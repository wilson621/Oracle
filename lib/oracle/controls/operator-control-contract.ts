import {
  assertNoRawEvidencePayload,
  assertUnderstandingSerializable,
  cloneUnderstandingValue,
  deepFreezeUnderstanding,
  requireNullableUnderstandingString,
  requireNullableUnderstandingTimestamp,
  requireUnderstandingInteger,
  requireUnderstandingRecord,
  requireUnderstandingString,
  requireUnderstandingTimestamp,
} from "../understanding/operator-understanding-validation";
import { createOperatorUnderstandingScope } from "../understanding";
import type {
  OperatorClaimInspection,
  OperatorClaimControlCommand,
  OperatorConsentCommand,
  OperatorControlCommandResult,
  OperatorControlFailureCode,
  OperatorControlOperationReceipt,
  OperatorControlOperationStep,
  OperatorControlOperationStepStatus,
  OperatorControlOperationStatus,
  OperatorControlTombstone,
  OperatorDeclarationCommand,
  OperatorDeletionCommand,
  OperatorDeletionScope,
  OperatorEvidenceDispositionCommand,
  OperatorRetentionCommand,
  OperatorUnderstandingExport,
  OperatorUnderstandingExportRequest,
} from "./operator-control-types";
import {
  OPERATOR_CLAIM_CONTROL_COMMAND_CONTRACT,
  OPERATOR_CLAIM_INSPECTION_CONTRACT,
  OPERATOR_CONSENT_COMMAND_CONTRACT,
  OPERATOR_CONTROL_CONTRACT_VERSION,
  OPERATOR_CONTROL_OPERATION_RECEIPT_CONTRACT,
  OPERATOR_CONTROL_OPERATION_STEP_CONTRACT,
  OPERATOR_CONTROL_TOMBSTONE_CONTRACT,
  OPERATOR_DECLARATION_COMMAND_CONTRACT,
  OPERATOR_DELETION_COMMAND_CONTRACT,
  OPERATOR_EVIDENCE_DISPOSITION_COMMAND_CONTRACT,
  OPERATOR_RETENTION_COMMAND_CONTRACT,
  OPERATOR_UNDERSTANDING_EXPORT_CONTRACT,
  OPERATOR_UNDERSTANDING_EXPORT_REQUEST_CONTRACT,
  OperatorControlFailure,
} from "./operator-control-types";
import {
  assertOperatorControlPolicyEffective,
  requireConfiguredGovernanceValue,
  resolveOperatorControlPurpose,
} from "./operator-control-policy";
import type { OperatorControlPolicySet } from "./operator-control-types";

const DECLARATION_ACTIONS = [
  "create",
  "revise",
  "correct",
  "withdraw",
  "expire",
  "delete",
] as const;
const DECLARATION_DOMAINS = ["identity", "preference", "goal"] as const;
const OPERATION_TYPES = [
  "consent",
  "declaration",
  "claim-correction",
  "claim-dispute",
  "export",
  "retention",
  "evidence-disposition",
  "deletion",
] as const;
const OPERATION_STATUSES = [
  "accepted",
  "eligibility-removed",
  "in-progress",
  "failed-recoverable",
  "blocked-policy",
  "completed",
] as const;
const STEP_STATUSES = [
  "pending",
  "running",
  "failed-recoverable",
  "succeeded",
  "retained-legal",
  "processor-pending",
  "backup-pending",
] as const;
const FAILURE_CODES = [
  "authentication-required",
  "ownership-not-established",
  "policy-unavailable",
  "policy-unconfigured",
  "policy-not-effective",
  "purpose-not-permitted",
  "scope-not-permitted",
  "immutable-conflict",
  "stale-concurrency",
  "not-found",
  "result-bound-exceeded",
  "operation-not-recoverable",
] as const;

export function createOperatorConsentCommand(
  value: unknown,
  policy: OperatorControlPolicySet
): OperatorConsentCommand {
  const input = prepareCommand(
    value,
    "consentCommand",
    OPERATOR_CONSENT_COMMAND_CONTRACT
  );
  const effectiveAt = requireUnderstandingTimestamp(
    input.effectiveAt,
    "consentCommand.effectiveAt"
  );
  assertPolicyBinding(input, policy, effectiveAt, "consentCommand");
  const purpose = requireUnderstandingString(
    input.purpose,
    "consentCommand.purpose"
  );
  const purposePolicy = resolveOperatorControlPurpose(policy, purpose);

  if (!purposePolicy.consentRequired) {
    throw new OperatorControlFailure(
      "purpose-not-permitted",
      false,
      "The selected purpose does not accept an optional consent decision."
    );
  }

  return deepFreezeUnderstanding({
    contract: createContract(OPERATOR_CONSENT_COMMAND_CONTRACT),
    commandId: commandId(input, "consentCommand"),
    purpose,
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
    decision: requireEnum(
      input.decision,
      ["granted", "revoked"] as const,
      "consentCommand.decision"
    ),
    effectiveAt,
    expectedCurrentDecisionId: requireNullableUnderstandingString(
      input.expectedCurrentDecisionId,
      "consentCommand.expectedCurrentDecisionId"
    ),
  });
}

