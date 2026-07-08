export type MissionDifficulty = "Easy" | "Moderate" | "Hard";

export type MissionObjective = {
  label: string;
};

export type OracleMission = {
  title: string;
  focusArea: string;
  summary: string;
  estimatedCombatGain: number;
  difficulty: MissionDifficulty;
  estimatedSessions: number;
  rewardXp: number;
  objectives: MissionObjective[];
};

export type MissionReadiness = {
  focus: string;
  strength: string;
  currentCombatRating: number;
  projectedCombatRating: number;
  confidence: number;
  estimatedSessions: number;
};

export type MissionReport = {
  summary: string;
  sessionsAnalysed: number;
  mission: OracleMission;
  readiness: MissionReadiness;
};