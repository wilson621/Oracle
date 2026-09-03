// Used by MatchVideoRecordingControl.tsx (full-video/Gemini Full Match
// Analysis) -- reports are written in this shape to
// oracle_match_coaching_reports and rendered via ReportView.tsx.

export type CoachingScores = {
  positioning: number;
  aim: number;
  movement: number;
  decision_making: number;
  game_sense: number;
};

export type DeathBreakdown = {
  whenInMatch: string;
  whatHappened: string;
  enemySightlineAssessment: string;
  couldHaveActedSooner: boolean;
  whatToDoDifferently: string;
  confidence: "low" | "medium" | "high";
};

export type CoachingReport = {
  id: string;
  status: "complete" | "degraded" | "failed";
  generated_at: string;
  model: string | null;
  summary: string | null;
  verdict: string | null;
  positioning: number | null;
  aim: number | null;
  movement: number | null;
  decision_making: number | null;
  game_sense: number | null;
  deaths: DeathBreakdown[] | null;
  raw_error: string | null;
  frame_count: number;
};
