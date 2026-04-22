"use client";
import type { NavId } from "@/app/page";

const nav = [
  {
    group: "Monitor",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z", active: true },
      { id: "patients", label: "Patients", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
      { id: "eeg", label: "EEG Review", icon: "M3 12 Q5 6 7 12 Q9 18 11 12 Q13 6 15 12 Q17 18 19 12 Q21 6 23 12", polyline: true },
      { id: "events", label: "Events", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", badge: "6" },
    ],
  },
  {
    group: "Analyze",
    items: [
      { id: "reports", label: "Reports", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" },
      { id: "trends", label: "Trends", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
      { id: "alerts", label: "Alert Config", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" },
    ],
  },
];

function NavIcon({ d, polyline }: { d: string; polyline?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {polyline ? <polyline points={d.replace(/M|Q/g, " ")} /> : <path d={d} />}
    </svg>
  );
}

export default function Sidebar({
  activeView,
  onNavChange,
  isOpen,
  onClose,
}: {
  activeView: NavId;
  onNavChange: (id: NavId) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const active = activeView;

  function handleNav(id: NavId) {
    onNavChange(id);
    onClose();
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-56 flex flex-col z-40 sidebar-texture transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
      style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 rounded-lg bg-blue-600 opacity-20 blur-sm" />
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 12 Q5 5 8 12 Q11 19 14 12 Q17 5 21 12"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
          </div>
          <div>
            <div className="text-white font-semibold text-[15px] leading-none tracking-tight">
              Neo<span style={{ color: "#FF5C5C" }}>Spasm</span>
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>
              CLINICAL MONITOR
            </div>
          </div>
        </div>
      </div>

      {/* Ward chip */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(25,103,210,0.3)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>PICU · Ward 3B</div>
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>4 active patients</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {nav.map((group) => (
          <div key={group.group}>
            <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.22)" }}>
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id as NavId)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all relative"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.09)" : "transparent",
                      color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                      borderLeft: isActive ? "2px solid #93C5FD" : "2px solid transparent",
                    }}
                  >
                    <NavIcon d={item.icon} polyline={item.polyline} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(217,48,37,0.3)", color: "#FF7070" }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 space-y-0.5" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        {[
          { label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" },
          { label: "Help & Docs", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" },
        ].map((item) => (
          <button key={item.label}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d={item.icon}/>
            </svg>
            {item.label}
          </button>
        ))}

        {/* User */}
        <div className="flex items-center gap-3 px-3 pt-3 mt-1" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}>
            KA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.8)" }}>Dr. K. Arora</div>
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Lead Clinician</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
        </div>
      </div>
    </aside>
  );
}
