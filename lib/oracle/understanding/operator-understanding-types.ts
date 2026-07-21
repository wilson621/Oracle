export const OPERATOR_UNDERSTANDING_CONTRACT_VERSION = 1 as const;

export const OPERATOR_EVIDENCE_REFERENCE_CONTRACT =
  "oracle.operator-evidence-reference" as const;

export const OPERATOR_INTELLIGENCE_CLAIM_CONTRACT =
  "oracle.operator-intelligence-claim" as const;

export const OPERATOR_DATA_POLICY_REFERENCE_CONTRACT =
  "oracle.operator-data-policy-reference" as const;

export const OPERATOR_DECLARATION_REVISION_CONTRACT =
  "oracle.operator-declaration-revision" as const;

export const OPERATOR_UNDERSTANDING_EXPLANATION_CONTRACT =
  "oracle.operator-understanding-explanation" as const;

export const OPERATOR_UNDERSTANDING_SNAPSHOT_CONTRACT =
  "oracle.operator-understanding-snapshot" as const;

export type OperatorUnderstandingSerializableValue =
  | null
  | string
  | number
  | boolean
  | readonly OperatorUnderstandingSerializableValue[]
  | Readonly<{
      [key: string]: OperatorUnderstandingSerializableValue;
    }>;

export type OperatorUnderstandingContract<
  Name extends string,
> = Readonly<{
  name: Name;
  version: typeof OPERATOR_UNDERSTANDING_CONTRACT_VERSION;
}>;

export type OperatorUnderstandingEpistemicClass =
  | "known"
  | "declared"
  | "observed"
  | "inferred"
  | "suspected"
  | "unknown";

export type OperatorUnderstandingPurpose = string;

export type OperatorUnderstandingScope =
  | Readonly<{
      type: "operator";
    }>
  | Readonly<{
      type: "application";
      applicationId: string;
    }>
  | Readonly<{
      type: "game-integration";
      integrationId: string;
      integrationVersion: string;
    }>
  | Readonly<{
      type: "session";
      sessionId: string;
      integrationId: string;
      integrationVersion: string;
    }>;

export type OperatorUnderstandingProvenance = Readonly<{
  sourceOwnerType:
    | "operator-service"
    | "session"
    | "application"
    | "game-integration"
    | "oracle-engine";
  sourceOwnerId: string;
  method:
    | "authoritative-source"
    | "operator-declaration"
    | "direct-observation"
    | "deterministic-engine";
  producerId: string;
  producerVersion: string;
  generatedAt: string;
}>;

export type OperatorUnderstandingTemporalValidity = Readonly<{
  effectiveFrom: string;
  validUntil: string | null;
  lastAssessedAt: string | null;
  reassessAfter: string | null;
  reassessmentTrigger: string | null;
}>;

export type OperatorNativeConfidence = Readonly<{
  value: number;
  scale: Readonly<{
    minimum: number;
    maximum: number;
  }>;
  label: string | null;
  rationale: string | null;
}>;

export type OperatorClaimConfidence = Readonly<{
  score: number;
  rationale: string;
  supportingEvidenceCount: number;
  contradictingEvidenceCount: number;
  policyId: string;
  policyVersion: string;
  assessedAt: string;
  producerNative: OperatorNativeConfidence | null;
}>;

export type OperatorUnderstandingExplanation = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_UNDERSTANDING_EXPLANATION_CONTRACT
  >;
  summary: string;
  reasonCodes: readonly string[];
  evidenceReferenceIds: readonly string[];
  method: Readonly<{
    kind: "deterministic-template";
    id: string;
    version: string;
  }>;
  policyVersion: string;
  generatedAt: string;
}>;

export type OperatorUnderstandingEligibilityReason =
  | "candidate"
  | "consent-absent"
  | "consent-revoked"
  | "disputed"
  | "expired"
  | "superseded"
  | "deleted"
  | "outside-purpose"
  | "outside-scope"
  | "insufficient-evidence";

export type OperatorUnderstandingEligibility = Readonly<{
  eligible: boolean;
  reasons: readonly OperatorUnderstandingEligibilityReason[];
  purpose: OperatorUnderstandingPurpose;
  policyId: string;
  policyVersion: string;
  assessedAt: string;
}>;

export type OperatorDataPolicyReference = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_DATA_POLICY_REFERENCE_CONTRACT
  >;
  id: string;
  policyVersion: string;
  purpose: OperatorUnderstandingPurpose;
  retentionClass: string;
}>;

export type OperatorKnownItem = Readonly<{
  id: string;
  operatorId: string;
  key: string;
  epistemic: "known";
  value: OperatorUnderstandingSerializableValue;
  confidence: null;
  provenance: OperatorUnderstandingProvenance;
  scope: OperatorUnderstandingScope;
  temporalValidity: OperatorUnderstandingTemporalValidity;
  revisionId: string;
}>;

export type OperatorDeclaredItem = Readonly<{
  id: string;
  operatorId: string;
  key: string;
  epistemic: "declared";
  value: OperatorUnderstandingSerializableValue;
  confidence: null;
  provenance: OperatorUnderstandingProvenance;
  scope: OperatorUnderstandingScope;
  temporalValidity: OperatorUnderstandingTemporalValidity;
  revisionId: string;
}>;

export type OperatorObservedItem = Readonly<{
  id: string;
  operatorId: string;
  key: string;
  epistemic: "observed";
  value: OperatorUnderstandingSerializableValue;
  confidence: null;
  evidenceReferenceId: string;
  provenance: OperatorUnderstandingProvenance;
  scope: OperatorUnderstandingScope;
  temporalValidity: OperatorUnderstandingTemporalValidity;
}>;

