// Plain constants only -- deliberately has NO "server-only" import (unlike
// usage-cap.ts, which re-exports these) so client components can show the
// real cap numbers in their copy (see MatchVideoRecordingControl.tsx)
// without pulling in server-only code.
// Keep these in sync with usage-cap.ts and the cap Lee decided on
// (2026-09-04, numbers confirmed/locked-in that evening; per-billing-cycle
// shape implemented 2026-09-05): 45 Full Match Analysis reports per
// billing cycle and 45 Content Clips per billing cycle, per Operator.
//
// Loadout Intelligence is deliberately NOT capped here (decided
// 2026-09-05) -- competitors give that feature away free, so a hard cap
// doesn't fit the market. Real per-call cost for it is still tracked via
// oracle_ai_usage_log (feature "loadout-intelligence"), which is the right
// place to check later if usage ever makes the cost worth revisiting.

export const FULL_MATCH_ANALYSIS_MONTHLY_CAP = 45;
export const CONTENT_CLIPS_MONTHLY_CAP = 45;
