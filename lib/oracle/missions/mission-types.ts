export type MissionDifficulty = "Easy" | "Moderate" | "Hard";

export type MissionSource =
  | "static"
  | "memory"
  | "evolution"
  | "coaching"
  | "brain"
  | "timeline";

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
  source: MissionSource;
  confidence: number;
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