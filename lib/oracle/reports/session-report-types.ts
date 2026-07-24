import type { OracleSession } from "../sessions";
import type { OperatorUnderstandingSnapshot } from "../understanding";

export const ORACLE_SESSION_REPORT_CONTRACT =
  "oracle.session-intelligence-report" as const;
export const ORACLE_SESSION_REPORT_CONTRACT_VERSION = 1 as const;

export type OracleSessionIntelligenceMetric =
  | "positioning"
  | "aim"
  | "movement"
  | "decision-making"
  | "game-sense";

export type OracleSessionIntelligenceObservation = Readonly<{
  id: string;
  sessionId: string;
  evidenceReferenceId: string;
  metric: OracleSessionIntelligenceMetric;
  value: number;
  scale: Readonly<{ minimum: number; maximum: number }>;
  observedAt: string;
  semantics: Readonly<{
    integrationId: string;
    integrationVersion: string;
    providerId: string;
    providerVersion: string;
  }>;
}>;

export type OracleSessionIntelligenceContext = Readonly<{
  session: OracleSession;
  history: readonly OracleSession[];
  understanding: OperatorUnderstandingSnapshot;
  observations: readonly OracleSessionIntelligenceObservation[];
  assembledAt: string;
}>;

export type OracleSessionReportEngineId =
  | "behaviour"
  | "trend"
  | "prediction"
  | "memory"
  | "contextual";

export type OracleSessionReportEngineOutput = Readonly<{
  engineId: OracleSessionReportEngineId;
  engineVersion: string;
  status: "established" | "suspected" | "unknown" | "failed";
  summary: string;
  confidence: number;
  evidenceReferenceIds: readonly string[];
  recommendation: string | null;
  reassessmentTrigger: string;
}>;

export type OracleSessionReportDisagreement = Readonly<{
  id: string;
  engineIds: readonly OracleSessionReportEngineId[];
  summary: string;
  resolution: "lower-confidence" | "omit-conclusion";
}>;

export type OracleSessionReportModelState = Readonly<{
  status: "not-requested" | "enriched" | "unavailable" | "invalid";
  providerId: string | null;
  modelId: string | null;
  narrative: string | null;
  caveat: string | null;
}>;

export type OracleSessionReport = Readonly<{
  contract: typeof ORACLE_SESSION_REPORT_CONTRACT;
  contractVersion: typeof ORACLE_SESSION_REPORT_CONTRACT_VERSION;
  id: string;
  operatorId: string;
  sessionId: string;
  revision: number;
  status: "complete" | "degraded";
  generatedAt: string;
  inputFingerprint: string;
  assessment: Readonly<{
    epistemic: "inferred" | "suspected" | "unknown";
    summary: string;
    confidence: number;
  }>;
  recommendation: Readonly<{
    summary: string;
    confidence: number;
    evidenceReferenceIds: readonly string[];
    reassessmentTrigger: string;
  }>;
  engines: readonly OracleSessionReportEngineOutput[];
  disagreements: readonly OracleSessionReportDisagreement[];
  evidenceReferenceIds: readonly string[];
  understandingClaimIds: readonly string[];
  model: OracleSessionReportModelState;
}>;

export type OracleSessionReportComparison = Readonly<{
  contract: "oracle.session-intelligence-report-comparison";
  contractVersion: 1;
  operatorId: string;
  earlierReportId: string;
  laterReportId: string;
  confidenceChange: number;
  assessmentChanged: boolean;
  recommendationChanged: boolean;
  generatedAt: string;
}>;

export type OracleSessionIntelligenceProvider = Readonly<{
  id: string;
  version: string;
  integrationId: string;
  resolve(
    sessions: readonly OracleSession[]
  ): Promise<readonly OracleSessionIntelligenceObservation[]>;
}>;

export type OracleSessionReportModelProvider = Readonly<{
  id: string;
  modelId: string;
  enrich(input: Readonly<{
    assessment: string;
    recommendation: string;
    evidenceReferenceIds: readonly string[];
  }>): Promise<unknown>;
}>;
