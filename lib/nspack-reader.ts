// lib/nspack-reader.ts
//
// Reads Neurosoft exam data either from:
//   (a) a raw .nspack ZIP archive, or
//   (b) a folder that already contains the extracted contents
//       (Neurosoft.DB, NSData/..., *.nscurve, etc.)
//
// The .nspack ZIP layout is:
//   - Neurosoft.DB  (SQLite — patient, exam, metadata)
//   - NSData/...    (EEG .nscurve files, video, audio streams)
//
// Set NSPACK_PATH in your .env.local to EITHER:
//   NSPACK_PATH=C:\neospasm-data\patient.nspack       (a zip file)
//   NSPACK_PATH=C:\neospasm-data\extracted_nspack     (an already-extracted folder)
//
// This module is SERVER-ONLY — never import in client components.

import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import Database from "better-sqlite3";
import os from "os";

// ─── Config ───────────────────────────────────────────────────────────────────

// Dataset bundled in the repo — used whenever NSPACK_PATH isn't set (e.g. in
// production/Vercel, which has no access to a developer's local .env.local).
const BUNDLED_DATASET_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "non video data");

function getNspackPath(): string {
  const p = process.env.NSPACK_PATH;
  if (p) {
    if (!fs.existsSync(p)) {
      throw new Error(`NSPACK_PATH points to a path that does not exist: ${p}`);
    }
    return p;
  }

  if (fs.existsSync(BUNDLED_DATASET_DIR)) {
    return BUNDLED_DATASET_DIR;
  }

  throw new Error(
    "NSPACK_PATH environment variable is not set and no bundled dataset was found at " +
    `"${BUNDLED_DATASET_DIR}".\n` +
    "Either restore the bundled dataset folder, or set NSPACK_PATH in .env.local, pointing at " +
    "either a .nspack file or an extracted folder:\n" +
    "  NSPACK_PATH=C:\\neospasm-data\\patient.nspack\n" +
    "  NSPACK_PATH=C:\\neospasm-data\\extracted_nspack"
  );
}

function nspackIsDirectory(): boolean {
  return fs.statSync(getNspackPath()).isDirectory();
}

// ─── Resolve Neurosoft.DB to a real file path on disk ─────────────────────────
// better-sqlite3 needs a real file path, not a buffer.
// If NSPACK_PATH is a zip, extract Neurosoft.DB once per process into a temp file.
// If NSPACK_PATH is already a folder, just point straight at the file inside it.

let _cachedDbPath: string | null = null;

function findDbInDirectory(dir: string): string {
  // Usual case: Neurosoft.DB sits directly inside the folder.
  const direct = path.join(dir, "Neurosoft.DB");
  if (fs.existsSync(direct)) return direct;

  // Fallback: search one level of subfolders in case the extractor nested it.
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nested = path.join(dir, entry.name, "Neurosoft.DB");
      if (fs.existsSync(nested)) return nested;
    }
  }

  throw new Error(`Neurosoft.DB not found inside extracted folder: ${dir}`);
}

function getExtractedDbPath(): string {
  if (_cachedDbPath && fs.existsSync(_cachedDbPath)) return _cachedDbPath;

  const nspackPath = getNspackPath();

  if (nspackIsDirectory()) {
    // Already extracted — use the file directly, no copying needed.
    _cachedDbPath = findDbInDirectory(nspackPath);
    return _cachedDbPath;
  }

  // It's a zip file — extract Neurosoft.DB into a temp file.
  const zip = new AdmZip(nspackPath);
  const entry = zip.getEntry("Neurosoft.DB");
  if (!entry) throw new Error("Neurosoft.DB not found inside the .nspack file");

  const tmpPath = path.join(os.tmpdir(), `neurosoft_${Date.now()}.db`);
  zip.extractEntryTo(entry, os.tmpdir(), false, true);
  // AdmZip extracts to tmpdir/Neurosoft.DB
  const extracted = path.join(os.tmpdir(), "Neurosoft.DB");
  fs.renameSync(extracted, tmpPath);

  _cachedDbPath = tmpPath;
  return tmpPath;
}

