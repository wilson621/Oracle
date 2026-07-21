import type {
  OperatorEvidenceReference,
  OperatorUnderstandingContract,
  OperatorUnderstandingProvenance,
} from "./operator-understanding-types";

export const OPERATOR_DATA_POLICY_DEFINITION_CONTRACT =
  "oracle.operator-data-policy-definition" as const;

export const OPERATOR_CONSENT_DECISION_CONTRACT =
  "oracle.operator-consent-decision" as const;

export const OPERATOR_EVIDENCE_DISPOSITION_CONTRACT =
  "oracle.operator-evidence-disposition" as const;

export const OPERATOR_GAME_SESSION_EVIDENCE_ADMISSION_CONTRACT =
  "oracle.operator-game-session-evidence-admission" as const;

export const OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE =
  "operator-intelligence.game-patterns" as const;

export type OperatorGamePatternClaimType =
  | "recurring-game-strength"
  | "recurring-game-weakness";

export type OperatorEvidenceSourceClassification =
  | "game-integration-direct-observation"
  | "game-integration-deterministic-transformation";

export type OperatorDataPolicyDefinition = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_DATA_POLICY_DEFINITION_CONTRACT
  >;
  id: string;
  policyVersion: string;
  purpose: string;
  retentionClass: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  allowedClaimTypes: readonly OperatorGamePatternClaimType[];
  evidenceAdmission: Readonly<{
    minimumQualityScore: number;
    allowedSourceClassifications:
      readonly OperatorEvidenceSourceClassification[];
  }>;
  retention: Readonly<{
    evidenceReferenceDays: number;
    supersededClaimRevisionDays: number;
  }>;
  claimLifecycle: Readonly<{
    maximumValidityDays: number;
    reassessAfterDays: number;
  }>;
}>;

export type OperatorConsentDecisionType = "granted" | "revoked";

export type OperatorConsentDecision = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_CONSENT_DECISION_CONTRACT
  >;
  id: string;
  operatorId: string;
  purpose: string;
  policyId: string;
  policyVersion: string;
  decision: OperatorConsentDecisionType;
  effectiveAt: string;
  recordedAt: string;
  supersedesDecisionId: string | null;
  provenance: OperatorUnderstandingProvenance;
}>;

export type OperatorEvidenceDispositionType =
  | "available"
  | "withdrawn"
  | "source-deleted"
  | "retention-expired";

export type OperatorEvidenceDisposition = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_EVIDENCE_DISPOSITION_CONTRACT
  >;
  id: string;
  operatorId: string;
  evidenceReferenceId: string;
  disposition: OperatorEvidenceDispositionType;
  reason: string;
  effectiveAt: string;
  recordedAt: string;
  supersedesDispositionId: string | null;
  provenance: OperatorUnderstandingProvenance;
}>;

export type OperatorGameSessionEvidenceAdmission = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_GAME_SESSION_EVIDENCE_ADMISSION_CONTRACT
  >;
  id: string;
  operatorId: string;
  evidenceReferenceId: string;
  evidenceDispositionId: string;
  sessionId: string;
  sourceRecordId: string;
  integrationId: string;
  integrationVersion: string;
  purpose: string;
  intendedClaimType: OperatorGamePatternClaimType;
  sourceClassification: OperatorEvidenceSourceClassification;
  policyId: string;
  policyVersion: string;
  consentDecisionId: string;
  admittedAt: string;
}>;

export type OperatorGameIntegrationIdentityAuthority = Readonly<{
  recognizes(integrationId: string, integrationVersion: string): boolean;
}>;

export type OperatorGameSessionEvidenceAdmissionInput = Readonly<{
  id: string;
  evidence: OperatorEvidenceReference;
  sessionId: string;
  sourceRecordId: string;
  integrationId: string;
  integrationVersion: string;
  purpose: string;
  intendedClaimType: OperatorGamePatternClaimType;
  sourceClassification: OperatorEvidenceSourceClassification;
  admittedAt: string;
}>;

export type OperatorGameSessionEvidenceAdmissionContext = Readonly<{
  authenticatedOperatorId: string;
  policy: OperatorDataPolicyDefinition;
  consentHistory: readonly OperatorConsentDecision[];
  evidenceDispositionHistory: readonly OperatorEvidenceDisposition[];
  gameIntegrations: OperatorGameIntegrationIdentityAuthority;
}>;
