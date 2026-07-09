import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleBrainGraphReport } from "@/lib/oracle/brain";
import type { OracleTimeline } from "@/lib/oracle/timeline";
import type { OracleIntelligenceGraph } from "@/lib/oracle/graph";

export type PlannerPriority =
  | "positioning"
  | "aim"
  | "movement"
  | "decision"
  | "gamesense";

export type PlannerConfidence = "low" | "medium" | "high";

export type PlannerSource =
  | "scores"
  | "brain"
  | "timeline"
  | "graph"
  | "signals"
  | "evidence";

export type PlannerEvidence = {
  source: PlannerSource;
  priority: PlannerPriority;
  weight: number;
  reason: string;
};

export type PlannerRecommendation = {
  priority: PlannerPriority;
  confidence: PlannerConfidence;
  reason: string;
  source: PlannerSource;
  evidence: PlannerEvidence[];
};

export type PlannerProfile = {
  operatorId?: string;
  generatedAt: string;
  recommendation: PlannerRecommendation;
};

export type PlannerResult = {
  profile: PlannerProfile;
  signals: OracleSignal[];
};

export type PlannerIntelligenceInput = {
  brain: OracleBrainGraphReport;
  timeline: OracleTimeline;
  graph: OracleIntelligenceGraph;
  signals: OracleSignal[];
};