import type { OracleContext } from "@/lib/oracle/context";
import type { IntelligenceBusResult } from "@/lib/oracle/bus";
import type { OracleBrainGraphReport } from "@/lib/oracle/brain";
import type { OracleTimeline } from "@/lib/oracle/timeline";
import type { PlannerResult } from "@/lib/oracle/planner";
import type { OracleExplanation } from "@/lib/oracle/explainability";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";
import type { OracleDecisionProfile } from "@/lib/oracle/intelligence/decision-profile";
import type { OracleLifecycle } from "@/lib/oracle/lifecycle";

export type OracleIntelligenceStateMetadata = {
  generatedAt: string;
  operatorId: string;
  callsign: string;
  version: string;
};

export type OracleIntelligenceState = {
  metadata: OracleIntelligenceStateMetadata;

  lifecycle: OracleLifecycle;

  context: OracleContext;

  bus: IntelligenceBusResult;

  brain: OracleBrainGraphReport;

  timeline: OracleTimeline;

  planner: PlannerResult;

  explanations: OracleExplanation[];

  signals: OracleSignal[];

  decisions: OracleDecision[];

  decisionProfile: OracleDecisionProfile;
};