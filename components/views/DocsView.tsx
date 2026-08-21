"use client";
import type { ReactNode } from "react";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="label mb-3">{title}</div>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </div>
  );
}

function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg px-3 py-2.5 font-mono text-xs overflow-x-auto"
      style={{ background: "var(--page-bg)", border: "1px solid var(--border)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
}

function Term({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{label}:</span>
      {" "}{children}
    </div>
  );
}

// ─── Illustrations ─────────────────────────────────────────────────────────
// Simple, token-colored SVG diagrams (light/dark-safe via style={{fill:...}},
// not the fill="..." attribute — SVG presentation attributes don't resolve
// CSS custom properties). Numbers shown are illustrative, not live data.

function DataPipelineDiagram() {
  const box = (x: number, label: string, sub: string, fill: string, w = 108) => (
    <g transform={`translate(${x},0)`}>
      <rect width={w} height="52" rx="8" style={{ fill }} stroke="var(--border)" strokeWidth="1"/>
      <text x={w / 2} y="22" textAnchor="middle" fontSize="10" fontWeight="600"
        style={{ fill: "var(--text-primary)" }} fontFamily="var(--font-ui)">{label}</text>
      <text x={w / 2} y="36" textAnchor="middle" fontSize="8.5"
        style={{ fill: "var(--text-muted)" }} fontFamily="var(--font-mono)">{sub}</text>
    </g>
  );
  const arrow = (x: number) => (
    <path d={`M${x} 26 L${x + 22} 26 M${x + 15} 20 L${x + 22} 26 L${x + 15} 32`}
      fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  );
  return (
    <svg viewBox="0 0 396 52" className="w-full" style={{ maxWidth: 440 }}>
      {box(0, ".nspack file", "1 recording", "var(--blue-light)", 100)}
      {arrow(100)}
      {box(124, "50 channel slots", "raw allocation", "var(--page-bg)", 112)}
      {arrow(236)}
      {box(260, "14 real channels", "signal check", "var(--teal-light)", 132)}
    </svg>
  );
}

function ClusterTimelineDiagram() {
  const clusterDots = [40, 62, 84, 106];
  const isolatedDot = 210;
  return (
    <svg viewBox="0 0 270 64" className="w-full" style={{ maxWidth: 420 }}>
      <line x1="20" y1="32" x2="240" y2="32" stroke="var(--border)" strokeWidth="1.5"/>
      {clusterDots.map((x, i) => (
        <circle key={i} cx={x} cy="32" r="5" style={{ fill: "var(--red)" }}/>
      ))}
      <path d={`M${clusterDots[0]} 46 L${clusterDots[clusterDots.length - 1]} 46`}
        stroke="var(--red)" strokeWidth="1" strokeDasharray="2 2"/>
      <text x={(clusterDots[0] + clusterDots[clusterDots.length - 1]) / 2} y="60" textAnchor="middle"
        fontSize="8" style={{ fill: "var(--red)" }} fontFamily="var(--font-mono)">gaps &le;90s &rarr; 1 cluster</text>

      <circle cx={isolatedDot} cy="32" r="5" style={{ fill: "var(--blue)" }}/>
      <text x={isolatedDot} y="60" textAnchor="middle" fontSize="8"
        style={{ fill: "var(--blue)" }} fontFamily="var(--font-mono)">gap &gt;90s &rarr; new group</text>

      <path d={`M${clusterDots[clusterDots.length - 1] + 6} 32 L${isolatedDot - 6} 32`}
        stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="1 3"/>
    </svg>
  );
}

function FormulaBarDiagram() {
  // Illustrative proportions for a mid-range example score, not live data.
  const segments = [
    { label: "base", value: 4.6, color: "var(--red)" },
    { label: "clusterBonus", value: 0.8, color: "var(--amber)" },
    { label: "rateBonus", value: 0.1, color: "var(--blue)" },
  ];
  const max = 10;
  let cursor = 0;
  return (
    <svg viewBox="0 0 320 46" className="w-full" style={{ maxWidth: 420 }}>
      <defs>
        <clipPath id="formula-bar-clip">
          <rect x="0" y="10" width="320" height="14" rx="7"/>
        </clipPath>
      </defs>
      <rect x="0" y="10" width="320" height="14" rx="7" style={{ fill: "var(--page-bg)" }} stroke="var(--border)" strokeWidth="1"/>
      {/* Clipped to the same rounded shape as the track above — otherwise the
          flat-cornered segments poke square corners out past the pill's
          rounded ends. */}
      <g clipPath="url(#formula-bar-clip)">
        {segments.map((s, i) => {
          const w = (s.value / max) * 320;
          const x = cursor;
          cursor += w;
          return <rect key={i} x={x} y="10" width={w} height="14" style={{ fill: s.color }} opacity={0.85}/>;
        })}
      </g>
      {segments.map((s, i) => (
        <g key={i} transform={`translate(${i * 108}, 40)`}>
          <rect width="7" height="7" rx="1.5" style={{ fill: s.color }}/>
          <text x="11" y="6.5" fontSize="8" style={{ fill: "var(--text-muted)" }} fontFamily="var(--font-mono)">
            {s.label} = {s.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function DocsView() {
  return (
    <div className="px-4 pt-6 pb-4 md:px-10 md:pt-8 md:pb-6 space-y-5 max-w-[900px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Help &amp; Docs
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          What this app shows, where the numbers come from, and exactly how they're calculated.
        </p>
      </div>

      <Section title="What is NeoSpasm">
        <p>
          NeoSpasm is a clinical-monitor UI for Infantile Epileptic Spasms Syndrome (IESS, also
          known as West syndrome), a seizure disorder in infants where the seizures ("spasms")
          come in brief clusters and get diagnosed mainly from video-EEG monitoring. This build
          reviews <em>one real recorded EEG session</em> and presents it the way a bedside monitor
          would: waveform playback styled as live, per-event detail, cluster and burden
          statistics, and a severity score.
        </p>
        <p>
          It's a student demo project, not a certified medical device. Treat every number here as
          a demonstration of how a system like this could present real recorded data, not as a
          diagnosis or treatment recommendation.
        </p>
      </Section>

      <Section title="Where the data comes from">
        <DataPipelineDiagram />
        <p>
          The patient record, exam metadata, and all 50 raw EEG channel files come straight from
          a real Neurosoft <span className="font-mono">.nspack</span> recording (a clinical EEG
          system's export format). Of those 50 channel slots, only 14 carry a recorded signal.
          The rest are slots the recording hardware reserved but never wrote to, and the app
          filters those out instead of counting them as real channels.
        </p>
        <p>
          The 23 spasm events, along with their start and end timestamps, come from a
          clinician-reviewed spreadsheet of this same recording. Every timestamp on screen
          matches that sheet exactly. Each event's <em>type</em>, <em>laterality</em>, and{" "}
          <em>description</em> are this project's own classification of that spreadsheet entry,
          and the <em>EEG confidence</em> percentage shown per event is likewise this project's
          own estimate, not the output of a certified seizure-detection algorithm.
        </p>
        <p>
          Electrode names on the EEG traces, such as <span className="font-mono">FP2-C4</span>,
          follow the standard clinical 10-20 bipolar montage naming convention. The recording
          file doesn't store which physical electrode each raw channel came from, so these names
          are a best-effort standard labeling, not a verified per-channel mapping.
        </p>
      </Section>

      <Section title="IESS Severity Score: how it's calculated">
        <p>
          The score out of 10 shown on the dashboard is computed from three components, each
          capped so no single factor can dominate the score:
        </p>
        <FormulaBarDiagram />
        <Formula>
          base&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= min(burden% × 1.5, 6)<br/>
          clusterBonus = min(clusterCount × 0.4, 3)<br/>
          rateBonus&nbsp;&nbsp;&nbsp;= min((totalSpasms ÷ recordingMinutes) × 0.3, 1)<br/>
          score&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= min(base + clusterBonus + rateBonus, 10)
        </Formula>
        <div className="space-y-1">
          <Term label="burden%">what fraction of the recording's total duration was spent
          mid-spasm. See below.</Term>
          <Term label="clusterCount">how many spasm clusters were detected in the recording (see
          "Clusters" below).</Term>
          <Term label="rateBonus">rewards a higher spasm rate per minute of recording, on top of
          burden and clustering.</Term>
        </div>
        <p>
          The interpretation text changes at fixed thresholds: <span className="font-mono">≥7</span>{" "}
          reads as a rising burden that warrants escalation, <span className="font-mono">≥5</span>{" "}
          as moderate burden with continued monitoring, and anything below that as low burden.
        </p>
      </Section>

      <Section title="Spasm burden %">
        <Formula>burden% = (sum of every spasm's duration ÷ total recording duration) × 100</Formula>
        <p>
          This is the percentage of the whole recording where a spasm was actively happening: not
          the number of events, but the actual time spent seizing.
        </p>
      </Section>

      <Section title="Event types & clusters">
        <div className="space-y-1">
          <Term label="FOCAL">a spasm localized to one side or region of the brain (has a
          laterality: R, L).</Term>
          <Term label="CLUSTER">a spasm that's part of a rapid-succession group of events, the
          classic IESS presentation.</Term>
          <Term label="DIFFUSE">a spasm with no clear lateralization, symmetric involvement.</Term>
          <Term label="BILATERAL">a laterality value meaning both sides were involved roughly
          equally.</Term>
        </div>
        <p>
          Clusters get detected automatically: consecutive spasms group into the same cluster
          whenever the gap between one event ending and the next starting is 90 seconds or less.
          A group needs at least 2 events to count as a cluster.
        </p>
        <ClusterTimelineDiagram />
      </Section>

      <Section title="EEG confidence">
        <p>
          Each event shows an "EEG" confidence percentage and a threshold line at 70% on the
          confidence bar. This reflects only the EEG signal. There's no real video or motion
          analysis pipeline behind this build, so unlike a production fusion system, nothing here
          combines EEG with a separate video-based score. Where the UI says "fusion," that's
          forward-looking language for a capability this demo doesn't implement yet.
        </p>
      </Section>

      <Section title="Live monitoring: what's real-time and what isn't">
        <p>
          The EEG waveform panel replays real decoded samples from the recording, windowed to
          whichever time you're looking at (the most recent event on the dashboard, or wherever
          you've clicked or scrubbed to in EEG Review). It is not a live sensor feed. The camera
          feed is a short looping clip with the infant's face blurred for privacy. "Streaming" and
          "LIVE" labels describe the product experience this UI is modeled after, not an actual
          live connection in this build.
        </p>
      </Section>
    </div>
  );
}
