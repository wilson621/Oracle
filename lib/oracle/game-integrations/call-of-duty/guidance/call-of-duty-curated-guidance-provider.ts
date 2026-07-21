import {
  createOracleCompanionGuidancePackageManifest,
  type OracleCompanionGuidanceProvider,
  type OracleCompanionGuidanceRequest,
  type OracleCompanionSerializableValue,
} from "../../../../companion/guidance";
import {
  CALL_OF_DUTY_CURATED_GUIDANCE_CATALOGUE,
  type CallOfDutyCuratedGuidanceCatalogueEntry,
} from "./call-of-duty-curated-guidance-catalogue";

export const CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_ID =
  "game-integrations.call-of-duty.curated-guidance";

export const CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_VERSION =
  "1.0.0";

export const CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_MANIFEST =
  createOracleCompanionGuidancePackageManifest({
    id: CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_ID,
    version:
      CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_VERSION,
    integrationId: "call-of-duty",
    categories: [
      "preparation",
      "operator-development",
      "performance",
    ],
    types: [
      "control-settings-review",
      "loadout-familiarity",
      "fundamentals-practice",
      "shader-preload-readiness",
    ],
  });

export type CallOfDutyCuratedGuidanceProviderDependencies =
  Readonly<{
    catalogue:
      readonly CallOfDutyCuratedGuidanceCatalogueEntry[];
  }>;

const DEFAULT_DEPENDENCIES:
  CallOfDutyCuratedGuidanceProviderDependencies =
  Object.freeze({
    catalogue:
      CALL_OF_DUTY_CURATED_GUIDANCE_CATALOGUE,
  });

/**
 * Creates the Call of Duty knowledge provider for explicit injection into the
 * Services-owned Guidance Provider Service. It performs no registration,
 * networking, game-process access or lifecycle work.
 */
export function createCallOfDutyCuratedGuidanceProvider(
  dependencies:
    CallOfDutyCuratedGuidanceProviderDependencies =
      DEFAULT_DEPENDENCIES
): OracleCompanionGuidanceProvider {
  const catalogue =
    snapshotCatalogue(
      dependencies.catalogue
    );

  return Object.freeze({
    manifest:
      CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_MANIFEST,

    provideGuidance(
      request:
        OracleCompanionGuidanceRequest
    ) {
      if (!isSupportedWarzoneSession(request)) {
        return Object.freeze([]);
      }

      const applicableEntries =
        catalogue.filter(
          (entry) =>
            (request.category === null ||
              request.category ===
                entry.category) &&
            (request.type === null ||
              request.type ===
                entry.type)
        );

      return Object.freeze(
        applicableEntries.map(
          (entry) =>
            createGuidanceCandidate(
              request,
              entry
            )
        )
      );
    },
  });
}

function snapshotCatalogue(
  catalogue:
    readonly CallOfDutyCuratedGuidanceCatalogueEntry[]
): readonly CallOfDutyCuratedGuidanceCatalogueEntry[] {
  if (!Array.isArray(catalogue)) {
    throw new Error(
      "Call of Duty curated guidance catalogue must be an array."
    );
  }

  return Object.freeze(
    catalogue.map(
      (entry) =>
        Object.freeze({
          ...entry,
          sources:
            Object.freeze(
              entry.sources.map(
                (
                  source:
                    CallOfDutyCuratedGuidanceCatalogueEntry["sources"][number]
                ) =>
                  Object.freeze({
                    ...source,
                  })
              )
            ),
        })
    )
  );
}

function isSupportedWarzoneSession(
  request:
    OracleCompanionGuidanceRequest
): boolean {
  const game = request.session.game;

  return (
    game?.integrationId ===
      "call-of-duty" &&
    game.integrationVersion ===
      "1.0.0" &&
    game.context
      .supportedExperience ===
      "warzone" &&
    game.context
      .detectedExperience ===
      "warzone"
  );
}

function createGuidanceCandidate(
  request:
    OracleCompanionGuidanceRequest,
  entry:
    CallOfDutyCuratedGuidanceCatalogueEntry
): OracleCompanionSerializableValue {
  const evidenceId =
    `${entry.id}.evidence`;

  return {
    contract: {
      name:
        "oracle.companion-guidance",
      version: 1,
    },
    id: entry.id,
    category: entry.category,
    type: entry.type,
    title: entry.title,
    summary: entry.summary,
    delivery: "advisory",
    recommendation:
      entry.recommendation,
    detailedExplanation:
      entry.detailedExplanation,
    rationale: entry.rationale,
    evidence: [
      {
        id: evidenceId,
        summary:
          entry.evidenceSummary,
        sourceIds:
          entry.sources.map(
            (source) => source.id
          ),
      },
    ],
    confidence: {
      score:
        entry.confidenceScore,
      level:
        confidenceLevel(
          entry.confidenceScore
        ),
      rationale:
        entry.confidenceRationale,
    },
    priority: entry.priority,
    sources: entry.sources,
    spoilerLevel:
      entry.spoilerLevel,
    reassessmentTrigger:
      entry.reassessmentTrigger,
    provenance: {
      method: "curated",
      providerId:
        CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_ID,
      providerVersion:
        CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_VERSION,
      generatedAt:
        request.requestedAt,
    },
    compatibility: {
      minimumCompanionVersion:
        null,
      integrationId:
        request.session.game!
          .integrationId,
      integrationVersion:
        request.session.game!
          .integrationVersion,
      gameVersion: null,
    },
    createdAt: request.requestedAt,
    expiresAt: null,
  };
}

function confidenceLevel(
  score: number
): "low" | "medium" | "high" {
  return score >= 0.75
    ? "high"
    : score >= 0.45
      ? "medium"
      : "low";
}
