import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine, OracleEngineResult } from "@/lib/oracle/engines";

export type ContextSummaryOutput = {
  operatorId: string;
  callsign: string;
  sessionsAnalysed: number;
  recentSessionCount: number;
  currentGame: string | null;
  patchVersion: string | null;
};

export const contextSummaryEngine: OracleEngine<ContextSummaryOutput> = {
  metadata: {
    id: "context-summary-engine",
    name: "Context Summary Engine",
    version: "1.0.0",
    description:
      "Produces a diagnostic summary of the current Oracle Context.",
    priority: 10,
    capabilities: ["context", "operator", "signal"],
    supportedGames: ["*"],
    dependencies: [],
    producesSignals: true,
    producesDecisions: false,
  },

  async execute(
    context: OracleContext
  ): Promise<OracleEngineResult<ContextSummaryOutput>> {
    const output: ContextSummaryOutput = {
      operatorId: context.operator.operatorId,
      callsign: context.operator.callsign,
      sessionsAnalysed: context.profile.sessionsAnalysed,
      recentSessionCount: context.session.recentSessions.length,
      currentGame: context.game.currentGame,
      patchVersion: context.game.patchVersion,
    };

    return {
      engineId: this.metadata.id,
      generatedAt: new Date().toISOString(),
      output,
      signals: [
        {
          id: "context-summary-generated",
          category: "operator",
          title: "Oracle Context Generated",
          summary: `Oracle Context prepared for ${context.operator.callsign} with ${context.session.recentSessions.length} recent sessions available.`,
          severity: "low",
          direction: "neutral",
          confidence: 0.95,
          createdAt: new Date().toISOString(),
        },
      ],
      decisions: [],
      diagnostics: {
        sessionsAnalysed: output.sessionsAnalysed,
        recentSessionCount: output.recentSessionCount,
        currentGame: output.currentGame,
        patchVersion: output.patchVersion,
      },
    };
  },
};