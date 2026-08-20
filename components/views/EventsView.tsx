"use client";
import { useState } from "react";
import { useSpasmData } from "@/lib/use-spasm-data";
import type { SpasmEvent, SpasmType } from "@/types/spasm";

function eventColors(type: SpasmType) {
  if (type === "FOCAL")   return { color: "var(--blue)", bg: "var(--blue-light)", border: "var(--blue-border)" };
  if (type === "CLUSTER") return { color: "var(--red)",  bg: "var(--red-light)",  border: "var(--red-border)" };
  return { color: "var(--text-secondary)", bg: "var(--page-bg)", border: "var(--border)" };
}

function WaveIcon({ color, bg, border }: { color: string; bg: string; border: string }) {
  const pts = [2, 6, 1, 9, 4, 7, 11, 2, 8, 10, 5, 8, 6, 3, 9, 7];
  const d = pts.map((y, i) =>
    i % 2 === 0 ? `${i === 0 ? "M" : "L"}${i * 2.5 + 2},${12 + y - 5}` : ""
  ).filter(Boolean).join(" ");
  return (
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: bg, border: `1px solid ${border}` }}>
      <svg width="34" height="24" viewBox="0 0 34 24">
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="card px-5 py-4">
      <div className="label mb-1">{label}</div>
      <div className="text-3xl font-bold" style={{ color: color ?? "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
        {value}
      </div>
    </div>
  );
}

export default function EventsView() {
  const [filter, setFilter]   = useState<"ALL" | SpasmType>("ALL");
  const [search,  setSearch]  = useState("");
  const { events, summary, loading, error } = useSpasmData();

  if (loading) return (
    <div className="p-6 flex items-center justify-center" style={{ minHeight: 300 }}>
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading events from .nspack…</span>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <span className="text-sm text-red-500">Error: {error}</span>
    </div>
  );

  // Compute type counts from real data
  const focalCount   = events.filter(e => e.type === "FOCAL").length;
  const clusterCount = events.filter(e => e.type === "CLUSTER").length;
  const diffuseCount = events.filter(e => e.type === "DIFFUSE").length;

  // Sort newest first, then filter
  const sorted = [...events].reverse();
  const filtered = sorted
    .filter(e => filter === "ALL" || e.type === filter)
    .filter(e =>
      search === "" ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.wallClockTime.includes(search) ||
      e.type.toLowerCase().includes(search.toLowerCase())
    );

  // Patient breadcrumb
  const patientName = summary?.patient?.name ?? "B/O Amandeep Kaur";
  const patientId   = summary?.patient?.id   ?? "00482-A";

  return (
    <div className="px-4 pt-6 pb-4 md:px-10 md:pt-8 md:pb-6 space-y-4 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Event Log</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {patientName} · MRN {patientId} · Recording {summary?.exam?.date
              ? new Date(summary.exam.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Events"  value={events.length} />
        <StatCard label={/* "Focal" */ "-"}   value={/* focalCount */ "-"}   color="var(--blue)" />
        <StatCard label={/* "Cluster" */ "-"} value={/* clusterCount */ "-"} color="var(--red)" />
        <StatCard label={/* "Diffuse" */ "-"} value={/* diffuseCount */ "-"} color="var(--teal)" />
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-sm"
            style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm bg-transparent outline-none flex-1"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{filtered.length} events</span>
            <div className="flex rounded-lg overflow-hidden" style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
              {(["ALL", "FOCAL", "CLUSTER", "DIFFUSE"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="text-[11px] font-semibold px-3 py-1.5 transition-all"
                  style={filter === f
                    ? { background: "white", color: "var(--text-primary)", boxShadow: "var(--shadow-xs)" }
                    : { background: "transparent", color: "var(--text-muted)" }
                  }>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--page-bg)" }}>
          <div className="col-span-1">Time</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2 text-right">IESS</div>
          <div className="col-span-1 text-right">Fused</div>
        </div>

        {/* Rows */}
        <div>
          {filtered.map((ev: SpasmEvent, i: number) => {
            const { color, bg, border } = eventColors(ev.type);
            const side = ev.laterality === "BILATERAL" ? "All" : (ev.laterality ?? "—");

            return (
              <button key={ev.id}
                className="w-full grid grid-cols-12 gap-4 items-center px-5 py-3.5 text-left transition-colors group"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {/* Waveform + time */}
                <div className="col-span-3 sm:col-span-1 flex items-center gap-3">
                  <WaveIcon color={color} bg={bg} border={border} />
                </div>

                {/* Time + type */}
                <div className="col-span-9 sm:col-span-2 flex flex-col gap-1">
                  <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {ev.wallClockTime}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                      style={{ background: bg, color, border: `1px solid ${border}` }}>
                      {/* {ev.type} */ "-"}
                    </span>
                    {ev.laterality && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: "var(--page-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                        {/* {side} */ "-"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="hidden sm:block col-span-4">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {/* {ev.description} */ "-"}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {ev.startFormatted} → {ev.endFormatted}
                  </div>
                </div>

                {/* Duration */}
                <div className="hidden sm:block col-span-2">
                  <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {ev.durationSec}s
                  </span>
                  {ev.interSpasmInterval !== null && (
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      +{ev.interSpasmInterval}s gap
                    </div>
                  )}
                </div>

                {/* IESS per-event score (fusion confidence mapped to score) */}
                <div className="hidden sm:block col-span-2 text-right">
                  <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {(ev.fusionConfidencePct / 14).toFixed(1)}
                  </span>
                </div>

                {/* Fusion confidence */}
                <div className="hidden sm:block col-span-1 text-right">
                  <div className="text-sm font-mono font-semibold" style={{ color }}>
                    {ev.fusionConfidencePct}%
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>FUSED</div>
                </div>

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="2.5" strokeLinecap="round"
                  className="hidden sm:block col-span-0 flex-shrink-0 group-hover:stroke-gray-400">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              No events match your search
            </div>
          )}
        </div>

        {/* Footer stats */}
        {summary && (
          <div className="px-5 py-3 flex flex-wrap items-center gap-5 text-xs"
            style={{ borderTop: "1px solid var(--border)", background: "var(--page-bg)", color: "var(--text-muted)" }}>
            <span>Recording: <b style={{ color: "var(--text-primary)" }}>{Math.floor(summary.recordingDurationSec / 60)}m {Math.round(summary.recordingDurationSec % 60)}s</b></span>
            <span>Burden: <b style={{ color: "var(--text-primary)" }}>{summary.spasmBurdenPercent}%</b></span>
            <span>Avg gap: <b style={{ color: "var(--text-primary)" }}>{summary.avgInterSpasmIntervalSec}s</b></span>
            <span>Avg duration: <b style={{ color: "var(--text-primary)" }}>{summary.avgDurationSec}s</b></span>
            <span>EEG channels: <b style={{ color: "var(--text-primary)" }}>{summary.exam.eegChannels}</b></span>
          </div>
        )}
      </div>
    </div>
  );
}
