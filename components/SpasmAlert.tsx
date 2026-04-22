"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function ConfidenceBar({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium w-9 flex-shrink-0" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
        <motion.div className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }} />
      </div>
      <span className="text-xs font-mono font-semibold w-9 text-right flex-shrink-0" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

export default function SpasmAlert() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-xl relative"
        style={{
          border: "1px solid var(--red-border)",
          boxShadow: "var(--shadow-alert)",
          background: "linear-gradient(145deg, #FEF2F2 0%, #FFF8F8 100%)",
        }}
      >
        {/* Animated left border */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: "var(--red)" }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="pl-4 pr-4 pt-4 pb-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              {/* Pulsing icon */}
              <div className="relative flex-shrink-0 mt-0.5">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(217,48,37,0.15)" }}
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
                <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(217,48,37,0.12)", border: "1px solid var(--red-border)" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                      fill="rgba(217,48,37,0.15)" stroke="var(--red)" strokeWidth="1.75" strokeLinecap="round"/>
                    <line x1="12" y1="9" x2="12" y2="13" stroke="var(--red)" strokeWidth="1.75" strokeLinecap="round"/>
                    <circle cx="12" cy="17" r="1" fill="var(--red)"/>
                  </svg>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Spasm Detected</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{ background: "rgba(217,48,37,0.12)", color: "var(--red)", border: "1px solid rgba(217,48,37,0.2)" }}>
                    Focal · Right Frontal
                  </span>
                </div>
                <div className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>
                  Event #285 · 7s ago · Cluster of 4
                </div>
              </div>
            </div>

            <button onClick={() => setDismissed(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "white")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Confidence */}
          <div className="rounded-lg p-3 mb-3 space-y-2.5"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(217,48,37,0.08)" }}>
            <ConfidenceBar label="EEG" value={89} color="var(--blue)" bg="rgba(37,99,235,0.1)" />
            <ConfidenceBar label="Video" value={82} color="var(--teal)" bg="rgba(11,138,116,0.1)" />
            <ConfidenceBar label="Fused" value={94} color="var(--red)" bg="rgba(217,48,37,0.1)" />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <motion.button
              onClick={() => setAcknowledged(!acknowledged)}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{
                background: acknowledged
                  ? "linear-gradient(135deg, #059669, #047857)"
                  : "linear-gradient(135deg, #DC2626, #B71C1C)",
                boxShadow: acknowledged
                  ? "0 1px 4px rgba(5,150,105,0.4)"
                  : "0 1px 4px rgba(217,48,37,0.4)",
              }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              {acknowledged ? "Acknowledged" : "Acknowledge"}
            </motion.button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "rgba(255,255,255,0.8)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Review
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
