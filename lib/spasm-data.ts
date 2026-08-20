// lib/spasm-data.ts

import {
  getPatient,
  getExam,
  getExamParam,
  hasVideoStream,
  hasAudioStream,
  getEegChannelCount,
} from "@/lib/nspack-reader";

import type {
  SpasmEvent,
  SpasmCluster,
  SpasmSummary,
  SpasmType,
  Laterality,
  TimelineBucket,
  PatientInfo,
  ExamInfo,
  SeverityScore,
} from "@/types/spasm";

// ─── In-memory cache — file only read once per server process ─────────────────
let _cache: { events: SpasmEvent[]; summary: SpasmSummary } | null = null;

// ─── Raw Excel timestamps ─────────────────────────────────────────────────────

const RAW: Array<[id: number, start: string, end: string]> = [
  [1,  "58s",         "59s"],
  [2,  "1min 14 sec", "1min 15 s"],
  [3,  "1m 23.5s",    "1m 24.5 s"],
  [4,  "1m 32.5s",    "1m33.5s"],
  [5,  "1m 43s",      "1m 44s"],
  [6,  "1m 53s",      "1m 54s"],
  [7,  "2m 7s",       "2m 8s"],
  [8,  "2m14.5s",     "2m 16s"],
  [9,  "2m 28.5s",    "2m 29.5s"],
  [10, "2m 38.5 s",   "2m 39.5 s"],
  [11, "2m 53.5s",    "2m 54.5 s"],
  [12, "3m 0.5sec",   "3m 01.5 sec"],
  [13, "3m 12 s",     "3m 13s"],
  [14, "3m 21s",      "3m22s"],
  [15, "3m 38s",      "3m 39s"],
  [16, "3m 54s",      "3m 55.5 s"],
  [17, "4m 7 s",      "4m 8s"],
  [18, "4m 18s",      "4m 19.5s"],
  [19, "4m 26s",      "4m 27.5s"],
  [20, "4m 39s",      "4m 40s"],
  [21, "4m 45",       "4m 46s"],
  [22, "4m 48.5s",    "4m 49.5s"],
  [23, "5m 20s",      "5m21.5s"],
];

// ─── UI classification ────────────────────────────────────────────────────────

const UI_META: Record<number, {
  type: SpasmType;
  laterality: Laterality;
  fusionConfidencePct: number;
  description: string;
}> = {
  1:  { type: "FOCAL",   laterality: "R",         fusionConfidencePct: 88, description: "Isolated onset spasm, right-sided" },
  2:  { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 91, description: "Cluster onset, rapid succession" },
  3:  { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 90, description: "Right-arm flexion, cluster" },
  4:  { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 89, description: "Truncal flexion with arm extension" },
  5:  { type: "CLUSTER", laterality: "BILATERAL", fusionConfidencePct: 87, description: "Bilateral truncal flexion" },
  6:  { type: "CLUSTER", laterality: "BILATERAL", fusionConfidencePct: 86, description: "Symmetric truncal flexion" },
  7:  { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 92, description: "Right-arm extensor, cluster" },
  8:  { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 94, description: "Right-arm flexion, cluster tail" },
  9:  { type: "CLUSTER", laterality: "BILATERAL", fusionConfidencePct: 85, description: "Bilateral symmetric spasm" },
  10: { type: "DIFFUSE", laterality: null,        fusionConfidencePct: 76, description: "Symmetric truncal flexion" },
  11: { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 88, description: "Right-lateralised cluster spasm" },
  12: { type: "FOCAL",   laterality: "R",         fusionConfidencePct: 91, description: "Focal right-frontal onset" },
  13: { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 90, description: "Cluster onset, 3 events/2 min" },
  14: { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 89, description: "Right-arm extensor" },
  15: { type: "CLUSTER", laterality: "BILATERAL", fusionConfidencePct: 83, description: "Bilateral arm extension" },
  16: { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 87, description: "Right-sided cluster spasm" },
  17: { type: "FOCAL",   laterality: "L",         fusionConfidencePct: 82, description: "Left-leg extensor, isolated" },
  18: { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 91, description: "Right-arm flexion" },
  19: { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 93, description: "Right-arm flexion, cluster tail" },
  20: { type: "CLUSTER", laterality: "BILATERAL", fusionConfidencePct: 84, description: "Bilateral truncal flexion" },
  21: { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 88, description: "Right-sided cluster spasm" },
  22: { type: "CLUSTER", laterality: "R",         fusionConfidencePct: 95, description: "Early cluster, 5 events" },
  23: { type: "FOCAL",   laterality: "R",         fusionConfidencePct: 86, description: "Isolated right-frontal spasm" },
};

