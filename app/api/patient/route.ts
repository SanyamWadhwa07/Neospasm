// app/api/patient/route.ts
// GET /api/patient  — patient info read directly from Neurosoft.DB inside .nspack

import { NextResponse } from "next/server";
import { getSpasmData } from "@/lib/spasm-data";

export async function GET() {
  try {
    const { summary } = getSpasmData();
    return NextResponse.json({ patient: summary.patient });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