export function createOperatorDeclarationCommand(
  value: unknown,
  policy: OperatorControlPolicySet
): OperatorDeclarationCommand {
  const input = prepareCommand(
    value,
    "declarationCommand",
    OPERATOR_DECLARATION_COMMAND_CONTRACT
  );
  const effectiveAt = requireUnderstandingTimestamp(
    input.effectiveAt,
    "declarationCommand.effectiveAt"
  );
  assertPolicyBinding(input, policy, effectiveAt, "declarationCommand");
  const purpose = requireUnderstandingString(
    input.purpose,
    "declarationCommand.purpose"
  );
  const purposePolicy = resolveOperatorControlPurpose(policy, purpose);
  const domain = requireEnum(
    input.domain,
    DECLARATION_DOMAINS,
    "declarationCommand.domain"
  );

  if (
    !policy.declarationLifecycle.allowedDomains.includes(domain) ||
    !purposePolicy.declarationDomains.includes(domain)
  ) {
    throw new OperatorControlFailure(
      "scope-not-permitted",
      false,
      "The declaration domain is not permitted for this purpose."
    );
  }

  const action = requireEnum(
    input.action,
    DECLARATION_ACTIONS,
    "declarationCommand.action"
  );
  const expectedCurrentRevisionId = requireNullableUnderstandingString(
    input.expectedCurrentRevisionId,
    "declarationCommand.expectedCurrentRevisionId"
  );
  const expiresAt = requireNullableUnderstandingTimestamp(
    input.expiresAt,
    "declarationCommand.expiresAt"
  );
  const hasContent = action === "create" || action === "revise" || action === "correct";

  if (action === "create" && expectedCurrentRevisionId !== null) {
    throw new Error(
      "Declaration creation cannot expect an existing current revision."
    );
  }

  if (action !== "create" && expectedCurrentRevisionId === null) {
    throw new Error(
      "Declaration lifecycle commands must identify the expected current revision."
    );
  }

  if (hasContent && input.value === null) {
    throw new Error("Declaration content actions require a value.");
  }

  if (!hasContent && input.value !== null) {
    throw new Error(
      "Declaration withdrawal, expiry, and deletion commands cannot carry content."
    );
  }

  if (
    policy.declarationLifecycle.expiryRequiredDomains.includes(domain) &&
    hasContent &&
    expiresAt === null
  ) {
    throw new OperatorControlFailure(
      "policy-unconfigured",
      false,
      "The declaration requires an explicit expiry under the active policy."
    );
  }

  if (expiresAt !== null && Date.parse(expiresAt) <= Date.parse(effectiveAt)) {
    throw new Error("Declaration expiry must follow its effective time.");
  }

  return deepFreezeUnderstanding({
    contract: createContract(OPERATOR_DECLARATION_COMMAND_CONTRACT),
    commandId: commandId(input, "declarationCommand"),
    action,
    declarationId: requireUnderstandingString(
      input.declarationId,
      "declarationCommand.declarationId"
    ),
    revisionId: requireUnderstandingString(
      input.revisionId,
      "declarationCommand.revisionId"
    ),
    expectedCurrentRevisionId,
    domain,
    key: requireUnderstandingString(input.key, "declarationCommand.key"),
    value:
      input.value === null
        ? null
        : cloneUnderstandingValue(input.value, "declarationCommand.value"),
    purpose,
    scope: createOperatorUnderstandingScope(input.scope),
    effectiveAt,
    expiresAt,
    reasonCode: requireUnderstandingString(
      input.reasonCode,
      "declarationCommand.reasonCode"
    ),
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  });
}