// ─── Open DB (cached) ─────────────────────────────────────────────────────────

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  const dbPath = getExtractedDbPath();
  _db = new Database(dbPath, { readonly: true });
  return _db;
}

// ─── Patient ──────────────────────────────────────────────────────────────────

export interface RawPatient {
  Id: number;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Sex: number;          // 0=unknown, 1=male, 2=female
  Birthday: string | null;
  Weight: number | null;
  Diagnosis: string | null;
  Comment: string | null;
}

export function getPatient(): RawPatient {
  const db = getDb();
  const row = db.prepare(`
    SELECT Id, FirstName, MiddleName, LastName, Sex, Birthday, Weight, Diagnosis, Comment
    FROM Patients
    LIMIT 1
  `).get() as RawPatient;
  if (!row) throw new Error("No patient found in Neurosoft.DB");
  return row;
}

// ─── Exam ─────────────────────────────────────────────────────────────────────

export interface RawExam {
  Id: number;
  ExamDate: string;
  ExamDuration: number;
  Doctor: string;
  Diagnosis: string;
  Format: string;
  Comment: string;
}

export function getExam(): RawExam {
  const db = getDb();
  const row = db.prepare(`
    SELECT Id, ExamDate, ExamDuration, Doctor, Diagnosis, Format, Comment
    FROM Exams
    LIMIT 1
  `).get() as RawExam;
  if (!row) throw new Error("No exam found in Neurosoft.DB");
  return row;
}

// ─── Exam params (metadata key-value store) ───────────────────────────────────

