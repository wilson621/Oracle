import {
  ORACLE_COMPANION_GUIDANCE_CONTRACT,
  ORACLE_COMPANION_GUIDANCE_CONTRACT_VERSION,
  type OracleCompanionGuidance,
  type OracleCompanionGuidanceCompatibility,
  type OracleCompanionGuidanceConfidence,
  type OracleCompanionGuidanceEvidence,
  type OracleCompanionGuidancePriority,
  type OracleCompanionGuidanceProvenance,
  type OracleCompanionGuidanceSource,
  type OracleCompanionGuidanceSpoilerLevel,
} from "./companion-guidance-types";
import {
  assertSerializableData,
  deepFreeze,
  requireFiniteNumber,
  requireHttpUri,
  requireIsoTimestamp,
  requireNonEmptyString,
  requireNullableIsoTimestamp,
  requireNullableSemanticVersion,
  requireNullableString,
  requirePlainRecord,
  requireSemanticVersion,
  requireStringArray,
} from "./companion-guidance-validation";

const PRIORITIES:
  readonly OracleCompanionGuidancePriority[] =
    ["low", "normal", "high"];

const SPOILER_LEVELS:
  readonly OracleCompanionGuidanceSpoilerLevel[] =
    [
      "none",
      "minor",
      "major",
      "full",
    ];

export function createOracleCompanionGuidance(
  value: unknown
): OracleCompanionGuidance {
  assertSerializableData(
    value,
    "guidance"
  );

  const input =
    requirePlainRecord(
      value,
      "guidance"
    );

  const guidance:
    OracleCompanionGuidance = {
    contract:
      createContract(
        input.contract
      ),

    id:
      requireNonEmptyString(
        input.id,
        "guidance.id"
      ),

    category:
      requireNonEmptyString(
        input.category,
        "guidance.category"
      ),

    type:
      requireNonEmptyString(
        input.type,
        "guidance.type"
      ),

    title:
      requireNonEmptyString(
        input.title,
        "guidance.title"
      ),

    summary:
      requireNonEmptyString(
        input.summary,
        "guidance.summary"
      ),

    delivery:
      requireAdvisoryDelivery(
        input.delivery
      ),

    recommendation:
      requireNonEmptyString(
        input.recommendation,
        "guidance.recommendation"
      ),

    detailedExplanation:
      requireNullableString(
        input.detailedExplanation,
        "guidance.detailedExplanation"
      ),

    rationale:
      requireNonEmptyString(
        input.rationale,
        "guidance.rationale"
      ),

    evidence:
      createEvidence(
        input.evidence
      ),

    confidence:
      createConfidence(
        input.confidence
      ),

    priority:
      requirePriority(
        input.priority
      ),

    sources:
      createSources(
        input.sources
      ),

    spoilerLevel:
      requireSpoilerLevel(
        input.spoilerLevel
      ),

    reassessmentTrigger:
      requireNullableString(
        input.reassessmentTrigger,
        "guidance.reassessmentTrigger"
      ),

    provenance:
      createProvenance(
        input.provenance
      ),

    compatibility:
      createCompatibility(
        input.compatibility
      ),

    createdAt:
      requireIsoTimestamp(
        input.createdAt,
        "guidance.createdAt"
      ),

    expiresAt:
      requireNullableIsoTimestamp(
        input.expiresAt,
        "guidance.expiresAt"
      ),
  };

  assertReferencesAreValid(
    guidance
  );

  assertExpiryIsValid(
    guidance.createdAt,
    guidance.expiresAt
  );

  return deepFreeze(guidance);
}

export function isOracleCompanionGuidance(
  value: unknown
): value is OracleCompanionGuidance {
  try {
    createOracleCompanionGuidance(
      value
    );
    return true;
  } catch {
    return false;
  }
}

function requireAdvisoryDelivery(
  value: unknown
): "advisory" {
  if (value === "advisory") {
    return value;
  }

  throw new Error(
    "Oracle Companion Guidance delivery must be advisory."
  );
}

function createContract(
  value: unknown
) {
  const contract =
    requirePlainRecord(
      value,
      "guidance.contract"
    );

  if (
    contract.name !==
      ORACLE_COMPANION_GUIDANCE_CONTRACT ||
    contract.version !==
      ORACLE_COMPANION_GUIDANCE_CONTRACT_VERSION
  ) {
    throw new Error(
      "Oracle Companion Guidance contract identity or version is unsupported."
    );
  }

  return {
    name:
      ORACLE_COMPANION_GUIDANCE_CONTRACT,

    version:
      ORACLE_COMPANION_GUIDANCE_CONTRACT_VERSION,
  } as const;
}

function createConfidence(
  value: unknown
): OracleCompanionGuidanceConfidence {
  const confidence =
    requirePlainRecord(
      value,
      "guidance.confidence"
    );

  const score =
    requireFiniteNumber(
      confidence.score,
      "guidance.confidence.score"
    );

  if (score < 0 || score > 1) {
    throw new Error(
      "Oracle Companion Guidance confidence score must be between 0 and 1."
    );
  }

  return {
    score,
    level:
      score >= 0.75
        ? "high"
        : score >= 0.45
          ? "medium"
          : "low",

    rationale:
      requireNonEmptyString(
        confidence.rationale,
        "guidance.confidence.rationale"
      ),
  };
}

