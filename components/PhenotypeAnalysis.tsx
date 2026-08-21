"use client";
import { useSpasmData } from "@/lib/use-spasm-data";
import type { Laterality } from "@/types/spasm";

// ─── Electrode layout ─────────────────────────────────────────────────────────

const ALL_ELECTRODES = [
  { id: "Fp1", x: 62,  y: 30,  side: "L" },
  { id: "Fp2", x: 88,  y: 30,  side: "R" },
  { id: "F7",  x: 38,  y: 50,  side: "L" },
  { id: "F3",  x: 62,  y: 47,  side: "L" },
  { id: "Fz",  x: 75,  y: 44,  side: "M" },
  { id: "F4",  x: 88,  y: 47,  side: "R" },
  { id: "F8",  x: 112, y: 50,  side: "R" },
  { id: "T3",  x: 28,  y: 72,  side: "L" },
  { id: "C3",  x: 55,  y: 72,  side: "L" },
  { id: "Cz",  x: 75,  y: 70,  side: "M" },
  { id: "C4",  x: 95,  y: 72,  side: "R" },
  { id: "T4",  x: 122, y: 72,  side: "R" },
  { id: "T5",  x: 36,  y: 94,  side: "L" },
  { id: "P3",  x: 58,  y: 94,  side: "L" },
  { id: "Pz",  x: 75,  y: 96,  side: "M" },
  { id: "P4",  x: 92,  y: 94,  side: "R" },
  { id: "T6",  x: 114, y: 94,  side: "R" },
  { id: "O1",  x: 62,  y: 114, side: "L" },
  { id: "O2",  x: 88,  y: 114, side: "R" },
];

// Frontal electrodes activated per laterality
const ACTIVE_MAP: Record<string, string[]> = {
  R:         ["Fp2", "F4", "F8"],
  L:         ["Fp1", "F3", "F7"],
  BILATERAL: ["Fp1", "Fp2", "F3", "F4"],
  null:      [],
};

// Focal highlight ellipse per laterality
const FOCUS_ELLIPSE: Record<string, { cx: number; cy: number; rx: number; ry: number } | null> = {
  R:         { cx: 90, cy: 42, rx: 20, ry: 15 },
  L:         { cx: 60, cy: 42, rx: 20, ry: 15 },
  BILATERAL: { cx: 75, cy: 42, rx: 30, ry: 15 },
  null:      null,
};

// ─── Brain map ────────────────────────────────────────────────────────────────

function BrainMap({ laterality, asymmetryPct }: { laterality: Laterality; asymmetryPct: number }) {
  const activeIds = ACTIVE_MAP[laterality ?? "null"] ?? [];
  const ellipse   = FOCUS_ELLIPSE[laterality ?? "null"];
  const label     = laterality === "BILATERAL" ? "L = R" : laterality === "R" ? "R > L" : laterality === "L" ? "L > R" : "Diffuse";

  return (
    <div className="rounded-xl p-3" style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
      <svg viewBox="0 0 150 148" className="w-full h-28">
        <ellipse cx="75" cy="72" rx="54" ry="60" style={{ fill: "var(--card-bg)" }} stroke="var(--border-strong)" strokeWidth="1"/>
        {ellipse && (
          <ellipse cx={ellipse.cx} cy={ellipse.cy} rx={ellipse.rx} ry={ellipse.ry}
            fill="rgba(217,48,37,0.08)" stroke="rgba(217,48,37,0.2)" strokeWidth="0.5"/>
        )}
        {ALL_ELECTRODES.map((e) => {
          const active = activeIds.includes(e.id);
          return (
            <g key={e.id}>
              {active && <circle cx={e.x} cy={e.y} r={8} fill="rgba(217,48,37,0.1)" />}
              <circle cx={e.x} cy={e.y} r={3} fill={active ? "var(--red)" : "var(--border-strong)"} />
            </g>
          );
        })}
        <line x1="75" y1="14" x2="75" y2="134" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1="22" y1="72" x2="128" y2="72" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
        <text x="24" y="68" fontSize="7" fill="var(--text-muted)" fontFamily="var(--font-mono)">L</text>
        <text x="118" y="68" fontSize="7" fill="var(--text-muted)" fontFamily="var(--font-mono)">R</text>
      </svg>
      <div className="text-center text-[11px] font-mono mt-1" style={{ color: "var(--text-muted)" }}>
        {label} · Δ {asymmetryPct}%
      </div>
    </div>
  );
}

// ─── Body diagram ─────────────────────────────────────────────────────────────

