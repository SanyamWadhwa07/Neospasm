// app/api/spasms/clusters/route.ts
// GET /api/spasms/clusters  — cluster groups with full event objects

import { NextResponse } from "next/server";
import { getSpasmData } from "@/lib/spasm-data";

export async function GET() {
  try {
    const { events, summary } = getSpasmData();
    const enriched = summary.clusters.map((cluster) => ({
      ...cluster,
      events: cluster.spasmIds.map((id) => events.find((e) => e.id === id)!),
    }));

    return NextResponse.json({
      clusters: enriched,
      total: enriched.length,
      totalSpasmsInClusters: enriched.reduce((sum, c) => sum + c.count, 0),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
