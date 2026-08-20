"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useSpasmData } from "@/lib/use-spasm-data";

// Keep 7D and 30D as mock (only have one recording session)
// 24H is replaced with real data from the .nspack
const data7d = [
  { time: "Mon", focal: 8,  diffuse: 3 },
  { time: "Tue", focal: 12, diffuse: 2 },
  { time: "Wed", focal: 6,  diffuse: 4 },
  { time: "Thu", focal: 15, diffuse: 1 },
  { time: "Fri", focal: 10, diffuse: 5 },
  { time: "Sat", focal: 21, diffuse: 2 },
  { time: "Sun", focal: 9,  diffuse: 3 },
];
const data30d = [
  { time: "W1", focal: 45, diffuse: 12 },
  { time: "W2", focal: 38, diffuse: 8  },
  { time: "W3", focal: 62, diffuse: 15 },
  { time: "W4", focal: 78, diffuse: 20 },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2"
      style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", fontFamily: "var(--font-ui)" }}>
      <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full inline-block"
            style={{ background: p.name === "focal" ? "var(--blue)" : "var(--teal)" }} />
          <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{/* {p.name} */ "-"}</span>
          <span className="font-mono font-semibold ml-1" style={{ color: "var(--text-primary)" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function SpasmBurden() {
  const [tab, setTab] = useState("24H");
  const { timeline, summary, loading } = useSpasmData();

  // Convert real timeline buckets into chart format for 24H tab
  // focal = FOCAL+CLUSTER spasms, diffuse = DIFFUSE spasms
  const data24h = timeline.map((b) => ({
    time:    b.label,
    focal:   b.count,   // all spasms in this bucket
    diffuse: 0,         // diffuse breakdown not in timeline; shown as 0
  }));

  const dataMap: Record<string, typeof data24h> = {
    "24H": data24h,
    "7D":  data7d,
    "30D": data30d,
  };

  const totalLabel = summary
    ? `${summary.totalSpasms} events · peak ${summary.exam.date ? new Date(summary.exam.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}`
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
              {tab === "24H"
                ? `events · burden ${summary?.spasmBurdenPercent ?? 0}%`
                : tab === "7D" ? "events · 7-day view" : "events · 30-day view"
              }
            </span>
          </div>
        </div>

        <div className="flex rounded-lg overflow-hidden p-0.5"
          style={{ background: "var(--page-bg)", border: "1px solid var(--border)" }}>
          {["24H", "7D", "30D"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="text-xs font-semibold px-3 py-1.5 rounded-md transition-all"
              style={tab === t
                ? { background: "white", color: "var(--blue)", boxShadow: "var(--shadow-xs)", border: "1px solid var(--border)" }
                : { background: "transparent", color: "var(--text-muted)", border: "1px solid transparent" }
              }>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dataMap[tab]}
            barSize={tab === "24H" ? 9 : tab === "7D" ? 13 : 26}
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
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "var(--blue)" }} /> {/* Focal */ "-"}
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "var(--teal)" }} /> {/* Diffuse */ "-"}
        </span>
        <span className="ml-auto text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>μV · events/hr</span>
      </div>
    </div>
  );
}