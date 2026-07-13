import type {
  CompanionConnectorDetection,
  CompanionConnectorObservation,
  CompanionGameConnector,
} from "./game-connector-types";
import type { CompanionContext, CompanionGame } from "../companion-types";
import type { CompanionGameConnectorManifest } from "./game-connector-manifest";

type CompanionGameConnectorImplementation = {
  manifest: CompanionGameConnectorManifest;

  detect(): Promise<CompanionConnectorDetection>;

  observe(
    context: CompanionContext
  ): Promise<CompanionConnectorObservation>;

  supportsGame?(game: CompanionGame): boolean;
};

const SEMANTIC_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export function createCompanionGameConnector(
  implementation: CompanionGameConnectorImplementation
): CompanionGameConnector {
  validateManifest(implementation.manifest);

  const { manifest } = implementation;

  return {
    manifest,

    id: manifest.id,
    gameId: manifest.gameId,
    name: manifest.name,
    version: manifest.version,

    compatibility: {
      status: manifest.compatibility.status,
      supportedDisplayModes:
        manifest.compatibility.supportedDisplayModes,
      supportsScreenObservation:
        manifest.permissions.includes("screen_observation"),
      supportsOverlay:
        manifest.permissions.includes("overlay"),
      restrictions: [...manifest.compatibility.restrictions],
      reviewedAt: manifest.compatibility.reviewedAt,
    },

    detect: implementation.detect,

    observe: implementation.observe,

    supportsGame:
      implementation.supportsGame ??
      ((game: CompanionGame) => game.id === manifest.gameId),
  };
}

function validateManifest(
  manifest: CompanionGameConnectorManifest
): void {
  if (manifest.schemaVersion !== "1.0") {
    throw new Error(
      `Unsupported connector manifest schema '${manifest.schemaVersion}'.`
    );
  }

  if (!manifest.id.trim()) {
    throw new Error("Connector manifest id is required.");
  }

  if (!manifest.gameId.trim()) {
    throw new Error("Connector manifest gameId is required.");
  }

  if (!manifest.name.trim()) {
    throw new Error("Connector manifest name is required.");
  }

  if (!manifest.description.trim()) {
    throw new Error(
      "Connector manifest description is required."
    );
  }

  if (!SEMANTIC_VERSION_PATTERN.test(manifest.version)) {
    throw new Error(
      `Connector version '${manifest.version}' must use semantic versioning.`
    );
  }

  if (
    !SEMANTIC_VERSION_PATTERN.test(
      manifest.compatibility.minimumCompanionVersion
    )
  ) {
    throw new Error(
      `Minimum Companion version '${manifest.compatibility.minimumCompanionVersion}' must use semantic versioning.`
    );
  }

  if (!manifest.author.name.trim()) {
    throw new Error("Connector author name is required.");
  }

  if (manifest.permissions.length === 0) {
    throw new Error(
      "Connector manifest must declare at least one permission."
    );
  }

  const duplicatePermissions = manifest.permissions.filter(
    (permission, index, permissions) =>
      permissions.indexOf(permission) !== index
  );

  if (duplicatePermissions.length > 0) {
    throw new Error(
      `Connector manifest contains duplicate permissions: ${[
        ...new Set(duplicatePermissions),
      ].join(", ")}.`
    );
  }

  if (
    manifest.compatibility.supportedDisplayModes.length === 0
  ) {
    throw new Error(
      "Connector manifest must declare at least one supported display mode."
    );
  }

  if (!isValidDate(manifest.createdAt)) {
    throw new Error(
      `Connector createdAt '${manifest.createdAt}' is invalid.`
    );
  }

  if (!isValidDate(manifest.updatedAt)) {
    throw new Error(
      `Connector updatedAt '${manifest.updatedAt}' is invalid.`
    );
  }

  if (
    manifest.compatibility.reviewedAt !== null &&
    !isValidDate(manifest.compatibility.reviewedAt)
  ) {
    throw new Error(
      `Connector reviewedAt '${manifest.compatibility.reviewedAt}' is invalid.`
    );
  }
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}