import type { OracleContext } from "@/lib/oracle/context";
import { getRegisteredOracleEngines } from "@/lib/oracle/engines";
import type {
  IntelligenceBusEngineResult,
  IntelligenceBusResult,
} from "./intelligence-bus-types";

function engineSupportsCurrentGame(
  supportedGames: string[],
  currentGame: string | null
): boolean {
  if (supportedGames.includes("*")) {
    return true;
  }

  if (!currentGame) {
    return true;
  }

  return supportedGames.includes(currentGame);
}

export async function runIntelligenceBus(
  context: OracleContext
): Promise<IntelligenceBusResult> {
  const engines = getRegisteredOracleEngines();

  const compatibleEngines = engines.filter((engine) =>
    engineSupportsCurrentGame(
      engine.metadata.supportedGames,
      context.game.currentGame
    )
  );

  const completedEngineIds = new Set<string>();

  const results: IntelligenceBusEngineResult[] = [];
  const signals = [...context.intelligence.signals];
  const decisions = [...context.intelligence.decisions];

  for (const engine of compatibleEngines) {
    const startedAt = Date.now();

    const missingDependencies = engine.metadata.dependencies.filter(
      (dependency) => !completedEngineIds.has(dependency)
    );

    if (missingDependencies.length > 0) {
      results.push({
        engineId: engine.metadata.id,
        engineName: engine.metadata.name,
        engineVersion: engine.metadata.version,
        status: "failed",
        generatedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        metadata: engine.metadata,
        error: `Missing engine dependencies: ${missingDependencies.join(", ")}`,
      });

      continue;
    }

    try {
      const result = await engine.execute(context);

      completedEngineIds.add(engine.metadata.id);

      signals.push(...result.signals);
      decisions.push(...result.decisions);

      results.push({
        engineId: engine.metadata.id,
        engineName: engine.metadata.name,
        engineVersion: engine.metadata.version,
        status: "success",
        generatedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        metadata: engine.metadata,
        result,
      });
    } catch (error) {
      results.push({
        engineId: engine.metadata.id,
        engineName: engine.metadata.name,
        engineVersion: engine.metadata.version,
        status: "failed",
        generatedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        metadata: engine.metadata,
        error: error instanceof Error ? error.message : "Unknown engine error",
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    engineCount: compatibleEngines.length,
    successfulEngines: results.filter((result) => result.status === "success")
      .length,
    failedEngines: results.filter((result) => result.status === "failed")
      .length,
    signals,
    decisions,
    results,
  };
}