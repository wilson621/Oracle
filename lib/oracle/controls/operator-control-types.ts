import type {
  OperatorClaimConfidence,
  OperatorDeclarationDomain,
  OperatorDeclarationRevision,
  OperatorDeclarationTombstone,
  OperatorEvidenceReference,
  OperatorIntelligenceClaimRevision,
  OperatorIntelligenceClaimTombstone,
  OperatorUnderstandingEligibility,
  OperatorUnderstandingExplanation,
  OperatorUnderstandingScope,
  OperatorUnderstandingSerializableValue,
} from "../understanding";

export const OPERATOR_CONTROL_CONTRACT_VERSION = 1 as const;

export const OPERATOR_CONTROL_POLICY_SET_CONTRACT =
  "oracle.operator-control-policy-set" as const;
export const OPERATOR_CONSENT_COMMAND_CONTRACT =
  "oracle.operator-consent-command" as const;
export const OPERATOR_DECLARATION_COMMAND_CONTRACT =
  "oracle.operator-declaration-command" as const;
export const OPERATOR_CLAIM_CONTROL_COMMAND_CONTRACT =
  "oracle.operator-claim-control-command" as const;
export const OPERATOR_UNDERSTANDING_EXPORT_REQUEST_CONTRACT =
  "oracle.operator-understanding-export-request" as const;
export const OPERATOR_UNDERSTANDING_EXPORT_CONTRACT =
  "oracle.operator-understanding-export" as const;
export const OPERATOR_DELETION_COMMAND_CONTRACT =
  "oracle.operator-deletion-command" as const;
export const OPERATOR_RETENTION_COMMAND_CONTRACT =
  "oracle.operator-retention-command" as const;
export const OPERATOR_EVIDENCE_DISPOSITION_COMMAND_CONTRACT =
  "oracle.operator-evidence-disposition-command" as const;
export const OPERATOR_CONTROL_OPERATION_RECEIPT_CONTRACT =
  "oracle.operator-control-operation-receipt" as const;
export const OPERATOR_CONTROL_OPERATION_STEP_CONTRACT =
  "oracle.operator-control-operation-step" as const;
export const OPERATOR_CONTROL_TOMBSTONE_CONTRACT =
  "oracle.operator-control-tombstone" as const;
export const OPERATOR_CLAIM_INSPECTION_CONTRACT =
  "oracle.operator-claim-inspection" as const;

export type OperatorControlContract<Name extends string> = Readonly<{
  name: Name;
  version: typeof OPERATOR_CONTROL_CONTRACT_VERSION;
}>;

export type OperatorGovernanceValue<Value> =
  | Readonly<{ state: "configured"; value: Value }>
  | Readonly<{ state: "unconfigured" }>;

export type OperatorControlPurposePolicy = Readonly<{
  id: string;
  optional: boolean;
  consentRequired: boolean;
  revocationEffect:
    | "future-processing"
    | "future-processing-and-eligibility-removal";
  observationCategories: readonly string[];
  declarationDomains: readonly OperatorDeclarationDomain[];
  admissionPolicy:
    | Readonly<{ policyId: string; policyVersion: string }>
    | null;
}>;

export type OperatorControlRetentionRule = Readonly<{
  id: string;
  informationCategory: string;
  authoritativeOwner:
    | "operator-service"
    | "operator-intelligence-service"
    | "memory-service"
    | "session-service"
    | "progression-service";
  purpose: string;
  retentionClass: string;
  startEvent: string;
  durationDays: OperatorGovernanceValue<number>;
  expiryEvent: OperatorGovernanceValue<string>;
  reassessmentDays: OperatorGovernanceValue<number>;
  consentDependent: boolean;
  legalAuthority: OperatorGovernanceValue<string>;
  disposition:
    | "physical-delete"
    | "irreversible-deidentify"
    | "source-owner-disposition";
  auditTreatment: string;
  backupTreatment: string;
  externalProcessorTreatment: string;
  deletionInteraction: string;
  approvingAuthority: string;
}>;

