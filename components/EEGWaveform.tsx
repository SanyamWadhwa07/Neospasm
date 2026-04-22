"use client";
import { useEffect, useRef } from "react";

const channels = ["Fp1", "Fp2", "F3", "F4", "C3", "C4", "O1", "O2"];

function generateWavePath(seed: number, width: number, height: number): string {
  const mid = height / 2;
  const points: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = mid + Math.sin((i * 0.5 + seed) * 1.7) * (height * 0.3)
                  + Math.sin((i * 0.3 + seed * 1.3) * 2.9) * (height * 0.15)
                  + Math.sin((i * 0.8 + seed * 0.7) * 0.8) * (height * 0.1);
    points.push(i === 0 ? `M${x},${y}` : `L${x},${y}`);
  }
  return points.join(" ");
}

export default function EEGWaveform() {
  const svgRefs = useRef<(SVGPathElement | null)[]>([]);
  const frameRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    let t = 0;
    const animate = () => {
      t += 0.02;
      offsetRef.current = t;
      svgRefs.current.forEach((el, i) => {
        if (!el) return;
        const width = el.closest("svg")?.clientWidth ?? 300;
        el.setAttribute("d", generateWavePath(i * 2.1 + t, width, 24));
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="space-y-1">
      {channels.map((ch, i) => (
        <div key={ch} className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 w-6 flex-shrink-0 font-mono">{ch}</span>
          <svg width="100%" height="24" className="flex-1 overflow-visible">
            <path
              ref={(el) => { svgRefs.current[i] = el; }}
              d={generateWavePath(i * 2.1, 300, 24)}
              fill="none"
              stroke="#DC2626"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
