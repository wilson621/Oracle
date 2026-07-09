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

/**
 * Represents what the Operator is currently trying to accomplish.
 * This should remain game-agnostic so it can be reused across
 * all Oracle intelligence domains.
 */
export type OracleContextIntent =
  | "unknown"
  | "exploration"
  | "mission"
  | "combat"
  | "collection"
  | "progression"
  | "resource"
  | "custom";

export type OracleContextOpportunity = {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: number;
};

export type OracleContextualState = {
  intent: OracleContextIntent;
  priorities: string[];
  opportunities: OracleContextOpportunity[];
};

export type OracleContext = {
  operator: OracleContextOperator;
  profile: OracleContextProfile;
  session: OracleContextSession;
  intelligence: OracleContextIntelligence;
  game: OracleContextGame;

  /**
   * Sprint 5
   * Contextual Intelligence
   */
  contextual: OracleContextualState;

  generatedAt: string;
};