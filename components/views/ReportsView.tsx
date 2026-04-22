"use client";
import { useState } from "react";

const reports = [
  { id: "RPT-2026-0422-01", title: "Daily Clinical Summary", patient: "Baby R.", date: "Today 14:00", status: "Ready", pages: 4, format: "PDF", author: "Auto-generated" },
  { id: "RPT-2026-0421-03", title: "Seizure Burden Report", patient: "Baby R.", date: "Yesterday 18:30", status: "Ready", pages: 6, format: "PDF", author: "Dr. K. Arora" },
  { id: "RPT-2026-0421-02", title: "EEG Phenotype Analysis", patient: "Baby R.", date: "Yesterday 12:00", status: "Ready", pages: 3, format: "PDF", author: "Auto-generated" },
  { id: "RPT-2026-0420-05", title: "Weekly Trend Summary", patient: "Baby R.", date: "Apr 20 · 08:00", status: "Ready", pages: 8, format: "PDF", author: "Dr. K. Arora" },
  { id: "RPT-2026-0420-02", title: "Medication Response Log", patient: "Baby R.", date: "Apr 20 · 07:30", status: "Archived", pages: 5, format: "PDF", author: "Dr. P. Shah" },
  { id: "RPT-2026-0419-01", title: "Admission Baseline EEG", patient: "Baby R.", date: "Apr 19 · 11:00", status: "Archived", pages: 10, format: "PDF", author: "Auto-generated" },
];

const sections = [
  { key: "summary", label: "Executive Summary" },
  { key: "eeg", label: "EEG Analysis" },
  { key: "events", label: "Event Log" },
  { key: "phenotype", label: "Phenotype Profile" },
  { key: "trends", label: "Burden Trends" },
  { key: "meds", label: "Medication Response" },
];

export default function ReportsView() {
  const [generating, setGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState(new Set(["summary", "eeg", "events", "phenotype"]));

  function toggle(k: string) {
    setSelectedSections(prev => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  }

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2200);
  }

  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Baby R. · MRN 00482-A</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Generate panel */}
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="card p-5">
            <div className="label mb-4">Generate New Report</div>

            <div className="space-y-1.5 mb-5">
              {sections.map(s => (
                <label key={s.key} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                  style={{ background: selectedSections.has(s.key) ? "var(--blue-light)" : "var(--page-bg)", border: `1px solid ${selectedSections.has(s.key) ? "var(--blue-border)" : "var(--border)"}` }}>
                  <input type="checkbox" checked={selectedSections.has(s.key)} onChange={() => toggle(s.key)}
                    className="w-3.5 h-3.5 accent-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium" style={{ color: selectedSections.has(s.key) ? "var(--blue)" : "var(--text-secondary)" }}>
                    {s.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <div className="label mb-2">Report Period</div>
              <div className="flex rounded-lg overflow-hidden" style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
                {["24H", "72H", "7D", "Full Stay"].map(p => (
                  <button key={p} className="flex-1 text-[11px] font-semibold py-2 transition-all"
                    style={p === "24H"
                      ? { background: "white", color: "var(--blue)", boxShadow: "var(--shadow-xs)" }
                      : { background: "transparent", color: "var(--text-muted)" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: generating ? "rgba(25,103,210,0.5)" : "linear-gradient(135deg, var(--blue), #1251A3)", boxShadow: "0 2px 8px rgba(25,103,210,0.25)" }}>
              {generating ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6"/>
                  </svg>
                  Generate Report
                </>
              )}
            </button>
          </div>

          {/* Quick stats */}
          <div className="card p-4">
            <div className="label mb-3">This Month</div>
            {[
              { label: "Reports generated", value: "12" },
              { label: "Pages total", value: "68" },
              { label: "Shared with team", value: "4" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                <span className="metric text-base">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Report list */}
        <div className="col-span-12 xl:col-span-8">
          <div className="card overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="label">Report History</div>
            </div>

            {reports.map((r, i) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4 transition-colors"
                style={{ borderBottom: i < reports.length - 1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: r.status === "Ready" ? "var(--blue-light)" : "var(--page-bg)", border: `1px solid ${r.status === "Ready" ? "var(--blue-border)" : "var(--border)"}` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={r.status === "Ready" ? "var(--blue)" : "var(--text-muted)"} strokeWidth="2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.date}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>·</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.pages}pp · {r.author}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md flex-shrink-0"
                  style={r.status === "Ready"
                    ? { background: "var(--teal-light)", color: "var(--teal)", border: "1px solid rgba(11,138,116,0.2)" }
                    : { background: "var(--page-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                  {r.status}
                </span>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
