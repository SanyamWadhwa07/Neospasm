"use client";
import { motion } from "framer-motion";

export default function IESSSeverity() {
  const score = 7.2;
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - score / 10);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="label mb-1">IESS Severity Score</div>
          <div className="flex items-baseline gap-2">
            <span className="metric" style={{ fontSize: 40 }}>{score}</span>
            <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>/ 10</span>
            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ml-1"
              style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red-border)" }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L22 22H2z"/>
              </svg>
              +0.8 / 24h
            </div>
          </div>
        </div>

        {/* Gauge */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
            <circle cx="56" cy="56" r={radius} fill="none" stroke="var(--page-bg)" strokeWidth="10" />
            <motion.circle
              cx="56" cy="56" r={radius}
              fill="none"
              stroke="var(--red)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
            />
            {/* Tick marks */}
            {Array.from({ length: 10 }, (_, i) => {
              const angle = (i / 10) * 2 * Math.PI - Math.PI / 2;
              const x1 = 56 + (radius - 16) * Math.cos(angle);
              const y1 = 56 + (radius - 16) * Math.sin(angle);
              const x2 = 56 + (radius - 11) * Math.cos(angle);
              const y2 = 56 + (radius - 11) * Math.sin(angle);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={i < 7 ? "var(--red)" : "var(--border-strong)"}
                  strokeWidth="1.5" strokeLinecap="round" />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="metric text-lg">{score}</span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>/ 10</span>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
        Rising burden driven by right-frontal cluster. Consider escalation of current regimen.
      </p>

      {/* Segment bars */}
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div key={i}
            className="flex-1 h-1 rounded-full"
            style={{ background: i < 7 ? "var(--red)" : i === 7 ? "rgba(217,48,37,0.3)" : "var(--border)" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>0</span>
        <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>10</span>
      </div>
    </div>
  );
}
