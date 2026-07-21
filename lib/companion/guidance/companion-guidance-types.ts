export const ORACLE_COMPANION_GUIDANCE_CONTRACT =
  "oracle.companion-guidance" as const;

export const ORACLE_COMPANION_GUIDANCE_CONTRACT_VERSION =
  1 as const;

export const ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT =
  "oracle.companion-guidance-session-projection" as const;

export const ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT_VERSION =
  1 as const;

export const ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT =
  "oracle.companion-guidance-request" as const;

export const ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT_VERSION =
  1 as const;

export type OracleCompanionGuidanceContract =
  Readonly<{
    name:
      typeof ORACLE_COMPANION_GUIDANCE_CONTRACT;

    version:
      typeof ORACLE_COMPANION_GUIDANCE_CONTRACT_VERSION;
  }>;

export type OracleCompanionGuidanceSessionContract =
  Readonly<{
    name:
      typeof ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT;

    version:
      typeof ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT_VERSION;
  }>;

export type OracleCompanionGuidanceRequestContract =
  Readonly<{
    name:
      typeof ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT;

    version:
      typeof ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT_VERSION;
  }>;

export type OracleCompanionSerializableValue =
  | null
  | boolean
  | number
  | string
  | readonly OracleCompanionSerializableValue[]
  | Readonly<{
      [key: string]:
        OracleCompanionSerializableValue;
    }>;

/**
 * Categories and types are open identifiers. Consumers must preserve and
 * safely present unknown future values instead of treating them as invalid.
 */
export type OracleCompanionGuidanceCategory =
  string;

export type OracleCompanionGuidanceType =
  string;

export type OracleCompanionGuidancePriority =
  | "low"
  | "normal"
  | "high";

export type OracleCompanionGuidanceSpoilerLevel =
  | "none"
  | "minor"
  | "major"
  | "full";

export type OracleCompanionGuidanceConfidenceLevel =
  | "low"
  | "medium"
  | "high";

export type OracleCompanionGuidanceConfidence =
  Readonly<{
    score: number;
    level:
      OracleCompanionGuidanceConfidenceLevel;
    rationale: string;
  }>;

export type OracleCompanionGuidanceSource =
  Readonly<{
    id: string;
    type: string;
    title: string;
    uri: string | null;
    publisher: string | null;
    version: string | null;
    verifiedAt: string | null;
  }>;

export type OracleCompanionGuidanceEvidence =
  Readonly<{
    id: string;
    summary: string;
    sourceIds: readonly string[];
  }>;

export type OracleCompanionGuidanceProvenance =
  Readonly<{
    /**
     * Open identifier such as curated, deterministic-analysis, ai-generated
     * or hybrid. It is deliberately not a closed union.
     */
    method: string;

    providerId: string;
    providerVersion: string;
    generatedAt: string;
  }>;

export type OracleCompanionGuidanceCompatibility =
  Readonly<{
    minimumCompanionVersion:
      string | null;

    integrationId:
      string | null;

    integrationVersion:
      string | null;

    gameVersion:
      string | null;
  }>;

export type OracleCompanionGuidanceGameProjection =
  Readonly<{
    integrationId: string;
    gameName: string;
    integrationVersion: string;

    context:
      Readonly<
        Record<
          string,
          OracleCompanionSerializableValue
        >
      >;
  }>;

/**
 * Data-only projection of authoritative Session Context. It grants no Session
 * lifecycle authority and contains no desktop, process or provider objects.
 */
export type OracleCompanionGuidanceSessionProjection =
  Readonly<{
    contract:
      OracleCompanionGuidanceSessionContract;

    sessionId: string;
    capturedAt: string;

    /**
     * Minimal provider-safe projection selected from authoritative Session
     * Context. It can support game, performance, clip and Operator domains
     * without exposing the Session object itself.
     */
    context:
      Readonly<
        Record<
          string,
          OracleCompanionSerializableValue
        >
      >;

    game:
      OracleCompanionGuidanceGameProjection | null;
  }>;

export type OracleCompanionGuidanceRequest =
  Readonly<{
    contract:
      OracleCompanionGuidanceRequestContract;

    requestId: string;
    requestedAt: string;

    session:
      OracleCompanionGuidanceSessionProjection;

    category:
      OracleCompanionGuidanceCategory | null;

    type:
      OracleCompanionGuidanceType | null;

    operatorPrompt: string | null;

    maximumSpoilerLevel:
      OracleCompanionGuidanceSpoilerLevel;
  }>;

/**
 * Guidance is an explainable recommendation for the Operator. It is never an
 * instruction to a game, an automation command or a gameplay-control payload.
 */
export type OracleCompanionGuidance =
  Readonly<{
    contract:
      OracleCompanionGuidanceContract;

    id: string;
    category:
      OracleCompanionGuidanceCategory;
    type:
      OracleCompanionGuidanceType;

    title: string;
    summary: string;
    delivery: "advisory";
    recommendation: string;
    detailedExplanation:
      string | null;

    rationale: string;
    evidence:
      readonly OracleCompanionGuidanceEvidence[];
    confidence:
      OracleCompanionGuidanceConfidence;
    priority:
      OracleCompanionGuidancePriority;
    sources:
      readonly OracleCompanionGuidanceSource[];
    spoilerLevel:
      OracleCompanionGuidanceSpoilerLevel;
    reassessmentTrigger:
      string | null;

    provenance:
      OracleCompanionGuidanceProvenance;
    compatibility:
      OracleCompanionGuidanceCompatibility;

    createdAt: string;
    expiresAt: string | null;
  }>;

export type OracleCompanionGuidancePackageManifest =
  Readonly<{
    id: string;
    version: string;
    integrationId: string | null;

    /**
     * Providers may declare "*" to support every current and future value.
     */
    categories: readonly string[];
    types: readonly string[];
  }>;
