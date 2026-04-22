"use client";
import { useState } from "react";
import jsPDF from "jspdf";

const reports = [
  { id: "RPT-2026-0422-01", title: "Daily Clinical Summary", patient: "Baby R.", date: "Today 14:00", status: "Ready", pages: 4, format: "PDF", author: "Auto-generated" },
  { id: "RPT-2026-0421-03", title: "Seizure Burden Report", patient: "Baby R.", date: "Yesterday 18:30", status: "Ready", pages: 6, format: "PDF", author: "Dr. K. Arora" },
  { id: "RPT-2026-0421-02", title: "EEG Phenotype Analysis", patient: "Baby R.", date: "Yesterday 12:00", status: "Ready", pages: 3, format: "PDF", author: "Auto-generated" },
  { id: "RPT-2026-0420-05", title: "Weekly Trend Summary", patient: "Baby R.", date: "Apr 20 · 08:00", status: "Ready", pages: 8, format: "PDF", author: "Dr. K. Arora" },
  { id: "RPT-2026-0420-02", title: "Medication Response Log", patient: "Baby R.", date: "Apr 20 · 07:30", status: "Archived", pages: 5, format: "PDF", author: "Dr. P. Shah" },
  { id: "RPT-2026-0419-01", title: "Admission Baseline EEG", patient: "Baby R.", date: "Apr 19 · 11:00", status: "Archived", pages: 10, format: "PDF", author: "Auto-generated" },
];

const sections = [
  { key: "summary",   label: "Executive Summary" },
  { key: "eeg",       label: "EEG Analysis" },
  { key: "events",    label: "Event Log" },
  { key: "phenotype", label: "Phenotype Profile" },
  { key: "trends",    label: "Burden Trends" },
  { key: "meds",      label: "Medication Response" },
];

const events = [
  { time: "14:19", type: "FOCAL",   side: "R", duration: "3.4s", desc: "Right-arm flexion, cluster tail",   conf: 94 },
  { time: "14:14", type: "FOCAL",   side: "R", duration: "2.9s", desc: "Right-arm extensor",                conf: 91 },
  { time: "14:09", type: "CLUSTER", side: "R", duration: "3.1s", desc: "Cluster onset, 3 events/2 min",     conf: 88 },
  { time: "11:47", type: "DIFFUSE", side: "—", duration: "1.8s", desc: "Symmetric truncal flexion",         conf: 76 },
  { time: "09:22", type: "FOCAL",   side: "L", duration: "2.6s", desc: "Left-leg extensor, isolated",       conf: 82 },
  { time: "04:51", type: "CLUSTER", side: "R", duration: "3.9s", desc: "Early-morning cluster, 5 events",   conf: 95 },
];

const meds = [
  { name: "ACTH",          dose: "40 IU/m²/day", start: "Day 1", response: "Partial — 32% reduction",  status: "Active" },
  { name: "Vigabatrin",    dose: "100 mg/kg/day", start: "Day 2", response: "Augmentation ongoing",      status: "Active" },
  { name: "Pyridoxine",    dose: "100 mg/day",    start: "Day 1", response: "No isolated response",      status: "Discontinued" },
];