export type OperatorControlPolicySet = Readonly<{
  contract: OperatorControlContract<
    typeof OPERATOR_CONTROL_POLICY_SET_CONTRACT
  >;
  id: string;
  policyVersion: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  purposes: readonly OperatorControlPurposePolicy[];
  declarationLifecycle: Readonly<{
    allowedDomains: readonly OperatorDeclarationDomain[];
    expiryRequiredDomains: readonly OperatorDeclarationDomain[];
  }>;
  retentionRules: readonly OperatorControlRetentionRule[];
  deletion: OperatorGovernanceValue<
    Readonly<{
      allowedScopes: readonly OperatorDeletionScopeType[];
      eligibilityRemovalRequired: true;
      liveCompletionRequired: true;
    }>
  >;
  audit: OperatorGovernanceValue<
    Readonly<{
      permittedFields: readonly OperatorControlAuditField[];
      retentionRuleId: string;
    }>
  >;
  tombstone: OperatorGovernanceValue<
    Readonly<{
      justifications: readonly OperatorControlTombstoneJustification[];
      permittedFields: readonly OperatorControlTombstoneField[];
      retentionRuleId: string;
    }>
  >;
  backup: OperatorGovernanceValue<
    Readonly<{
      retentionDays: number;
      restoreReapplicationRequired: true;
      expiryEvidenceRequired: true;
    }>
  >;
  externalProcessors: OperatorGovernanceValue<
    readonly Readonly<{
      id: string;
      purpose: string;
      deletionMechanism: string;
      confirmationRequired: boolean;
      retryLimit: number;
    }>[]
  >;
  export: OperatorGovernanceValue<
    Readonly<{
      schemaVersion: typeof OPERATOR_CONTROL_CONTRACT_VERSION;
      maxItems: number;
      maxBytes: number;
      rawSourceContentPermitted: false;
      artifactHandling: "none";
    }>
  >;
  bounds: OperatorGovernanceValue<
    Readonly<{
      inspectionPageSize: number;
      declarationHistoryPageSize: number;
      deletionBatchSize: number;
      operationMaxAttempts: number;
    }>
  >;
  recovery: OperatorGovernanceValue<
    Readonly<{
      resumable: true;
      exactRetryRequired: true;
      completionVerificationRequired: true;
    }>
  >;
  approvedBy: string;
  approvedAt: string;
}>;

export type OperatorControlAuditField =
  | "operation-id"
  | "actor-class"
  | "scope-identifier"
  | "action-type"
  | "policy-identity"
  | "request-time"
  | "transition-time"
  | "completion-time"
  | "outcome"
  | "recovery-state"
  | "affected-record-counts"
  | "non-content-integrity-evidence";

export type OperatorControlTombstoneJustification =
  | "prevent-unsafe-replay"
  | "preserve-monotonic-revision-integrity"
  | "prove-deletion-transition"
  | "coordinate-deletion-recovery";

export type OperatorControlTombstoneField =
  | "tombstone-id"
  | "operation-id"
  | "subject-type"
  | "non-content-subject-identity"
  | "policy-identity"
  | "deleted-at"
  | "predecessor-identity"
  | "integrity-digest";

export type OperatorConsentCommand = Readonly<{
  contract: OperatorControlContract<typeof OPERATOR_CONSENT_COMMAND_CONTRACT>;
  commandId: string;
  purpose: string;
  policySetId: string;
  policySetVersion: string;
  decision: "granted" | "revoked";
  effectiveAt: string;
  expectedCurrentDecisionId: string | null;
}>;

export type OperatorDeclarationCommandAction =
  | "create"
  | "revise"
  | "correct"
  | "withdraw"
  | "expire"
  | "delete";

