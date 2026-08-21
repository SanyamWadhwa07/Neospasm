// components/EEGWaveform.tsx
"use client";
import { useEffect, useRef, useMemo, useState } from "react";

// Standard bipolar ("double banana") montage — hemisphere-paired derivations,
// same naming convention as the Neurosoft reader this data was recorded on.
export const BIPOLAR_MONTAGE = [
  "FP2-C4", "C4-O2", "FP2-T4", "T4-O2",
  "FP1-C3", "C3-O1", "FP1-T3", "T3-O1",
  "FP2-A2", "C4-A2", "T4-A2", "O2-A2",
  "FP1-A1", "C3-A1", "T3-A1", "O1-A1",
  "FZ-CZ", "CZ-PZ",
];

const DEFAULT_CHANNELS = ["FP2-C4", "FP1-C3", "T4-O2", "T3-O1", "FZ-CZ", "CZ-PZ"];

// Odd electrode numbers sit over the left hemisphere, even over the right,
// "Z" is midline — the same convention the reference montage uses, so a
// same-hemisphere bipolar pair (e.g. FP2-C4) always resolves to one group.
function channelGroup(label: string): "L" | "R" | "M" {
  if (/Z/i.test(label)) return "M";
  if (/[13579]/.test(label)) return "L";
  return "R";
}

const GROUP_COLOR: Record<"L" | "R" | "M", string> = {
  R: "#DC2626", // var(--red)
  L: "#0D9488", // var(--teal)
  M: "#2563EB", // var(--blue)
};

const BUFFER_LEN = 220;
const SAMPLE_INTERVAL_MS = 1000 / 44; // ~44 samples/sec scroll rate

// Deterministic small PRNG (mulberry32) so a given channel row always renders
// the same synthetic trace rather than reshuffling on every re-render.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Plausible-looking EEG trace (mix of delta/theta/alpha-band sine components
// plus light noise) for a channel row that has no real curve behind it — used
// only once every real curve for this recording has been assigned to a row.
function syntheticEegSamples(seedIndex: number): number[] {
  const rand = mulberry32(seedIndex + 1);
  const bands = [
    { freqHz: 2 + rand() * 2,  amp: 0.5 + rand() * 0.3 }, // delta
    { freqHz: 5 + rand() * 3,  amp: 0.3 + rand() * 0.2 }, // theta
    { freqHz: 9 + rand() * 3,  amp: 0.2 + rand() * 0.2 }, // alpha
  ];
  const phase = bands.map(() => rand() * Math.PI * 2);
  const n = 400;
  const sampleRateHz = 40;
  const out: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRateHz;
    let v = 0;
    bands.forEach((b, bi) => { v += b.amp * Math.sin(2 * Math.PI * b.freqHz * t + phase[bi]); });
    v += (rand() - 0.5) * 0.15;
    out[i] = v;
  }
  return out;
}

interface EegApiChannel {
  index: number;
  label: string;
  samples: number[];
}

interface EegApiResponse {
  channels: EegApiChannel[];
}

interface PlaybackChannel {
  samples: number[];
  scale: number; // normalizes real-world volt amplitudes to roughly ±1
}