export function createOperatorClaimControlCommand(
  value: unknown,
  policy: OperatorControlPolicySet
): OperatorClaimControlCommand {
  const input = prepareCommand(
    value,
    "claimControlCommand",
    OPERATOR_CLAIM_CONTROL_COMMAND_CONTRACT
  );
  const effectiveAt = requireUnderstandingTimestamp(
    input.effectiveAt,
    "claimControlCommand.effectiveAt"
  );
  assertPolicyBinding(input, policy, effectiveAt, "claimControlCommand");
  const purpose = requireUnderstandingString(
    input.purpose,
    "claimControlCommand.purpose"
  );
  resolveOperatorControlPurpose(policy, purpose);
  const action = requireEnum(
    input.action,
    ["correct", "dispute"] as const,
    "claimControlCommand.action"
  );

  if (action === "correct" && input.correctedValue === null) {
    throw new Error("Claim correction requires a replacement value.");
  }

  if (action === "dispute" && input.correctedValue !== null) {
    throw new Error("Claim dispute cannot carry a replacement value.");
  }

  return deepFreezeUnderstanding({
    contract: createContract(OPERATOR_CLAIM_CONTROL_COMMAND_CONTRACT),
    commandId: commandId(input, "claimControlCommand"),
    action,
    claimId: requireUnderstandingString(
      input.claimId,
      "claimControlCommand.claimId"
    ),
    expectedCurrentRevisionId: requireUnderstandingString(
      input.expectedCurrentRevisionId,
      "claimControlCommand.expectedCurrentRevisionId"
    ),
    correctedValue:
      input.correctedValue === null
        ? null
        : cloneUnderstandingValue(
            input.correctedValue,
            "claimControlCommand.correctedValue"
          ),
    purpose,
    reasonCode: requireUnderstandingString(
      input.reasonCode,
      "claimControlCommand.reasonCode"
    ),
    effectiveAt,
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  });
}

export function createOperatorUnderstandingExportRequest(
  value: unknown,
  policy: OperatorControlPolicySet
): OperatorUnderstandingExportRequest {
  const input = prepareCommand(
    value,
    "exportRequest",
    OPERATOR_UNDERSTANDING_EXPORT_REQUEST_CONTRACT
  );
  const asOf = requireUnderstandingTimestamp(input.asOf, "exportRequest.asOf");
  assertPolicyBinding(input, policy, asOf, "exportRequest");
  requireConfiguredGovernanceValue(policy.export, "export");
  const purpose = requireUnderstandingString(
    input.purpose,
    "exportRequest.purpose"
  );
  resolveOperatorControlPurpose(policy, purpose);

  return deepFreezeUnderstanding({
    contract: createContract(OPERATOR_UNDERSTANDING_EXPORT_REQUEST_CONTRACT),
    commandId: commandId(input, "exportRequest"),
    asOf,
    purpose,
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  });
}

export function createOperatorDeletionCommand(
  value: unknown,
  policy: OperatorControlPolicySet
): OperatorDeletionCommand {
  const input = prepareCommand(
    value,
    "deletionCommand",
    OPERATOR_DELETION_COMMAND_CONTRACT
  );
  const requestedAt = requireUnderstandingTimestamp(
    input.requestedAt,
    "deletionCommand.requestedAt"
  );
  assertPolicyBinding(input, policy, requestedAt, "deletionCommand");
  const deletionPolicy = requireConfiguredGovernanceValue(
    policy.deletion,
    "deletion"
  );
  requireConfiguredGovernanceValue(policy.recovery, "recovery");
  requireConfiguredGovernanceValue(policy.audit, "audit");
  requireConfiguredGovernanceValue(policy.tombstone, "tombstone");
  requireConfiguredGovernanceValue(policy.backup, "backup");
  requireConfiguredGovernanceValue(
    policy.externalProcessors,
    "externalProcessors"
  );
  const scope = createDeletionScope(input.scope);

  if (!deletionPolicy.allowedScopes.includes(scope.type)) {
    throw new OperatorControlFailure(
      "scope-not-permitted",
      false,
      "The deletion scope is not authorised by the active policy."
    );
  }

  return deepFreezeUnderstanding({
    contract: createContract(OPERATOR_DELETION_COMMAND_CONTRACT),
    commandId: commandId(input, "deletionCommand"),
    scope,
    requestedAt,
    reasonCode: requireUnderstandingString(
      input.reasonCode,
      "deletionCommand.reasonCode"
    ),
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  });
}

export function createOperatorRetentionCommand(
  value: unknown,
  policy: OperatorControlPolicySet
): OperatorRetentionCommand {
  const input = prepareCommand(
    value,
    "retentionCommand",
    OPERATOR_RETENTION_COMMAND_CONTRACT
  );
  const asOf = requireUnderstandingTimestamp(input.asOf, "retentionCommand.asOf");
  assertPolicyBinding(input, policy, asOf, "retentionCommand");
  const purpose = requireUnderstandingString(
    input.purpose,
    "retentionCommand.purpose"
  );
  resolveOperatorControlPurpose(policy, purpose);
  const informationCategory = requireUnderstandingString(
    input.informationCategory,
    "retentionCommand.informationCategory"
  );
  const rule = policy.retentionRules.find(
    (candidate) =>
      candidate.purpose === purpose &&
      candidate.informationCategory === informationCategory
  );

  if (!rule) {
    throw new OperatorControlFailure(
      "policy-unconfigured",
      false,
      "No retention rule governs the requested information category."
    );
  }
  requireConfiguredGovernanceValue(rule.durationDays, "retention.durationDays");
  requireConfiguredGovernanceValue(policy.bounds, "bounds");
  requireConfiguredGovernanceValue(policy.recovery, "recovery");

  return deepFreezeUnderstanding({
    contract: createContract(OPERATOR_RETENTION_COMMAND_CONTRACT),
    commandId: commandId(input, "retentionCommand"),
    informationCategory,
    purpose,
    asOf,
    cursor: requireNullableUnderstandingString(
      input.cursor,
      "retentionCommand.cursor"
    ),
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  });
}

