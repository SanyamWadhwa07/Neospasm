import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle the Neurosoft dataset with API routes — it's read via `fs` at
  // runtime (lib/nspack-reader.ts), not imported, so Next's file tracer
  // won't discover it on its own and the serverless function would 404 on
  // the dataset in production without this.
  outputFileTracingIncludes: {
    "/api/**": ["./non video data/**/*"],
  },
};

export default nextConfig;
