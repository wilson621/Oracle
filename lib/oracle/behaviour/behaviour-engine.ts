import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine } from "@/lib/oracle/engines";
import { buildEngineResult } from "@/lib/oracle/engines";
import { calculateCombatRatingFromSession } from "@/lib/oracle/repositories/session-repository";
import { analyseBehaviour } from "./behaviour-analysis";
import type { BehaviourInput, BehaviourProfile } from "./behaviour-types";

export { analyseBehaviour } from "./behaviour-analysis";

type BehaviourSessionField =
  | "positioning"
  | "aim"
  | "movement"
  | "decision_making"
  | "game_sense";

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function getAverageScore(
  context: OracleContext,
  field: BehaviourSessionField
): number {
  const scores = context.session.recentSessions
    .map((session) => session[field] ?? 0)
    .filter((score) => score > 0);

  return average(scores);
}

function buildBehaviourInput(context: OracleContext): BehaviourInput {
  const latestSession = context.session.latestSession;

  return {
    totalSessions: context.profile.sessionsAnalysed,
    combatRating: latestSession
      ? calculateCombatRatingFromSession(latestSession)
      : 0,
    positioning: getAverageScore(context, "positioning"),
    aim: getAverageScore(context, "aim"),
    movement: getAverageScore(context, "movement"),
    decisionMaking: getAverageScore(context, "decision_making"),
    gameSense: getAverageScore(context, "game_sense"),
  };
}

export const behaviourEngine: OracleEngine<BehaviourProfile> = {
  metadata: {
    id: "behaviour-engine",
    name: "Behaviour Engine",
    version: "1.0.0",
    description:
      "Builds the current Operator behaviour profile from Oracle Context.",
    priority: 25,
    capabilities: ["behaviour", "operator", "signal"],
    supportedGames: ["*"],
    dependencies: [],
    producesSignals: true,
    producesDecisions: false,
  },

  async execute(context: OracleContext) {
    const input = buildBehaviourInput(context);
    const profile = analyseBehaviour(input);

    const signals = [
      {
        id: "behaviour-profile-generated",
        category: "behaviour" as const,
        title: "Behaviour Profile Generated",
        summary: `Oracle classified the Operator's current playstyle as ${profile.playstyle.toLowerCase()} with ${Math.round(
          profile.overallBehaviourConfidence * 100
        )}% confidence.`,
        severity: "low" as const,
        direction: "neutral" as const,
        confidence: profile.overallBehaviourConfidence,
        createdAt: new Date().toISOString(),
      },
    ];

    return buildEngineResult(behaviourEngine, {
      profile,
      graph: [
        {
          key: "behaviour",
          engineId: behaviourEngine.metadata.id,
          profile,
          generatedAt: new Date().toISOString(),
        },
      ],
      signals,
      diagnostics: {
        totalSessions: input.totalSessions,
        combatRating: input.combatRating,
        playstyle: profile.playstyle,
        strengths: profile.strengths.length,
        weaknesses: profile.weaknesses.length,
        confidence: profile.overallBehaviourConfidence,
      },
    });
  },
};