export function createOperatorEvidenceDispositionCommand(
  value: unknown,
  policy: OperatorControlPolicySet
): OperatorEvidenceDispositionCommand {
  const input = prepareCommand(
    value,
    "evidenceDispositionCommand",
    OPERATOR_EVIDENCE_DISPOSITION_COMMAND_CONTRACT
  );
  const effectiveAt = requireUnderstandingTimestamp(
    input.effectiveAt,
    "evidenceDispositionCommand.effectiveAt"
  );
  assertPolicyBinding(input, policy, effectiveAt, "evidenceDispositionCommand");
  return deepFreezeUnderstanding({
    contract: createContract(OPERATOR_EVIDENCE_DISPOSITION_COMMAND_CONTRACT),
    commandId: commandId(input, "evidenceDispositionCommand"),
    evidenceReferenceId: requireUnderstandingString(
      input.evidenceReferenceId,
      "evidenceDispositionCommand.evidenceReferenceId"
    ),
    disposition: requireEnum(
      input.disposition,
      ["withdrawn", "source-deleted", "retention-expired"] as const,
      "evidenceDispositionCommand.disposition"
    ),
    effectiveAt,
    reasonCode: requireUnderstandingString(
      input.reasonCode,
      "evidenceDispositionCommand.reasonCode"
    ),
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  });
}

export function createOperatorControlOperationReceipt(
  value: unknown,
  policy: OperatorControlPolicySet
): OperatorControlOperationReceipt {
  assertContentFree(value, "operationReceipt");
  const input = prepareContract(
    value,
    "operationReceipt",
    OPERATOR_CONTROL_OPERATION_RECEIPT_CONTRACT,
    false
  );
  const status = requireEnum(
    input.status,
    OPERATION_STATUSES,
    "operationReceipt.status"
  );
  const eligibilityRemovedAt = requireNullableUnderstandingTimestamp(
    input.eligibilityRemovedAt,
    "operationReceipt.eligibilityRemovedAt"
  );
  const completedAt = requireNullableUnderstandingTimestamp(
    input.completedAt,
    "operationReceipt.completedAt"
  );
  const failureCode = requireNullableEnum(
    input.failureCode,
    FAILURE_CODES,
    "operationReceipt.failureCode"
  );
  const requestedAt = requireUnderstandingTimestamp(
    input.requestedAt,
    "operationReceipt.requestedAt"
  );
  assertPolicyBinding(input, policy, requestedAt, "operationReceipt");
  const auditPolicy = requireConfiguredGovernanceValue(policy.audit, "audit");
  const requiredAuditFields = [
    "operation-id",
    "action-type",
    "policy-identity",
    "request-time",
    "outcome",
    "recovery-state",
    "affected-record-counts",
  ] as const;

  if (
    requiredAuditFields.some(
      (field) => !auditPolicy.permittedFields.includes(field)
    )
  ) {
    throw new OperatorControlFailure(
      "policy-unconfigured",
      false,
      "The active audit policy does not authorise the minimum operation receipt fields."
    );
  }
  const eligibilityRemovalRequired = requireBoolean(
    input.eligibilityRemovalRequired,
    "operationReceipt.eligibilityRemovalRequired"
  );

  assertReceiptState(
    status,
    eligibilityRemovalRequired,
    eligibilityRemovedAt,
    completedAt,
    failureCode,
    input.recoveryState
  );

  const countsInput = requireUnderstandingRecord(
    input.affectedRecordCounts,
    "operationReceipt.affectedRecordCounts"
  );
  const affectedRecordCounts = Object.fromEntries(
    Object.entries(countsInput).map(([key, count]) => {
      const safeKey = requireCode(
        key,
        "operationReceipt.affectedRecordCounts.key"
      );
      return [
        safeKey,
        requireUnderstandingInteger(
          count,
          `operationReceipt.affectedRecordCounts.${safeKey}`
        ),
      ];
    })
  );

  return deepFreezeUnderstanding({
    contract: createContract(OPERATOR_CONTROL_OPERATION_RECEIPT_CONTRACT),
    id: requireUnderstandingString(input.id, "operationReceipt.id"),
    operatorId: requireUnderstandingString(
      input.operatorId,
      "operationReceipt.operatorId"
    ),
    commandId: requireUnderstandingString(
      input.commandId,
      "operationReceipt.commandId"
    ),
    type: requireEnum(
      input.type,
      OPERATION_TYPES,
      "operationReceipt.type"
    ),
    scopeType: requireNullableEnum(
      input.scopeType,
      [
        "item",
        "purpose",
        "game-integration",
        "understanding-domain",
        "complete-operator",
      ] as const,
      "operationReceipt.scopeType"
    ),
    status,
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
    requestedAt,
    eligibilityRemovalRequired,
    eligibilityRemovedAt,
    completedAt,
    affectedRecordCounts,
    recoveryState: requireEnum(
      input.recoveryState,
      ["none", "retry-available", "policy-required"] as const,
      "operationReceipt.recoveryState"
    ),
    failureCode,
  });
}

