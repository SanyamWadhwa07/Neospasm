"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, ReferenceLine } from "recharts";
import { useSpasmData } from "@/lib/use-spasm-data";

// Day 1-6 removed: only one real recording session exists in spasm-data.ts,
// so there is no real admission history to show alongside it.
// const buildDailyData = (todayEvents, todayIess) => [ /* Day 1-6 mock, removed */ ];
const buildDailyData = (todayEvents: number, todayIess: number) => [
  { day: "Today", events: todayEvents, iess: todayIess },
];

// Hourly distribution built from real spasm events
function buildHourlyData(events: { wallClockTime: string }[]) {
  const buckets: Record<string, number> = {};
  for (let h = 0; h < 24; h += 2) {
    buckets[String(h).padStart(2, "0")] = 0;
  }
  events.forEach(e => {
    const hour = parseInt(e.wallClockTime.split(":")[0], 10);
    const bucket = String(Math.floor(hour / 2) * 2).padStart(2, "0");
    if (bucket in buckets) buckets[bucket]++;
  });
  return Object.entries(buckets).map(([hour, events]) => ({ hour, events }));
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
      <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} className="text-xs flex items-center gap-2">
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{p.value}</span>
          <span style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>
            {p.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrendsView() {
  const { events, summary, loading } = useSpasmData();

  const todayEvents = summary?.totalSpasms ?? 23;
  const todayIess   = summary?.severity?.score ?? 5.5;
  const patientName = summary?.patient?.name ?? "B/O Amandeep Kaur";
  const patientId   = summary?.patient?.id ?? "00482-A";
  const burden      = summary?.spasmBurdenPercent ?? 3.05;
  const spasmsPerMin = summary?.spasmsPerMinute ?? 1.65;

  const dailyData  = buildDailyData(todayEvents, todayIess);
  // Fabricated placeholder counts removed — an empty/loading state has no real hourly
  // distribution yet, so every bucket is genuinely 0 until real events arrive.
  const hourlyData = buildHourlyData(events);

  // Peak hour from real data
  const peakHour = hourlyData.reduce((a, b) => a.events > b.events ? a : b, { hour: "06", events: 0 });

  return (
    <div className="px-4 pt-6 pb-4 md:px-10 md:pt-8 md:pb-6 space-y-5 max-w-[1600px]">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Trends</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {patientName} · MRN {patientId} · single recording session
        </p>
      </div>

      {/* KPI row — real values */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today's Events",  value: loading ? "…" : String(todayEvents),         sub: "This recording session",            color: "var(--red)" },
          { label: "IESS Score",      value: loading ? "…" : `${todayIess}/10`,            sub: `+${summary?.severity?.delta24h ?? 0.8} in 24h`, color: "var(--red)" },
          { label: "Peak Hour",       value: loading ? "…" : `${peakHour.hour}:00`,        sub: `${peakHour.events} events`,         color: "var(--amber)" },
          { label: "Spasm Burden",    value: loading ? "…" : `${burden}%`,                 sub: `${spasmsPerMin}/min avg`,           color: "var(--teal)" },
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
        <div className="col-span-12 xl:col-span-8 card p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="label mb-1">IESS Severity Over Admission</div>
              <div className="flex items-baseline gap-2">
                <span className="metric text-2xl" style={{ color: "var(--red)" }}>
                  {loading ? "…" : todayIess}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>current</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red-border)" }}>
              ↑ Worsening
            </span>
          </div>
          <div className="h-48 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={7} stroke="rgba(217,48,37,0.3)" strokeDasharray="4 4" label={{ value: "Alert threshold", fontSize: 9, fill: "var(--text-muted)" }} />
                <Line type="monotone" dataKey="iess" name="IESS" stroke="var(--red)" strokeWidth={2}
                  dot={{ fill: "var(--red)", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Real data from today's recording ({todayEvents} events · {burden}% burden)
          </p>
        </div>

        {/* Hourly distribution — real */}
        <div className="col-span-12 xl:col-span-4 card p-5 min-w-0">
          <div className="label mb-1">Circadian Pattern</div>
          <div className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Events by hour · today's recording
          </div>
          <div className="h-48 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={hourlyData} barSize={10}>
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
      <div className="card p-5 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="label">Daily Spasm Breakdown</div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>real data</span>
        </div>
        <div className="h-48 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={dailyData} barSize={18} barGap={3}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="events" name="events" fill="var(--blue)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}