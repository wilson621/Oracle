import type { CoachReport } from "./coach-types";
import { generateCoachMission } from "./mission-generator";

type CoachEngineInput = {
  sessionsAnalysed: number;
  weakestSkill: string;
  strongestSkill: string;
  currentCombatRating: number;
  projectedCombatRating: number;
  predictionConfidence: number;
};

export function generateCoachReport({
  sessionsAnalysed,
  weakestSkill,
  strongestSkill,
  currentCombatRating,
  projectedCombatRating,
  predictionConfidence,
}: CoachEngineInput): CoachReport {
  const mission = generateCoachMission({
    weakestSkill,
    currentCombatRating,
  });

  return {
    summary: `Oracle has analysed ${sessionsAnalysed} Oracle Sessions. Current coaching priority is ${weakestSkill}.`,
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