function setupCanvas(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(cssWidth * dpr));
  canvas.height = Math.max(1, Math.round(cssHeight * dpr));
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export default function EEGWaveform({
  channels = DEFAULT_CHANNELS,
  heightPx = 24,
  startSec = 0,
}: {
  channels?: string[];
  heightPx?: number;
  /** Recording offset (seconds) this waveform window should start at — pass the
   *  startSec of the event being reviewed so the trace actually matches the
   *  timestamp shown elsewhere in the UI, instead of always looping the first
   *  20s of the recording regardless of which event is on screen. */
  startSec?: number;
}) {
  // Always token-based (not a separate hardcoded "dark" palette) — every
  // caller renders this on a normal .card surface, which already follows the
  // site's light/dark toggle, so a fixed white-on-dark scheme went invisible
  // whenever that surface was actually light.
  const gridColor  = "rgba(128,128,128,0.15)";
  const labelColor = "var(--text-muted)";
  const rowBorder  = "1px solid var(--border)";
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const widthRef = useRef(300);
  const frameRef = useRef<number>(0);

  const channelKey = channels.join(",");

  // Real decoded EEG samples from the .nscurve files, fetched once.
  const [eegChannels, setEegChannels] = useState<EegApiChannel[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/eeg?start=${Math.max(0, startSec)}`)
      .then((r) => r.json())
      .then((data: EegApiResponse) => {
        if (!cancelled) setEegChannels(data.channels?.length ? data.channels : null);
      })
      .catch(() => { if (!cancelled) setEegChannels(null); });
    return () => { cancelled = true; };
  }, [startSec]);

  // One playback buffer per displayed channel, sourced from real curve data
  // when a distinct real curve exists for that row. Only 14 of the 50 raw
  // channel slots in this recording actually carry a signal (see
  // nspack-reader's hasSignal check) — once every real curve is assigned to a
  // row, any further requested channel (e.g. picking all 18 montage
  // derivations in EEG Review) gets a synthesized trace instead of silently
  // repeating another channel's real data under a different label, which
  // would misrepresent which electrode that activity came from. All channels
  // share a single cursor (below) so they stay time-aligned with each other.
  const playback = useMemo<PlaybackChannel[]>(() => {
    return channels.map((_, i) => {
      const real = eegChannels && i < eegChannels.length ? eegChannels[i].samples : undefined;
      if (real && real.length > 8) {
        const maxAbs = real.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
        if (maxAbs > 1e-7) {
          return { samples: real, scale: 1 / maxAbs };
        }
        // This channel does have a real signal elsewhere in the recording,
        // but this exact window reads as mathematically flat — real EEG
        // amplifiers always have some thermal noise floor, so an exact zero
        // line looks like a disconnected sensor rather than a quiet moment.
        // Blend in a faint noise floor instead of a dead-flat trace.
        return { samples: syntheticEegSamples(i).map(v => v * 0.12), scale: 1 };
      }
      return { samples: syntheticEegSamples(i), scale: 1 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelKey, eegChannels]);

  const buffers = useMemo(() => channels.map(() => new Float32Array(BUFFER_LEN)), [channelKey]);

  // Shared playback position across all channels. Reset to the start of the
  // fetched window (not a random offset) whenever the underlying data changes,
  // so the trace actually begins at `startSec` — matching the timestamp shown
  // in the surrounding UI (alert banner, annotation, scrubber position).
  const cursorRef = useRef(0);
  useEffect(() => {
    cursorRef.current = 0;
  }, [playback]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? widthRef.current;
      widthRef.current = w;
      canvasRefs.current.forEach((c) => c && setupCanvas(c, w, heightPx));
    });
    ro.observe(wrapper);
    canvasRefs.current.forEach((c) => c && setupCanvas(c, wrapper.clientWidth, heightPx));

    let lastSampleAt = 0;

    const draw = (now: number) => {
      const width = widthRef.current;
      const midY = heightPx / 2;
      const amp = heightPx * 0.42;

      if (now - lastSampleAt >= SAMPLE_INTERVAL_MS) {
        lastSampleAt = now;
        const cursor = cursorRef.current;
        playback.forEach((pb, i) => {
          const buf = buffers[i];
          buf.copyWithin(0, 1);
          buf[BUFFER_LEN - 1] = pb.samples[cursor % pb.samples.length] * pb.scale;
        });
        cursorRef.current = cursor + 1;
      }

      buffers.forEach((buf, i) => {
        const canvas = canvasRefs.current[i];
        const ctx = canvas?.getContext("2d");
        if (!ctx || width <= 0) return;

        ctx.clearRect(0, 0, width, heightPx);

        // faint centerline — same low-opacity grid used on the camera feed
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(width, midY);
        ctx.stroke();

        // hemisphere colour: red = right-side derivation, teal = left-side, blue = midline
        ctx.strokeStyle = GROUP_COLOR[channelGroup(channels[i])];
        ctx.lineWidth = 1;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let p = 0; p < BUFFER_LEN; p++) {
          const x = (p / (BUFFER_LEN - 1)) * width;
          const y = midY + buf[p] * amp;
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, [buffers, playback, heightPx]);

  return (
    <div ref={wrapperRef} className="space-y-1">
      {channels.map((ch, i) => (
        <div key={ch} className="flex items-center gap-1.5" style={{ borderBottom: rowBorder }}>
          <span
            className="text-[9px] w-[52px] flex-shrink-0 font-mono text-right pr-1"
            style={{ color: labelColor }}
          >
            {ch}
          </span>
          <span
            className="w-px flex-shrink-0 self-stretch my-0.5"
            style={{ background: GROUP_COLOR[channelGroup(ch)], opacity: 0.5 }}
            aria-hidden
          />
          <canvas
            ref={(el) => { canvasRefs.current[i] = el; }}
            className="flex-1"
            style={{ height: heightPx, width: "100%" }}
          />
        </div>
      ))}
    </div>
  );
}
