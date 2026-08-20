"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import EEGWaveform from "./EEGWaveform";

function MetricTile({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: string }) {
  return (
    <div className="rounded-lg px-3 py-2.5 flex-1"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono font-semibold text-lg leading-none" style={{ color: accent ?? "rgba(255,255,255,0.9)" }}>{value}</span>
        <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{unit}</span>
      </div>
    </div>
  );
}

export default function LiveMonitoring() {
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (paused) el.pause();
    else el.play().catch(() => {});
  }, [paused]);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Live Monitoring</span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md"
            style={{ background: "rgba(217,48,37,0.08)", color: "var(--red)", border: "1px solid rgba(217,48,37,0.15)" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--red)" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--red)" }} />
            </span>
            Streaming
          </span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setPaused(!paused)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "var(--page-bg)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            {paused
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            }
          </button>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "var(--page-bg)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Camera feed */}
      <div className="relative" style={{ background: "#060D1A", aspectRatio: "16/9" }}>
        {/* Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          src="/video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`v${i}`} x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%" stroke="white" strokeWidth="0.5"/>
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={`${(i + 1) * 16.6}%`} x2="100%" y2={`${(i + 1) * 16.6}%`} stroke="white" strokeWidth="0.5"/>
          ))}
        </svg>

        {/* Corner brackets */}
        {[
          "top-2 left-2 border-t border-l",
          "top-2 right-2 border-t border-r",
          "bottom-2 left-2 border-b border-l",
          "bottom-2 right-2 border-b border-r",
        ].map((cls, i) => (
          <div key={i} className={`absolute w-4 h-4 border-white/30 ${cls}`} />
        ))}

        {/* Top overlays */}
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[10px] font-mono font-medium text-white/60"
          style={{ background: "rgba(0,0,0,0.45)", padding: "3px 8px", borderRadius: 4 }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-red-500" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
          </span>
          LIVE · CAM-01
        </div>

        <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-white/40">
          0:15 loop · 25FPS · 346×540
        </div>

        {/* Fullscreen */}
        <button className="absolute top-2.5 right-3 w-6 h-6 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
          style={{ background: "rgba(0,0,0,0.4)", borderRadius: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>

      {/* Metrics */}
      <div className="flex gap-2 p-3" style={{ background: "#080F1C" }}>
        <MetricTile label="Motion Energy" value="0.82" unit="rel" accent="#FF7070" />
        <MetricTile label={/* "Pose Asymmetry" */ "-"} value={/* "0.61" */ "-"} unit={/* "idx" */ "-"} accent="#FACC15" />
        <MetricTile label="Frame Rate" value="25" unit="Hz" />
      </div>

      {/* EEG */}
      <div className="px-4 pt-3.5 pb-1" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12 Q5 5 8 12 Q11 19 14 12 Q17 5 21 12"/>
            </svg>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>EEG · 19 channels</span>
          </div>
          <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>256 Hz · μV</span>
        </div>
        {!paused ? <EEGWaveform /> : (
          <div className="h-20 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>Paused</div>
        )}
      </div>

      {/* Fusion bar */}
      <div className="px-4 pt-2 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{/* Fusion confidence */ "EEG confidence"}</span>
          <span className="text-sm font-mono font-semibold" style={{ color: "var(--red)" }}>94.0%</span>
        </div>
        <div className="relative h-2 rounded-full overflow-visible" style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
          <motion.div className="h-full rounded-full"
            style={{ background: "linear-gradient(to right, #FBBF24, #EF4444)" }}
            initial={{ width: 0 }}
            animate={{ width: "94%" }}
            transition={{ duration: 1.1, ease: "easeOut" }} />
          {/* Threshold */}
          <div className="absolute top-1/2 -translate-y-1/2" style={{ left: "70%" }}>
            <div className="w-px h-4 -translate-y-1" style={{ background: "var(--text-muted)" }} />
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>0</span>
          <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)", marginLeft: "64%" }}>threshold 70%</span>
          <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>100</span>
        </div>
      </div>
    </div>
  );
}
