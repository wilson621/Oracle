import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // ffmpeg-static locates its bundled ffmpeg binary at runtime via
  // path.join(__dirname, ...) (see node_modules/ffmpeg-static/index.js).
  // Next.js bundles route handler dependencies by default, which rewrites
  // __dirname to a fake bundle-relative path (confirmed by testing: it
  // resolved to a literal "\ROOT\node_modules\ffmpeg-static\ffmpeg.exe",
  // which doesn't exist) -- ffmpeg then fails to spawn with ENOENT every
  // time, in both the content-clips route (which needs to actually run
  // ffmpeg) and silently in any other route that happens to import
  // anything from lib/oracle/clips/. Opting it out of that bundling means
  // it's loaded with native Node `require` instead, which keeps its real
  // on-disk __dirname and lets it find the binary it already downloaded.
  serverExternalPackages: ["ffmpeg-static"],
  experimental: {
    // Next.js 16's proxy (proxy.ts -> lib/supabase-middleware.ts) buffers
    // the entire incoming request body in memory so both the proxy and the
    // route handler can read it, and silently truncates anything past this
    // limit (10MB by default) instead of erroring. Full Match Analysis
    // (/api/oracle/coach-report-video) and Content Clips
    // (/api/oracle/content-clips) both need it raised well above that: a
    // full 45-minute recording at the desktop app's standard capture
    // settings reaches ~300MB, or, when the Operator has opted into
    // "record in high quality for Content Clips", ~1.01GB (see
    // MAX_VIDEO_BYTES in those routes and the bitrate math in
    // match-video-recording-coordinator.ts) -- this was raised from 350mb
    // specifically to cover that higher-quality mode, which would
    // otherwise have its uploads silently truncated well before hitting
    // either route's own size check. This is a single global setting, so
    // it applies to every route, not just those two.
    proxyClientMaxBodySize: "1300mb",
  },
};

export default nextConfig;
