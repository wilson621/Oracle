import type { OracleExtensionManifest } from "./extension-types";
import type {
  OracleExtensionResolverResult,
  OracleResolvedExtension,
} from "./extension-resolver-types";

import { buildOracleCapabilityGraph } from "../capabilities/capability-graph";

export function resolveOracleExtensions(
  manifests: OracleExtensionManifest[]
): OracleExtensionResolverResult {
  const graph = buildOracleCapabilityGraph(manifests);

  const enabled: OracleResolvedExtension[] = [];
  const disabled: OracleResolvedExtension[] = [];

  for (const manifest of manifests) {
    const missingRequirements = manifest.requires.filter(
      (requirement) =>
        !graph.resolutions.some(
          (resolution) =>
            resolution.capabilityId === requirement.capabilityId &&
            resolution.status === "resolved"
        )
    );

    if (missingRequirements.length > 0) {
      disabled.push({
        extensionId: manifest.id,
        status: "missing_dependencies",
        reason:
          "Missing: " +
          missingRequirements
            .map((requirement) => requirement.capabilityId)
            .join(", "),
      });

      continue;
    }

    const hasConflict = graph.errors.some((error) =>
      error.includes(manifest.id)
    );

    if (hasConflict) {
      disabled.push({
        extensionId: manifest.id,
        status: "conflict",
        reason: "Capability conflict detected.",
      });

      continue;
    }

    enabled.push({
      extensionId: manifest.id,
      status: "enabled",
      reason: null,
    });
  }

  return {
    valid: graph.valid,

    enabled,

    disabled,

    errors: [...graph.errors],

    warnings: [...graph.warnings],
  };
}