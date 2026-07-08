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
  id: "context-summary-engine",

  async execute(
    context: OracleContext
  ): Promise<OracleEngineResult<ContextSummaryOutput>> {
    return {
      engineId: this.id,
      generatedAt: new Date().toISOString(),
      output: {
        operatorId: context.operator.operatorId,
        callsign: context.operator.callsign,
        sessionsAnalysed: context.profile.sessionsAnalysed,
        recentSessionCount: context.session.recentSessions.length,
        currentGame: context.game.currentGame,
        patchVersion: context.game.patchVersion,
      },
    };
  },
};