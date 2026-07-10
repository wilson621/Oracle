import type { RegisteredOracleEngine } from "../registry/engine-registry";

export type EngineValidationSeverity = "error" | "warning";

export type EngineValidationIssue = {
  severity: EngineValidationSeverity;
  engineId: string;
  message: string;
};

export type EngineValidationResult = {
  valid: boolean;
  issues: EngineValidationIssue[];
};

const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

export function validateOracleEngineRuntime(
  engines: RegisteredOracleEngine[]
): EngineValidationResult {
  const issues: EngineValidationIssue[] = [];

  const ids = new Set<string>();
  const priorities = new Map<number, string>();

  for (const engine of engines) {
    const { metadata } = engine;

    if (!metadata.id.trim()) {
      issues.push({
        severity: "error",
        engineId: metadata.id,
        message: "Engine id is empty.",
      });
    }

    if (!metadata.name.trim()) {
      issues.push({
        severity: "error",
        engineId: metadata.id,
        message: "Engine name is empty.",
      });
    }

    if (!SEMVER_REGEX.test(metadata.version)) {
      issues.push({
        severity: "error",
        engineId: metadata.id,
        message: `Invalid version '${metadata.version}'.`,
      });
    }

    if (ids.has(metadata.id)) {
      issues.push({
        severity: "error",
        engineId: metadata.id,
        message: "Duplicate engine id.",
      });
    }

    ids.add(metadata.id);

    const existingPriority = priorities.get(metadata.priority);

    if (existingPriority) {
      issues.push({
        severity: "warning",
        engineId: metadata.id,
        message: `Priority ${metadata.priority} already used by '${existingPriority}'.`,
      });
    } else {
      priorities.set(metadata.priority, metadata.id);
    }

    if (metadata.dependencies.includes(metadata.id)) {
      issues.push({
        severity: "error",
        engineId: metadata.id,
        message: "Engine cannot depend on itself.",
      });
    }

    const duplicateCapabilities = metadata.capabilities.filter(
      (capability, index, array) =>
        array.indexOf(capability) !== index
    );

    if (duplicateCapabilities.length > 0) {
      issues.push({
        severity: "warning",
        engineId: metadata.id,
        message: `Duplicate capabilities: ${duplicateCapabilities.join(", ")}`,
      });
    }
  }

  for (const engine of engines) {
    for (const dependency of engine.metadata.dependencies) {
      if (!ids.has(dependency)) {
        issues.push({
          severity: "error",
          engineId: engine.metadata.id,
          message: `Unknown dependency '${dependency}'.`,
        });
      }
    }
  }

  detectCircularDependencies(engines, issues);

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
}

function detectCircularDependencies(
  engines: RegisteredOracleEngine[],
  issues: EngineValidationIssue[]
): void {
  const lookup = new Map(
    engines.map((engine) => [engine.metadata.id, engine])
  );

  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(engineId: string): void {
    if (visiting.has(engineId)) {
      issues.push({
        severity: "error",
        engineId,
        message: "Circular dependency detected.",
      });

      return;
    }

    if (visited.has(engineId)) {
      return;
    }

    visiting.add(engineId);

    const engine = lookup.get(engineId);

    if (engine) {
      for (const dependency of engine.metadata.dependencies) {
        visit(dependency);
      }
    }

    visiting.delete(engineId);
    visited.add(engineId);
  }

  for (const engine of engines) {
    visit(engine.metadata.id);
  }
}