export type OperatorUnknownItem = Readonly<{
  id: string;
  operatorId: string;
  key: string;
  epistemic: "unknown";
  value: null;
  confidence: null;
  reason: string;
  requiredEvidence: readonly string[];
  scope: OperatorUnderstandingScope;
}>;

export type OperatorExplicitUnderstandingItem =
  | OperatorKnownItem
  | OperatorDeclaredItem;

export type OperatorStateUnderstandingItem =
  | OperatorKnownItem
  | OperatorDeclaredItem
  | OperatorObservedItem
  | OperatorUnknownItem;

export type OperatorEvidenceSourceType =
  | "session"
  | "operator-declaration"
  | "application-event"
  | "game-integration-observation";

export type OperatorEvidenceReference = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_EVIDENCE_REFERENCE_CONTRACT
  >;
  id: string;
  operatorId: string;
  sourceType: OperatorEvidenceSourceType;
  sourceOwnerId: string;
  sourceRecordId: string;
  observedAt: string;
  capturedAt: string;
  purpose: OperatorUnderstandingPurpose;
  scope: OperatorUnderstandingScope;
  producer: Readonly<{
    id: string;
    version: string;
    method:
      | "direct-observation"
      | "operator-declaration"
      | "deterministic-transformation";
  }>;
  quality: Readonly<{
    score: number;
    rationale: string;
    policyId: string;
    policyVersion: string;
    assessedAt: string;
  }> | null;
  summary: string;
  contentDigest: string;
  retentionClass: string;
  policyId: string;
  policyVersion: string;
}>;

export type OperatorClaimEvidenceRelationship =
  | "support"
  | "contradict";

export type OperatorClaimEvidenceLink = Readonly<{
  claimId: string;
  claimRevisionId: string;
  evidenceReferenceId: string;
  relationship: OperatorClaimEvidenceRelationship;
  rationale: string;
  linkedAt: string;
}>;

export type OperatorClaimLifecycleStatus =
  | "candidate"
  | "active"
  | "disputed"
  | "superseded"
  | "expired"
  | "deleted";

export type OperatorIntelligenceClaimRevision = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_INTELLIGENCE_CLAIM_CONTRACT
  >;
  id: string;
  claimId: string;
  operatorId: string;
  revision: number;
  type: string;
  status: Exclude<OperatorClaimLifecycleStatus, "deleted">;
  epistemic: "suspected" | "inferred";
  value: OperatorUnderstandingSerializableValue;
  confidence: OperatorClaimConfidence;
  explanation: OperatorUnderstandingExplanation | null;
  evidence: readonly OperatorClaimEvidenceLink[];
  provenance: OperatorUnderstandingProvenance;
  scope: OperatorUnderstandingScope;
  temporalValidity: OperatorUnderstandingTemporalValidity;
  eligibility: OperatorUnderstandingEligibility;
  policyId: string;
  policyVersion: string;
  supersedesRevisionId: string | null;
}>;

export type OperatorIntelligenceClaimTombstone = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_INTELLIGENCE_CLAIM_CONTRACT
  >;
  id: string;
  claimId: string;
  operatorId: string;
  revision: number;
  status: "deleted";
  deletedAt: string;
  policyId: string;
  policyVersion: string;
  supersedesRevisionId: string;
}>;

export type OperatorDeclarationLifecycleStatus =
  | "active"
  | "corrected"
  | "superseded"
  | "withdrawn"
  | "deleted";

export type OperatorDeclarationDomain =
  | "identity"
  | "preference"
  | "goal";

export type OperatorDeclarationRevision = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_DECLARATION_REVISION_CONTRACT
  >;
  id: string;
  declarationId: string;
  operatorId: string;
  revision: number;
  domain: OperatorDeclarationDomain;
  key: string;
  status: Exclude<OperatorDeclarationLifecycleStatus, "deleted">;
  epistemic: "known" | "declared";
  value: OperatorUnderstandingSerializableValue;
  confidence: null;
  provenance: OperatorUnderstandingProvenance;
  scope: OperatorUnderstandingScope;
  temporalValidity: OperatorUnderstandingTemporalValidity;
  policyId: string;
  policyVersion: string;
  supersedesRevisionId: string | null;
}>;

export type OperatorDeclarationTombstone = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_DECLARATION_REVISION_CONTRACT
  >;
  id: string;
  declarationId: string;
  operatorId: string;
  revision: number;
  status: "deleted";
  deletedAt: string;
  policyId: string;
  policyVersion: string;
  supersedesRevisionId: string;
}>;

export type OperatorMemoryProjectionItem = Readonly<{
  understandingItemId: string;
  epistemic: OperatorUnderstandingEpistemicClass;
  retainedAt: string;
  retentionClass: string;
  policyId: string;
  policyVersion: string;
  reassessAfter: string | null;
}>;

export type OperatorUnderstandingSnapshot = Readonly<{
  contract: OperatorUnderstandingContract<
    typeof OPERATOR_UNDERSTANDING_SNAPSHOT_CONTRACT
  >;
  operatorId: string;
  generatedAt: string;
  asOf: string;
  purpose: OperatorUnderstandingPurpose;
  policySetVersion: string;
  identity: readonly OperatorExplicitUnderstandingItem[];
  preferences: readonly OperatorDeclaredItem[];
  goals: readonly OperatorDeclaredItem[];
  state: readonly OperatorStateUnderstandingItem[];
  memory: readonly OperatorMemoryProjectionItem[];
  intelligence: readonly OperatorIntelligenceClaimRevision[];
  unknowns: readonly OperatorUnknownItem[];
}>;
