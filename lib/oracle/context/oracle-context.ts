import type { OracleSessionRow } from "@/lib/oracle/repositories/session-repository";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";

export type OracleContextOperator = {
  operatorId: string;
  callsign: string;
};

export type OracleContextProfile = {
  sessionsAnalysed: number;
};

export type OracleContextSession = {
  latestSession: OracleSessionRow | null;
  recentSessions: OracleSessionRow[];
};

export type OracleContextIntelligence = {
  signals: OracleSignal[];
  decisions: OracleDecision[];
};

export type OracleContextGame = {
  currentGame: string | null;
  patchVersion: string | null;
};

export type OracleContext = {
  operator: OracleContextOperator;
  profile: OracleContextProfile;
  session: OracleContextSession;
  intelligence: OracleContextIntelligence;
  game: OracleContextGame;
  generatedAt: string;
};