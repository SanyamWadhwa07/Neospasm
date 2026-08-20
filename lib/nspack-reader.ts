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

function getNspackPath(): string {
  const p = process.env.NSPACK_PATH;
  if (!p) {
    throw new Error(
      "NSPACK_PATH environment variable is not set.\n" +
      "Add it to your .env.local file, pointing at either a .nspack file or an extracted folder:\n" +
      "  NSPACK_PATH=C:\\neospasm-data\\patient.nspack\n" +
      "  NSPACK_PATH=C:\\neospasm-data\\extracted_nspack"
    );
  }
  if (!fs.existsSync(p)) {
    throw new Error(`NSPACK_PATH points to a path that does not exist: ${p}`);
  }
  return p;
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

function countNscurveInDirectory(dir: string): number {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countNscurveInDirectory(full);
    } else if (entry.name.endsWith(".nscurve")) {
      count += 1;
    }
  }
  return count;
}

export function getEegChannelCount(): number {
  const nspackPath = getNspackPath();

  if (nspackIsDirectory()) {
    return countNscurveInDirectory(nspackPath);
  }

  const zip = new AdmZip(nspackPath);
  const entries = zip.getEntries();
  return entries.filter((e) => e.entryName.endsWith(".nscurve")).length;
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