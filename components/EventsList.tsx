"use client";
import { useState } from "react";
import { useSpasmData } from "@/lib/use-spasm-data";
import type { SpasmEvent, SpasmType } from "@/types/spasm";

function eventColors(type: SpasmType) {
  if (type === "FOCAL")   return { color: "var(--blue)", bgColor: "var(--blue-light)", borderColor: "var(--blue-border)" };
  if (type === "CLUSTER") return { color: "var(--red)",  bgColor: "var(--red-light)",  borderColor: "var(--red-border)" };
  return { color: "var(--text-secondary)", bgColor: "var(--page-bg)", borderColor: "var(--border)" };
}

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

export default function EventsList({ onSelectEvent }: { onSelectEvent?: (sec: number) => void } = {}) {
  const [filter, setFilter] = useState<"ALL" | SpasmType>("ALL");
  const { events, summary, loading, error } = useSpasmData();

  // Show newest first
  const sorted = [...events].reverse();
  const filtered = filter === "ALL" ? sorted : sorted.filter(e => e.type === filter);

  if (loading) return (
    <div className="card p-6 flex items-center justify-center" style={{ minHeight: 200 }}>
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading events…</span>
    </div>
  );

  if (error) return (
    <div className="card p-6">
      <span className="text-sm text-red-500">Error: {error}</span>
    </div>
  );

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
                ? { background: "var(--card-bg)", color: "var(--text-primary)", boxShadow: "var(--shadow-xs)" }
                : { background: "transparent", color: "var(--text-muted)" }
              }>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
        {filtered.map((ev: SpasmEvent, i: number) => {
          const { color, bgColor, borderColor } = eventColors(ev.type);
          const side = ev.laterality === "BILATERAL" ? "B" : (ev.laterality ?? "—");

          return (
            <button key={ev.id}
              onClick={() => onSelectEvent?.(ev.startSec)}
              className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors group"
              style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                {i < filtered.length - 1 && (
                  <div className="w-px flex-1" style={{ background: "var(--border)", minHeight: 8 }} />
                )}
              </div>

              {/* Waveform */}
              <div className="flex-shrink-0 rounded-lg p-1" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
                <MiniWave color={color} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {ev.wallClockTime}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                    style={{ background: bgColor, color, border: `1px solid ${borderColor}` }}>
                    {ev.type}
                  </span>
                  {side !== "—" && (
                    <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: "var(--page-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                      {side}
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                  {ev.durationSec}s · {ev.description}
                </div>
              </div>

              {/* Confidence */}
              <div className="flex-shrink-0 text-right">
                <div className="metric text-base">
                  {ev.fusionConfidencePct}
                  <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>%</span>
                </div>
                <div className="text-[10px] font-semibold" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>{/* FUSED */ "EEG"}</div>
              </div>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="2.5" strokeLinecap="round"
                className="flex-shrink-0 transition-colors group-hover:stroke-gray-400">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No {filter !== "ALL" ? filter.toLowerCase() : ""} events found
          </div>
        )}
      </div>

      {/* Footer: total from real data */}
      {summary && (
        <div className="px-5 py-3 flex items-center gap-4 text-xs"
          style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <span>Total: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{summary.totalSpasms}</span> spasms</span>
          <span>Burden: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{summary.spasmBurdenPercent}%</span></span>
          <span>Avg gap: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{summary.avgInterSpasmIntervalSec}s</span></span>
        </div>
      )}
    </div>
  );
}