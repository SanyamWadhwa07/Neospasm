"use client";
import { useState } from "react";
import jsPDF from "jspdf";
import { useSpasmData } from "@/lib/use-spasm-data";
import type { SpasmEvent } from "@/types/spasm";

const reports = [
  { id: "RPT-2022-0113-01", title: "Daily Clinical Summary",    patient: "B/O Amandeep Kaur", date: "Jan 13 · 06:04", status: "Ready",    pages: 4,  format: "PDF", author: "Auto-generated" },
  { id: "RPT-2022-0113-02", title: "Seizure Burden Report",     patient: "B/O Amandeep Kaur", date: "Jan 13 · 08:00", status: "Ready",    pages: 6,  format: "PDF", author: "Dr. K. Arora" },
  { id: "RPT-2022-0113-03", title: "EEG Phenotype Analysis",    patient: "B/O Amandeep Kaur", date: "Jan 13 · 10:00", status: "Ready",    pages: 3,  format: "PDF", author: "Auto-generated" },
  { id: "RPT-2022-0113-04", title: "Weekly Trend Summary",      patient: "B/O Amandeep Kaur", date: "Jan 13 · 12:00", status: "Ready",    pages: 8,  format: "PDF", author: "Dr. K. Arora" },
  { id: "RPT-2022-0112-01", title: "Medication Response Log",   patient: "B/O Amandeep Kaur", date: "Jan 12 · 14:00", status: "Archived", pages: 5,  format: "PDF", author: "Dr. P. Shah" },
  { id: "RPT-2022-0111-01", title: "Admission Baseline EEG",    patient: "B/O Amandeep Kaur", date: "Jan 11 · 09:00", status: "Archived", pages: 10, format: "PDF", author: "Auto-generated" },
];

const sections = [
  { key: "summary",   label: "Executive Summary" },
  { key: "eeg",       label: "EEG Analysis" },
  { key: "events",    label: "Event Log" },
  { key: "phenotype", label: "Phenotype Profile" },
  { key: "trends",    label: "Burden Trends" },
  { key: "meds",      label: "Medication Response" },
];

const meds = [
  { name: "ACTH",       dose: "40 IU/m²/day",  start: "Day 1", response: "Partial — 32% reduction", status: "Active" },
  { name: "Vigabatrin", dose: "100 mg/kg/day",  start: "Day 2", response: "Augmentation ongoing",    status: "Active" },
  { name: "Pyridoxine", dose: "100 mg/day",     start: "Day 1", response: "No isolated response",    status: "Discontinued" },
];

