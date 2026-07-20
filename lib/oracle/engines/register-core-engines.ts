import { registerOracleEngine } from "./registry/engine-registry";

import { behaviourEngine } from "@/lib/oracle/behaviour/behaviour-engine";
import { contextSummaryEngine } from "@/lib/oracle/engines/context-summary-engine";
import { memoryEngine } from "@/lib/oracle/memory/memory-engine";
import { behaviourEvolutionEngine } from "@/lib/oracle/evolution/evolution-engine";
import { adaptiveCoachingEngine } from "@/lib/oracle/coaching/adaptive-coaching-engine";
import { missionEngine } from "@/lib/oracle/missions/mission-engine";
import { plannerEngine } from "@/lib/oracle/planner/planner-engine";
import { operatorProfileEngine } from "@/lib/oracle/operator-profile/operator-profile-engine";
import { contextualIntelligenceEngine } from "@/lib/oracle/contextual/contextual-intelligence-engine";
import { predictionEngine } from "@/lib/oracle/prediction/prediction-engine";
import { trendEngine } from "@/lib/oracle/trend/trend-engine";

export function registerCoreOracleEngines(): void {
  registerOracleEngine(contextSummaryEngine);
  registerOracleEngine(contextualIntelligenceEngine);

  registerOracleEngine(behaviourEngine);
  registerOracleEngine(trendEngine);
  registerOracleEngine(predictionEngine);
  registerOracleEngine(missionEngine);

  registerOracleEngine(memoryEngine);
  registerOracleEngine(behaviourEvolutionEngine);
  registerOracleEngine(adaptiveCoachingEngine);
  registerOracleEngine(plannerEngine);
  registerOracleEngine(operatorProfileEngine);
}