export function getExamParam(name: string): string | number | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT StringValue, LongValue, DoubleValue, ValueType
    FROM ExamParams
    WHERE Name = ?
    LIMIT 1
  `).get(name) as { StringValue: string; LongValue: number; DoubleValue: number; ValueType: number } | undefined;

  if (!row) return null;
  // ValueType: 0=string, 1=long, 2=double, 3=double, 4=bool
  if (row.ValueType === 0) return row.StringValue;
  if (row.ValueType === 4) return row.LongValue;
  if (row.ValueType === 1) return row.LongValue;
  return row.DoubleValue;
}

// ─── Check what streams exist (video/audio presence) ─────────────────────────

export function hasVideoStream(): boolean {
  const db = getDb();
  const row = db.prepare(`
    SELECT COUNT(*) as cnt FROM ExamStreams WHERE StreamKey LIKE '%VideoStream%'
  `).get() as { cnt: number };
  return row.cnt > 0;
}

export function hasAudioStream(): boolean {
  const db = getDb();
  const row = db.prepare(`
    SELECT COUNT(*) as cnt FROM ExamStreams WHERE StreamKey LIKE '%AudioStream%'
  `).get() as { cnt: number };
  return row.cnt > 0;
}

// ─── List available .nscurve channel files ────────────────────────────────────
// Verified empirically against this repo's bundled dataset: of the 50
// .nscurve file slots, most are non-empty (byteLength matches the full
// exam duration) but a large fraction of THOSE are still all-zero — reserved
// channel slots the Neurosoft system allocated but never actually recorded
// through. A byte-length check alone counts those as real channels, which is
// why the UI was showing "50 channels" when only ~14 curves carry an actual
// signal. hasSignal() does the real check so channel counts and playback data
// only ever reflect curves that truly have something in them.

function hasSignal(filePath: string): boolean {
  const buf = fs.readFileSync(filePath);
  const arr = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 4));
  if (arr.length === 0) return false;
  // Require a non-trivial fraction of nonzero samples so a handful of stray
  // floats don't get a dead channel counted as "real" — but low enough that a
  // channel with a genuine brief burst of real activity (common for auxiliary
  // leads) still counts, since that IS real recorded data.
  const threshold = Math.max(1, Math.floor(arr.length * 0.005));
  let nonZero = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      nonZero++;
      if (nonZero >= threshold) return true;
    }
  }
  return false;
}

export function getEegChannelCount(): number {
  const nspackPath = getNspackPath();

  if (nspackIsDirectory()) {
    return listEegCurves().length;
  }

  const zip = new AdmZip(nspackPath);
  const entries = zip.getEntries();
  return entries.filter((e) => e.entryName.endsWith(".nscurve") && e.header.size > 0 && e.header.size % 4 === 0).length;
}

// ─── EEG curve (.nscurve) reading ─────────────────────────────────────────────
// .nscurve files are raw, headerless, little-endian float32 sample arrays,
// already in volts — one file per channel. Verified empirically against this
// repo's bundled dataset: byte length is always an exact multiple of 4 (no
// header/footer), and sampleCount / Exams.ExamDuration == 200 Hz exactly, so
// that's treated as the fixed EEG sampling rate. Curve-index → electrode-name
// mapping is NOT available here (it lives in .NET BinaryFormatter-serialized
// sidecar files, not Neurosoft.DB), so callers get channels labeled by their
// raw curve index rather than a clinical montage name.

export const EEG_SAMPLE_RATE_HZ = 200;

export interface CurveFileInfo {
  index: number;
  filePath: string;
  byteLength: number;
  sampleCount: number;
}

function findCurveFilesInDirectory(dir: string): CurveFileInfo[] {
  const out: CurveFileInfo[] = [];
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      const m = entry.name.match(/NeuroSoft\.Curves\.Curve\.(\d+)\.nscurve$/);
      if (!m) continue;
      const byteLength = fs.statSync(full).size;
      if (byteLength === 0 || byteLength % 4 !== 0) continue; // unused channel slot / not a clean float32 array
      if (!hasSignal(full)) continue; // allocated slot, but recorded nothing — not a real channel
      out.push({ index: Number(m[1]), filePath: full, byteLength, sampleCount: byteLength / 4 });
    }
  };
  walk(dir);
  out.sort((a, b) => a.index - b.index);
  return out;
}

let _cachedCurveDir: string | null = null;
let _cachedCurves: CurveFileInfo[] | null = null;

export function listEegCurves(): CurveFileInfo[] {
  const nspackPath = getNspackPath();
  if (!nspackIsDirectory()) {
    throw new Error("EEG curve reading currently only supports an already-extracted NSPACK_PATH folder, not a raw .nspack zip.");
  }
  if (_cachedCurves && _cachedCurveDir === nspackPath) return _cachedCurves;
  _cachedCurves = findCurveFilesInDirectory(nspackPath);
  _cachedCurveDir = nspackPath;
  return _cachedCurves;
}

/** Read a window of real decoded samples (volts) from one curve file, clamped to its actual length. */
export function readEegCurveWindow(curve: CurveFileInfo, startSec: number, durationSec: number): Float32Array {
  const totalSamples = curve.sampleCount;
  const startSample = Math.max(0, Math.min(totalSamples, Math.floor(startSec * EEG_SAMPLE_RATE_HZ)));
  const count = Math.max(0, Math.min(totalSamples - startSample, Math.round(durationSec * EEG_SAMPLE_RATE_HZ)));
  if (count === 0) return new Float32Array(0);

  const fd = fs.openSync(curve.filePath, "r");
  try {
    const buf = Buffer.alloc(count * 4);
    fs.readSync(fd, buf, 0, buf.length, startSample * 4);
    return new Float32Array(buf.buffer, buf.byteOffset, count);
  } finally {
    fs.closeSync(fd);
  }
}

// ─── Cleanup on process exit ──────────────────────────────────────────────────

process.on("exit", () => {
  if (_db) { try { _db.close(); } catch { /* ignore */ } }
  // Only delete the cached DB path if we actually extracted it to a temp file
  // (i.e. NSPACK_PATH was a zip, not a folder we should leave untouched).
  if (_cachedDbPath && _cachedDbPath.startsWith(os.tmpdir()) && fs.existsSync(_cachedDbPath)) {
    try { fs.unlinkSync(_cachedDbPath); } catch { /* ignore */ }
  }
});