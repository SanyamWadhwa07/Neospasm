// components/EEGWaveform.tsx
"use client";
import { useEffect, useRef, useMemo, useState } from "react";

const DEFAULT_CHANNELS = ["Fp1", "Fp2", "F3", "F4", "C3", "C4", "O1", "O2"];

const BUFFER_LEN = 220;
const SAMPLE_INTERVAL_MS = 1000 / 44; // ~44 samples/sec scroll rate

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
}: {
  channels?: string[];
  heightPx?: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const widthRef = useRef(300);
  const frameRef = useRef<number>(0);

  const channelKey = channels.join(",");

  // Real decoded EEG samples from the .nscurve files, fetched once.
  const [eegChannels, setEegChannels] = useState<EegApiChannel[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/eeg")
      .then((r) => r.json())
      .then((data: EegApiResponse) => {
        if (!cancelled) setEegChannels(data.channels?.length ? data.channels : null);
      })
      .catch(() => { if (!cancelled) setEegChannels(null); });
    return () => { cancelled = true; };
  }, []);

  // One playback buffer per displayed channel, sourced from real curve data
  // (looped) when available; falls back to a flat line if the fetch failed
  // or returned nothing, so a data outage never crashes the view. All
  // channels share a single cursor (below) so they stay time-aligned with
  // each other, since they were all fetched from the same window.
  const playback = useMemo<PlaybackChannel[]>(() => {
    return channels.map((_, i) => {
      const real = eegChannels?.[i % eegChannels.length]?.samples;
      if (real && real.length > 8) {
        const maxAbs = real.reduce((m, v) => Math.max(m, Math.abs(v)), 1e-9);
        return { samples: real, scale: 1 / maxAbs };
      }
      return { samples: [0], scale: 1 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelKey, eegChannels]);

  const buffers = useMemo(() => channels.map(() => new Float32Array(BUFFER_LEN)), [channelKey]);

  // Shared playback position across all channels — re-randomized only when
  // the underlying real data changes, not per channel.
  const cursorRef = useRef(0);
  useEffect(() => {
    const maxLen = Math.max(1, ...playback.map((p) => p.samples.length));
    cursorRef.current = Math.floor(Math.random() * maxLen);
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

        // faint centerline — same low-opacity white grid used on the camera feed
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(width, midY);
        ctx.stroke();

        ctx.strokeStyle = "#DC2626";
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
