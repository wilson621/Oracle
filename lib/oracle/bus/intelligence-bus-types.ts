import type {
  OracleEngineMetadata,
  OracleEngineResult,
} from "@/lib/oracle/engines";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";
import type { OracleIntelligenceGraph } from "@/lib/oracle/graph";

export type IntelligenceBusStatus = "success" | "failed";

export type IntelligenceBusEngineDiagnostics = {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  dependencyResolutionDurationMs: number;
  declaredDependencies: string[];
  satisfiedDependencies: string[];
  missingDependencies: string[];
  signalsProduced: number;
  decisionsProduced: number;
  graphEntriesProduced: number;
  explanationsProduced: number;
  hasEngineDiagnostics: boolean;
};

export type IntelligenceBusEngineResult = {
  engineId: string;
  engineName: string;
  engineVersion: string;
  status: IntelligenceBusStatus;
  generatedAt: string;
  durationMs: number;
  metadata: OracleEngineMetadata;
  diagnostics: IntelligenceBusEngineDiagnostics;
  result?: OracleEngineResult<unknown>;
  error?: string;
};

export type IntelligenceBusResult = {
  generatedAt: string;
  engineCount: number;
  successfulEngines: number;
  failedEngines: number;
  signals: OracleSignal[];
  decisions: OracleDecision[];
  graph: OracleIntelligenceGraph;
  results: IntelligenceBusEngineResult[];
};