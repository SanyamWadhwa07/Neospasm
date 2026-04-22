function BrainMap() {
  const electrodes = [
    { id: "Fp1", x: 62, y: 30, active: false },
    { id: "Fp2", x: 88, y: 30, active: true },
    { id: "F7",  x: 38, y: 50, active: false },
    { id: "F3",  x: 62, y: 47, active: true },
    { id: "Fz",  x: 75, y: 44, active: false },
    { id: "F4",  x: 88, y: 47, active: true },
    { id: "F8",  x: 112, y: 50, active: false },
    { id: "T3",  x: 28, y: 72, active: false },
    { id: "C3",  x: 55, y: 72, active: false },
    { id: "Cz",  x: 75, y: 70, active: false },
    { id: "C4",  x: 95, y: 72, active: false },
    { id: "T4",  x: 122, y: 72, active: false },
    { id: "T5",  x: 36, y: 94, active: false },
    { id: "P3",  x: 58, y: 94, active: false },
    { id: "Pz",  x: 75, y: 96, active: false },
    { id: "P4",  x: 92, y: 94, active: false },
    { id: "T6",  x: 114, y: 94, active: false },
    { id: "O1",  x: 62, y: 114, active: false },
    { id: "O2",  x: 88, y: 114, active: false },
  ];

  return (
    <div className="rounded-xl p-3" style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
      <svg viewBox="0 0 150 148" className="w-full h-28">
        <ellipse cx="75" cy="72" rx="54" ry="60" fill="white" stroke="var(--border-strong)" strokeWidth="1"/>
        {/* Right frontal activation */}
        <ellipse cx="90" cy="42" rx="20" ry="15" fill="rgba(217,48,37,0.08)" stroke="rgba(217,48,37,0.2)" strokeWidth="0.5"/>
        {electrodes.map((e) => (
          <g key={e.id}>
            {e.active && <circle cx={e.x} cy={e.y} r={8} fill="rgba(217,48,37,0.1)" />}
            <circle cx={e.x} cy={e.y} r={3} fill={e.active ? "var(--red)" : "var(--border-strong)"} />
          </g>
        ))}
        {/* Midline */}
        <line x1="75" y1="14" x2="75" y2="134" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1="22" y1="72" x2="128" y2="72" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
        <text x="24" y="68" fontSize="7" fill="var(--text-muted)" fontFamily="var(--font-mono)">L</text>
        <text x="118" y="68" fontSize="7" fill="var(--text-muted)" fontFamily="var(--font-mono)">R</text>
      </svg>
      <div className="text-center text-[11px] font-mono mt-1" style={{ color: "var(--text-muted)" }}>R &gt; L · Δ 38%</div>
    </div>
  );
}

function BodyDiagram() {
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
      <svg viewBox="0 0 120 148" className="w-full h-28">
        {/* Head */}
        <circle cx="60" cy="20" r="14" fill="var(--red-light)" stroke="rgba(217,48,37,0.2)" strokeWidth="1"/>
        {/* Torso */}
        <rect x="38" y="36" width="44" height="46" rx="8" fill="var(--red-light)" stroke="rgba(217,48,37,0.15)" strokeWidth="1"/>
        {/* Right arm - highlighted */}
        <rect x="82" y="40" width="18" height="36" rx="7" fill="rgba(217,48,37,0.25)" stroke="var(--red)" strokeWidth="1"/>
        {/* Left arm */}
        <rect x="20" y="40" width="18" height="36" rx="7" fill="var(--red-light)" stroke="rgba(217,48,37,0.15)" strokeWidth="1"/>
        {/* Legs */}
        <rect x="38" y="82" width="19" height="48" rx="8" fill="var(--red-light)" stroke="rgba(217,48,37,0.15)" strokeWidth="1"/>
        <rect x="63" y="82" width="19" height="48" rx="8" fill="var(--red-light)" stroke="rgba(217,48,37,0.15)" strokeWidth="1"/>
        {/* L / R labels */}
        <text x="15" y="18" fontSize="8" fontWeight="600" fill="var(--text-muted)" fontFamily="var(--font-mono)">L</text>
        <text x="99" y="18" fontSize="8" fontWeight="600" fill="var(--text-muted)" fontFamily="var(--font-mono)">R</text>
        {/* Right arm dot */}
        <circle cx="91" cy="58" r="3" fill="var(--red)"/>
      </svg>
      <div className="text-center text-[11px] font-mono mt-1" style={{ color: "var(--text-muted)" }}>AI 0.61 · R &gt; L</div>
    </div>
  );
}

export default function PhenotypeAnalysis() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="label mb-1">Phenotype Analysis</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Last event · Focal, right frontal</div>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
          style={{ background: "var(--blue-light)", color: "var(--blue)", border: "1px solid var(--blue-border)" }}>
          FOCAL
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="label mb-2">EEG Focality</div>
          <BrainMap />
        </div>
        <div>
          <div className="label mb-2">Motor Asymmetry</div>
          <BodyDiagram />
        </div>
      </div>

      {/* Concordant banner */}
      <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
        style={{ background: "rgba(11,138,116,0.07)", border: "1px solid rgba(11,138,116,0.15)" }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "rgba(11,138,116,0.15)" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <span className="font-semibold" style={{ color: "var(--teal)" }}>Concordant modalities.</span>{" "}
          Right-frontal EEG focus aligned with right-lateralized motor response.
        </p>
      </div>
    </div>
  );
}
