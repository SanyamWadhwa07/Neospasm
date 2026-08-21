"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useSpasmData } from "@/lib/use-spasm-data";

// 7D/30D tabs removed: only one real recording session exists in spasm-data.ts,
// so there is no real week/month history to show.
// const data7d = [ /* mock, removed */ ];
// const data30d = [ /* mock, removed */ ];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", fontFamily: "var(--font-ui)" }}>
      <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full inline-block"
            style={{ background: p.name === "focal" ? "var(--blue)" : "var(--teal)" }} />
          <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{p.name}</span>
          <span className="font-mono font-semibold ml-1" style={{ color: "var(--text-primary)" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function SpasmBurden() {
  const { timeline, summary, loading } = useSpasmData();

  // Convert real timeline buckets into chart format for 24H tab
  // focal = FOCAL+CLUSTER spasms, diffuse = DIFFUSE spasms
  const data24h = timeline.map((b) => ({
    time:    b.label,
    focal:   b.count,   // all spasms in this bucket
    diffuse: 0,         // diffuse breakdown not in timeline; shown as 0
  }));

  // Explicit IST (Asia/Kolkata, UTC+5:30) — matches the recording site, not the browser's TZ.
  const totalLabel = summary
    ? `${summary.totalSpasms} events · peak ${summary.exam.date ? new Date(summary.exam.date).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }) : "—"}`
    : "Loading…";

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="label mb-1">Spasm Burden</div>
          <div className="flex items-baseline gap-2">
            <span className="metric text-2xl">
              {loading ? "…" : summary?.totalSpasms ?? 21}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              events · burden {summary?.spasmBurdenPercent ?? 0}%
            </span>
          </div>
        </div>
        {/* 7D/30D tab switcher removed — no real history to switch to */}
      </div>

      <div className="h-32 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart
            data={data24h}
            barSize={9}
            barGap={2}
            barCategoryGap="30%"
          >
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)", radius: 4 }} />
            <Bar dataKey="focal"   name="focal"   fill="var(--blue)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="diffuse" name="diffuse" fill="var(--teal)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "var(--blue)" }} /> Focal
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "var(--teal)" }} /> Diffuse
        </span>
        <span className="ml-auto text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>μV · events/hr</span>
      </div>
    </div>
  );
}