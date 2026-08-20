"use client";
import { useState, useEffect } from "react";
import { useSpasmData } from "@/lib/use-spasm-data";
import type { NavId } from "@/app/page";

const viewLabels: Record<NavId, string> = {
  dashboard: "Dashboard",
  patients:  "Patients",
  eeg:       "EEG Review",
  events:    "Event Log",
  reports:   "Reports",
  trends:    "Trends",
  alerts:    "Alert Config",
};

export default function TopBar({
  activeView,
  onNavChange,
  onMenuClick,
}: {
  activeView: NavId;
  onNavChange: (id: NavId) => void;
  onMenuClick: () => void;
}) {
  const [time, setTime] = useState("--:--:--");
  const { summary } = useSpasmData();

  // Use real patient name; fall back gracefully while loading
  const patientName = summary?.patient?.name ?? "Baby R.";
  const patientId   = summary?.patient?.id   ?? "00482-A";

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30"
      style={{ background: "rgba(242,244,248,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border)" }}>

      {/* Hamburger — mobile only */}
      <button
        className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: "white", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>
        </svg>
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{viewLabels[activeView]}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" className="hidden sm:block">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        <span className="hidden sm:block truncate max-w-[160px]" style={{ color: "var(--text-secondary)" }}>
          {patientName}
        </span>
        <span className="hidden sm:block" style={{ color: "var(--text-muted)" }}>·</span>
        <span className="font-mono text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
          MRN {patientId}
        </span>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ml-1 w-44 lg:w-52 transition-all focus-within:w-60"
        style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Search…" className="text-sm bg-transparent outline-none flex-1 min-w-0"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}
        />
        <kbd className="hidden lg:block text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: "var(--page-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>⌘K</kbd>
      </div>

      <div className="flex-1" />

      {/* Alert pill */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
        style={{ background: "var(--red-light)", border: "1px solid var(--red-border)", color: "var(--red)" }}>
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--red)" }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--red)" }} />
        </span>
        <span className="hidden sm:inline">1 ACTIVE ALERT</span>
      </div>

      {/* Clock */}
      <div className="font-mono text-sm tabular-nums hidden xl:block" style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}>
        {time}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "white", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
          style={{ background: "var(--red)" }}>4</span>
      </div>

      {/* Share */}
      <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        style={{ background: "white", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        Share
      </button>

      {/* Generate report */}
      <button onClick={() => onNavChange("reports")}
        className="flex items-center gap-1.5 px-3 md:px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white transition-all"
        style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)", boxShadow: "0 1px 4px rgba(25,103,210,0.35)" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span className="hidden sm:inline">Generate Report</span>
      </button>
    </header>
  );
}
