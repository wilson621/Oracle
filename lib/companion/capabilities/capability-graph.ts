import type { OracleExtensionManifest } from "../extensions";
import type {
  OracleCapabilityGraph,
  OracleCapabilityGraphNode,
  OracleCapabilityProvider,
  OracleCapabilityResolution,
  OracleCapabilityId,
} from "./capability-types";

export function buildOracleCapabilityGraph(
  manifests: OracleExtensionManifest[]
): OracleCapabilityGraph {
  const nodes = manifests.map(createNode);

  const providerLookup = buildProviderLookup(nodes);

  const resolutions = buildResolutions(nodes, providerLookup);

  const errors = buildErrors(resolutions);

  const warnings = buildWarnings(providerLookup);

  return {
    nodes,
    resolutions,
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function createNode(
  manifest: OracleExtensionManifest
): OracleCapabilityGraphNode {
  return {
    extensionId: manifest.id,
    provides: [...new Set<OracleCapabilityId>(manifest.provides)],
    requires: [...manifest.requires],
    conflictsWith: [
  ...new Set<OracleCapabilityId>(manifest.conflictsWith),
],
  };
}

function buildProviderLookup(
  nodes: OracleCapabilityGraphNode[]
): Map<string, OracleCapabilityProvider[]> {
  const lookup = new Map<string, OracleCapabilityProvider[]>();

  for (const node of nodes) {
    for (const capability of node.provides) {
      const providers = lookup.get(capability) ?? [];

      providers.push({
        capabilityId: capability,
        extensionId: node.extensionId,
      });

      lookup.set(capability, providers);
    }
  }

  return lookup;
}

function buildResolutions(
  nodes: OracleCapabilityGraphNode[],
  providerLookup: Map<string, OracleCapabilityProvider[]>
): OracleCapabilityResolution[] {
  const capabilityIds = new Set<string>();

  for (const node of nodes) {
    node.provides.forEach((capability) =>
      capabilityIds.add(capability)
    );

    node.requires.forEach((requirement) =>
      capabilityIds.add(requirement.capabilityId)
    );
  }

  return [...capabilityIds].map((capabilityId) => {
    const providers =
      providerLookup.get(capabilityId) ?? [];

    const requiredBy = nodes
      .filter((node) =>
        node.requires.some(
          (requirement) =>
            requirement.capabilityId === capabilityId
        )
      )
      .map((node) => node.extensionId);

    return {
      capabilityId,
      status:
        providers.length > 0 ? "resolved" : "missing",
      providers,
      requiredBy,
      conflicts: [],
    };
  });
}

function buildErrors(
  resolutions: OracleCapabilityResolution[]
): string[] {
  const errors: string[] = [];

  for (const resolution of resolutions) {
    if (
      resolution.status === "missing" &&
      resolution.requiredBy.length > 0
    ) {
      errors.push(
        `Capability '${resolution.capabilityId}' is required by ${resolution.requiredBy.join(
          ", "
        )} but has no provider.`
      );
    }
  }

  return errors;
}

function buildWarnings(
  providerLookup: Map<string, OracleCapabilityProvider[]>
): string[] {
  const warnings: string[] = [];

  for (const [
    capabilityId,
    providers,
  ] of providerLookup.entries()) {
    if (providers.length <= 1) {
      continue;
    }

    warnings.push(
      `Capability '${capabilityId}' has multiple providers: ${providers
        .map((provider) => provider.extensionId)
        .join(", ")}`
    );
  }

  return warnings;
}