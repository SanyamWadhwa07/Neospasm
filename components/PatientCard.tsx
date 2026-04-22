export default function PatientCard() {
  const fields = [
    { label: "Etiology", value: "Structural (R MCD)", priority: true },
    { label: "Clinician", value: "Dr. K. Arora", priority: true },
    { label: "Admitted", value: "Apr 15", priority: false },
    { label: "Weight", value: "7.2 kg", priority: false },
  ];

  return (
    <div className="card flex items-center gap-0 overflow-hidden">
      {/* Left accent strip */}
      <div className="w-1 self-stretch flex-shrink-0" style={{ background: "var(--red)" }} />

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3.5 flex-1 min-w-0">
        {/* Avatar + name */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--red-light)", border: "1px solid var(--red-border)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.75" strokeLinecap="round">
              <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Baby R.</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded"
                style={{ background: "var(--blue-light)", color: "var(--blue)", border: "1px solid var(--blue-border)" }}>
                00482-A
              </span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>F · 6 mo · Day 3</div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-8 w-px flex-shrink-0" style={{ background: "var(--border)" }} />

        {/* Info fields */}
        <div className="flex items-center gap-5 flex-wrap flex-1 min-w-0">
          {fields.map((f) => (
            <div key={f.label} className={`flex-shrink-0 ${f.priority ? "" : "hidden md:block"}`}>
              <div className="label mb-0.5">{f.label}</div>
              <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red-border)" }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--red)" }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--red)" }} />
          </span>
          <span className="hidden sm:inline">Active Monitoring</span>
          <span className="sm:hidden">Live</span>
        </div>
      </div>
    </div>
  );
}
