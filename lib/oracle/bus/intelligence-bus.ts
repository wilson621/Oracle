import type { OracleContext } from "@/lib/oracle/context";
import { getRegisteredOracleEngines } from "@/lib/oracle/engines";
import type {
  IntelligenceBusEngineResult,
  IntelligenceBusResult,
} from "./intelligence-bus-types";

export async function runIntelligenceBus(
  context: OracleContext
): Promise<IntelligenceBusResult> {
  const engines = getRegisteredOracleEngines();

  const results: IntelligenceBusEngineResult[] = await Promise.all(
    engines.map(async (engine) => {
      const startedAt = Date.now();

      try {
        const result = await engine.execute(context);

        return {
          engineId: engine.id,
          status: "success",
          generatedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt,
          result,
        };
      } catch (error) {
        return {
          engineId: engine.id,
          status: "failed",
          generatedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : "Unknown engine error",
        };
      }
    })
  );

  return {
    generatedAt: new Date().toISOString(),
    engineCount: engines.length,
    successfulEngines: results.filter((result) => result.status === "success")
      .length,
    failedEngines: results.filter((result) => result.status === "failed")
      .length,
    results,
  };
}