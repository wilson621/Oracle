// Deliberately duplicated rather than imported from
// lib/oracle/clips/oracle-content-clips-service.ts (a "server-only"
// module) -- same convention report-types.ts already uses for the coaching
// report shape. Keep in sync with that file's GeneratedContentClip /
// GenerateContentClipsResult if either changes.

export type ContentClipMomentType =
  | "skill-highlight"
  | "clutch-moment"
  | "funny-fail"
  | "big-play"
  | "milestone"
  | "other";

export type GeneratedContentClip = Readonly<{
  title: string;
  hook: string;
  caption: string;
  reason: string;
  momentType: ContentClipMomentType;
  confidence: "low" | "medium" | "high";
  startOffsetMs: number;
  endOffsetMs: number;
  filePath: string;
}>;

export type ContentClipsResult = Readonly<{
  status: "complete";
  clips: readonly GeneratedContentClip[];
  outputFolder: string;
  /**
   * How many genuinely shareworthy moments Oracle found in this match but
   * didn't cut, specifically because today's Content Clips allowance ran
   * out -- not counting a moment that was picked but failed to cut for an
   * unrelated (e.g. local processing) reason. Greater than 0 means this
   * match had more worth sharing than today's cap allowed.
   */
  heldBackByDailyCap: number;
}>;

export const MOMENT_TYPE_LABELS: Record<ContentClipMomentType, string> = {
  "skill-highlight": "Skill highlight",
  "clutch-moment": "Clutch moment",
  "funny-fail": "Funny / fail",
  "big-play": "Big play",
  milestone: "Milestone",
  other: "Highlight",
};
