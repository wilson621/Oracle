import {
  getLatestOperatorSession,
  getRecentOperatorSessions,
} from "@/lib/oracle/repositories/session-repository";

import type { OracleContext } from "./oracle-context";

export type BuildOracleContextInput = {
  operatorId: string;
  callsign: string;
  sessionsAnalysed?: number;
  currentGame?: string | null;
  patchVersion?: string | null;
};

export async function buildOracleContext({
  operatorId,
  callsign,
  sessionsAnalysed = 0,
  currentGame = null,
  patchVersion = null,
}: BuildOracleContextInput): Promise<OracleContext> {
  const [latestSession, recentSessions] = await Promise.all([
    getLatestOperatorSession(operatorId),
    getRecentOperatorSessions(operatorId, 10),
  ]);

  return {
    operator: {
      operatorId,
      callsign,
    },
    profile: {
      sessionsAnalysed,
    },
    session: {
      latestSession,
      recentSessions,
    },
    intelligence: {
      signals: [],
      decisions: [],
    },
    game: {
      currentGame,
      patchVersion,
    },
    contextual: {
      intent: "unknown",
      priorities: [],
      opportunities: [],
    },
    generatedAt: new Date().toISOString(),
  };
}