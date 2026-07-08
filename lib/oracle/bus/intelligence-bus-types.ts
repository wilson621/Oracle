import type {
  OracleEngineMetadata,
  OracleEngineResult,
} from "@/lib/oracle/engines";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";
import type { OracleIntelligenceGraph } from "@/lib/oracle/graph";

export type IntelligenceBusStatus = "success" | "failed";

export type IntelligenceBusEngineResult = {
  engineId: string;
  engineName: string;
  engineVersion: string;
  status: IntelligenceBusStatus;
  generatedAt: string;
  durationMs: number;
  metadata: OracleEngineMetadata;
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