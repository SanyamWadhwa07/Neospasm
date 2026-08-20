"use client";
// lib/use-spasm-data.ts
// Drop-in React hook for any client component needing real spasm data.

import { useEffect, useState } from "react";
import type { SpasmEvent, SpasmSummary, SpasmCluster, TimelineBucket } from "@/types/spasm";

interface Result {
  events:   SpasmEvent[];
  summary:  SpasmSummary | null;
  clusters: Array<SpasmCluster & { events: SpasmEvent[] }>;
  timeline: TimelineBucket[];
  loading:  boolean;
  error:    string | null;
}

export function useSpasmData(options: { from?: number; to?: number } = {}): Result {
  const [state, setState] = useState<Result>({
    events: [], summary: null, clusters: [], timeline: [], loading: true, error: null,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (options.from !== undefined) params.set("from", String(options.from));
    if (options.to   !== undefined) params.set("to",   String(options.to));
    const qs = params.toString() ? `?${params}` : "";

    Promise.all([
      fetch(`/api/spasms${qs}`).then((r) => r.json()),
      fetch("/api/spasms/clusters").then((r) => r.json()),
    ])
      .then(([spasmRes, clusterRes]) => {
        setState({
          events:   spasmRes.events   ?? [],
          summary:  spasmRes.summary  ?? null,
          clusters: clusterRes.clusters ?? [],
          timeline: spasmRes.timeline ?? [],
          loading:  false,
          error:    spasmRes.error ?? null,
        });
      })
      .catch((err: Error) => setState((p) => ({ ...p, loading: false, error: err.message })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.from, options.to]);

  return state;
}

export function formatSpasmTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s % 1 === 0 ? s.toFixed(0) : s.toFixed(1)}s`;
  return `${m}m ${s % 1 === 0 ? s.toFixed(0) : s.toFixed(1)}s`;
}
