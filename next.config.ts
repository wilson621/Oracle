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
    proxyClientMaxBodySize: "80mb",
  },
};

export default nextConfig;
