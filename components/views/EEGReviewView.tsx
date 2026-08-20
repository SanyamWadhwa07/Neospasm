"use client";
import { useState, useEffect } from "react";
import EEGWaveform from "@/components/EEGWaveform";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpasmEvent {
  id: number;
  startSec: number;
  endSec: number;
  wallClockTime: string;
  type: "FOCAL" | "CLUSTER" | "DIFFUSE";
  laterality: "R" | "L" | "BILATERAL" | null;
  description: string;
  fusionConfidencePct: number;
}

interface PatientInfo {
  name: string;
  id: string;
  diagnosis: string;
  examDate: string;
  ageMonths: number;
  sex: "M" | "F" | "Unknown";
}

interface ExamInfo {
  durationSec: number;
  samplingRateHz: number;
  hasVideo: boolean;
  eegChannels: number;
}

interface SpasmSummary {
  totalSpasms: number;
  spasmsPerMinute: number;
  spasmBurdenPercent: number;
  patient: PatientInfo;
  exam: ExamInfo;
  clusters: Array<{ id: number; count: number; startSec: number; endSec: number }>;
  severity: { score: number; interpretation: string };
}

interface ApiData {
  events: SpasmEvent[];
  summary: SpasmSummary;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert absolute recording seconds → "HH:MM" wall-clock display */
function secToTimeline(sec: number, totalSec: number): number {
  return Math.round((sec / totalSec) * 100);
}

/** Map spasm type → annotation label + severity */
function spasmToAnnotation(e: SpasmEvent) {
  const typeLabel =
    e.type === "CLUSTER" ? "Cluster onset" :
    e.type === "FOCAL"   ? "Focal spasm"   : "Diffuse burst";
  const annotType =
    e.type === "CLUSTER" ? "alert" :
    e.type === "FOCAL"   ? "alert" : "info";
  const ch =
    e.laterality === "R" ? "Fp2" :
    e.laterality === "L" ? "Fp1" : "Cz";
  return { time: e.wallClockTime, label: typeLabel, type: annotType, ch };
}

// ─── Component ────────────────────────────────────────────────────────────────

const FALLBACK_CHANNELS = ["Fp1","Fp2","F3","F4","C3","C4","P3","P4","O1","O2","T3","T4","F7","F8"];

export default function EEGReviewView() {
  const [gain, setGain]   = useState(50);
  const [speed, setSpeed] = useState(30);
  const [activeMontage, setActiveMontage] = useState("Bipolar");
  const [activeChannels, setActiveChannels] = useState<Set<string>>(
    new Set(["Fp1","Fp2","F3","F4","C3","C4","P3","P4"])
  );

  const [data, setData]       = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Fetch spasms + summary from /api/spasms ──
  useEffect(() => {
    fetch("/api/spasms")
      .then(r => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function toggleChannel(ch: string) {
    setActiveChannels(prev => {
      const n = new Set(prev);
      if (n.has(ch)) n.delete(ch); else n.add(ch);
      return n;
    });
  }

  // ── Derived display values ──
  const patient   = data?.summary.patient;
  const exam      = data?.summary.exam;
  const events    = data?.events ?? [];
  const totalSec  = exam?.durationSec ?? 840;

  // Top-5 most recent/significant spasm events as annotations
  const annotations = events
    .filter(e => e.type === "CLUSTER" || e.type === "FOCAL")
    .slice(0, 5)
    .map(spasmToAnnotation);

  // Timeline marker positions as percentages
  const spasmMarkers = events.map(e => secToTimeline(e.startSec, totalSec));

  // Power spectrum from ExamStatItems — fallback to hardcoded if not in API yet
  const powerBands = [
    { band: "Delta", hz: "0.5–4",  pct: 48, color: "var(--red)" },
    { band: "Theta", hz: "4–8",    pct: 22, color: "var(--amber)" },
    { band: "Alpha", hz: "8–12",   pct: 15, color: "var(--blue)" },
    { band: "Beta",  hz: "12–30",  pct: 10, color: "var(--teal)" },
    { band: "Gamma", hz: ">30",    pct: 5,  color: "var(--text-muted)" },
  ];

  // Patient subtitle
  const patientLine = loading
    ? "Loading…"
    : error
    ? "Error loading patient data"
    : `${patient?.name ?? "—"} · MRN ${patient?.id ?? "—"} · ${exam?.samplingRateHz ?? 256} Hz`;

  // Recording duration label
  const durationLabel = exam
    ? `${String(Math.floor(exam.durationSec / 60)).padStart(2,"0")}:${String(Math.round(exam.durationSec % 60)).padStart(2,"0")}`
    : "14:00";

  return (
    <div className="px-4 pt-6 pb-4 md:px-10 md:pt-8 md:pb-6 space-y-5 max-w-[1600px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            EEG Review
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {patientLine}
            {exam?.hasVideo && (
              <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ background: "var(--teal-light)", color: "var(--teal)" }}>
                VIDEO
              </span>
            )}
          </p>
        </div>

        {/* Summary pills from real data */}
        {data && (
          <div className="hidden xl:flex items-center gap-3 mr-4">
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {data.summary.totalSpasms}
              </div>
              <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Spasms</div>
            </div>
            <div className="w-px h-8" style={{ background: "var(--border)" }}/>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: "var(--red)" }}>
                {data.summary.clusters.length}
              </div>
              <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Clusters</div>
            </div>
            <div className="w-px h-8" style={{ background: "var(--border)" }}/>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: "var(--amber)" }}>
                {data.summary.spasmBurdenPercent}%
              </div>
              <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Burden</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red-border)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: "var(--red)" }}/>
            LIVE
          </span>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "var(--page-bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
            Freeze
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, var(--blue), #1D4ED8)" }}>
            Export EDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">

        {/* ── Main EEG panel ── */}
        <div className="col-span-12 xl:col-span-9 space-y-4">
          <div className="card overflow-hidden">

            {/* Controls bar */}
            <div className="flex items-center gap-6 px-5 py-3"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--page-bg)" }}>
              <div className="flex items-center gap-2">
                <span className="label">Gain</span>
                <input type="range" min="10" max="200" value={gain}
                  onChange={e => setGain(+e.target.value)} className="w-20 accent-blue-600" />
                <span className="text-xs font-mono w-10" style={{ color: "var(--text-secondary)" }}>{gain}μV</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="label">Speed</span>
                <input type="range" min="10" max="60" value={speed}
                  onChange={e => setSpeed(+e.target.value)} className="w-20 accent-blue-600" />
                <span className="text-xs font-mono w-10" style={{ color: "var(--text-secondary)" }}>{speed}mm/s</span>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className="label">Montage:</span>
                {["Bipolar", "Referential", "Laplacian"].map(m => (
                  <button key={m}
                    onClick={() => setActiveMontage(m)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all"
                    style={m === activeMontage
                      ? { background: "white", color: "var(--blue)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }
                      : { background: "transparent", color: "var(--text-muted)" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Waveform */}
            <div style={{ background: "#060D1A", padding: "16px 8px" }}>
              <EEGWaveform
                channels={FALLBACK_CHANNELS.filter(ch => activeChannels.has(ch))}
                heightPx={32}
              />
            </div>

            {/* Timeline scrubber — real spasm positions */}
            <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)", background: "var(--page-bg)" }}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>00:00</span>
                <div className="flex-1 relative h-4 flex items-center">
                  <div className="w-full h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full"
                      style={{ width: "62%", background: "linear-gradient(90deg, var(--blue), var(--teal))" }}/>
                  </div>
                  <div className="absolute w-3 h-3 rounded-full border-2 border-white shadow"
                    style={{ left: "62%", background: "var(--blue)", transform: "translateX(-50%)" }}/>

                  {/* Real spasm markers from API */}
                  {spasmMarkers.map((pct, i) => (
                    <div key={i} className="absolute w-1 h-3 rounded-sm"
                      title={`Spasm ${i + 1} at ${events[i]?.wallClockTime}`}
                      style={{ left: `${pct}%`, background: "var(--red)", opacity: 0.75 }}/>
                  ))}
                </div>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{durationLabel}</span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "var(--red)" }}/>
                  Spasm events
                  {!loading && (
                    <span className="ml-1 font-semibold" style={{ color: "var(--red)" }}>
                      ({events.length})
                    </span>
                  )}
                </span>
                {data && (
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {data.summary.spasmsPerMinute}/min · burden {data.summary.spasmBurdenPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="col-span-12 xl:col-span-3 space-y-4">

          {/* Channel selector */}
          <div className="card p-4">
            <div className="label mb-3">
              Channels
              {exam && (
                <span className="ml-2 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                  ({exam.eegChannels} available)
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {FALLBACK_CHANNELS.map(ch => {
                const on = activeChannels.has(ch);
                return (
                  <button key={ch} onClick={() => toggleChannel(ch)}
                    className="text-[11px] font-mono font-semibold px-2 py-1.5 rounded-md transition-all text-left"
                    style={on
                      ? { background: "var(--blue-light)", color: "var(--blue)", border: "1px solid var(--blue-border)" }
                      : { background: "var(--page-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                    }>
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Annotations — from real spasm events */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="label">Annotations</div>
              {loading && (
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Loading…</span>
              )}
            </div>
            <div>
              {error ? (
                <div className="px-4 py-3 text-xs" style={{ color: "var(--red)" }}>
                  Failed to load: {error}
                </div>
              ) : loading ? (
                [0,1,2,3,4].map(i => (
                  <div key={i} className="flex items-start gap-2.5 px-4 py-2.5"
                    style={{ borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 animate-pulse"
                      style={{ background: "var(--border)" }}/>
                    <div className="flex-1 space-y-1">
                      <div className="h-2.5 rounded animate-pulse" style={{ background: "var(--border)", width: "60%" }}/>
                      <div className="h-2 rounded animate-pulse" style={{ background: "var(--border)", width: "40%" }}/>
                    </div>
                  </div>
                ))
              ) : annotations.length === 0 ? (
                <div className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  No annotations found
                </div>
              ) : (
                annotations.map((a, i) => (
                  <div key={i}
                    className="flex items-start gap-2.5 px-4 py-2.5 transition-colors"
                    style={{ borderBottom: i < annotations.length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: a.type === "alert" ? "var(--red)" : a.type === "warning" ? "var(--amber)" : "var(--teal)" }}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{a.label}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{a.time}</span>
                        <span className="text-[10px] font-mono px-1 rounded"
                          style={{ background: "var(--blue-light)", color: "var(--blue)" }}>{a.ch}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Power Spectrum */}
          <div className="card p-4">
            <div className="label mb-3">Power Spectrum</div>
            {powerBands.map(b => (
              <div key={b.band} className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{b.band}</span>
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{b.hz} Hz</span>
                  </div>
                  <span className="text-xs font-mono font-semibold" style={{ color: b.color }}>{b.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--page-bg)" }}>
                  <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Severity card — from real API */}
          {data?.summary.severity && (
            <div className="card p-4">
              <div className="label mb-2">IESS Severity</div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold" style={{ color: "var(--red)", letterSpacing: "-0.03em" }}>
                  {data.summary.severity.score}
                </span>
                <span className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>/10</span>
              </div>
              <div className="h-1.5 rounded-full mb-2" style={{ background: "var(--page-bg)" }}>
                <div className="h-full rounded-full"
                  style={{ width: `${data.summary.severity.score * 10}%`, background: "var(--red)" }}/>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {data.summary.severity.interpretation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}