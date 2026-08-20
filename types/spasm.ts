// types/spasm.ts
// Types aligned with every data field visible in the NeoSpasm UI

// ─── Spasm event (Previous Events panel + Events count) ──────────────────────

export type SpasmType = "FOCAL" | "CLUSTER" | "DIFFUSE";
export type Laterality = "L" | "R" | "BILATERAL" | null;

export interface SpasmEvent {
  id: number;
  // Raw strings from Excel
  startRaw: string;
  endRaw: string;
  // Normalised seconds from recording start
  startSec: number;
  endSec: number;
  durationSec: number;
  // Formatted for display e.g. "1m 23.5s"
  startFormatted: string;
  endFormatted: string;
  // Wall-clock time string e.g. "14:19" (computed from exam start + offset)
  wallClockTime: string;
  // Gap since previous spasm ended
  interSpasmInterval: number | null;
  // UI classification fields
  type: SpasmType;
  laterality: Laterality;
  fusionConfidencePct: number;   // e.g. 94  → shown as "94% EEG" (no real fusion source yet)
  description: string;           // e.g. "Right-arm flexion, cluster tail"
  isClusterTail: boolean;
}

// ─── Spasm cluster (cluster badge on events) ─────────────────────────────────

export interface SpasmCluster {
  id: number;
  spasmIds: number[];
  startSec: number;
  endSec: number;
  durationSec: number;
  count: number;
}

// ─── Spasm Burden chart (010 chart in UI) ────────────────────────────────────

export interface TimelineBucket {
  timeSec: number;
  label: string;       // "0:00", "0:30" …
  count: number;
  burdenPct: number;
}

// ─── IESS Severity Score ──────────────────────────────────────────────────────

export interface SeverityScore {
  score: number;            // e.g. 7.2
  maxScore: number;         // 10
  delta24h: number;         // e.g. +0.8
  interpretation: string;   // e.g. "Rising burden driven by right-frontal cluster…"
}

// ─── Patient info (header card) ───────────────────────────────────────────────

export interface PatientInfo {
  name: string;             // "B/O Amandeep Kaur"
  id: string;               // "00482-A"
  sex: "M" | "F" | "Unknown";
  ageMonths: number;        // 6
  dayOfAdmission: number;   // 3
  weightKg: number | null;
  etiology: string;         // "West Syndrome (IESS)"
  diagnosis: string;
  clinician: string;
  examDate: string;
}

// ─── Exam / recording info ────────────────────────────────────────────────────

export interface ExamInfo {
  date: string;             // ISO string from Neurosoft.DB
  durationSec: number;      // 836.98
  format: string;           // "Neurosoft EEG WPF"
  eegChannels: number;      // 50 total, 19 shown in UI (10-20 system)
  samplingRateHz: number;   // 256
  hasVideo: boolean;
  hasAudio: boolean;
  doctor: string;
}

// ─── Full summary (Spasm Burden card) ─────────────────────────────────────────

export interface SpasmSummary {
  totalSpasms: number;              // 23
  totalDurationSec: number;
  avgDurationSec: number;
  minDurationSec: number;
  maxDurationSec: number;
  recordingDurationSec: number;     // 836.98
  spasmBurdenPercent: number;       // % of recording occupied by spasms
  avgInterSpasmIntervalSec: number;
  minInterSpasmIntervalSec: number;
  maxInterSpasmIntervalSec: number;
  firstSpasmSec: number;
  lastSpasmSec: number;
  spasmsPerMinute: number;
  clusters: SpasmCluster[];
  severity: SeverityScore;
  patient: PatientInfo;
  exam: ExamInfo;
}

// ─── API response shapes ───────────────────────────────────────────────────────

export interface SpasmsApiResponse {
  events: SpasmEvent[];
  summary: SpasmSummary;
  meta: { total: number; filtered: boolean; fromSec: number | null; toSec: number | null };
}

export interface ClustersApiResponse {
  clusters: Array<SpasmCluster & { events: SpasmEvent[] }>;
  total: number;
  totalSpasmsInClusters: number;
}
