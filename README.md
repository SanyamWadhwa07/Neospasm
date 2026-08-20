# Neospasm

Clinical dashboard for monitoring infantile epileptic spasm syndrome (IESS) —
EEG event review, severity trending, and reporting. Next.js App Router
project backed by a single real Neurosoft `.nspack` export in
`non video data/`.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See `INTEGRATION.md` for
how the backend reads the `.nspack`/`Neurosoft.DB` dataset.

## Current status (2026-08-21)

The dataset in `non video data/` is a **single real recording session**
(~14 min, one patient). There is no multi-day/multi-week history and no
`.xlsx` annotation file anywhere in the repo, despite some code comments
still referring to one.

### What's real (read live from `Neurosoft.DB` via `lib/nspack-reader.ts`)
- Patient name/weight, exam date, doctor name
- Video/audio presence flags, EEG channel count

### Timezone
All displayed spasm event/exam clock times are shown in **IST (India Standard
Time, UTC+5:30)** — hardcoded explicitly (`timeZone: "Asia/Kolkata"`) in
`lib/spasm-data.ts`'s `toWallClock()` and `SpasmBurden.tsx`, not derived from
the server's or browser's local timezone. This matches the recording site.

### What's hardcoded (in `lib/spasm-data.ts`)
- All 23 spasm event timestamps (`RAW`) and their type/laterality/confidence
  classification (`UI_META`) — hand-typed, not parsed from any file
- Patient fields `id`, `ageMonths`, `dayOfAdmission`, `etiology`, and
  fallback name/clinician
- `samplingRateHz`, `getTimelineData()`'s `totalSec`
- IESS severity score is a real formula (`computeSeverity()`) but it runs on
  the hardcoded event data above, and its `delta24h` is a fixed `+0.8`

### What's pure UI mock (bypasses `lib/spasm-data.ts` entirely)
- `EEGWaveform.tsx` — synthetic sine/random signal, not the real `.nscurve`
  files
- `LiveMonitoring.tsx` — simulated live camera/pose panel (fixed FPS,
  timestamp, motion metrics); not wired to any real feed
- `ReportsView.tsx` PDF export — narrative text templated around real event
  counts, not independently sourced

### What the UI currently shows
- **Type/laterality badges show `-`**: FOCAL/CLUSTER/DIFFUSE type badges and
  laterality ("asymmetry") text in `EventsList.tsx`, `EventsView.tsx`,
  `SpasmBurden.tsx`, `TrendsView.tsx`, `SpasmAlert.tsx`, `LiveMonitoring.tsx`,
  `IESSSeverity.tsx`, `Notifications.tsx`, and `EEGReviewView.tsx` render as
  `-` placeholders (original values kept as source comments, not deleted).
- **Phenotype Analysis card is empty**: `PhenotypeAnalysis.tsx`'s brain-map/
  body-diagram visualization is disabled; the card renders `-` placeholders
  in the same layout.
- **No 7D/30D or multi-day history**: `SpasmBurden.tsx` only has a 24H view
  and `TrendsView.tsx` only shows one real data point — there's no other
  history to show since only one session exists.
- **Confidence badges read "EEG", not "FUSED"**: the per-event confidence
  badge reflects that only EEG-derived confidence exists — no real video or
  fusion pipeline. `SpasmAlert.tsx`'s Video/Fused confidence rows are
  disabled, leaving only the real EEG confidence row.

### Known inaccuracies
- `INTEGRATION.md` and a comment in `lib/spasm-data.ts` (`RAW`) reference a
  `spasms_time_stamp.xlsx` file that does not exist in the repo — the event
  timestamps are hand-typed, not parsed from Excel.
- `AlertConfigView.tsx` still has "Cluster Alert Count"/"cluster event"
  config copy (a feature name — different meaning from the spasm-
  classification "cluster" wording elsewhere, so left as-is).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