function generatePDF(
  selectedSections: Set<string>,
  period: string,
  patientName: string,
  patientId: string,
  totalSpasms: number,
  burden: number,
  iessScore: number,
  iessInterp: string,
  clinician: string,
  examDate: string,
  eegChannels: number,
  events: SpasmEvent[]
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  const colors = {
    navy:  [12,  18,  32]  as [number,number,number],
    blue:  [25,  103, 210] as [number,number,number],
    red:   [217, 48,  37]  as [number,number,number],
    teal:  [11,  138, 116] as [number,number,number],
    amber: [201, 106, 0]   as [number,number,number],
    gray:  [90,  100, 128] as [number,number,number],
    light: [242, 244, 248] as [number,number,number],
    border:[220, 224, 232] as [number,number,number],
    white: [255, 255, 255] as [number,number,number],
    text:  [13,  17,  23]  as [number,number,number],
  };

  const setFill      = (c: [number,number,number]) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw      = (c: [number,number,number]) => doc.setDrawColor(c[0], c[1], c[2]);
  const setTextColor = (c: [number,number,number]) => doc.setTextColor(c[0], c[1], c[2]);

  // Header bar
  setFill(colors.navy);
  doc.rect(0, 0, W, 28, "F");
  setTextColor(colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Neo", margin + 4, 12);
  doc.setTextColor(255, 100, 100);
  doc.text("Spasm", margin + 4 + doc.getTextWidth("Neo"), 12);
  setTextColor(colors.white);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("CLINICAL MONITOR  ·  INFANT EPILEPSY MONITORING SYSTEM", margin + 4, 18);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CLINICAL REPORT", W - margin, 10, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Generated ${dateStr} at ${timeStr}`, W - margin, 16, { align: "right" });
  doc.text(`Period: ${period}`, W - margin, 21, { align: "right" });

  y = 36;

  // Patient strip — real data
  setFill(colors.light);
  setDraw(colors.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 20, 2, 2, "FD");
  setFill(colors.red);
  doc.roundedRect(margin, y, 3, 20, 1, 1, "F");

  setTextColor(colors.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(patientName, margin + 8, y + 7.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setTextColor(colors.gray);
  doc.text(`Female · 6 months · West Syndrome (IESS)`, margin + 8, y + 13);

  const infoCols = [
    { label: "MRN",             val: patientId },
    { label: "Exam Date",       val: new Date(examDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
    { label: "Day",             val: "Day 3" },
    { label: "Lead Clinician",  val: clinician },
    { label: "EEG Channels",    val: String(eegChannels) },
    { label: "Ward",            val: "PICU · 3B-04" },
  ];
  const colW = (contentW - 60) / 3;
  infoCols.forEach((col, i) => {
    const cx = margin + 60 + (i % 3) * colW;
    const cy = y + (i < 3 ? 7 : 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    setTextColor(colors.gray);
    doc.text(col.label.toUpperCase(), cx, cy - 1.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(colors.text);
    doc.text(col.val, cx, cy + 3.5);
  });

  y += 28;

  // IESS banner — real score
  setFill(colors.red);
  doc.roundedRect(margin, y, contentW, 14, 2, 2, "F");
  setTextColor(colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("IESS SEVERITY INDEX", margin + 5, y + 6);
  doc.setFontSize(16);
  doc.text(`${iessScore} / 10`, margin + 5, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`${totalSpasms} spasms  ·  Burden ${burden}%  ·  ${iessInterp.slice(0, 60)}…`, margin + 42, y + 12);
  y += 22;

  function sectionHeader(title: string) {
    setTextColor(colors.gray);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(title, margin, y + 3);
    setDraw(colors.border);
    doc.setLineWidth(0.2);
    doc.line(margin + doc.getTextWidth(title) + 3, y + 1.5, margin + contentW, y + 1.5);
    y += 8;
  }

  function checkPage(needed: number) {
    if (y + needed > 270) { doc.addPage(); y = 20; }
  }

  // EXECUTIVE SUMMARY
  if (selectedSections.has("summary")) {
    checkPage(50);
    sectionHeader("EXECUTIVE SUMMARY");

    const focalCount   = events.filter(e => e.type === "FOCAL").length;
    const clusterCount = events.filter(e => e.type === "CLUSTER").length;

    const summaryText = [
      `${patientName} is a 6-month-old female admitted on Day 3 with infantile epileptic spasm syndrome (IESS). The IESS severity score is ${iessScore}/10, with ${totalSpasms} spasms recorded in this EEG session (${burden}% recording burden).`,
      `${clusterCount} cluster-type and ${focalCount} focal spasms were detected. The predominant phenotype is right-frontal with concordant EEG focality. Average inter-spasm interval was ${events.length > 1 ? events[1].interSpasmInterval ?? "—" : "—"}s, indicating rapid succession.`,
      `Current treatment with ACTH and Vigabatrin has produced a partial 32% reduction in event frequency. Continued monitoring and possible dose adjustment are recommended. ${iessInterp}`,
    ];

    summaryText.forEach(para => {
      checkPage(20);
      const lines = doc.splitTextToSize(para, contentW);
      setTextColor(colors.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(lines, margin, y);
      y += lines.length * 4.5 + 4;
    });

    checkPage(22);
    const kpis = [
      { label: "Total Spasms",  val: String(totalSpasms), color: colors.red },
      { label: "Burden",        val: `${burden}%`,         color: colors.amber },
      { label: "IESS Score",    val: String(iessScore),    color: colors.red },
      { label: "EEG Channels",  val: String(eegChannels),  color: colors.blue },
    ];
    const kpiW = contentW / kpis.length;
    kpis.forEach((k, i) => {
      const kx = margin + i * kpiW;
      setFill(colors.light);
      setDraw(colors.border);
      doc.setLineWidth(0.2);
      doc.roundedRect(kx + 1, y, kpiW - 2, 16, 2, 2, "FD");
      setTextColor(colors.gray);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text(k.label.toUpperCase(), kx + 4, y + 5);
      setTextColor(k.color);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(k.val, kx + 4, y + 13);
    });
    y += 22;
  }

  // EVENT LOG — real events
  if (selectedSections.has("events")) {
    checkPage(60);
    sectionHeader("EVENT LOG");

    setFill(colors.navy);
    doc.roundedRect(margin, y, contentW, 7, 1, 1, "F");
    const cols = [
      { label: "TIME",   x: margin + 3  },
      { label: "TYPE",   x: margin + 18 },
      { label: "SIDE",   x: margin + 38 },
      { label: "DUR.",   x: margin + 50 },
      { label: "DESCRIPTION", x: margin + 64 },
      { label: "CONF",   x: margin + 148 },
    ];
    setTextColor(colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    cols.forEach(c => doc.text(c.label, c.x, y + 4.8));
    y += 8;

    // Use real events (newest first)
    const eventsToShow = [...events].reverse().slice(0, 20);
    eventsToShow.forEach((ev, i) => {
      checkPage(8);
      const rowBg = i % 2 === 0 ? colors.white : colors.light;
      setFill(rowBg);
      setDraw(colors.border);
      doc.setLineWidth(0.15);
      doc.rect(margin, y, contentW, 6.5, "FD");

      const typeColor = ev.type === "CLUSTER" ? colors.red : ev.type === "FOCAL" ? colors.blue : colors.gray;
      setTextColor(typeColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(ev.wallClockTime, margin + 3, y + 4.5);
      doc.text(ev.type, margin + 18, y + 4.5);

      setTextColor(colors.text);
      doc.setFont("helvetica", "normal");
      const side = ev.laterality === "BILATERAL" ? "Both" : (ev.laterality ?? "—");
      doc.text(side, margin + 38, y + 4.5);
      doc.text(`${ev.durationSec}s`, margin + 50, y + 4.5);
      doc.text(ev.description.slice(0, 45), margin + 64, y + 4.5);
      setTextColor(typeColor);
      doc.setFont("helvetica", "bold");
      doc.text(`${ev.fusionConfidencePct}%`, margin + 148, y + 4.5);
      y += 6.5;
    });

    if (events.length > 20) {
      setTextColor(colors.gray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(`… and ${events.length - 20} more events`, margin, y + 5);
      y += 10;
    }
    y += 4;
  }

  // MEDICATION RESPONSE
  if (selectedSections.has("meds")) {
    checkPage(45);
    sectionHeader("MEDICATION RESPONSE");
    meds.forEach((m) => {
      checkPage(24);
      const statusColor = m.status === "Active" ? colors.teal : colors.gray;
      setFill(colors.light);
      setDraw(colors.border);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentW, 18, 2, 2, "FD");
      const medBg = m.status === "Active" ? [237,251,248] as [number,number,number] : [242,244,248] as [number,number,number];
      doc.setFillColor(medBg[0], medBg[1], medBg[2]);
      doc.roundedRect(W - margin - 26, y + 4, 24, 6, 1, 1, "F");
      setTextColor(statusColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text(m.status.toUpperCase(), W - margin - 24, y + 8.5);
      setTextColor(colors.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(m.name, margin + 5, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      setTextColor(colors.gray);
      doc.text(`Dose: ${m.dose}  ·  Started: ${m.start}`, margin + 5, y + 13);
      setTextColor(colors.text);
      doc.setFontSize(8);
      doc.text(`Response: ${m.response}`, margin + 5, y + 17);
      y += 22;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    setFill(colors.navy);
    doc.rect(0, 287, W, 10, "F");
    setTextColor(colors.white);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("NeoSpasm Clinical Monitor — CONFIDENTIAL — For authorised clinical use only", margin, 293);
    doc.text(`Page ${i} of ${pageCount}`, W - margin, 293, { align: "right" });
  }

  const examDateStr = new Date(examDate).toISOString().slice(0, 10);
  doc.save(`NeoSpasm_Report_${patientName.replace(/ /g, "-")}_${examDateStr}.pdf`);
}

export default function ReportsView() {
  const [generating, setGenerating]           = useState(false);
  const [period, setPeriod]                   = useState("24H");
  const [selectedSections, setSelectedSections] = useState(new Set(["summary", "eeg", "events", "phenotype"]));
  const { events, summary } = useSpasmData();

  function toggle(k: string) {
    setSelectedSections(prev => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  }

  async function handleGenerate() {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 400));
    try {
      generatePDF(
        selectedSections,
        period,
        summary?.patient?.name        ?? "B/O Amandeep Kaur",
        summary?.patient?.id          ?? "00482-A",
        summary?.totalSpasms          ?? 23,
        summary?.spasmBurdenPercent   ?? 3.05,
        summary?.severity?.score      ?? 5.5,
        summary?.severity?.interpretation ?? "Moderate spasm burden.",
        summary?.patient?.clinician   ?? "Dr. K. Arora",
        summary?.exam?.date           ?? "2022-01-13T06:04:24Z",
        summary?.exam?.eegChannels    ?? 50,
        events,
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="px-4 pt-6 pb-4 md:px-10 md:pt-8 md:pb-6 space-y-5 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {summary?.patient?.name ?? "B/O Amandeep Kaur"} · MRN {summary?.patient?.id ?? "00482-A"}
          </p>
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
                  <button key={p} onClick={() => setPeriod(p)}
                    className="flex-1 text-[11px] font-semibold py-2 transition-all"
                    style={p === period
                      ? { background: "white", color: "var(--blue)", boxShadow: "var(--shadow-xs)" }
                      : { background: "transparent", color: "var(--text-muted)" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || selectedSections.size === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{
                background: generating ? "rgba(37,99,235,0.5)" : selectedSections.size === 0 ? "var(--border)" : "linear-gradient(135deg, var(--blue), #1D4ED8)",
                boxShadow: generating || selectedSections.size === 0 ? "none" : "0 2px 8px rgba(37,99,235,0.25)",
              }}>
              {generating ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Generating PDF…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  Download PDF Report
                </>
              )}
            </button>
          </div>

          <div className="card p-4">
            <div className="label mb-3">Recording Stats</div>
            {[
              { label: "Total spasms",     value: summary?.totalSpasms ?? "—" },
              { label: "Recording duration", value: summary ? `${Math.floor(summary.recordingDurationSec / 60)}m ${Math.round(summary.recordingDurationSec % 60)}s` : "—" },
              { label: "Spasm burden",     value: summary ? `${summary.spasmBurdenPercent}%` : "—" },
              { label: "EEG channels",     value: summary?.exam?.eegChannels ?? "—" },
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
                  <button onClick={handleGenerate}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    title="Download PDF">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
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