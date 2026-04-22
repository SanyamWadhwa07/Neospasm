"use client";
import { useState } from "react";
import EEGWaveform from "@/components/EEGWaveform";

const channels = ["Fp1", "Fp2", "F3", "F4", "C3", "C4", "P3", "P4", "O1", "O2", "T3", "T4", "F7", "F8"];
const annotations = [
  { time: "14:09:22", label: "Spasm onset", type: "alert", ch: "Fp2" },
  { time: "14:09:25", label: "Cluster peak", type: "alert", ch: "F4" },
  { time: "14:10:01", label: "Post-ictal", type: "info", ch: "Fp2" },
  { time: "13:22:14", label: "Baseline drift", type: "warning", ch: "C4" },
  { time: "11:47:09", label: "Diffuse burst", type: "info", ch: "Cz" },
];

export default function EEGReviewView() {
  const [gain, setGain] = useState(50);
  const [speed, setSpeed] = useState(30);
  const [activeChannels, setActiveChannels] = useState<Set<string>>(new Set(["Fp1","Fp2","F3","F4","C3","C4","P3","P4"]));

  function toggleChannel(ch: string) {
    setActiveChannels(prev => {
      const n = new Set(prev);
      if (n.has(ch)) n.delete(ch); else n.add(ch);
      return n;
    });
  }

  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>EEG Review</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Baby R. · MRN 00482-A · Live stream · 256 Hz</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red-border)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: "var(--red)" }}/>
            LIVE
          </span>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "var(--page-bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
            Freeze
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, var(--blue), #1D4ED8)" }}>
            Export EDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Main EEG panel */}
        <div className="col-span-12 xl:col-span-9 space-y-4">
          <div className="card overflow-hidden">
            {/* Controls bar */}
            <div className="flex items-center gap-6 px-5 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--page-bg)" }}>
              <div className="flex items-center gap-2">
                <span className="label">Gain</span>
                <input type="range" min="10" max="200" value={gain} onChange={e => setGain(+e.target.value)}
                  className="w-20 accent-blue-600" />
                <span className="text-xs font-mono w-10" style={{ color: "var(--text-secondary)" }}>{gain}μV</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="label">Speed</span>
                <input type="range" min="10" max="60" value={speed} onChange={e => setSpeed(+e.target.value)}
                  className="w-20 accent-blue-600" />
                <span className="text-xs font-mono w-10" style={{ color: "var(--text-secondary)" }}>{speed}mm/s</span>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className="label">Montage:</span>
                {["Bipolar", "Referential", "Laplacian"].map(m => (
                  <button key={m} className="text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all"
                    style={m === "Bipolar"
                      ? { background: "white", color: "var(--blue)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }
                      : { background: "transparent", color: "var(--text-muted)" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {/* Waveform */}
            <div style={{ background: "#060D1A", padding: "16px 8px" }}>
              <EEGWaveform />
            </div>
            {/* Timeline scrubber */}
            <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)", background: "var(--page-bg)" }}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>00:00</span>
                <div className="flex-1 relative h-4 flex items-center">
                  <div className="w-full h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full" style={{ width: "62%", background: "linear-gradient(90deg, var(--blue), var(--teal))" }}/>
                  </div>
                  <div className="absolute w-3 h-3 rounded-full border-2 border-white shadow" style={{ left: "62%", background: "var(--blue)", transform: "translateX(-50%)" }}/>
                  {/* Spasm markers */}
                  {[14, 28, 62].map((pct, i) => (
                    <div key={i} className="absolute w-1 h-3 rounded-sm" style={{ left: `${pct}%`, background: "var(--red)", opacity: 0.7 }}/>
                  ))}
                </div>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>24:00</span>
              </div>
              <div className="flex gap-4 mt-1">
                <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "var(--red)" }}/> Spasm events
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="col-span-12 xl:col-span-3 space-y-4">
          {/* Channel selector */}
          <div className="card p-4">
            <div className="label mb-3">Channels</div>
            <div className="grid grid-cols-2 gap-1">
              {channels.map(ch => {
                const on = activeChannels.has(ch);
                return (
                  <button key={ch} onClick={() => toggleChannel(ch)}
                    className="text-[11px] font-mono font-semibold px-2 py-1.5 rounded-md transition-all text-left"
                    style={on
                      ? { background: "var(--blue-light)", color: "var(--blue)", border: "1px solid var(--blue-border)" }
                      : { background: "var(--page-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                    }>
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Annotations */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="label">Annotations</div>
            </div>
            <div>
              {annotations.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 transition-colors"
                  style={{ borderBottom: i < annotations.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--page-bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: a.type === "alert" ? "var(--red)" : a.type === "warning" ? "var(--amber)" : "var(--teal)" }}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{a.label}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{a.time}</span>
                      <span className="text-[10px] font-mono px-1 rounded"
                        style={{ background: "var(--blue-light)", color: "var(--blue)" }}>{a.ch}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequency bands */}
          <div className="card p-4">
            <div className="label mb-3">Power Spectrum</div>
            {[
              { band: "Delta", hz: "0.5–4", pct: 48, color: "var(--red)" },
              { band: "Theta", hz: "4–8", pct: 22, color: "var(--amber)" },
              { band: "Alpha", hz: "8–12", pct: 15, color: "var(--blue)" },
              { band: "Beta", hz: "12–30", pct: 10, color: "var(--teal)" },
              { band: "Gamma", hz: ">30", pct: 5, color: "var(--text-muted)" },
            ].map(b => (
              <div key={b.band} className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{b.band}</span>
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{b.hz} Hz</span>
                  </div>
                  <span className="text-xs font-mono font-semibold" style={{ color: b.color }}>{b.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--page-bg)" }}>
                  <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