function generatePDF(selectedSections: Set<string>, period: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  const colors = {
    navy:  [12, 18, 32]  as [number, number, number],
    blue:  [25, 103, 210] as [number, number, number],
    red:   [217, 48, 37]  as [number, number, number],
    teal:  [11, 138, 116] as [number, number, number],
    amber: [201, 106, 0]  as [number, number, number],
    gray:  [90, 100, 128] as [number, number, number],
    light: [242, 244, 248] as [number, number, number],
    border:[220, 224, 232] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    text:  [13, 17, 23]   as [number, number, number],
  };

  function setFill(c: [number,number,number]) { doc.setFillColor(c[0], c[1], c[2]); }
  function setDraw(c: [number,number,number]) { doc.setDrawColor(c[0], c[1], c[2]); }
  function setTextColor(c: [number,number,number]) { doc.setTextColor(c[0], c[1], c[2]); }

  // ── Header bar ──
  setFill(colors.navy);
  doc.rect(0, 0, W, 28, "F");

  // Logo wave (simplified)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.7);
  doc.lines([[3,0],[3,6],[3,-6],[3,6],[3,0]], margin, 14, [1,1], "S");

  setTextColor(colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Neo", margin + 16, 12);
  doc.setTextColor(255, 100, 100);
  doc.text("Spasm", margin + 16 + doc.getTextWidth("Neo"), 12);

  setTextColor(colors.white);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("CLINICAL MONITOR  ·  INFANT EPILEPSY MONITORING SYSTEM", margin + 16, 18);

  // Right side: report type + date
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

  // ── Patient info strip ──
  setFill(colors.light);
  setDraw(colors.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 20, 2, 2, "FD");

  // Alert accent strip
  setFill(colors.red);
  doc.roundedRect(margin, y, 3, 20, 1, 1, "F");

  setTextColor(colors.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Baby R.", margin + 8, y + 7.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setTextColor(colors.gray);
  doc.text("Female · 6 months · 7.2 kg", margin + 8, y + 13);

  // Info columns
  const infoCols = [
    { label: "MRN",          val: "00482-A" },
    { label: "Etiology",     val: "HIE" },
    { label: "Admission",    val: "Apr 19, 2026" },
    { label: "Day",          val: "Day 3" },
    { label: "Lead Clinician", val: "Dr. K. Arora" },
    { label: "Ward",         val: "PICU · 3B-04" },
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

  // ── IESS severity ──
  setFill(colors.red);
  doc.roundedRect(margin, y, contentW, 14, 2, 2, "F");
  setTextColor(colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("IESS SEVERITY INDEX", margin + 5, y + 6);
  doc.setFontSize(16);
  doc.text("7.2 / 10", margin + 5, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("ALERTING  ·  +0.8 in 24h  ·  Worsening trajectory", margin + 40, y + 12);

  // IESS bar
  const barX = W - margin - 70;
  const barW = 65;
  setFill([255,255,255]);
  doc.setFillColor(255,255,255);
  doc.roundedRect(barX, y + 5, barW, 5, 1, 1, "F");
  setFill(colors.red);
  doc.setFillColor(255,180,180);
  doc.roundedRect(barX, y + 5, barW * 0.72, 5, 1, 1, "F");

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
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  }

  // ── EXECUTIVE SUMMARY ──
  if (selectedSections.has("summary")) {
    checkPage(50);
    sectionHeader("EXECUTIVE SUMMARY");

    const summary = [
      "Baby R. is a 6-month-old female admitted on Day 3 with infantile epileptic spasm syndrome (IESS) secondary to hypoxic-ischaemic encephalopathy (HIE). The IESS severity score has risen from 3.2 on admission to 7.2 today, indicating a worsening trajectory requiring urgent clinical review.",
      "21 spasms were detected in the past 24 hours, with a peak cluster of 4 events recorded at 14:09. The predominant phenotype is focal right-frontal — confirmed by concordant EEG focality (R > L, Δ38%) and motor asymmetry (asymmetry index 0.61). The fused confidence score for the most recent event was 94%.",
      "Current treatment with ACTH (40 IU/m²/day) and Vigabatrin (100 mg/kg/day) has produced a partial 32% reduction in event frequency. Continued monitoring and possible medication dose adjustment are recommended.",
    ];

    summary.forEach(para => {
      checkPage(20);
      const lines = doc.splitTextToSize(para, contentW);
      setTextColor(colors.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(lines, margin, y);
      y += lines.length * 4.5 + 4;
    });

    // KPI row
    checkPage(22);
    const kpis = [
      { label: "Events (24h)", val: "21",   color: colors.red },
      { label: "Peak Hour",    val: "15:00", color: colors.amber },
      { label: "IESS Score",   val: "7.2",   color: colors.red },
      { label: "Avg Confidence", val: "88%", color: colors.blue },
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

  // ── EEG ANALYSIS ──
  if (selectedSections.has("eeg")) {
    checkPage(60);
    sectionHeader("EEG ANALYSIS");

    const eegFindings = [
      { label: "Dominant Focus", val: "Right frontal — Fp2, F4, F8" },
      { label: "Lateralisation",  val: "R > L (Δ38% amplitude asymmetry)" },
      { label: "Ictal Pattern",   val: "High-amplitude spike-wave complexes, 2–3 Hz" },
      { label: "Interictal",      val: "Hypsarrhythmia with right-sided preponderance" },
      { label: "Impedance",       val: "C4 elevated at 22 kΩ (within limit)" },
      { label: "Sampling Rate",   val: "256 Hz · 19-channel 10-20 montage" },
      { label: "Model Confidence", val: "EEG branch 89% · recalibrated at 13:22" },
    ];

    const halfW = (contentW - 4) / 2;
    eegFindings.forEach((f, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      if (col === 0 && row > 0) checkPage(9);
      const fx = margin + col * (halfW + 4);
      const fy = y + row * 9;
      setFill(colors.light);
      setDraw(colors.border);
      doc.setLineWidth(0.2);
      doc.roundedRect(fx, fy, halfW, 7.5, 1, 1, "FD");
      setTextColor(colors.gray);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text(f.label.toUpperCase(), fx + 3, fy + 3.2);
      setTextColor(colors.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(f.val, fx + 3, fy + 6.2);
    });
    y += Math.ceil(eegFindings.length / 2) * 9 + 6;

    // Frequency band table
    checkPage(36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setTextColor(colors.gray);
    doc.text("POWER SPECTRUM (dominant channel Fp2)", margin, y);
    y += 6;

    const bands = [
      { band: "Delta", hz: "0.5–4 Hz", pct: 48, note: "Elevated — consistent with encephalopathy", color: colors.red },
      { band: "Theta", hz: "4–8 Hz",   pct: 22, note: "Mildly elevated",                          color: colors.amber },
      { band: "Alpha", hz: "8–12 Hz",  pct: 15, note: "Reduced for age",                          color: colors.blue },
      { band: "Beta",  hz: "12–30 Hz", pct: 10, note: "Within normal range",                      color: colors.teal },
      { band: "Gamma", hz: ">30 Hz",   pct: 5,  note: "Normal",                                   color: colors.gray },
    ];
    const barTotalW = 55;
    bands.forEach((b, i) => {
      const by = y + i * 6.5;
      setTextColor(colors.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(b.band, margin, by + 4);
      setTextColor(colors.gray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(b.hz, margin + 14, by + 4);
      // bar bg
      setFill(colors.light);
      doc.roundedRect(margin + 35, by + 1, barTotalW, 4, 1, 1, "F");
      setFill(b.color);
      doc.roundedRect(margin + 35, by + 1, barTotalW * b.pct / 100, 4, 1, 1, "F");
      setTextColor(b.color);
      doc.setFont("helvetica", "bold");
      doc.text(`${b.pct}%`, margin + 35 + barTotalW + 2, by + 4);
      setTextColor(colors.gray);
      doc.setFont("helvetica", "normal");
      doc.text(b.note, margin + 35 + barTotalW + 14, by + 4);
    });
    y += bands.length * 6.5 + 8;
  }

  // ── EVENT LOG ──
  if (selectedSections.has("events")) {
    checkPage(60);
    sectionHeader("EVENT LOG");

    // Table header
    setFill(colors.navy);
    doc.roundedRect(margin, y, contentW, 7, 1, 1, "F");
    const cols = [
      { label: "TIME",    x: margin + 3,   w: 14 },
      { label: "TYPE",    x: margin + 18,  w: 18 },
      { label: "SIDE",    x: margin + 38,  w: 10 },
      { label: "DUR.",    x: margin + 50,  w: 12 },
      { label: "DESCRIPTION", x: margin + 64, w: 80 },
      { label: "CONF",   x: margin + 146, w: 14 },
    ];
    setTextColor(colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    cols.forEach(c => doc.text(c.label, c.x, y + 4.8));
    y += 8;

    events.forEach((ev, i) => {
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
      doc.text(ev.time, margin + 3, y + 4.5);
      doc.text(ev.type, margin + 18, y + 4.5);

      setTextColor(colors.text);
      doc.setFont("helvetica", "normal");
      doc.text(ev.side, margin + 38, y + 4.5);
      doc.text(ev.duration, margin + 50, y + 4.5);
      doc.text(ev.desc, margin + 64, y + 4.5);
      setTextColor(typeColor);
      doc.setFont("helvetica", "bold");
      doc.text(`${ev.conf}%`, margin + 146, y + 4.5);
      y += 6.5;
    });
    y += 8;
  }

  // ── PHENOTYPE PROFILE ──
  if (selectedSections.has("phenotype")) {
    checkPage(45);
    sectionHeader("PHENOTYPE PROFILE");

    const phenoData = [
      { label: "Classification",    val: "Focal — Right Frontal" },
      { label: "EEG Lateralisation", val: "Right > Left (Δ38%)" },
      { label: "Motor Lateralisation", val: "Right > Left" },
      { label: "Asymmetry Index",   val: "0.61 (moderate-high)" },
      { label: "EEG-Motor Concordance", val: "Concordant ✓" },
      { label: "Cluster Frequency", val: "3 events / 2 min" },
      { label: "Mean Duration",     val: "3.1 seconds" },
      { label: "Predominant Posture", val: "Right-arm flexion / extensor" },
    ];

    // Concordance banner
    setFill([11, 138, 116]);
    doc.setFillColor(237, 251, 248);
    setDraw([11, 138, 116]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "FD");
    setTextColor(colors.teal);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("Concordant Modalities", margin + 5, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Right-frontal EEG focus aligned with right-lateralised motor response. High localisation confidence.", margin + 5, y + 8.5);
    y += 14;

    const phenoColW = (contentW - 4) / 2;
    phenoData.forEach((p, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const px = margin + col * (phenoColW + 4);
      const py = y + row * 9;
      setFill(colors.light);
      setDraw(colors.border);
      doc.setLineWidth(0.2);
      doc.roundedRect(px, py, phenoColW, 7.5, 1, 1, "FD");
      setTextColor(colors.gray);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text(p.label.toUpperCase(), px + 3, py + 3.2);
      setTextColor(colors.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(p.val, px + 3, py + 6.2);
    });
    y += Math.ceil(phenoData.length / 2) * 9 + 8;
  }

  // ── BURDEN TRENDS ──
  if (selectedSections.has("trends")) {
    checkPage(50);
    sectionHeader("BURDEN TRENDS (7-DAY)");

    const trendData = [
      { day: "Apr 16", events: 4,  iess: 3.2 },
      { day: "Apr 17", events: 7,  iess: 4.1 },
      { day: "Apr 18", events: 12, iess: 5.0 },
      { day: "Apr 19", events: 9,  iess: 4.6 },
      { day: "Apr 20", events: 15, iess: 5.8 },
      { day: "Apr 21", events: 18, iess: 6.4 },
      { day: "Apr 22", events: 21, iess: 7.2 },
    ];

    // Chart area
    const chartH = 35;
    const chartX = margin + 20;
    const chartW = contentW - 20;
    const maxEvents = 25;

    setFill(colors.light);
    setDraw(colors.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, y, contentW, chartH + 16, 2, 2, "FD");

    // Y axis labels
    [0, 5, 10, 15, 20, 25].forEach(v => {
      const vy = y + 5 + chartH - (v / maxEvents) * chartH;
      setTextColor(colors.gray);
      doc.setFontSize(5.5);
      doc.text(String(v), margin + 3, vy + 1.5);
      setDraw(colors.border);
      doc.setLineWidth(0.1);
      doc.setDrawColor(220, 224, 232);
      doc.line(chartX, vy, chartX + chartW - 5, vy);
    });

    const barW2 = (chartW - 10) / trendData.length;
    trendData.forEach((d, i) => {
      const bx = chartX + i * barW2 + 2;
      const bh = (d.events / maxEvents) * chartH;
      const by = y + 5 + chartH - bh;
      // Bar
      setFill(colors.blue);
      doc.roundedRect(bx, by, barW2 - 4, bh, 1, 1, "F");
      // Label
      setTextColor(colors.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.text(String(d.events), bx + (barW2 - 4) / 2 - 1.5, by - 1.5);
      setTextColor(colors.gray);
      doc.setFont("helvetica", "normal");
      doc.text(d.day.replace("Apr ", ""), bx, y + 5 + chartH + 5);
      // IESS dot (red)
      const dotY = y + 5 + chartH - (d.iess / 10) * chartH;
      setFill(colors.red);
      doc.circle(bx + (barW2 - 4) / 2, dotY, 1.2, "F");
    });

    // Legend
    setFill(colors.blue);
    doc.roundedRect(margin + 4, y + chartH + 10, 4, 3, 0.5, 0.5, "F");
    setTextColor(colors.gray);
    doc.setFontSize(6.5);
    doc.text("Events/day", margin + 10, y + chartH + 13);
    setFill(colors.red);
    doc.circle(margin + 38, y + chartH + 11.5, 1.2, "F");
    doc.text("IESS score", margin + 42, y + chartH + 13);

    y += chartH + 24;
  }

  // ── MEDICATION RESPONSE ──
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

      // Status pill
      setFill(statusColor);
      const medBg = m.status === "Active" ? [237, 251, 248] as [number,number,number] : [242, 244, 248] as [number,number,number];
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

  // ── Footer on all pages ──
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

  // Download
  const filename = `NeoSpasm_Report_Baby-R_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

export default function ReportsView() {
  const [generating, setGenerating] = useState(false);
  const [period, setPeriod] = useState("24H");
  const [selectedSections, setSelectedSections] = useState(new Set(["summary", "eeg", "events", "phenotype"]));

  function toggle(k: string) {
    setSelectedSections(prev => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  }

  async function handleGenerate() {
    setGenerating(true);
    // Small delay so the UI shows the spinner before the synchronous PDF work blocks
    await new Promise(r => setTimeout(r, 400));
    try {
      generatePDF(selectedSections, period);
    } finally {
      setGenerating(false);
    }
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

            {selectedSections.size === 0 && (
              <p className="text-xs text-center mt-2" style={{ color: "var(--text-muted)" }}>Select at least one section</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="card p-4">
            <div className="label mb-3">This Month</div>
            {[
              { label: "Reports generated", value: "12" },
              { label: "Pages total",        value: "68" },
              { label: "Shared with team",   value: "4" },
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
                  <button
                    onClick={() => handleGenerate()}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    title="Download PDF">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    title="Share">
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
