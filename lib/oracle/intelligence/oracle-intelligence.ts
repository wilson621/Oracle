import { analyseBehaviour } from "@/lib/oracle/behaviour/behaviour-engine";
import { analyseTrends } from "@/lib/oracle/trend/trend-engine";
import { generatePrediction } from "@/lib/oracle/prediction/prediction-engine";
import type { OracleBrainInput } from "@/lib/oracle/oracle-brain-types";

export function buildOracleIntelligence(input: OracleBrainInput) {
  const totalSessions = input.totalSessions ?? 0;
  const combatRating = input.combatRating ?? 0;
  const winChance = input.winChance ?? 0;

  const behaviour = analyseBehaviour({
    totalSessions,
    combatRating,
    positioning: input.positioning ?? 0,
    aim: input.aim ?? 0,
    movement: input.movement ?? 0,
    decisionMaking: input.decisionMaking ?? 0,
    gameSense: input.gameSense ?? 0,
  });

  const trend = analyseTrends(input.trendSessions ?? []);

  const prediction = generatePrediction({
    currentCombatRating: combatRating,
    currentWinChance: winChance,
    totalSessions,
    trend,
  });

  return {
    behaviour,
    trend,
    prediction,
  };
}