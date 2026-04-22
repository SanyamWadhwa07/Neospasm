"use client";
import { useState, useEffect } from "react";
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

export default function TopBar({ activeView, onNavChange }: { activeView: NavId; onNavChange: (id: NavId) => void }) {
  void onNavChange;
  const [time, setTime] = useState("14:23:47");

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
    <header className="h-14 flex items-center px-6 gap-4 sticky top-0 z-30"
      style={{ background: "rgba(242,244,248,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border)" }}>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{viewLabels[activeView]}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        <span style={{ color: "var(--text-secondary)" }}>Baby R.</span>
        <span style={{ color: "var(--text-muted)" }}>·</span>
        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>MRN 00482-A</span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg ml-2 transition-all w-52 focus-within:w-64"
        style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Search…" className="text-sm bg-transparent outline-none flex-1 min-w-0"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}
        />
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--page-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>⌘K</kbd>
      </div>

      <div className="flex-1" />

      {/* Alert pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
        style={{ background: "var(--red-light)", border: "1px solid var(--red-border)", color: "var(--red)" }}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--red)" }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--red)" }} />
        </span>
        1 ACTIVE ALERT
      </div>

      {/* Clock */}
      <div className="font-mono text-sm tabular-nums hidden lg:block" style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}>
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
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        style={{ background: "white", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        Share
      </button>

      {/* Generate report */}
      <button onClick={() => onNavChange("reports")} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white transition-all"
        style={{ background: "linear-gradient(135deg, #1967D2, #1251A3)", boxShadow: "0 1px 4px rgba(25,103,210,0.35)" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        Generate Report
      </button>
    </header>
  );
}
