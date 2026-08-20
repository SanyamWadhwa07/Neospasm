// components/EEGWaveform.tsx
"use client";
import { useEffect, useRef, useMemo } from "react";

const DEFAULT_CHANNELS = ["Fp1", "Fp2", "F3", "F4", "C3", "C4", "O1", "O2"];

const BUFFER_LEN = 220;
const SAMPLE_INTERVAL_MS = 1000 / 44; // ~44 samples/sec scroll rate

interface ChannelState {
  buffer: Float32Array;
  seed: number;
  frontality: number; // 0..1 — frontal leads swing harder during a burst
  walk: number;        // slow baseline-wander accumulator
  lastSampleAt: number;
}

interface BurstState {
  active: boolean;
  strength: number;
  startT: number;
  durationSec: number;
  nextCheckAt: number;
}

function frontalityFor(name: string): number {
  if (name.startsWith("Fp")) return 1;
  if (name.startsWith("F")) return 0.78;
  if (name.startsWith("C")) return 0.55;
  if (name.startsWith("T")) return 0.42;
  if (name.startsWith("P")) return 0.32;
  if (name.startsWith("O")) return 0.22;
  return 0.5;
}

/** One synthetic sample: background rhythms + wander + noise, plus an
 *  epileptiform spike-wave overlay while a burst is active. */
function sampleValue(tSec: number, ch: ChannelState, burst: BurstState): number {
  const s = ch.seed;

  let v =
    Math.sin(tSec * 0.55 + s) * 0.30 +
    Math.sin(tSec * 1.3 + s * 1.9) * 0.15 +
    Math.sin(tSec * 3.1 + s * 2.7) * 0.08 +
    Math.sin(tSec * 7.4 + s * 0.6) * 0.04;

  ch.walk += (Math.random() - 0.5) * 0.018;
  ch.walk = Math.max(-0.22, Math.min(0.22, ch.walk * 0.985));
  v += ch.walk;

  v += (Math.random() - 0.5) * 0.055;

  if (burst.active) {
    const localT = tSec - burst.startT;
    const cyclePos = (localT * 3.2 + ch.frontality * 0.3) % 1; // ~3Hz spike-wave
    const spike =
      cyclePos < 0.12 ? Math.sin((cyclePos / 0.12) * Math.PI)
      : cyclePos < 0.22 ? -Math.sin(((cyclePos - 0.12) / 0.10) * Math.PI) * 0.5
      : 0;
    const envelope = Math.sin((localT / burst.durationSec) * Math.PI); // fade in/out
    v += spike * burst.strength * envelope * (0.55 + ch.frontality * 0.65);
    v += Math.sin(tSec * 14 + s) * 0.045 * burst.strength * envelope;
  }

  return v;
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
}: {
  channels?: string[];
  heightPx?: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const widthRef = useRef(300);
  const frameRef = useRef<number>(0);

  const channelKey = channels.join(",");

  const states = useMemo<ChannelState[]>(() => {
    return channels.map((name, i) => {
      const seed = i * 1.87 + Math.random() * 6;
      const buffer = new Float32Array(BUFFER_LEN);
      const ch: ChannelState = { buffer, seed, frontality: frontalityFor(name), walk: 0, lastSampleAt: 0 };
      // pre-fill so the first paint isn't a flat line
      for (let k = 0; k < BUFFER_LEN; k++) {
        buffer[k] = sampleValue(-((BUFFER_LEN - k) / 44), ch, { active: false, strength: 0, startT: 0, durationSec: 1, nextCheckAt: 0 });
      }
      return ch;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    });
  }, [channelKey]);

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

    const burst: BurstState = { active: false, strength: 0, startT: 0, durationSec: 0, nextCheckAt: 1 };
    const start = performance.now();

    const draw = (now: number) => {
      const tSec = (now - start) / 1000;
      const width = widthRef.current;
      const midY = heightPx / 2;
      const amp = heightPx * 0.42;

      // schedule / resolve epileptiform bursts — sparse, so the trace is
      // mostly calm background rhythm with the occasional spasm-like run
      if (!burst.active && tSec > burst.nextCheckAt) {
        if (Math.random() < 0.35) {
          burst.active = true;
          burst.startT = tSec;
          burst.durationSec = 0.5 + Math.random() * 0.5;
          burst.strength = 0.85 + Math.random() * 0.55;
        } else {
          burst.nextCheckAt = tSec + 3 + Math.random() * 5;
        }
      } else if (burst.active && tSec - burst.startT > burst.durationSec) {
        burst.active = false;
        burst.nextCheckAt = tSec + 6 + Math.random() * 10;
      }

      states.forEach((ch, i) => {
        if (tSec - ch.lastSampleAt >= SAMPLE_INTERVAL_MS / 1000) {
          ch.lastSampleAt = tSec;
          ch.buffer.copyWithin(0, 1);
          ch.buffer[BUFFER_LEN - 1] = sampleValue(tSec, ch, burst);
        }

        const canvas = canvasRefs.current[i];
        const ctx = canvas?.getContext("2d");
        if (!ctx || width <= 0) return;

        ctx.clearRect(0, 0, width, heightPx);

        // faint centerline — same low-opacity white grid used on the camera feed
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(width, midY);
        ctx.stroke();

        ctx.strokeStyle = burst.active ? "#FF6B6B" : "#DC2626";
        ctx.lineWidth = 1;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let p = 0; p < BUFFER_LEN; p++) {
          const x = (p / (BUFFER_LEN - 1)) * width;
          const y = midY + ch.buffer[p] * amp;
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
  }, [states, heightPx]);

  return (
    <div ref={wrapperRef} className="space-y-1">
      {channels.map((ch, i) => (
        <div key={ch} className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 w-6 flex-shrink-0 font-mono">{ch}</span>
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
