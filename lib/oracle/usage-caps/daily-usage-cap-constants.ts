// Plain constants only -- deliberately has NO "server-only" import (unlike
// daily-usage-cap.ts, which re-exports these) so client components can
// show the real cap numbers in their copy (see
// MatchVideoRecordingControl.tsx) without pulling in server-only code.
// Keep these in sync with daily-usage-cap.ts and the cap Lee decided on
// (2026-09-04): 2 Full Match Analysis reports/day, 2 Content Clips/day.

export const FULL_MATCH_ANALYSIS_DAILY_CAP = 2;
export const CONTENT_CLIPS_DAILY_CAP = 2;