export type OperatorDeclarationCommand = Readonly<{
  contract: OperatorControlContract<
    typeof OPERATOR_DECLARATION_COMMAND_CONTRACT
  >;
  commandId: string;
  action: OperatorDeclarationCommandAction;
  declarationId: string;
  revisionId: string;
  expectedCurrentRevisionId: string | null;
  domain: OperatorDeclarationDomain;
  key: string;
  value: OperatorUnderstandingSerializableValue | null;
  purpose: string;
  scope: OperatorUnderstandingScope;
  effectiveAt: string;
  expiresAt: string | null;
  reasonCode: string;
  policySetId: string;
  policySetVersion: string;
}>;

export type OperatorClaimControlCommand = Readonly<{
  contract: OperatorControlContract<
    typeof OPERATOR_CLAIM_CONTROL_COMMAND_CONTRACT
  >;
  commandId: string;
  action: "correct" | "dispute";
  claimId: string;
  expectedCurrentRevisionId: string;
  correctedValue: OperatorUnderstandingSerializableValue | null;
  purpose: string;
  reasonCode: string;
  effectiveAt: string;
  policySetId: string;
  policySetVersion: string;
}>;

export type OperatorClaimInspection = Readonly<{
  contract: OperatorControlContract<
    typeof OPERATOR_CLAIM_INSPECTION_CONTRACT
  >;
  claim:
    | OperatorIntelligenceClaimRevision
    | OperatorIntelligenceClaimTombstone;
  evidenceReferences: readonly OperatorEvidenceReference[];
  explanation: OperatorUnderstandingExplanation | null;
  confidence: OperatorClaimConfidence | null;
  eligibility: OperatorUnderstandingEligibility | null;
}>;

export type OperatorUnderstandingExportRequest = Readonly<{
  contract: OperatorControlContract<
    typeof OPERATOR_UNDERSTANDING_EXPORT_REQUEST_CONTRACT
  >;
  commandId: string;
  asOf: string;
  purpose: string;
  policySetId: string;
  policySetVersion: string;
}>;

export type OperatorUnderstandingExport = Readonly<{
  contract: OperatorControlContract<
    typeof OPERATOR_UNDERSTANDING_EXPORT_CONTRACT
  >;
  generatedAt: string;
  asOf: string;
  operatorId: string;
  purpose: string;
  policySetId: string;
  policySetVersion: string;
  declarations: readonly (
    | OperatorDeclarationRevision
    | OperatorDeclarationTombstone
  )[];
  claims: readonly (
    | OperatorIntelligenceClaimRevision
    | OperatorIntelligenceClaimTombstone
  )[];
  evidenceReferences: readonly OperatorEvidenceReference[];
  retentionStates: readonly Readonly<{
    itemId: string;
    informationCategory: string;
    retentionClass: string;
    state:
      | "retained"
      | "ineligible"
      | "retention-expired"
      | "deletion-pending"
      | "physically-deleted";
    policyId: string;
    policyVersion: string;
  }>[];
  itemCount: number;
  serializedBytes: number;
}>;

export type OperatorDeletionScopeType =
  | "item"
  | "purpose"
  | "game-integration"
  | "understanding-domain"
  | "complete-operator";

export type OperatorDeletionScope =
  | Readonly<{ type: "item"; itemType: "declaration" | "claim" | "evidence-reference"; itemId: string }>
  | Readonly<{ type: "purpose"; purpose: string }>
  | Readonly<{ type: "game-integration"; integrationId: string; integrationVersion: string | null }>
  | Readonly<{ type: "understanding-domain"; domain: string }>
  | Readonly<{ type: "complete-operator" }>;

export type OperatorDeletionCommand = Readonly<{
  contract: OperatorControlContract<typeof OPERATOR_DELETION_COMMAND_CONTRACT>;
  commandId: string;
  scope: OperatorDeletionScope;
  requestedAt: string;
  reasonCode: string;
  policySetId: string;
  policySetVersion: string;
}>;

export type OperatorRetentionCommand = Readonly<{
  contract: OperatorControlContract<typeof OPERATOR_RETENTION_COMMAND_CONTRACT>;
  commandId: string;
  informationCategory: string;
  purpose: string;
  asOf: string;
  cursor: string | null;
  policySetId: string;
  policySetVersion: string;
}>;