export function createOperatorControlOperationStep(
  value: unknown
): OperatorControlOperationStep {
  assertContentFree(value, "operationStep");
  const input = prepareContract(
    value,
    "operationStep",
    OPERATOR_CONTROL_OPERATION_STEP_CONTRACT,
    false
  );
  const status = requireEnum(
    input.status,
    STEP_STATUSES,
    "operationStep.status"
  );
  const startedAt = requireNullableUnderstandingTimestamp(
    input.startedAt,
    "operationStep.startedAt"
  );
  const completedAt = requireNullableUnderstandingTimestamp(
    input.completedAt,
    "operationStep.completedAt"
  );
  const failureCode = requireNullableEnum(
    input.failureCode,
    FAILURE_CODES,
    "operationStep.failureCode"
  );
  assertStepState(status, startedAt, completedAt, failureCode);

  return deepFreezeUnderstanding({
    contract: createContract(OPERATOR_CONTROL_OPERATION_STEP_CONTRACT),
    id: requireUnderstandingString(input.id, "operationStep.id"),
    operationId: requireUnderstandingString(
      input.operationId,
      "operationStep.operationId"
    ),
    owner: requireEnum(
      input.owner,
      [
        "operator-service",
        "operator-intelligence-service",
        "memory-service",
        "session-service",
        "progression-service",
        "backup-owner",
        "external-processor",
      ] as const,
      "operationStep.owner"
    ),
    action: requireCode(input.action, "operationStep.action"),
    status,
    attempt: requirePositiveInteger(input.attempt, "operationStep.attempt"),
    startedAt,
    completedAt,
    affectedRecordCount: requireUnderstandingInteger(
      input.affectedRecordCount,
      "operationStep.affectedRecordCount"
    ),
    failureCode,
    checkpoint:
      input.checkpoint === null
        ? null
        : requireOpaqueIdentifier(input.checkpoint, "operationStep.checkpoint"),
  });
}

export function createOperatorControlTombstone(
  value: unknown,
  policy: OperatorControlPolicySet
): OperatorControlTombstone {
  assertContentFree(value, "controlTombstone");
  const configured = requireConfiguredGovernanceValue(
    policy.tombstone,
    "tombstone"
  );
  const input = prepareContract(
    value,
    "controlTombstone",
    OPERATOR_CONTROL_TOMBSTONE_CONTRACT,
    false
  );
  const deletedAt = requireUnderstandingTimestamp(
    input.deletedAt,
    "controlTombstone.deletedAt"
  );
  assertOperatorControlPolicyEffective(policy, deletedAt);
  assertExactPolicyBinding(input, policy, "controlTombstone");
  const justification = requireEnum(
    input.justification,
    [
      "prevent-unsafe-replay",
      "preserve-monotonic-revision-integrity",
      "prove-deletion-transition",
      "coordinate-deletion-recovery",
    ] as const,
    "controlTombstone.justification"
  );

  if (!configured.justifications.includes(justification)) {
    throw new OperatorControlFailure(
      "policy-unconfigured",
      false,
      "The tombstone justification is not authorised by policy."
    );
  }

  const usedFields = [
    "tombstone-id",
    "operation-id",
    "subject-type",
    "non-content-subject-identity",
    "policy-identity",
    "deleted-at",
    "predecessor-identity",
    "integrity-digest",
  ] as const;

  if (usedFields.some((field) => !configured.permittedFields.includes(field))) {
    throw new OperatorControlFailure(
      "policy-unconfigured",
      false,
      "The active policy does not authorise every field in the control tombstone."
    );
  }

  return deepFreezeUnderstanding({
    contract: createContract(OPERATOR_CONTROL_TOMBSTONE_CONTRACT),
    id: requireUnderstandingString(input.id, "controlTombstone.id"),
    operationId: requireUnderstandingString(
      input.operationId,
      "controlTombstone.operationId"
    ),
    subjectType: requireEnum(
      input.subjectType,
      ["declaration", "claim", "evidence-reference", "operator"] as const,
      "controlTombstone.subjectType"
    ),
    nonContentSubjectIdentity: requireOpaqueIdentifier(
      input.nonContentSubjectIdentity,
      "controlTombstone.nonContentSubjectIdentity"
    ),
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
    justification,
    deletedAt,
    predecessorIdentity: requireNullableUnderstandingString(
      input.predecessorIdentity,
      "controlTombstone.predecessorIdentity"
    ),
    integrityDigest: requireDigest(
      input.integrityDigest,
      "controlTombstone.integrityDigest"
    ),
  });
}

