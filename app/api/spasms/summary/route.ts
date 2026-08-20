// app/api/spasms/summary/route.ts
// GET /api/spasms/summary  — lightweight stats-only endpoint for dashboard cards

import { NextResponse } from "next/server";
import { getSpasmData } from "@/lib/spasm-data";

export async function GET() {
  try {
    const { summary } = getSpasmData();
    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
