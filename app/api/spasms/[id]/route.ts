// app/api/spasms/[id]/route.ts
// GET /api/spasms/5  — single spasm with prev/next context

import { NextRequest, NextResponse } from "next/server";
import { getSpasmData } from "@/lib/spasm-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) return NextResponse.json({ error: "ID must be a number" }, { status: 400 });

    const { events } = getSpasmData();
    const event = events.find((e) => e.id === id);
    if (!event) {
      return NextResponse.json(
        { error: `Event ${id} not found. Valid range: 1–${events.length}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      event,
      prev: events.find((e) => e.id === id - 1) ?? null,
      next: events.find((e) => e.id === id + 1) ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
