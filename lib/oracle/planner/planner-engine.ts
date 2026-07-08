import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine, OracleEngineResult } from "@/lib/oracle/engines";
import { generatePlannerProfile } from "./planner-profile";
import { plannerSignals } from "./planner-signals";
import type { PlannerResult } from "./planner-types";

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}

function getAverageScore(
  context: OracleContext,
  field:
    | "positioning"
    | "aim"
    | "movement"
    | "decision_making"
    | "game_sense"
): number {
  const scores = context.session.recentSessions
    .map((session) => session[field] ?? 0)
    .filter((score) => score > 0);

  return average(scores);
}

export const plannerEngine: OracleEngine<PlannerResult> = {
  metadata: {
    id: "planner-engine",
    name: "Planner Engine",
    version: "1.0.0",
    description:
      "Determines the next highest-value operator training priority.",
    priority: 45,
    capabilities: ["planner", "coach", "signal"],
    supportedGames: ["*"],
    dependencies: ["adaptive-coaching-engine"],
    producesSignals: true,
    producesDecisions: false,
  },

  async execute(
    context: OracleContext
  ): Promise<OracleEngineResult<PlannerResult>> {
    const profile = generatePlannerProfile({
      operatorId: context.operator.operatorId,
      positioning: getAverageScore(context, "positioning"),
      aim: getAverageScore(context, "aim"),
      movement: getAverageScore(context, "movement"),
      decisionMaking: getAverageScore(context, "decision_making"),
      gameSense: getAverageScore(context, "game_sense"),
    });

    const signals = plannerSignals(profile);

    return {
      engineId: this.metadata.id,
      generatedAt: new Date().toISOString(),
      output: {
        profile,
        signals,
      },
      graph: [
        {
          key: "planner",
          engineId: this.metadata.id,
          profile,
          generatedAt: new Date().toISOString(),
        },
      ],
      signals,
      decisions: [],
      diagnostics: {
        priority: profile.recommendation.priority,
        confidence: profile.recommendation.confidence,
      },
    };
  },
};