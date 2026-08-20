"use client";
import { useState } from "react";
import { useSpasmData } from "@/lib/use-spasm-data";

const statusStyle: Record<string, { bg: string; color: string; border: string }> = {
  ALERTING:   { bg: "var(--red-light)",  color: "var(--red)",   border: "var(--red-border)" },
  MONITORING: { bg: "var(--amber-light)", color: "var(--amber)", border: "rgba(201,106,0,0.2)" },
  STABLE:     { bg: "var(--teal-light)", color: "var(--teal)",  border: "rgba(11,138,116,0.2)" },
};

export default function PatientsView() {
  const [selected, setSelected] = useState<string | null>("00482-A");
  const { summary, loading } = useSpasmData();

  // Real patient from API — others remain as ward context (mock)
  const realPatient = summary ? {
    id:        summary.patient.id,
    name:      summary.patient.name,
    age:       `${summary.patient.ageMonths} mo`,
    weight:    summary.patient.weightKg ? `${summary.patient.weightKg} kg` : "7.2 kg",
    sex:       summary.patient.sex,
    day:       summary.patient.dayOfAdmission,
    status:    "ALERTING",
    events:    summary.totalSpasms,
    iess:      summary.severity.score,
    clinician: summary.patient.clinician,
    etiology:  summary.patient.etiology,
    lastEvent: summary.events?.[summary.totalSpasms - 1]?.wallClockTime ?? "—",
    ward:      "3B-04",
  } : null;

  const patients = [
    realPatient ?? {
      id: "00482-A", name: "B/O Amandeep Kaur", age: "6 mo", weight: "7.2 kg", sex: "F",
      day: 3, status: "ALERTING", events: 23, iess: 5.5, clinician: "Dr. K. Arora",
      etiology: "Structural (R MCD)", lastEvent: "06:09", ward: "3B-04",
    },
    {
      id: "00479-B", name: "Baby M.", age: "4 mo", weight: "5.8 kg", sex: "M",
      day: 7, status: "STABLE", events: 3, iess: 3.1, clinician: "Dr. P. Shah",
      etiology: "TSC", lastEvent: "09:41", ward: "3B-02",
    },
    {
      id: "00476-C", name: "Baby J.", age: "8 mo", weight: "8.4 kg", sex: "F",
      day: 12, status: "STABLE", events: 0, iess: 1.8, clinician: "Dr. P. Shah",
      etiology: "Idiopathic", lastEvent: "Yesterday", ward: "3B-01",
    },
    {
      id: "00481-D", name: "Baby K.", age: "5 mo", weight: "6.5 kg", sex: "M",
      day: 1, status: "MONITORING", events: 8, iess: 5.4, clinician: "Dr. K. Arora",
      etiology: "DS", lastEvent: "12:55", ward: "3B-06",
    },
  ];

  // Real ward stats from API
  const totalEvents = realPatient
    ? realPatient.events + 3 + 0 + 8
    : 32;
  const avgIess = realPatient
    ? Math.round(((realPatient.iess + 3.1 + 1.8 + 5.4) / 4) * 10) / 10
    : 4.4;

  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Ward 3B — Active Patients
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            4 patients · PICU · {loading ? "Loading…" : `Updated ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, var(--blue), #1D4ED8)", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Admit Patient
        </button>
      </div>

      {/* Stats strip — real values for first patient */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active",       value: "4",              sub: "PICU Ward 3B",         color: "var(--blue)" },
          { label: "Alerting",     value: "1",              sub: "Requires attention",   color: "var(--red)" },
          { label: "Total Events", value: String(totalEvents), sub: "Today across ward", color: "var(--amber)" },
          { label: "Avg IESS",     value: String(avgIess),  sub: "Ward severity index",  color: "var(--teal)" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="label mb-2">{s.label}</div>
            <div className="metric text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Patient table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="label">Patient Roster</div>
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--page-bg)" }}>
              {["Patient", "Status", "Ward", "IESS", "Events Today", "Last Event", "Clinician", "Day"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => {
              const s = statusStyle[p.status];
              const isSelected = selected === p.id;
              const isReal = p.id === "00482-A";
              return (
                <tr key={p.id}
                  onClick={() => setSelected(p.id)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: i < patients.length - 1 ? "1px solid var(--border)" : "none",
                    background: isSelected ? "var(--blue-light)" : "transparent",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--page-bg)"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: isReal ? "linear-gradient(135deg, var(--red), #B71C1C)" : "linear-gradient(135deg, var(--blue), #1D4ED8)" }}>
                        {p.sex}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                        <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {p.sex} · {p.age} · {p.weight} · {p.etiology}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>{p.ward}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="metric text-base"
                      style={{ color: p.iess >= 6 ? "var(--red)" : p.iess >= 4 ? "var(--amber)" : "var(--teal)" }}>
                      {p.iess}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>/10</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="metric text-base">{p.events}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>{p.lastEvent}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{p.clinician}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Day {p.day}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}