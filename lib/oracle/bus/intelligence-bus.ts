import type { OracleContext } from "@/lib/oracle/context";
import {
  createOracleEngineRuntime,
  evaluateEngineHealth,
  getRegisteredOracleEngines,
  validateOracleEngineRuntime,
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

function buildValidationErrorMessage(
  errors: {
    engineId: string;
    message: string;
  }[]
): string {
  const details = errors
    .map((issue) => {
      const owner = issue.engineId || "unknown-engine";

      return `${owner}: ${issue.message}`;
    })
    .join("; ");

  return `Oracle Engine Runtime validation failed: ${details}`;
}

export async function runIntelligenceBus(
  context: OracleContext
): Promise<IntelligenceBusResult> {
  const registeredEngines = getRegisteredOracleEngines();

  const validation =
    validateOracleEngineRuntime(registeredEngines);

  if (!validation.valid) {
    const errors = validation.issues.filter(
      (issue) => issue.severity === "error"
    );

    throw new Error(buildValidationErrorMessage(errors));
  }

  const compatibleEngines = registeredEngines.filter((engine) =>
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

      const diagnostics = buildEngineDiagnostics({
        startedAt,
        completedAt,
        durationMs,
        dependencyResolutionDurationMs,
        declaredDependencies,
        satisfiedDependencies,
        missingDependencies,
      });

      results.push({
        engineId: engine.metadata.id,
        engineName: engine.metadata.name,
        engineVersion: engine.metadata.version,
        status: "failed",
        generatedAt: completedAt,
        durationMs,
        metadata: engine.metadata,
        diagnostics,
        health: evaluateEngineHealth({
          executed: false,
          executionSucceeded: false,
          validationPassed: validation.valid,
          durationMs,
          hasDiagnostics: false,
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

      const hasEngineDiagnostics =
        Object.keys(result.diagnostics).length > 0;

      const diagnostics = buildEngineDiagnostics({
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
        hasEngineDiagnostics,
      });

      results.push({
        engineId: engine.metadata.id,
        engineName: engine.metadata.name,
        engineVersion: engine.metadata.version,
        status: "success",
        generatedAt: completedAt,
        durationMs,
        metadata: engine.metadata,
        diagnostics,
        health: evaluateEngineHealth({
          executed: true,
          executionSucceeded: true,
          validationPassed: validation.valid,
          durationMs,
          hasDiagnostics: hasEngineDiagnostics,
        }),
        result,
      });
    } catch (error) {
      const completedAtMs = Date.now();
      const completedAt = new Date(completedAtMs).toISOString();
      const durationMs = completedAtMs - startedAtMs;

      const diagnostics = buildEngineDiagnostics({
        startedAt,
        completedAt,
        durationMs,
        dependencyResolutionDurationMs,
        declaredDependencies,
        satisfiedDependencies,
        missingDependencies,
      });

      results.push({
        engineId: engine.metadata.id,
        engineName: engine.metadata.name,
        engineVersion: engine.metadata.version,
        status: "failed",
        generatedAt: completedAt,
        durationMs,
        metadata: engine.metadata,
        diagnostics,
        health: evaluateEngineHealth({
          executed: true,
          executionSucceeded: false,
          validationPassed: validation.valid,
          durationMs,
          hasDiagnostics: false,
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
    validation,
    signals: runtime.signals,
    decisions: runtime.decisions,
    graph: runtime.graph,
    results,
  };
}