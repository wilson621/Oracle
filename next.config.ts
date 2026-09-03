import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    // Next.js 16's proxy (proxy.ts -> lib/supabase-middleware.ts) buffers
    // the entire incoming request body in memory so both the proxy and the
    // route handler can read it, and silently truncates anything past this
    // limit (10MB by default) instead of erroring. A full Watch & Coach
    // match submission to /api/oracle/coach-report can include up to 400
    // captured frames as base64 JPEGs, which easily exceeds 10MB -- the
    // truncated body then fails JSON parsing in the route handler with
    // "Coaching report request must be valid JSON." Raised here so a real
    // full-length match report can't get silently cut off.
    //
    // Full Match Analysis (/api/oracle/coach-report-video) pushed this much
    // higher still: a full 45-minute recording at the desktop app's capped
    // bitrate can reach ~300MB (see MAX_VIDEO_BYTES in that route and the
    // bitrate math in match-video-recording-coordinator.ts). This is a
    // single global setting, so it has to cover both routes -- there's no
    // per-route override.
    proxyClientMaxBodySize: "350mb",
  },
};

export default nextConfig;
