export type CoachMissionDifficulty = "Easy" | "Moderate" | "Hard";

export type CoachMissionObjective = {
  label: string;
};

export type CoachMission = {
  title: string;
  focusArea: string;
  summary: string;
  estimatedCombatGain: number;
  difficulty: CoachMissionDifficulty;
  estimatedSessions: number;
  rewardXp: number;
  objectives: CoachMissionObjective[];
};

export type CoachReadiness = {
  focus: string;
  strength: string;
  currentCombatRating: number;
  projectedCombatRating: number;
  confidence: number;
  estimatedSessions: number;
};

export type CoachReport = {
  summary: string;
  sessionsAnalysed: number;
  mission: CoachMission;
  readiness: CoachReadiness;
};