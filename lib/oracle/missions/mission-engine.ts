import type { MissionReport, MissionSource } from "./mission-types";
import { generateMission } from "./mission-generator";

type MissionEngineInput = {
  sessionsAnalysed: number;
  weakestSkill: string;
  strongestSkill: string;
  currentCombatRating: number;
  projectedCombatRating: number;
  predictionConfidence: number;
  source?: MissionSource;
};

export function generateMissionReport({
  sessionsAnalysed,
  weakestSkill,
  strongestSkill,
  currentCombatRating,
  projectedCombatRating,
  predictionConfidence,
  source = "static",
}: MissionEngineInput): MissionReport {
  const mission = generateMission({
    weakestSkill,
    currentCombatRating,
    source,
    confidence: predictionConfidence,
  });

  return {
    summary: `Oracle has analysed ${sessionsAnalysed} Oracle Sessions. Current mission priority is ${weakestSkill}.`,
    sessionsAnalysed,
    mission,
    readiness: {
      focus: weakestSkill,
      strength: strongestSkill,
      currentCombatRating,
      projectedCombatRating,
      confidence: Math.round(predictionConfidence * 100),
      estimatedSessions: mission.estimatedSessions,
    },
  };
}