function BodyDiagram({ laterality, aiScore }: { laterality: Laterality; aiScore: number }) {
  // Motor findings are contralateral to the EEG focus (corticospinal tracts
  // cross): a right-hemisphere EEG focus (laterality "R") predicts left-sided
  // limb involvement, not right-sided.
  const rightActive = laterality === "L" || laterality === "BILATERAL";
  const leftActive  = laterality === "R" || laterality === "BILATERAL";
  const label       = laterality === "BILATERAL" ? "Bilateral" : laterality === "R" ? "L > R" : laterality === "L" ? "R > L" : "Symmetric";

  return (
    <div className="rounded-xl p-3" style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
      <svg viewBox="0 0 120 148" className="w-full h-28">
        <circle cx="60" cy="20" r="14" fill="var(--red-light)" stroke="rgba(217,48,37,0.2)" strokeWidth="1"/>
        <rect x="38" y="36" width="44" height="46" rx="8" fill="var(--red-light)" stroke="rgba(217,48,37,0.15)" strokeWidth="1"/>
        <rect x="82" y="40" width="18" height="36" rx="7"
          fill={rightActive ? "rgba(217,48,37,0.25)" : "var(--red-light)"}
          stroke={rightActive ? "var(--red)" : "rgba(217,48,37,0.15)"} strokeWidth="1"/>
        <rect x="20" y="40" width="18" height="36" rx="7"
          fill={leftActive ? "rgba(217,48,37,0.25)" : "var(--red-light)"}
          stroke={leftActive ? "var(--red)" : "rgba(217,48,37,0.15)"} strokeWidth="1"/>
        <rect x="38" y="82" width="19" height="48" rx="8" fill="var(--red-light)" stroke="rgba(217,48,37,0.15)" strokeWidth="1"/>
        <rect x="63" y="82" width="19" height="48" rx="8" fill="var(--red-light)" stroke="rgba(217,48,37,0.15)" strokeWidth="1"/>
        <text x="15" y="18" fontSize="8" fontWeight="600" fill="var(--text-muted)" fontFamily="var(--font-mono)">L</text>
        <text x="99" y="18" fontSize="8" fontWeight="600" fill="var(--text-muted)" fontFamily="var(--font-mono)">R</text>
        {rightActive && <circle cx="91" cy="58" r="3" fill="var(--red)"/>}
        {leftActive  && <circle cx="29" cy="58" r="3" fill="var(--red)"/>}
      </svg>
      <div className="text-center text-[11px] font-mono mt-1" style={{ color: "var(--text-muted)" }}>
        AI {aiScore.toFixed(2)} · {label}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PhenotypeAnalysis() {
  const { events, loading, error } = useSpasmData();

  // Use last event as "current" phenotype (most recent is highest id)
  const lastEvent  = events[events.length - 1] ?? null;
  const laterality = lastEvent?.laterality ?? null;
  const spasmType  = lastEvent?.type ?? "FOCAL";

  // Derived stats from all events
  const totalEvents = events.length;
  const rightCount  = events.filter(e => e.laterality === "R").length;
  const leftCount   = events.filter(e => e.laterality === "L").length;
  const asymmetryPct = totalEvents > 0
    ? Math.round(Math.abs(rightCount - leftCount) / totalEvents * 100)
    : 38; // illustrative default while events are still loading

  const avgConfidence = events.length
    ? Math.round(events.reduce((s, e) => s + e.fusionConfidencePct, 0) / events.length) / 100
    : 0.61; // illustrative default while events are still loading

  // Concordance: motor findings contralateral to the EEG focus, as expected
  // from crossed corticospinal tracts — a right-hemisphere focus predicts
  // left-sided limb involvement, not right-sided.
  const isConcordant = laterality !== null && laterality !== "BILATERAL";
  const concordantText = laterality === "R"
    ? "Right-frontal EEG focus with contralateral left-sided motor involvement."
    : laterality === "L"
    ? "Left-frontal EEG focus with contralateral right-sided motor involvement."
    : "Bilateral EEG involvement with symmetric motor pattern.";

  const typeLabel = spasmType === "CLUSTER" ? "CLUSTER" : spasmType === "FOCAL" ? "FOCAL" : "DIFFUSE";
  const descLabel = lastEvent?.description ?? "Focal, right frontal";

  if (loading) {
    return (
      <div className="card p-5 animate-pulse space-y-3">
        <div className="h-4 rounded" style={{ background: "var(--border)", width: "40%" }}/>
        <div className="h-3 rounded" style={{ background: "var(--border)", width: "60%" }}/>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-36 rounded-xl" style={{ background: "var(--border)" }}/>
          <div className="h-36 rounded-xl" style={{ background: "var(--border)" }}/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-5">
        <div className="text-xs" style={{ color: "var(--red)" }}>Failed to load phenotype: {error}</div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="label mb-1">Phenotype Analysis</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Last event · {descLabel}
          </div>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
          style={{ background: "var(--blue-light)", color: "var(--blue)", border: "1px solid var(--blue-border)" }}>
          {typeLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="label mb-2">EEG Focality</div>
          <BrainMap laterality={laterality} asymmetryPct={asymmetryPct} />
        </div>
        <div>
          <div className="label mb-2">Motor Asymmetry</div>
          <BodyDiagram laterality={laterality} aiScore={avgConfidence} />
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
        style={isConcordant
          ? { background: "rgba(11,138,116,0.07)", border: "1px solid rgba(11,138,116,0.15)" }
          : { background: "rgba(217,48,37,0.05)", border: "1px solid rgba(217,48,37,0.15)" }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: isConcordant ? "rgba(11,138,116,0.15)" : "rgba(217,48,37,0.1)" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke={isConcordant ? "var(--teal)" : "var(--red)"}
            strokeWidth="3" strokeLinecap="round">
            {isConcordant
              ? <path d="M20 6L9 17l-5-5"/>
              : <path d="M12 9v4M12 17h.01"/>}
          </svg>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <span className="font-semibold" style={{ color: isConcordant ? "var(--teal)" : "var(--red)" }}>
            {isConcordant ? "Concordant modalities." : "Bilateral pattern."}
          </span>{" "}
          {concordantText}
        </p>
      </div>
    </div>
  );
}
