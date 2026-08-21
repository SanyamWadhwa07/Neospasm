"use client";
import { useState } from "react";

export default function AlertConfigView() {
  const [thresholds, setThresholds] = useState({
    iessAlert: 6.0,
    iessWarning: 4.0,
    clusterCount: 3,
    impedanceMax: 30,
    minConf: 80,
  });
  const [notifications, setNotifications] = useState({
    clinicianPage: true,
    emailAlert: true,
    smsAlert: false,
    inAppAlert: true,
  });
  const [escalationRules, setEscalationRules] = useState([
    { label: "Auto-page if IESS > alert threshold", enabled: true },
    { label: "Escalate to attending if unacknowledged > 5 min", enabled: true },
    { label: "Night mode: reduce non-urgent notifications (22:00-06:00)", enabled: false },
    { label: "Bundle notifications within 60 sec window", enabled: true },
    { label: "Auto-generate summary after cluster event", enabled: true },
  ]);
  const [saved, setSaved] = useState(false);

  function toggleRule(i: number) {
    setEscalationRules(prev => prev.map((r, idx) => idx === i ? { ...r, enabled: !r.enabled } : r));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="px-4 pt-6 pb-4 md:px-10 md:pt-8 md:pb-6 space-y-5 max-w-[1600px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Alert Configuration</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Baby R. · MRN 00482-A · Customize thresholds and escalation rules</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: saved ? "var(--teal)" : "linear-gradient(135deg, var(--blue), #1D4ED8)", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
          {saved ? (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg> Saved</>
          ) : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Threshold config */}
        <div className="col-span-12 xl:col-span-8 space-y-5">
          <div className="card p-5">
            <div className="label mb-4">Severity Thresholds</div>

            {[
              { key: "iessAlert" as const, label: "IESS Alert Threshold", sub: "Triggers immediate clinician page", min: 1, max: 10, step: 0.1, unit: "/10", color: "var(--red)" },
              { key: "iessWarning" as const, label: "IESS Warning Threshold", sub: "Triggers monitoring notification", min: 1, max: 10, step: 0.1, unit: "/10", color: "var(--amber)" },
              { key: "clusterCount" as const, label: "Cluster Alert Count", sub: "Events per 2 min to trigger cluster alert", min: 2, max: 10, step: 1, unit: "events", color: "var(--red)" },
              { key: "impedanceMax" as const, label: "Electrode Impedance Max", sub: "kΩ before re-gel notification", min: 10, max: 100, step: 5, unit: "kΩ", color: "var(--amber)" },
              { key: "minConf" as const, label: "Minimum Confidence", sub: "Below this, the event gets flagged for review", min: 50, max: 99, step: 1, unit: "%", color: "var(--blue)" },
            ].map(item => (
              <div key={item.key} className="mb-5 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.label}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{item.sub}</div>
                  </div>
                  <div className="metric text-xl" style={{ color: item.color }}>
                    {thresholds[item.key]}{item.unit !== "/10" ? " " : ""}<span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>{item.unit}</span>
                  </div>
                </div>
                <input type="range"
                  min={item.min} max={item.max} step={item.step}
                  value={thresholds[item.key]}
                  onChange={e => setThresholds(prev => ({ ...prev, [item.key]: parseFloat(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  <span>{item.min}{item.unit === "/10" ? "" : ""}</span>
                  <span>{item.max}{item.unit === "/10" ? "" : ""}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Escalation rules */}
          <div className="card p-5">
            <div className="label mb-4">Escalation Rules</div>
            {escalationRules.map((rule, i) => (
              <div key={i} className="flex items-center justify-between py-3"
                style={{ borderBottom: i < escalationRules.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{rule.label}</span>
                <button
                  onClick={() => toggleRule(i)}
                  className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
                  style={{ background: rule.enabled ? "var(--blue)" : "var(--border-strong)" }}>
                  <span className="absolute w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ top: 2, left: rule.enabled ? 22 : 2 }}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification channels */}
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="card p-5">
            <div className="label mb-4">Notification Channels</div>
            {[
              { key: "clinicianPage" as const, label: "Clinician Page", sub: "Dr. Jitendra Kumar Sahu via pager", icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.12 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.2a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" },
              { key: "emailAlert" as const, label: "Email Alert", sub: "jitendra.sahu@hospital.org", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" },
              { key: "smsAlert" as const, label: "SMS Alert", sub: "+91 98765 XXXXX", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
              { key: "inAppAlert" as const, label: "In-App Alert", sub: "Dashboard notification", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" },
            ].map(ch => (
              <div key={ch.key} className="flex items-center gap-3 py-3"
                style={{ borderBottom: ch.key !== "inAppAlert" ? "1px solid var(--border)" : "none" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: notifications[ch.key] ? "var(--blue-light)" : "var(--page-bg)", border: `1px solid ${notifications[ch.key] ? "var(--blue-border)" : "var(--border)"}` }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={notifications[ch.key] ? "var(--blue)" : "var(--text-muted)"} strokeWidth="2" strokeLinecap="round">
                    <path d={ch.icon}/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ch.label}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{ch.sub}</div>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [ch.key]: !prev[ch.key] }))}
                  className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
                  style={{ background: notifications[ch.key] ? "var(--blue)" : "var(--border-strong)" }}>
                  <span className="absolute w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ top: 2, left: notifications[ch.key] ? 22 : 2 }}/>
                </button>
              </div>
            ))}
          </div>

          {/* Alert preview */}
          <div className="card p-4">
            <div className="label mb-3">Current Alert State</div>
            <div className="space-y-2">
              {[
                { label: "IESS threshold reached", status: true, color: "var(--red)" },
                { label: "Cluster threshold reached", status: true, color: "var(--red)" },
                { label: "Impedance warning", status: false, color: "var(--amber)" },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: a.status ? (a.color === "var(--red)" ? "var(--red-light)" : "var(--amber-light)") : "var(--page-bg)", border: `1px solid ${a.status ? "var(--red-border)" : "var(--border)"}` }}>
                  <span className="text-xs font-medium" style={{ color: a.status ? a.color : "var(--text-muted)" }}>{a.label}</span>
                  <span className="text-[10px] font-bold uppercase"
                    style={{ color: a.status ? a.color : "var(--text-muted)" }}>
                    {a.status ? "ACTIVE" : "OK"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
