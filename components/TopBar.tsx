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
  docs:      "Help & Docs",
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { summary } = useSpasmData();

  // The inline script in layout.tsx already stamped data-theme on <html>
  // before hydration — read it back rather than re-deciding, so this button's
  // icon matches what's actually on screen.
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("neospasm-theme", next); } catch { /* storage unavailable */ }
  }

  const notifications = [
    { title: "Clinician paged", desc: "Dr. Sahu notified after the latest cluster alert", time: "14:10" },
    { title: "IESS score updated", desc: "Rose following the afternoon cluster", time: "14:20" },
    { title: "Model confidence recalibrated", desc: "EEG branch drift corrected against baseline", time: "13:22" },
    { title: "Electrode impedance elevated on C4", desc: "22 kΩ · consider re-gel if >30 min", time: "12:04" },
  ];

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title: "NeoSpasm Clinical Monitor", url }); return; } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 1500);
    } catch { /* clipboard unavailable */ }
  }

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
      style={{ background: "var(--topbar-bg)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border)" }}>

      {/* Hamburger — mobile only */}
      <button
        className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
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
        style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
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

      {/* Clock */}
      <div className="font-mono text-sm tabular-nums hidden xl:block" style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}>
        {time}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button onClick={() => setNotifOpen(o => !o)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}
          aria-label="Notifications" aria-expanded={notifOpen}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
          style={{ background: "var(--red)" }}>{notifications.length}</span>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-10 w-80 rounded-xl z-40 overflow-hidden"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</span>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="px-4 py-3"
                  style={{ borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{n.title}</span>
                    <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "var(--text-muted)" }}>{n.time}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{n.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
        {theme === "dark" ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {/* Share — Web Share API where available, otherwise copies the link */}
      <button onClick={handleShare}
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        {shareState === "copied" ? "Link copied" : "Share"}
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
