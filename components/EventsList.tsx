"use client";
import { useState } from "react";

type EventType = "FOCAL" | "CLUSTER" | "DIFFUSE";

const events = [
  { time: "14:19", type: "FOCAL" as EventType, side: "R", duration: "3.4s", desc: "Right-arm flexion, cluster tail", conf: 94, color: "var(--blue)", bgColor: "var(--blue-light)", borderColor: "var(--blue-border)" },
  { time: "14:14", type: "FOCAL" as EventType, side: "R", duration: "2.9s", desc: "Right-arm extensor", conf: 91, color: "var(--blue)", bgColor: "var(--blue-light)", borderColor: "var(--blue-border)" },
  { time: "14:09", type: "CLUSTER" as EventType, side: "R", duration: "3.1s", desc: "Cluster onset, 3 events/2 min", conf: 88, color: "var(--red)", bgColor: "var(--red-light)", borderColor: "var(--red-border)" },
  { time: "11:47", type: "DIFFUSE" as EventType, side: "—", duration: "1.8s", desc: "Symmetric truncal flexion", conf: 76, color: "var(--text-secondary)", bgColor: "var(--page-bg)", borderColor: "var(--border)" },
  { time: "09:22", type: "FOCAL" as EventType, side: "L", duration: "2.6s", desc: "Left-leg extensor, isolated", conf: 82, color: "var(--blue)", bgColor: "var(--blue-light)", borderColor: "var(--blue-border)" },
  { time: "04:51", type: "CLUSTER" as EventType, side: "R", duration: "3.9s", desc: "Early-morning cluster, 5 events", conf: 95, color: "var(--red)", bgColor: "var(--red-light)", borderColor: "var(--red-border)" },
];

function MiniWave({ color }: { color: string }) {
  const pts = [2, 5, 1, 8, 3, 6, 10, 2, 7, 9, 4, 7, 5, 3, 8, 6];
  const mid = 12;
  const d = pts.map((y, i) =>
    i % 2 === 0 ? `${i === 0 ? "M" : "L"}${i * 2.5 + 1},${mid + y - 5}` : ""
  ).filter(Boolean).join(" ");
  return (
    <svg width="42" height="24" viewBox="0 0 42 24">
      <path d={d} fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function EventsList() {
  const [filter, setFilter] = useState<"ALL" | EventType>("ALL");
  const filtered = filter === "ALL" ? events : events.filter(e => e.type === filter);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <div className="label mb-0.5">Previous Events</div>
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {filtered.length} events · newest first
          </span>
        </div>
        <div className="flex rounded-lg overflow-hidden" style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
          {(["ALL", "FOCAL", "CLUSTER", "DIFFUSE"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-[11px] font-semibold px-2.5 py-1.5 transition-all"
              style={filter === f
                ? { background: "white", color: "var(--text-primary)", boxShadow: "var(--shadow-xs)" }
                : { background: "transparent", color: "var(--text-muted)" }
              }>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        {filtered.map((ev, i) => (
          <button key={i}
            className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors group"
            style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-2 h-2 rounded-full" style={{ background: ev.color }} />
              {i < filtered.length - 1 && (
                <div className="w-px flex-1" style={{ background: "var(--border)", minHeight: 8 }} />
              )}
            </div>

            {/* Waveform */}
            <div className="flex-shrink-0 rounded-lg p-1" style={{ background: ev.bgColor, border: `1px solid ${ev.borderColor}` }}>
              <MiniWave color={ev.color} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ev.time}</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                  style={{ background: ev.bgColor, color: ev.color, border: `1px solid ${ev.borderColor}` }}>
                  {ev.type}
                </span>
                {ev.side !== "—" && (
                  <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: "var(--page-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {ev.side}
                  </span>
                )}
              </div>
              <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                {ev.duration} · {ev.desc}
              </div>
            </div>

            {/* Confidence */}
            <div className="flex-shrink-0 text-right">
              <div className="metric text-base">{ev.conf}<span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>%</span></div>
              <div className="text-[10px] font-semibold" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>FUSED</div>
            </div>

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="2.5" strokeLinecap="round"
              className="flex-shrink-0 transition-colors group-hover:stroke-gray-400">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
