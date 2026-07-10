import type {
  EngineHealth,
  EngineHealthReason,
} from "./health-types";

type HealthInput = {
  executed: boolean;
  executionSucceeded: boolean;
  validationPassed: boolean;
  durationMs: number;
  hasDiagnostics: boolean;
};

export function evaluateEngineHealth(
  input: HealthInput
): EngineHealth {
  const reasons: EngineHealthReason[] = [];

  if (!input.validationPassed) {
    reasons.push({
      code: "VALIDATION_FAILED",
      message: "Runtime validation failed.",
    });

    return {
      status: "failed",
      score: 0,
      reasons,
    };
  }

  if (!input.executed) {
    reasons.push({
      code: "NOT_EXECUTED",
      message: "Engine did not execute.",
    });

    return {
      status: "failed",
      score: 0,
      reasons,
    };
  }

  if (!input.executionSucceeded) {
    reasons.push({
      code: "EXECUTION_FAILED",
      message: "Engine execution failed.",
    });

    return {
      status: "failed",
      score: 0,
      reasons,
    };
  }

  let score = 100;

  if (!input.hasDiagnostics) {
    score -= 10;

    reasons.push({
      code: "NO_ENGINE_DIAGNOSTICS",
      message:
        "Engine did not provide additional diagnostics.",
    });
  }

  if (input.durationMs > 100) {
    score -= 5;

    reasons.push({
      code: "SLOW_EXECUTION",
      message: "Execution exceeded 100ms.",
    });
  }

  if (score >= 90) {
    return {
      status: "healthy",
      score,
      reasons,
    };
  }

  if (score >= 70) {
    return {
      status: "warning",
      score,
      reasons,
    };
  }

  return {
    status: "degraded",
    score,
    reasons,
  };
}