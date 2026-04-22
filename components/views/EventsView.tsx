"use client";
import { useState } from "react";

type EventType = "FOCAL" | "CLUSTER" | "DIFFUSE";

const allEvents = [
  { date: "Today", time: "14:19", type: "FOCAL" as EventType, side: "R", duration: "3.4s", desc: "Right-arm flexion, cluster tail", conf: 94, ch: "Fp2, F4", iess: 7.2 },
  { date: "Today", time: "14:14", type: "FOCAL" as EventType, side: "R", duration: "2.9s", desc: "Right-arm extensor", conf: 91, ch: "F4", iess: 7.0 },
  { date: "Today", time: "14:09", type: "CLUSTER" as EventType, side: "R", duration: "3.1s", desc: "Cluster onset, 3 events/2 min", conf: 88, ch: "Fp2, F4, F8", iess: 6.8 },
  { date: "Today", time: "11:47", type: "DIFFUSE" as EventType, side: "—", duration: "1.8s", desc: "Symmetric truncal flexion", conf: 76, ch: "All", iess: 5.9 },
  { date: "Today", time: "09:22", type: "FOCAL" as EventType, side: "L", duration: "2.6s", desc: "Left-leg extensor, isolated", conf: 82, ch: "P3, T5", iess: 5.5 },
  { date: "Today", time: "04:51", type: "CLUSTER" as EventType, side: "R", duration: "3.9s", desc: "Early-morning cluster, 5 events", conf: 95, ch: "Fp2, F4", iess: 6.2 },
  { date: "Yesterday", time: "21:33", type: "FOCAL" as EventType, side: "R", duration: "2.1s", desc: "Isolated right frontal", conf: 87, ch: "Fp2", iess: 5.8 },
  { date: "Yesterday", time: "18:05", type: "DIFFUSE" as EventType, side: "—", duration: "2.3s", desc: "Bilateral synchronous", conf: 79, ch: "All", iess: 5.6 },
  { date: "Yesterday", time: "14:30", type: "CLUSTER" as EventType, side: "R", duration: "4.1s", desc: "Cluster of 6 events, 3 min", conf: 92, ch: "F4, C4", iess: 5.9 },
  { date: "Yesterday", time: "08:12", type: "FOCAL" as EventType, side: "R", duration: "1.9s", desc: "Morning brief focal", conf: 84, ch: "F4", iess: 5.4 },
];

const typeStyle: Record<EventType, { color: string; bg: string; border: string }> = {
  FOCAL:   { color: "var(--blue)",  bg: "var(--blue-light)",  border: "var(--blue-border)" },
  CLUSTER: { color: "var(--red)",   bg: "var(--red-light)",   border: "var(--red-border)" },
  DIFFUSE: { color: "var(--text-secondary)", bg: "var(--page-bg)", border: "var(--border)" },
};

function MiniWave({ color }: { color: string }) {
  const d = "M1,12 Q3,5 5,12 Q7,19 9,12 Q11,5 13,12 Q15,19 17,12 Q19,5 21,12 Q23,19 25,12";
  return (
    <svg width="42" height="24" viewBox="0 0 26 24">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function EventsView() {
  const [filter, setFilter] = useState<"ALL" | EventType>("ALL");
  const [search, setSearch] = useState("");

  const filtered = allEvents.filter(e => {
    if (filter !== "ALL" && e.type !== filter) return false;
    if (search && !e.desc.toLowerCase().includes(search.toLowerCase()) && !e.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: allEvents.length,
    focal: allEvents.filter(e => e.type === "FOCAL").length,
    cluster: allEvents.filter(e => e.type === "CLUSTER").length,
    diffuse: allEvents.filter(e => e.type === "DIFFUSE").length,
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Event Log</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Baby R. · MRN 00482-A · Last 48 hours</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, var(--blue), #1D4ED8)" }}>
          Export CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: stats.total, color: "var(--text-primary)" },
          { label: "Focal", value: stats.focal, color: "var(--blue)" },
          { label: "Cluster", value: stats.cluster, color: "var(--red)" },
          { label: "Diffuse", value: stats.diffuse, color: "var(--teal)" },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="label mb-2">{s.label}</div>
            <div className="metric text-2xl" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs"
            style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" placeholder="Search events…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm flex-1 outline-none"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}
            />
          </div>

          <div className="flex rounded-lg overflow-hidden ml-auto" style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
            {(["ALL", "FOCAL", "CLUSTER", "DIFFUSE"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="text-[11px] font-semibold px-3 py-2 transition-all"
                style={filter === f
                  ? { background: "white", color: "var(--text-primary)", boxShadow: "var(--shadow-xs)" }
                  : { background: "transparent", color: "var(--text-muted)" }
                }>
                {f}
              </button>
            ))}
          </div>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>{filtered.length} events</span>
        </div>

        {/* Group by date */}
        {(["Today", "Yesterday"] as const).map(date => {
          const group = filtered.filter(e => e.date === date);
          if (!group.length) return null;
          return (
            <div key={date}>
              <div className="px-5 py-2" style={{ background: "var(--page-bg)", borderBottom: "1px solid var(--border)" }}>
                <span className="label">{date}</span>
              </div>
              {group.map((ev, i) => {
                const s = typeStyle[ev.type];
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 transition-colors cursor-pointer"
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    {/* Waveform */}
                    <div className="rounded-lg p-1 flex-shrink-0" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                      <MiniWave color={s.color} />
                    </div>

                    {/* Time + type */}
                    <div className="w-24 flex-shrink-0">
                      <div className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ev.time}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {ev.type}
                        </span>
                        {ev.side !== "—" && (
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded"
                            style={{ background: "var(--page-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                            {ev.side}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{ev.desc}</div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {ev.duration} · {ev.ch}
                      </div>
                    </div>

                    {/* IESS */}
                    <div className="text-center flex-shrink-0 w-16">
                      <div className="label mb-0.5">IESS</div>
                      <div className="metric text-base">{ev.iess}</div>
                    </div>

                    {/* Confidence */}
                    <div className="text-right flex-shrink-0 w-20">
                      <div className="metric text-base">{ev.conf}<span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>%</span></div>
                      <div className="text-[10px] font-semibold" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>FUSED</div>
                    </div>

                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
