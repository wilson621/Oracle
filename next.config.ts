import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    // Next.js 16's proxy (proxy.ts -> lib/supabase-middleware.ts) buffers
    // the entire incoming request body in memory so both the proxy and the
    // route handler can read it, and silently truncates anything past this
    // limit (10MB by default) instead of erroring. Full Match Analysis
    // (/api/oracle/coach-report-video) needs it raised well above that: a
    // full 45-minute recording at the desktop app's capped bitrate can
    // reach ~300MB (see MAX_VIDEO_BYTES in that route and the bitrate math
    // in match-video-recording-coordinator.ts). This is a single global
    // setting, so it applies to every route, not just that one.
    proxyClientMaxBodySize: "350mb",
  },
};

export default nextConfig;
