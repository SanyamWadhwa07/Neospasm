// app/api/eeg/route.ts
// GET /api/eeg?start=0  — real decoded EEG waveform samples read directly from
// the .nspack's .nscurve files (see lib/nspack-reader.ts). Channels are
// labeled by raw curve index — curve→electrode-name mapping isn't available
// from Neurosoft.DB (see nspack-reader.ts comment).

import { NextResponse } from "next/server";
import { listEegCurves, readEegCurveWindow, EEG_SAMPLE_RATE_HZ } from "@/lib/nspack-reader";

const MAX_CHANNELS = 16;
const WINDOW_SEC = 20;
const POINTS_PER_CHANNEL = 600;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startSec = Number(searchParams.get("start") ?? "0") || 0;

    const curves = listEegCurves().slice(0, MAX_CHANNELS);

    const channels = curves.map((curve, i) => {
      const raw = readEegCurveWindow(curve, startSec, WINDOW_SEC);
      const stride = Math.max(1, Math.floor(raw.length / POINTS_PER_CHANNEL));
      const samples: number[] = [];
      for (let p = 0; p < raw.length; p += stride) samples.push(raw[p]);
      return { index: curve.index, label: `Ch${i + 1}`, samples };
    });

    return NextResponse.json({ sampleRateHz: EEG_SAMPLE_RATE_HZ, windowSec: WINDOW_SEC, channels });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
