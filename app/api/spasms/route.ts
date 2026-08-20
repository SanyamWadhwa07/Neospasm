// app/api/spasms/route.ts
// GET /api/spasms  — all events + full summary, sourced live from .nspack

import { NextRequest, NextResponse } from "next/server";
import { getSpasmData, getTimelineData } from "@/lib/spasm-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from        = searchParams.has("from")    ? parseFloat(searchParams.get("from")!) : null;
    const to          = searchParams.has("to")      ? parseFloat(searchParams.get("to")!)   : null;
    const summaryOnly = searchParams.get("summary") === "only";

    const { events: allEvents, summary } = getSpasmData();

    let events = allEvents;
    if (from !== null) events = events.filter((e) => e.startSec >= from);
    if (to   !== null) events = events.filter((e) => e.startSec <= to);

    if (summaryOnly) {
      return NextResponse.json({ summary });
    }

    return NextResponse.json({
      events,
      summary,
      timeline: getTimelineData(allEvents),
      meta: { total: events.length, filtered: from !== null || to !== null, fromSec: from, toSec: to },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
