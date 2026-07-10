import { registerOracleEngine } from "@/lib/oracle/engines";

import { behaviourEngine } from "@/lib/oracle/behaviour/behaviour-engine";
import { contextSummaryEngine } from "@/lib/oracle/engines/context-summary-engine";
import { memoryEngine } from "@/lib/oracle/memory";
import { behaviourEvolutionEngine } from "@/lib/oracle/evolution";
import { adaptiveCoachingEngine } from "@/lib/oracle/coaching";
import { plannerEngine } from "@/lib/oracle/planner";
import { operatorProfileEngine } from "@/lib/oracle/operator-profile";
import { contextualIntelligenceEngine } from "@/lib/oracle/contextual/contextual-intelligence-engine";

export function registerCoreOracleEngines(): void {
  registerOracleEngine(contextSummaryEngine);
  registerOracleEngine(contextualIntelligenceEngine);
  registerOracleEngine(behaviourEngine);

  registerOracleEngine(memoryEngine);
  registerOracleEngine(behaviourEvolutionEngine);
  registerOracleEngine(adaptiveCoachingEngine);
  registerOracleEngine(plannerEngine);
  registerOracleEngine(operatorProfileEngine);
}