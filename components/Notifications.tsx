"use client";

const items = [
  {
    icon: "person",
    iconBg: "var(--blue-light)",
    iconColor: "var(--blue)",
    title: "Clinician paged",
    desc: "-", // "Dr. Arora notified — cluster alert 14:09"
    time: "14:10",
    urgent: false,
  },
  {
    icon: "score",
    iconBg: "var(--red-light)",
    iconColor: "var(--red)",
    title: "IESS score updated",
    desc: "-", // "6.8 → 7.2 following afternoon cluster"
    time: "14:20",
    urgent: true,
  },
  {
    icon: "check",
    iconBg: "var(--teal-light)",
    iconColor: "var(--teal)",
    title: "Model confidence recalibrated",
    desc: "EEG branch drift corrected against baseline",
    time: "13:22",
    urgent: false,
  },
  {
    icon: "warning",
    iconBg: "var(--amber-light)",
    iconColor: "var(--amber)",
    title: "Electrode impedance — C4 elevated",
    desc: "22 kΩ · consider re-gel if >30 min",
    time: "12:04",
    urgent: false,
  },
];

const iconPaths: Record<string, string> = {
  person: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  check: "M20 6L9 17l-5-5",
  warning: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  score: "M3 12 Q5 5 8 12 Q11 19 14 12 Q17 5 21 12",
};

export default function Notifications() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <div className="label mb-0.5">Live Notifications</div>
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>4 today</span>
        </div>
        <button className="text-xs font-semibold transition-colors" style={{ color: "var(--blue)" }}>
          View all
        </button>
      </div>

      <div>
        {items.map((n, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5 transition-colors"
            style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: n.iconBg, border: `1px solid ${n.iconBg}` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={n.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={iconPaths[n.icon]}/>
                {n.icon === "warning" && <circle cx="12" cy="17" r="0.5" fill={n.iconColor}/>}
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{n.title}</span>
                {n.urgent && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: "var(--red-light)", color: "var(--red)" }}>NEW</span>
                )}
              </div>
              <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{n.desc}</div>
            </div>
            <span className="text-[11px] font-mono flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }}>{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