export function createOperatorClaimInspection(
  value: OperatorClaimInspection
): OperatorClaimInspection {
  assertUnderstandingSerializable(value, "claimInspection");
  assertNoRawEvidencePayload(value, "claimInspection");
  const operatorIds = new Set([
    value.claim.operatorId,
    ...value.evidenceReferences.map((evidence) => evidence.operatorId),
  ]);

  if (operatorIds.size !== 1) {
    throw new Error(
      "Claim inspection cannot contain Evidence owned by another Operator."
    );
  }

  if (value.claim.status === "deleted") {
    if (
      value.evidenceReferences.length > 0 ||
      value.explanation !== null ||
      value.confidence !== null ||
      value.eligibility !== null
    ) {
      throw new Error(
        "Deleted claim inspection must remain content-free."
      );
    }
  }

  return deepFreezeUnderstanding(
    structuredClone({
      ...value,
      contract: createContract(OPERATOR_CLAIM_INSPECTION_CONTRACT),
    })
  );
}

export function createOperatorUnderstandingExport(
  value: Omit<OperatorUnderstandingExport, "contract" | "itemCount" | "serializedBytes">,
  policy: OperatorControlPolicySet
): OperatorUnderstandingExport {
  assertUnderstandingSerializable(value, "understandingExport");
  assertNoRawEvidencePayload(value, "understandingExport");
  const exportPolicy = requireConfiguredGovernanceValue(policy.export, "export");
  assertOperatorControlPolicyEffective(policy, value.asOf);
  resolveOperatorControlPurpose(policy, value.purpose);

  if (
    value.policySetId !== policy.id ||
    value.policySetVersion !== policy.policyVersion
  ) {
    throw new Error("Operator export policy binding is invalid.");
  }

  const operatorId = requireUnderstandingString(
    value.operatorId,
    "understandingExport.operatorId"
  );
  const operatorIds = new Set([
    ...value.declarations.map((item) => item.operatorId),
    ...value.claims.map((item) => item.operatorId),
    ...value.evidenceReferences.map((item) => item.operatorId),
  ]);

  if (
    operatorIds.size > 1 ||
    (operatorIds.size === 1 && !operatorIds.has(operatorId))
  ) {
    throw new Error(
      "Operator export cannot contain information owned by another Operator."
    );
  }

  const declarations = canonicalSort(value.declarations, (item) => item.id);
  const claims = canonicalSort(value.claims, (item) => item.id);
  const evidenceReferences = canonicalSort(
    value.evidenceReferences,
    (item) => item.id
  );
  const retentionStates = canonicalSort(
    value.retentionStates,
    (item) => `${item.itemId}:${item.policyId}:${item.policyVersion}`
  );
  const itemCount =
    declarations.length +
    claims.length +
    evidenceReferences.length +
    retentionStates.length;

  if (itemCount > exportPolicy.maxItems) {
    throw new OperatorControlFailure(
      "result-bound-exceeded",
      false,
      "Operator export item bound was exceeded."
    );
  }

  const withoutSize = {
    contract: createContract(OPERATOR_UNDERSTANDING_EXPORT_CONTRACT),
    generatedAt: value.generatedAt,
    asOf: value.asOf,
    operatorId,
    purpose: value.purpose,
    policySetId: value.policySetId,
    policySetVersion: value.policySetVersion,
    declarations,
    claims,
    evidenceReferences,
    retentionStates,
    itemCount,
  };
  const serializedBytes = measureSerializedBytes(withoutSize);

  if (serializedBytes > exportPolicy.maxBytes) {
    throw new OperatorControlFailure(
      "result-bound-exceeded",
      false,
      "Operator export byte bound was exceeded."
    );
  }

  return deepFreezeUnderstanding({
    ...withoutSize,
    serializedBytes,
  }) as OperatorUnderstandingExport;
}