function createEvidence(
  value: unknown
): OracleCompanionGuidanceEvidence[] {
  if (!Array.isArray(value)) {
    throw new Error(
      "Oracle Companion Guidance 'guidance.evidence' must be an array."
    );
  }

  return value.map(
    (entry, index) => {
      const evidence =
        requirePlainRecord(
          entry,
          `guidance.evidence[${index}]`
        );

      return {
        id:
          requireNonEmptyString(
            evidence.id,
            `guidance.evidence[${index}].id`
          ),

        summary:
          requireNonEmptyString(
            evidence.summary,
            `guidance.evidence[${index}].summary`
          ),

        sourceIds:
          requireStringArray(
            evidence.sourceIds,
            `guidance.evidence[${index}].sourceIds`
          ),
      };
    }
  );
}

function createSources(
  value: unknown
): OracleCompanionGuidanceSource[] {
  if (!Array.isArray(value)) {
    throw new Error(
      "Oracle Companion Guidance 'guidance.sources' must be an array."
    );
  }

  return value.map(
    (entry, index) => {
      const source =
        requirePlainRecord(
          entry,
          `guidance.sources[${index}]`
        );

      return {
        id:
          requireNonEmptyString(
            source.id,
            `guidance.sources[${index}].id`
          ),

        type:
          requireNonEmptyString(
            source.type,
            `guidance.sources[${index}].type`
          ),

        title:
          requireNonEmptyString(
            source.title,
            `guidance.sources[${index}].title`
          ),

        uri:
          requireHttpUri(
            source.uri,
            `guidance.sources[${index}].uri`
          ),

        publisher:
          requireNullableString(
            source.publisher,
            `guidance.sources[${index}].publisher`
          ),

        version:
          requireNullableString(
            source.version,
            `guidance.sources[${index}].version`
          ),

        verifiedAt:
          requireNullableIsoTimestamp(
            source.verifiedAt,
            `guidance.sources[${index}].verifiedAt`
          ),
      };
    }
  );
}

function createProvenance(
  value: unknown
): OracleCompanionGuidanceProvenance {
  const provenance =
    requirePlainRecord(
      value,
      "guidance.provenance"
    );

  return {
    method:
      requireNonEmptyString(
        provenance.method,
        "guidance.provenance.method"
      ),

    providerId:
      requireNonEmptyString(
        provenance.providerId,
        "guidance.provenance.providerId"
      ),

    providerVersion:
      requireSemanticVersion(
        provenance.providerVersion,
        "guidance.provenance.providerVersion"
      ),

    generatedAt:
      requireIsoTimestamp(
        provenance.generatedAt,
        "guidance.provenance.generatedAt"
      ),
  };
}

function createCompatibility(
  value: unknown
): OracleCompanionGuidanceCompatibility {
  const compatibility =
    requirePlainRecord(
      value,
      "guidance.compatibility"
    );

  const integrationId =
    requireNullableString(
      compatibility.integrationId,
      "guidance.compatibility.integrationId"
    );

  const integrationVersion =
    requireNullableSemanticVersion(
      compatibility.integrationVersion,
      "guidance.compatibility.integrationVersion"
    );

  if (
    (integrationId === null) !==
      (integrationVersion === null)
  ) {
    throw new Error(
      "Oracle Companion Guidance integration compatibility requires both integrationId and integrationVersion, or neither."
    );
  }

  return {
    minimumCompanionVersion:
      requireNullableSemanticVersion(
        compatibility.minimumCompanionVersion,
        "guidance.compatibility.minimumCompanionVersion"
      ),

    integrationId,
    integrationVersion,

    gameVersion:
      requireNullableString(
        compatibility.gameVersion,
        "guidance.compatibility.gameVersion"
      ),
  };
}

function requirePriority(
  value: unknown
): OracleCompanionGuidancePriority {
  if (
    typeof value === "string" &&
    PRIORITIES.includes(
      value as OracleCompanionGuidancePriority
    )
  ) {
    return value as
      OracleCompanionGuidancePriority;
  }

  throw new Error(
    "Oracle Companion Guidance priority is unsupported."
  );
}

function requireSpoilerLevel(
  value: unknown
): OracleCompanionGuidanceSpoilerLevel {
  if (
    typeof value === "string" &&
    SPOILER_LEVELS.includes(
      value as OracleCompanionGuidanceSpoilerLevel
    )
  ) {
    return value as
      OracleCompanionGuidanceSpoilerLevel;
  }

  throw new Error(
    "Oracle Companion Guidance spoiler level is unsupported."
  );
}

function assertReferencesAreValid(
  guidance: OracleCompanionGuidance
): void {
  assertUniqueIds(
    guidance.sources.map(
      (source) => source.id
    ),
    "source"
  );

  assertUniqueIds(
    guidance.evidence.map(
      (evidence) => evidence.id
    ),
    "evidence"
  );

  const sourceIds =
    new Set(
      guidance.sources.map(
        (source) => source.id
      )
    );

  for (
    const evidence
    of guidance.evidence
  ) {
    for (
      const sourceId
      of evidence.sourceIds
    ) {
      if (!sourceIds.has(sourceId)) {
        throw new Error(
          `Oracle Companion Guidance evidence '${evidence.id}' references unknown source '${sourceId}'.`
        );
      }
    }
  }
}

function assertUniqueIds(
  ids: readonly string[],
  label: string
): void {
  if (
    new Set(ids).size !== ids.length
  ) {
    throw new Error(
      `Oracle Companion Guidance contains duplicate ${label} identifiers.`
    );
  }
}

function assertExpiryIsValid(
  createdAt: string,
  expiresAt: string | null
): void {
  if (
    expiresAt !== null &&
    Date.parse(expiresAt) <
      Date.parse(createdAt)
  ) {
    throw new Error(
      "Oracle Companion Guidance expiresAt cannot precede createdAt."
    );
  }
}
