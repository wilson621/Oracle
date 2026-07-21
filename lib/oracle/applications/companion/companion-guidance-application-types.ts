export const ORACLE_COMPANION_GUIDANCE_APPLICATION_STATE =
  "oracle.companion-guidance-application-state" as const;

export const ORACLE_COMPANION_GUIDANCE_APPLICATION_STATE_VERSION =
  1 as const;

export type CompanionGuidanceApplicationStatus =
  | "loading"
  | "ready"
  | "empty"
  | "partial-success"
  | "unavailable";

export type CompanionGuidanceDisplayLabel =
  Readonly<{
    id: string;
    label: string;
  }>;

export type CompanionGuidanceSourceViewModel =
  Readonly<{
    id: string;
    type:
      CompanionGuidanceDisplayLabel;
    title: string;
    uri: string | null;
    publisher: string | null;
    version: string | null;
    verifiedAt: string | null;
  }>;

export type CompanionGuidanceEvidenceViewModel =
  Readonly<{
    id: string;
    summary: string;
    sourceIds: readonly string[];
  }>;

export type CompanionGuidanceConfidenceViewModel =
  Readonly<{
    score: number;
    level:
      CompanionGuidanceDisplayLabel;
    rationale: string;
  }>;

export type CompanionGuidanceCardViewModel =
  Readonly<{
    id: string;
    category:
      CompanionGuidanceDisplayLabel;
    type:
      CompanionGuidanceDisplayLabel;
    title: string;
    summary: string;
    recommendation: string;
    detailedExplanation: string | null;
    rationale: string;
    evidence:
      readonly CompanionGuidanceEvidenceViewModel[];
    confidence:
      CompanionGuidanceConfidenceViewModel;
    priority:
      CompanionGuidanceDisplayLabel;
    sources:
      readonly CompanionGuidanceSourceViewModel[];
    spoiler:
      CompanionGuidanceDisplayLabel;
    reassessmentTrigger: string | null;
    createdAt: string;
    expiresAt: string | null;
  }>;

export type CompanionGuidanceDiagnosticCode =
  | "guidance-unavailable"
  | "guidance-source-unavailable"
  | "guidance-content-omitted";

export type CompanionGuidanceDiagnosticViewModel =
  Readonly<{
    code:
      CompanionGuidanceDiagnosticCode;
    severity: "warning";
    title: string;
    message: string;
  }>;

export type CompanionGuidanceApplicationState =
  Readonly<{
    contract: Readonly<{
      name:
        typeof ORACLE_COMPANION_GUIDANCE_APPLICATION_STATE;
      version:
        typeof ORACLE_COMPANION_GUIDANCE_APPLICATION_STATE_VERSION;
    }>;
    status:
      CompanionGuidanceApplicationStatus;
    message: string;
    cards:
      readonly CompanionGuidanceCardViewModel[];
    diagnostics:
      readonly CompanionGuidanceDiagnosticViewModel[];
  }>;
