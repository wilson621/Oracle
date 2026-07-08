import { registerOracleEngine } from "@/lib/oracle/engines";

import { contextSummaryEngine } from "@/lib/oracle/engines/context-summary-engine";
import { memoryEngine } from "@/lib/oracle/memory";
import { behaviourEvolutionEngine } from "@/lib/oracle/evolution";
import { adaptiveCoachingEngine } from "@/lib/oracle/coaching";
import { plannerEngine } from "@/lib/oracle/planner";

export function registerCoreOracleEngines(): void {
  registerOracleEngine(contextSummaryEngine);
  registerOracleEngine(memoryEngine);
  registerOracleEngine(behaviourEvolutionEngine);
  registerOracleEngine(adaptiveCoachingEngine);
  registerOracleEngine(plannerEngine);
}