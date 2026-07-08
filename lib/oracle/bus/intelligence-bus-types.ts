import type { OracleEngineResult } from "@/lib/oracle/engines";

export type IntelligenceBusStatus = "success" | "failed";

export type IntelligenceBusEngineResult = {
  engineId: string;
  status: IntelligenceBusStatus;
  generatedAt: string;
  durationMs: number;
  result?: OracleEngineResult<unknown>;
  error?: string;
};

export type IntelligenceBusResult = {
  generatedAt: string;
  engineCount: number;
  successfulEngines: number;
  failedEngines: number;
  results: IntelligenceBusEngineResult[];
};