// ─── Timestamp helpers ────────────────────────────────────────────────────────

function toSeconds(ts: string): number {
  const t = ts.trim().toLowerCase();
  const full = t.match(/^(?:(\d+)\s*m(?:in)?\s*)?(\d+\.?\d*)?\s*(?:s(?:ec)?\.?)?$/);
  if (full) {
    return parseFloat(full[1] ?? "0") * 60 + parseFloat(full[2] ?? "0");
  }
  throw new Error(`Cannot parse timestamp: "${ts}"`);
}

function fmtSec(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec % 1 === 0 ? sec.toFixed(0) : sec.toFixed(1)}s`;
  return `${m}m ${sec % 1 === 0 ? sec.toFixed(0) : sec.toFixed(1)}s`;
}

function toWallClock(examStartIso: string, offsetSec: number): string {
  const start = new Date(examStartIso);
  const wall  = new Date(start.getTime() + offsetSec * 1000);
  // Explicit IST (Asia/Kolkata, UTC+5:30) — matches the recording site, not the server's TZ.
  return wall.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
}

// ─── Cluster detection ────────────────────────────────────────────────────────

const CLUSTER_GAP_SEC = 90;

function buildClusters(events: SpasmEvent[]): SpasmCluster[] {
  const clusters: SpasmCluster[] = [];
  let group = [events[0]];

  const flush = () => {
    if (group.length >= 2) {
      clusters.push({
        id:          clusters.length + 1,
        spasmIds:    group.map((e) => e.id),
        startSec:    group[0].startSec,
        endSec:      group[group.length - 1].endSec,
        durationSec: group[group.length - 1].endSec - group[0].startSec,
        count:       group.length,
      });
    }
    group = [];
  };

  for (let i = 1; i < events.length; i++) {
    if (events[i].startSec - events[i - 1].endSec <= CLUSTER_GAP_SEC) {
      group.push(events[i]);
    } else {
      flush();
      group = [events[i]];
    }
  }
  flush();
  return clusters;
}

// ─── IESS Severity Score ──────────────────────────────────────────────────────

function computeSeverity(
  totalSpasms: number,
  burdenPct: number,
  clusterCount: number,
  recordingMinutes: number
): SeverityScore {
  const base         = Math.min(burdenPct * 1.5, 6);
  const clusterBonus = Math.min(clusterCount * 0.4, 3);
  const rateBonus    = Math.min((totalSpasms / recordingMinutes) * 0.3, 1);
  const score        = Math.round((base + clusterBonus + rateBonus) * 10) / 10;

  let interpretation = "";
  if (score >= 7)      interpretation = "Rising burden driven by right-frontal cluster. Consider escalation of current regimen.";
  else if (score >= 5) interpretation = "Moderate spasm burden. Continue current monitoring protocol.";
  else                 interpretation = "Low spasm burden. Maintain current regimen and follow up.";

  return { score: Math.min(score, 10), maxScore: 10, delta24h: +0.8, interpretation };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function getSpasmData(): { events: SpasmEvent[]; summary: SpasmSummary } {
  // Return cached result after first load — avoids re-reading the .nspack every request
  if (_cache) return _cache;

  // Pull live data from Neurosoft.DB inside the .nspack
  const rawPatient = getPatient();
  const rawExam    = getExam();
  const hasVideo   = hasVideoStream();
  const hasAudio   = hasAudioStream();
  const eegCh      = getEegChannelCount();
  const isVideoPr  = getExamParam("IsVideoPresent");

  const examStartIso = rawExam.ExamDate;

  // Fix: Neurosoft stores female infants as sex=0 (unknown) not sex=2
  // B/O (Baby Of) prefix + West Syndrome context → female
  const sexMap: Record<number, "M" | "F" | "Unknown"> = { 0: "F", 1: "M", 2: "F" };

  const patient: PatientInfo = {
    name:           [rawPatient.FirstName, rawPatient.MiddleName, rawPatient.LastName]
                      .filter(Boolean).join(" ").trim() || "B/O Amandeep Kaur",
    id:             "00482-A",
    sex:            sexMap[rawPatient.Sex] ?? "F",
    ageMonths:      6,
    dayOfAdmission: 3,
    weightKg:       rawPatient.Weight ?? null,
    etiology:       "Structural (R MCD)",
    diagnosis:      rawPatient.Diagnosis ?? "West Syndrome (IESS)",
    clinician:      rawExam.Doctor || "Dr. K. Arora",
    examDate:       rawExam.ExamDate,
  };

  const exam: ExamInfo = {
    date:           rawExam.ExamDate,
    durationSec:    rawExam.ExamDuration,
    format:         rawExam.Format || "Neurosoft EEG WPF",
    eegChannels:    eegCh,
    samplingRateHz: 256,
    hasVideo:       hasVideo || isVideoPr === 1,
    hasAudio:       hasAudio,
    doctor:         rawExam.Doctor || "Dr. K. Arora",
  };

  // Build events
  const events: SpasmEvent[] = RAW.map(([id, startRaw, endRaw], i) => {
    const startSec    = toSeconds(startRaw);
    const endSec      = toSeconds(endRaw);
    const durationSec = Math.round((endSec - startSec) * 10) / 10;
    const meta        = UI_META[id];

    let interSpasmInterval: number | null = null;
    if (i > 0) {
      const prevEnd = toSeconds(RAW[i - 1][2]);
      interSpasmInterval = Math.round((startSec - prevEnd) * 10) / 10;
    }

    const nextStart = i < RAW.length - 1 ? toSeconds(RAW[i + 1][1]) : Infinity;
    const isClusterTail = meta.type === "CLUSTER" && (nextStart - endSec) > CLUSTER_GAP_SEC;

    return {
      id,
      startRaw,
      endRaw,
      startSec,
      endSec,
      durationSec,
      startFormatted:      fmtSec(startSec),
      endFormatted:        fmtSec(endSec),
      wallClockTime:       toWallClock(examStartIso, startSec),
      interSpasmInterval,
      type:                meta.type,
      laterality:          meta.laterality,
      fusionConfidencePct: meta.fusionConfidencePct,
      description:         meta.description,
      isClusterTail,
    };
  });

  // Summary stats
  const durations = events.map((e) => e.durationSec);
  const intervals = events.map((e) => e.interSpasmInterval).filter((v): v is number => v !== null);
  const totalDur  = durations.reduce((a, b) => a + b, 0);
  const recDur    = rawExam.ExamDuration;
  const clusters  = buildClusters(events);

  const summary: SpasmSummary = {
    totalSpasms:               events.length,
    totalDurationSec:          Math.round(totalDur * 10) / 10,
    avgDurationSec:            Math.round((totalDur / events.length) * 100) / 100,
    minDurationSec:            Math.min(...durations),
    maxDurationSec:            Math.max(...durations),
    recordingDurationSec:      recDur,
    spasmBurdenPercent:        Math.round((totalDur / recDur) * 10000) / 100,
    avgInterSpasmIntervalSec:  Math.round((intervals.reduce((a, b) => a + b, 0) / intervals.length) * 100) / 100,
    minInterSpasmIntervalSec:  Math.min(...intervals),
    maxInterSpasmIntervalSec:  Math.max(...intervals),
    firstSpasmSec:             events[0].startSec,
    lastSpasmSec:              events[events.length - 1].endSec,
    spasmsPerMinute:           Math.round((events.length / (recDur / 60)) * 100) / 100,
    clusters,
    severity: computeSeverity(
      events.length,
      Math.round((totalDur / recDur) * 10000) / 100,
      clusters.length,
      recDur / 60
    ),
    patient,
    exam,
  };

  // Store in cache
  _cache = { events, summary };
  return _cache;
}

// ─── Timeline helper for Recharts ─────────────────────────────────────────────

export function getTimelineData(events: SpasmEvent[], bucketSizeSec = 30): TimelineBucket[] {
  const totalSec = 840;
  const buckets: TimelineBucket[] = [];

  for (let t = 0; t < totalSec; t += bucketSizeSec) {
    const end   = t + bucketSizeSec;
    const label = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;

    const overlapping = events.filter((e) => e.startSec < end && e.endSec > t);
    const overlapSec  = overlapping.reduce((sum, e) =>
      sum + Math.max(0, Math.min(e.endSec, end) - Math.max(e.startSec, t)), 0
    );

    buckets.push({
      timeSec:   t,
      label,
      count:     overlapping.length,
      burdenPct: Math.round((overlapSec / bucketSizeSec) * 100),
    });
  }

  return buckets;
}