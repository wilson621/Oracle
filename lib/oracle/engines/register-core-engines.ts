import { registerOracleEngine } from "@/lib/oracle/engines";
import { contextSummaryEngine } from "@/lib/oracle/engines/context-summary-engine";

export function registerCoreOracleEngines(): void {
  registerOracleEngine(contextSummaryEngine);
}