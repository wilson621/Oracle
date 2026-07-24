import {
  OPERATOR_CONTROL_CONTRACT_VERSION,
  OPERATOR_CONTROL_POLICY_SET_CONTRACT,
} from "../lib/oracle/controls";

export const controlVerifiedAt = "2026-07-24T12:00:00.000Z";
export const controlExpiresAt = "2027-07-24T12:00:00.000Z";

const configured = <Value>(value: Value) => ({
  state: "configured" as const,
  value,
});

const unconfigured = () => ({
  state: "unconfigured" as const,
});

export const operatorControlPolicyInput = {
  contract: {
    name: OPERATOR_CONTROL_POLICY_SET_CONTRACT,
    version: OPERATOR_CONTROL_CONTRACT_VERSION,
  },
  id: "operator-control-policy",
  policyVersion: "1.0.0",
  effectiveFrom: "2026-07-24T00:00:00.000Z",
  effectiveUntil: null,
  purposes: [
    {
      id: "operator-control",
      optional: true,
      consentRequired: true,
      revocationEffect: "future-processing-and-eligibility-removal",
      observationCategories: [],
      declarationDomains: ["identity", "preference", "goal"],
      // Explicit null means this control purpose grants no Evidence admission.
      admissionPolicy: null,
    },
  ],
  declarationLifecycle: {
    allowedDomains: ["identity", "preference", "goal"],
    expiryRequiredDomains: ["goal"],
  },
  retentionRules: [
    {
      id: "audit-retention",
      informationCategory: "control-audit",
      authoritativeOwner: "operator-intelligence-service",
      purpose: "operator-control",
      retentionClass: "control-audit",
      startEvent: "operation-completed",
      durationDays: configured(30),
      expiryEvent: unconfigured(),
      reassessmentDays: unconfigured(),
      consentDependent: false,
      legalAuthority: unconfigured(),
      disposition: "physical-delete",
      auditTreatment: "content-free",
      backupTreatment: "expire-with-backup-policy",
      externalProcessorTreatment: "none",
      deletionInteraction: "remove-when-policy-expires",
      approvingAuthority: "founder",
    },
    {
      id: "tombstone-retention",
      informationCategory: "control-tombstone",
      authoritativeOwner: "operator-intelligence-service",
      purpose: "operator-control",
      retentionClass: "control-tombstone",
      startEvent: "deletion-completed",
      durationDays: configured(30),
      expiryEvent: unconfigured(),
      reassessmentDays: unconfigured(),
      consentDependent: false,
      legalAuthority: unconfigured(),
      disposition: "physical-delete",
      auditTreatment: "content-free",
      backupTreatment: "reapply-before-runtime",
      externalProcessorTreatment: "none",
      deletionInteraction: "remove-or-deidentify-on-complete-operator",
      approvingAuthority: "founder",
    },
  ],
  deletion: configured({
    allowedScopes: [
      "item",
      "purpose",
      "game-integration",
      "understanding-domain",
      "complete-operator",
    ],
    eligibilityRemovalRequired: true,
    liveCompletionRequired: true,
  }),
  audit: configured({
    permittedFields: [
      "operation-id",
      "actor-class",
      "scope-identifier",
      "action-type",
      "policy-identity",
      "request-time",
      "transition-time",
      "completion-time",
      "outcome",
      "recovery-state",
      "affected-record-counts",
      "non-content-integrity-evidence",
    ],
    retentionRuleId: "audit-retention",
  }),
  tombstone: configured({
    justifications: [
      "prevent-unsafe-replay",
      "preserve-monotonic-revision-integrity",
      "prove-deletion-transition",
      "coordinate-deletion-recovery",
    ],
    permittedFields: [
      "tombstone-id",
      "operation-id",
      "subject-type",
      "non-content-subject-identity",
      "policy-identity",
      "deleted-at",
      "predecessor-identity",
      "integrity-digest",
    ],
    retentionRuleId: "tombstone-retention",
  }),
  backup: configured({
    retentionDays: 30,
    restoreReapplicationRequired: true,
    expiryEvidenceRequired: true,
  }),
  externalProcessors: configured([]),
  export: configured({
    schemaVersion: OPERATOR_CONTROL_CONTRACT_VERSION,
    maxItems: 3,
    maxBytes: 4096,
    rawSourceContentPermitted: false,
    artifactHandling: "none",
  }),
  bounds: configured({
    inspectionPageSize: 50,
    declarationHistoryPageSize: 50,
    deletionBatchSize: 25,
    operationMaxAttempts: 3,
  }),
  recovery: configured({
    resumable: true,
    exactRetryRequired: true,
    completionVerificationRequired: true,
  }),
  approvedBy: "founder",
  approvedAt: controlVerifiedAt,
};
