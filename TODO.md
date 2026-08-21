# NeoSpasm — session TODO

Tracking every request from this session. Color palette (globals.css tokens) stays untouched throughout.

## Done
- [x] PDF report generator: fixed text overflowing page/box edges in `ReportsView.tsx` (width-aware truncation helper, applied to patient name, IESS interpretation, event descriptions, medication response).
- [x] Confirmed the 23 event timestamps in `lib/spasm-data.ts` match `D:\Infantile\data\eeg\raw\spasms time stamp.xlsx` exactly (real data, not fake).
- [x] Installed third-party design skills: `impeccable`, `design-taste-frontend`, Emil Kowalski's animation/motion set.
- [x] Doctor names replaced everywhere: "Dr. K. Arora" → "Dr. Jitendra Kumar Sahu", "Dr. P. Shah" → "Dr. Priyanka Madaan" (lib/spasm-data.ts, PatientCard, Sidebar, PatientsView, ReportsView, AlertConfigView, Notifications).
- [x] Live-monitoring video: face region blurred for privacy (static crop+blur+overlay over the whole 15s clip — head position is fixed/static in the source footage). Original unblurred file kept in session scratchpad only, not in `public/`.
- [x] EEGWaveform.tsx: added real bipolar montage labels (FP2-C4, C4-O2, ... FZ-CZ, CZ-PZ, matching the reference clinical reader screenshot) and hemisphere-based coloring (red = right, teal = left, blue = midline — reusing existing palette tokens, no new colors).

## In progress
- [ ] Wire the new montage colors/labels into the actual render loop + into `LiveMonitoring.tsx` and `EEGReviewView.tsx` callers (channel selector, waveform panel).
- [ ] Switch EEG Review's waveform panel from dark navy to the light "paper" clinical look using existing `--page-bg`/`--border` tokens (matches reference screenshot's cream-grid style without adding new colors).

## Not started
- [ ] **Dashboard redesign: bento grid layout.** Restructure `app/page.tsx`'s `DashboardView` into a bento-style grid (varied cell sizes by content priority) instead of the current uniform 8/4 column split, still using existing card/color tokens.
- [ ] **Audit every displayed timestamp for authenticity.** Known fake/static ones to check: `Notifications.tsx` item times (14:10/14:20/13:22/12:04 — hardcoded), `ReportsView.tsx` report list dates ("Jan 13 · 06:04" etc. — hardcoded), PDF "Generated {date} at {time}" (this one is real, uses `new Date()`). Replace hardcoded ones with real data where a real source exists, or clearly mark as illustrative if not.
- [ ] Restore the "-" placeholder blanks left over from a prior fake-data-removal pass, using the real fields already in `SpasmEvent`/`useSpasmData()` (type, laterality, description, confidence) — currently broken/blank in:
  - `SpasmAlert.tsx` (badge + subtitle)
  - `SpasmBurden.tsx` (tooltip series name, legend labels)
  - `LiveMonitoring.tsx` (Pose Asymmetry metric tile — remove tile instead, no real pose pipeline exists)
  - `EventsList.tsx` (type badge, side badge, description)
  - `EventsView.tsx` (stat cards, type badge, side badge, description)
  - `EEGReviewView.tsx` (annotation label)
  - `TrendsView.tsx` (tooltip series name)
- [ ] Restore `PhenotypeAnalysis.tsx` (currently fully gutted to "-" placeholders) using `useSpasmData()` instead of the old raw `/api/spasms` fetch — brain map + body diagram + concordance text all have working original code, just disconnected.
- [ ] General layout/typography/depth polish pass per `impeccable` skill guidance (Operate mode): remove double elevation (border + shadow) on `.card`, remove the banned colored `border-left` accent strips on `PatientCard.tsx` and `SpasmAlert.tsx`, simplify Sidebar active-nav-item indicator.
- [ ] Run `node .agents/skills/impeccable/scripts/detect.mjs --json` mechanical scan over changed files once the visual pass is done.
- [ ] `/humanizer` pass over on-page copy: PDF executive-summary paragraphs and IESS interpretation strings (`lib/spasm-data.ts`), `PhenotypeAnalysis` concordance text, `Notifications` descriptions, `AlertConfigView` copy — check for AI-writing tells (em dashes, "underscores," "vibrant," filler).
- [ ] Final pass: `npm run build` / dev-server visual check across all views (Dashboard, Patients, EEG Review, Events, Reports, Trends, Alert Config) at desktop + mobile widths.
