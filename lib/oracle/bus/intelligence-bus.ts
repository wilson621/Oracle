import type { OracleContext } from "@/lib/oracle/context";
import {
  createOracleEngineRuntime,
  getRegisteredOracleEngines,
} from "@/lib/oracle/engines";

import type {
  IntelligenceBusEngineDiagnostics,
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

function buildEngineDiagnostics(input: {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  dependencyResolutionDurationMs: number;
  declaredDependencies: string[];
  satisfiedDependencies: string[];
  missingDependencies: string[];
  signalsProduced?: number;
  decisionsProduced?: number;
  graphEntriesProduced?: number;
  explanationsProduced?: number;
  hasEngineDiagnostics?: boolean;
}): IntelligenceBusEngineDiagnostics {
  return {
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    durationMs: input.durationMs,
    dependencyResolutionDurationMs:
      input.dependencyResolutionDurationMs,
    declaredDependencies: input.declaredDependencies,
    satisfiedDependencies: input.satisfiedDependencies,
    missingDependencies: input.missingDependencies,
    signalsProduced: input.signalsProduced ?? 0,
    decisionsProduced: input.decisionsProduced ?? 0,
    graphEntriesProduced: input.graphEntriesProduced ?? 0,
    explanationsProduced: input.explanationsProduced ?? 0,
    hasEngineDiagnostics: input.hasEngineDiagnostics ?? false,
  };
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

  const runtime = createOracleEngineRuntime(context);
  const completedEngineIds = new Set<string>();

  const results: IntelligenceBusEngineResult[] = [];

  for (const engine of compatibleEngines) {
    const startedAtMs = Date.now();
    const startedAt = new Date(startedAtMs).toISOString();

    const dependencyResolutionStartedAtMs = Date.now();

    const declaredDependencies = [
      ...engine.metadata.dependencies,
    ];

    const satisfiedDependencies = declaredDependencies.filter(
      (dependency) => completedEngineIds.has(dependency)
    );

    const missingDependencies = declaredDependencies.filter(
      (dependency) => !completedEngineIds.has(dependency)
    );

    const dependencyResolutionDurationMs =
      Date.now() - dependencyResolutionStartedAtMs;

    if (missingDependencies.length > 0) {
      const completedAtMs = Date.now();
      const completedAt = new Date(completedAtMs).toISOString();
      const durationMs = completedAtMs - startedAtMs;

      results.push({
        engineId: engine.metadata.id,
        engineName: engine.metadata.name,
        engineVersion: engine.metadata.version,
        status: "failed",
        generatedAt: completedAt,
        durationMs,
        metadata: engine.metadata,
        diagnostics: buildEngineDiagnostics({
          startedAt,
          completedAt,
          durationMs,
          dependencyResolutionDurationMs,
          declaredDependencies,
          satisfiedDependencies,
          missingDependencies,
        }),
        error: `Missing engine dependencies: ${missingDependencies.join(", ")}`,
      });

      continue;
    }

    try {
      const result = await engine.execute(runtime);

      completedEngineIds.add(engine.metadata.id);
      runtime.completeEngineResult(result);

      const completedAtMs = Date.now();
      const completedAt = new Date(completedAtMs).toISOString();
      const durationMs = completedAtMs - startedAtMs;

      results.push({
        engineId: engine.metadata.id,
        engineName: engine.metadata.name,
        engineVersion: engine.metadata.version,
        status: "success",
        generatedAt: completedAt,
        durationMs,
        metadata: engine.metadata,
        diagnostics: buildEngineDiagnostics({
          startedAt,
          completedAt,
          durationMs,
          dependencyResolutionDurationMs,
          declaredDependencies,
          satisfiedDependencies,
          missingDependencies,
          signalsProduced: result.signals.length,
          decisionsProduced: result.decisions.length,
          graphEntriesProduced: result.graph.length,
          explanationsProduced: result.explanations.length,
          hasEngineDiagnostics:
            Object.keys(result.diagnostics).length > 0,
        }),
        result,
      });
    } catch (error) {
      const completedAtMs = Date.now();
      const completedAt = new Date(completedAtMs).toISOString();
      const durationMs = completedAtMs - startedAtMs;

      results.push({
        engineId: engine.metadata.id,
        engineName: engine.metadata.name,
        engineVersion: engine.metadata.version,
        status: "failed",
        generatedAt: completedAt,
        durationMs,
        metadata: engine.metadata,
        diagnostics: buildEngineDiagnostics({
          startedAt,
          completedAt,
          durationMs,
          dependencyResolutionDurationMs,
          declaredDependencies,
          satisfiedDependencies,
          missingDependencies,
        }),
        error:
          error instanceof Error
            ? error.message
            : "Unknown engine error",
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    engineCount: compatibleEngines.length,
    successfulEngines: results.filter(
      (result) => result.status === "success"
    ).length,
    failedEngines: results.filter(
      (result) => result.status === "failed"
    ).length,
    signals: runtime.signals,
    decisions: runtime.decisions,
    graph: runtime.graph,
    results,
  };
}