"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const dailyData = [
  { day: "Apr 16", events: 4, iess: 3.2, focal: 3, diffuse: 1 },
  { day: "Apr 17", events: 7, iess: 4.1, focal: 5, diffuse: 2 },
  { day: "Apr 18", events: 12, iess: 5.0, focal: 8, diffuse: 4 },
  { day: "Apr 19", events: 9, iess: 4.6, focal: 6, diffuse: 3 },
  { day: "Apr 20", events: 15, iess: 5.8, focal: 11, diffuse: 4 },
  { day: "Apr 21", events: 18, iess: 6.4, focal: 14, diffuse: 4 },
  { day: "Apr 22", events: 21, iess: 7.2, focal: 17, diffuse: 4 },
];

const hourlyPeak = [
  { hour: "00", events: 2 }, { hour: "02", events: 4 }, { hour: "04", events: 6 },
  { hour: "06", events: 1 }, { hour: "08", events: 3 }, { hour: "10", events: 2 },
  { hour: "12", events: 4 }, { hour: "14", events: 8 }, { hour: "16", events: 7 },
  { hour: "18", events: 3 }, { hour: "20", events: 2 }, { hour: "22", events: 1 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
      <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} className="text-xs flex items-center gap-2">
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{p.value}</span>
          <span style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
};

export default function TrendsView() {
  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Trends</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Baby R. · MRN 00482-A · Day 1–7 of admission</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Trend", value: "↑ 425%", sub: "Events vs Day 1", color: "var(--red)" },
          { label: "IESS Change", value: "+4.0", sub: "Over 7 days", color: "var(--red)" },
          { label: "Peak Hour", value: "14:00", sub: "Most events at 15:00", color: "var(--amber)" },
          { label: "Best Day", value: "Apr 16", sub: "4 events · IESS 3.2", color: "var(--teal)" },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="label mb-2">{s.label}</div>
            <div className="metric text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* IESS trend line */}
        <div className="col-span-12 xl:col-span-8 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="label mb-1">IESS Severity Over Time</div>
              <div className="flex items-baseline gap-2">
                <span className="metric text-2xl" style={{ color: "var(--red)" }}>7.2</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>current · Day 7</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red-border)" }}>
              ↑ Worsening
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="iess" name="IESS" stroke="var(--red)" strokeWidth={2} dot={{ fill: "var(--red)", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly distribution */}
        <div className="col-span-12 xl:col-span-4 card p-5">
          <div className="label mb-1">Circadian Pattern</div>
          <div className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Events by hour of day</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyPeak} barSize={10}>
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="events" name="events" fill="var(--blue)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="card p-5">
        <div className="label mb-4">Daily Spasm Breakdown</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} barSize={18} barGap={3}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="focal" name="focal" fill="var(--blue)" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="diffuse" name="diffuse" fill="var(--teal)" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "var(--blue)" }}/> Focal
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "var(--teal)" }}/> Diffuse
          </span>
        </div>
      </div>
    </div>
  );
}