export function createOperatorControlSuccess<Value>(
  value: Value
): OperatorControlCommandResult<Value> {
  return deepFreezeUnderstanding({
    outcome: "succeeded",
    value,
  });
}

export function createOperatorControlFailureResult(
  error: OperatorControlFailure
): OperatorControlCommandResult<never> {
  return deepFreezeUnderstanding({
    outcome: "failed",
    code: error.code,
    recoverable: error.recoverable,
  });
}

export function assertExactOperatorControlCommandReplay<
  Command extends Readonly<{ commandId: string }>,
>(original: Command, replay: Command): Command {
  if (original.commandId !== replay.commandId) {
    throw new Error(
      "Operator control replay must use the original command identity."
    );
  }

  if (JSON.stringify(original) !== JSON.stringify(replay)) {
    throw new OperatorControlFailure(
      "immutable-conflict",
      false,
      "Operator control command identity was replayed with different immutable content."
    );
  }

  return original;
}

function prepareCommand<Name extends string>(
  value: unknown,
  path: string,
  contractName: Name
): Record<string, unknown> {
  return prepareContract(value, path, contractName, true);
}

function prepareContract<Name extends string>(
  value: unknown,
  path: string,
  contractName: Name,
  rejectOperatorId: boolean
): Record<string, unknown> {
  assertUnderstandingSerializable(value, path);
  const input = requireUnderstandingRecord(value, path);
  if (rejectOperatorId && Object.hasOwn(input, "operatorId")) {
    throw new Error(`${path} cannot select an Operator.`);
  }
  const contract = requireUnderstandingRecord(input.contract, `${path}.contract`);
  if (
    contract.name !== contractName ||
    contract.version !== OPERATOR_CONTROL_CONTRACT_VERSION
  ) {
    throw new Error(`${path} contract identity or version is unsupported.`);
  }
  return input;
}

function createContract<Name extends string>(name: Name) {
  return {
    name,
    version: OPERATOR_CONTROL_CONTRACT_VERSION,
  } as const;
}

function commandId(input: Record<string, unknown>, path: string): string {
  return requireUnderstandingString(input.commandId, `${path}.commandId`);
}

function assertPolicyBinding(
  input: Record<string, unknown>,
  policy: OperatorControlPolicySet,
  asOf: string,
  path: string
): void {
  assertOperatorControlPolicyEffective(policy, asOf);
  assertExactPolicyBinding(input, policy, path);
}

function assertExactPolicyBinding(
  input: Record<string, unknown>,
  policy: OperatorControlPolicySet,
  path: string
): void {
  if (
    input.policySetId !== policy.id ||
    input.policySetVersion !== policy.policyVersion
  ) {
    throw new OperatorControlFailure(
      "policy-unavailable",
      false,
      `${path} does not bind to the supplied policy version.`
    );
  }
}

function createDeletionScope(value: unknown): OperatorDeletionScope {
  const input = requireUnderstandingRecord(value, "deletionCommand.scope");
  const type = requireEnum(
    input.type,
    [
      "item",
      "purpose",
      "game-integration",
      "understanding-domain",
      "complete-operator",
    ] as const,
    "deletionCommand.scope.type"
  );

  switch (type) {
    case "item":
      return {
        type,
        itemType: requireEnum(
          input.itemType,
          ["declaration", "claim", "evidence-reference"] as const,
          "deletionCommand.scope.itemType"
        ),
        itemId: requireUnderstandingString(
          input.itemId,
          "deletionCommand.scope.itemId"
        ),
      };
    case "purpose":
      return {
        type,
        purpose: requireUnderstandingString(
          input.purpose,
          "deletionCommand.scope.purpose"
        ),
      };
    case "game-integration":
      return {
        type,
        integrationId: requireUnderstandingString(
          input.integrationId,
          "deletionCommand.scope.integrationId"
        ),
        integrationVersion: requireNullableUnderstandingString(
          input.integrationVersion,
          "deletionCommand.scope.integrationVersion"
        ),
      };
    case "understanding-domain":
      return {
        type,
        domain: requireUnderstandingString(
          input.domain,
          "deletionCommand.scope.domain"
        ),
      };
    case "complete-operator":
      return { type };
  }
}

