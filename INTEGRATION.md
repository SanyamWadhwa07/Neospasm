# INTEGRATION GUIDE
# Neospasm — .nspack Direct Backend Integration
# ================================================

## What changed vs the previous version

The app now reads DIRECTLY from your Neurosoft .nspack file on disk.
Patient name, exam date, recording duration, doctor name, video/audio presence,
and EEG channel count all come LIVE from Neurosoft.DB inside the file.

> **Correction (see README.md "Current status"):** there is no
> `spasms_time_stamp.xlsx` file anywhere in this repo. Spasm event
> timestamps and their type/laterality/confidence classification are
> hand-typed literals in `lib/spasm-data.ts` (`RAW`/`UI_META`), not parsed
> from Excel. Only the patient/exam metadata listed above is genuinely live.
>
> **Timezone:** all displayed clock times are fixed to **IST (Asia/Kolkata,
> UTC+5:30)**, explicitly, regardless of where the server or browser is
> located. If you integrate a `.nspack` from a site outside India, update
> the `timeZone` in `lib/spasm-data.ts`'s `toWallClock()` and in
> `SpasmBurden.tsx` accordingly.

---

## Step 1 — Install new dependencies

```bash
npm install better-sqlite3 adm-zip
npm install --save-dev @types/better-sqlite3 @types/adm-zip
```

---

## Step 2 — Create .env.local in your project root

```
# Path to your .nspack file on the Windows Server
NSPACK_PATH=C:\neospasm-data\patient.nspack
```

Replace the path with wherever your actual file is stored.
Never commit .env.local to git — it's already in .gitignore.

---

## Step 3 — Copy files into your repo

```
your-repo/
├── types/
│   └── spasm.ts
├── lib/
│   ├── nspack-reader.ts        ← NEW: reads Neurosoft.DB from .nspack
│   ├── spasm-data.ts           ← UPDATED: pulls live data from nspack-reader
│   └── use-spasm-data.ts       ← React hook (unchanged)
└── app/
    └── api/
        ├── patient/
        │   └── route.ts        ← NEW: GET /api/patient
        ├── exam/
        │   └── route.ts        ← NEW: GET /api/exam
        └── spasms/
            ├── route.ts        ← GET /api/spasms
            ├── [id]/route.ts   ← GET /api/spasms/5
            ├── clusters/route.ts
            └── summary/route.ts
```

---

## Step 4 — Test

```bash
npm run dev
```

Visit these URLs to verify live data from your .nspack:

| Endpoint | What it returns |
|----------|----------------|
| /api/patient | Patient name, diagnosis from Neurosoft.DB |
| /api/exam | Exam date, duration, doctor from Neurosoft.DB |
| /api/spasms | All 23 spasm events + full summary |
| /api/spasms/summary | Dashboard stats cards data |
| /api/spasms/clusters | Cluster groups |
| /api/spasms/5 | Single event with prev/next |

---

## Step 5 — Replace mock data in your components

```tsx
"use client";
import { useSpasmData } from "@/lib/use-spasm-data";

export default function EventsPanel() {
  const { events, summary, loading, error } = useSpasmData();
  if (loading) return <div>Loading from .nspack...</div>;
  if (error)   return <div>Error: {error}</div>;

  return (
    <div>
      <p>{summary?.patient.name} — {summary?.patient.diagnosis}</p>
      <p>{summary?.totalSpasms} spasms · Burden {summary?.spasmBurdenPercent}%</p>
      {events.map(e => (
        <div key={e.id}>
          {e.wallClockTime} · {e.type} · {e.durationSec}s · {e.fusionConfidencePct}% FUSED
          <br/>{e.description}
        </div>
      ))}
    </div>
  );
}
```

---

## Step 6 — Run in production on Windows Server

```bash
npm run build
npm start
```

Or with PM2 for auto-restart:
```bash
npm install -g pm2
pm2 start "npm start" --name neospasm
pm2 save
pm2 startup
```

---

## How the data flows

```
.nspack file (disk)
  └─ adm-zip unzips it
       ├─ Neurosoft.DB  ──→  better-sqlite3  ──→  patient, exam, doctor, channels
       └─ NSData/*.nscurve   (raw EEG — not parsed, requires Neurosoft decoder)

spasms_time_stamp.xlsx (hardcoded in spasm-data.ts)
  └─ timestamp parser  ──→  23 spasm events with start/end/duration

Both combined in spasm-data.ts  ──→  API routes  ──→  React components
```

---

## Notes

- The .nspack is only read once per process start (cached in memory)
- The Neurosoft.DB is extracted to a temp file, then deleted on process exit  
- Raw EEG waveform data (.nscurve files) is NOT decoded — that requires
  the proprietary Neurosoft binary format decoder which is not public
- If you move the .nspack file, just update NSPACK_PATH in .env.local and restart