export type OperatorEvidenceDispositionCommand = Readonly<{
  contract: OperatorControlContract<
    typeof OPERATOR_EVIDENCE_DISPOSITION_COMMAND_CONTRACT
  >;
  commandId: string;
  evidenceReferenceId: string;
  disposition: "withdrawn" | "source-deleted" | "retention-expired";
  effectiveAt: string;
  reasonCode: string;
  policySetId: string;
  policySetVersion: string;
}>;

export type OperatorControlOperationType =
  | "consent"
  | "declaration"
  | "claim-correction"
  | "claim-dispute"
  | "export"
  | "retention"
  | "evidence-disposition"
  | "deletion";

export type OperatorControlOperationStatus =
  | "accepted"
  | "eligibility-removed"
  | "in-progress"
  | "failed-recoverable"
  | "blocked-policy"
  | "completed";

export type OperatorControlOperationStepStatus =
  | "pending"
  | "running"
  | "failed-recoverable"
  | "succeeded"
  | "retained-legal"
  | "processor-pending"
  | "backup-pending";

export type OperatorControlOperationReceipt = Readonly<{
  contract: OperatorControlContract<
    typeof OPERATOR_CONTROL_OPERATION_RECEIPT_CONTRACT
  >;
  id: string;
  operatorId: string;
  commandId: string;
  type: OperatorControlOperationType;
  scopeType: OperatorDeletionScopeType | null;
  status: OperatorControlOperationStatus;
  policySetId: string;
  policySetVersion: string;
  requestedAt: string;
  eligibilityRemovalRequired: boolean;
  eligibilityRemovedAt: string | null;
  completedAt: string | null;
  affectedRecordCounts: Readonly<Record<string, number>>;
  recoveryState: "none" | "retry-available" | "policy-required";
  failureCode: OperatorControlFailureCode | null;
}>;

export type OperatorControlOperationStep = Readonly<{
  contract: OperatorControlContract<
    typeof OPERATOR_CONTROL_OPERATION_STEP_CONTRACT
  >;
  id: string;
  operationId: string;
  owner:
    | "operator-service"
    | "operator-intelligence-service"
    | "memory-service"
    | "session-service"
    | "progression-service"
    | "backup-owner"
    | "external-processor";
  action: string;
  status: OperatorControlOperationStepStatus;
  attempt: number;
  startedAt: string | null;
  completedAt: string | null;
  affectedRecordCount: number;
  failureCode: OperatorControlFailureCode | null;
  checkpoint: string | null;
}>;

export type OperatorControlTombstone = Readonly<{
  contract: OperatorControlContract<
    typeof OPERATOR_CONTROL_TOMBSTONE_CONTRACT
  >;
  id: string;
  operationId: string;
  subjectType: "declaration" | "claim" | "evidence-reference" | "operator";
  nonContentSubjectIdentity: string;
  policySetId: string;
  policySetVersion: string;
  justification: OperatorControlTombstoneJustification;
  deletedAt: string;
  predecessorIdentity: string | null;
  integrityDigest: string;
}>;

export type OperatorControlFailureCode =
  | "authentication-required"
  | "ownership-not-established"
  | "policy-unavailable"
  | "policy-unconfigured"
  | "policy-not-effective"
  | "purpose-not-permitted"
  | "scope-not-permitted"
  | "immutable-conflict"
  | "stale-concurrency"
  | "not-found"
  | "result-bound-exceeded"
  | "operation-not-recoverable";

export type OperatorControlCommandResult<Value> =
  | Readonly<{ outcome: "succeeded"; value: Value }>
  | Readonly<{
      outcome: "failed";
      code: OperatorControlFailureCode;
      recoverable: boolean;
    }>;

export class OperatorControlFailure extends Error {
  constructor(
    readonly code: OperatorControlFailureCode,
    readonly recoverable: boolean,
    message: string
  ) {
    super(message);
    this.name = "OperatorControlFailure";
  }
}