function assertReceiptState(
  status: OperatorControlOperationStatus,
  eligibilityRemovalRequired: boolean,
  eligibilityRemovedAt: string | null,
  completedAt: string | null,
  failureCode: OperatorControlFailureCode | null,
  recoveryState: unknown
): void {
  if (
    eligibilityRemovalRequired &&
    ["eligibility-removed", "in-progress", "failed-recoverable", "completed"].includes(
      status
    ) &&
    eligibilityRemovedAt === null
  ) {
    throw new Error(
      "Control operations cannot advance without recorded eligibility removal."
    );
  }
  if (!eligibilityRemovalRequired && eligibilityRemovedAt !== null) {
    throw new Error(
      "Control operations cannot report eligibility removal when it is not required."
    );
  }
  if ((status === "completed") !== (completedAt !== null)) {
    throw new Error("Control operation completion state is inconsistent.");
  }
  const failedOrBlocked =
    status === "failed-recoverable" || status === "blocked-policy";
  if (failedOrBlocked !== (failureCode !== null)) {
    throw new Error("Control operation failure state is inconsistent.");
  }
  if (
    (status === "failed-recoverable" && recoveryState !== "retry-available") ||
    (status === "blocked-policy" && recoveryState !== "policy-required") ||
    (status === "completed" && recoveryState !== "none")
  ) {
    throw new Error("Control operation recovery state is inconsistent.");
  }
}

function assertStepState(
  status: OperatorControlOperationStepStatus,
  startedAt: string | null,
  completedAt: string | null,
  failureCode: OperatorControlFailureCode | null
): void {
  if (status !== "pending" && startedAt === null) {
    throw new Error("Started operation steps require a start time.");
  }
  if (
    ["succeeded", "retained-legal"].includes(status) !==
    (completedAt !== null)
  ) {
    throw new Error("Operation step completion state is inconsistent.");
  }
  if ((status === "failed-recoverable") !== (failureCode !== null)) {
    throw new Error("Operation step failure state is inconsistent.");
  }
}

function assertContentFree(value: unknown, path: string): void {
  assertUnderstandingSerializable(value, path);
  const prohibited = new Set([
    "value",
    "declarationValue",
    "claimValue",
    "summary",
    "explanation",
    "confidence",
    "rationale",
    "prompt",
    "rawPrompt",
    "rawEvidence",
    "payload",
    "email",
    "gamePayload",
  ]);
  visitKeys(value, path, prohibited, new WeakSet<object>());
}

function visitKeys(
  value: unknown,
  path: string,
  prohibited: ReadonlySet<string>,
  ancestors: WeakSet<object>
): void {
  if (value === null || typeof value !== "object" || ancestors.has(value)) {
    return;
  }
  ancestors.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (prohibited.has(key)) {
      throw new Error(`${path}.${key} contains prohibited personal content.`);
    }
    visitKeys(nested, `${path}.${key}`, prohibited, ancestors);
  }
  ancestors.delete(value);
}

function requireEnum<const Values extends readonly string[]>(
  value: unknown,
  allowed: Values,
  path: string
): Values[number] {
  const candidate = requireUnderstandingString(value, path);
  if (!allowed.includes(candidate)) {
    throw new Error(`${path} is unsupported.`);
  }
  return candidate as Values[number];
}

function requireNullableEnum<const Values extends readonly string[]>(
  value: unknown,
  allowed: Values,
  path: string
): Values[number] | null {
  return value === null ? null : requireEnum(value, allowed, path);
}

function requirePositiveInteger(value: unknown, path: string): number {
  const integer = requireUnderstandingInteger(value, path);
  if (integer < 1) {
    throw new Error(`${path} must be a positive integer.`);
  }
  return integer;
}

function requireDigest(value: unknown, path: string): string {
  const digest = requireUnderstandingString(value, path);
  if (!/^sha256:[0-9a-f]{64}$/u.test(digest)) {
    throw new Error(`${path} must be a SHA-256 digest.`);
  }
  return digest;
}

function requireCode(value: unknown, path: string): string {
  const code = requireUnderstandingString(value, path);
  if (!/^[a-z][a-z0-9-]{0,63}$/u.test(code)) {
    throw new Error(`${path} must be a bounded non-content code.`);
  }
  return code;
}

function requireOpaqueIdentifier(value: unknown, path: string): string {
  const identifier = requireUnderstandingString(value, path);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/u.test(identifier)) {
    throw new Error(`${path} must be a bounded opaque identifier.`);
  }
  return identifier;
}

function byteLength(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

function measureSerializedBytes(value: object): number {
  let size = 0;
  for (;;) {
    const measured = byteLength({ ...value, serializedBytes: size });
    if (measured === size) {
      return size;
    }
    size = measured;
  }
}

function canonicalSort<Value>(
  values: readonly Value[],
  key: (value: Value) => string
): Value[] {
  return [...structuredClone(values)].sort((left, right) =>
    key(left).localeCompare(key(right), "en")
  );
}

function requireBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${path} must be boolean.`);
  }
  return value;
}
