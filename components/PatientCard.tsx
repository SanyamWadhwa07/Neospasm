export default function PatientCard() {
  const fields = [
    { label: "Etiology", value: "Structural (R MCD)" },
    { label: "Lead Clinician", value: "Dr. K. Arora" },
    { label: "Admitted", value: "Apr 15 · 09:04" },
    { label: "Monitoring Day", value: "Day 3" },
    { label: "Weight", value: "7.2 kg" },
    { label: "Age", value: "6 months" },
  ];

  return (
    <div className="card flex items-center gap-0 overflow-hidden">
      {/* Left accent strip */}
      <div className="w-1 self-stretch flex-shrink-0" style={{ background: "var(--red)" }} />

      <div className="flex items-center gap-5 px-5 py-4 flex-1 min-w-0">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--red-light)", border: "1px solid var(--red-border)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.75" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
          </svg>
        </div>

        {/* Name */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Baby R.</span>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md"
              style={{ background: "var(--blue-light)", color: "var(--blue)", border: "1px solid var(--blue-border)" }}>
              MRN 00482-A
            </span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>F · 6 mo · Day 3</div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px mx-1 flex-shrink-0" style={{ background: "var(--border)" }} />

        {/* Info grid */}
        <div className="flex items-center gap-6 flex-1 min-w-0 overflow-x-auto">
          {fields.map((f) => (
            <div key={f.label} className="flex-shrink-0">
              <div className="label mb-0.5">{f.label}</div>
              <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red-border)" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--red)" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--red)" }} />
            </span>
            Active Monitoring
          </div>
        </div>
      </div>
    </div>
  );
}
