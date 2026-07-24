import assert from "node:assert/strict";
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
  OPERATOR_UNDERSTANDING_EXPORT_REQUEST_CONTRACT,
  OperatorControlFailure,
  assertExactOperatorControlCommandReplay,
  assertOperatorControlOperationCanComplete,
  assertOperatorControlOperationStepTransition,
  assertOperatorControlOperationTransition,
  createOperatorClaimControlCommand,
  createOperatorClaimInspection,
  createOperatorConsentCommand,
  createOperatorControlFailureResult,
  createOperatorControlOperationReceipt,
  createOperatorControlOperationStep,
  createOperatorControlPolicySet,
  createOperatorControlSuccess,
  createOperatorControlTombstone,
  createOperatorDeclarationCommand,
  createOperatorDeletionCommand,
  createOperatorEvidenceDispositionCommand,
  createOperatorRetentionCommand,
  createOperatorUnderstandingExport,
  createOperatorUnderstandingExportRequest,
  requireConfiguredGovernanceValue,
} from "../lib/oracle/controls";
import {
  assertOperatorDeclarationLifecycleTransition,
  createOperatorDeclarationTombstone,
  createOperatorEvidenceReference,
  createOperatorIntelligenceClaimRevision,
} from "../lib/oracle/understanding";
import {
  controlExpiresAt,
  controlVerifiedAt,
  operatorControlPolicyInput,
} from "./operator-control-verification-fixtures";
import {
  activeClaimInput,
  evidenceInput,
} from "./operator-understanding-verification-fixtures";

const policy = createOperatorControlPolicySet(operatorControlPolicyInput);

assert.equal(Object.isFrozen(policy), true);
assert.equal(Object.isFrozen(policy.purposes), true);
assert.equal(policy.purposes[0]?.admissionPolicy, null);
assert.equal(
  requireConfiguredGovernanceValue(policy.bounds, "bounds").inspectionPageSize,
  50
);
assert.doesNotThrow(() => JSON.stringify(policy));

const consentInput = {
  contract: {
    name: OPERATOR_CONSENT_COMMAND_CONTRACT,
    version: OPERATOR_CONTROL_CONTRACT_VERSION,
  },
  commandId: "consent-command-1",
  purpose: "operator-control",
  policySetId: policy.id,
  policySetVersion: policy.policyVersion,
  decision: "granted",
  effectiveAt: controlVerifiedAt,
  expectedCurrentDecisionId: null,
};
const consent = createOperatorConsentCommand(consentInput, policy);
assert.equal(consent.decision, "granted");
assert.equal(Object.isFrozen(consent), true);
assert.equal(
  assertExactOperatorControlCommandReplay(
    consent,
    createOperatorConsentCommand(consentInput, policy)
  ),
  consent
);

assert.throws(
  () =>
    createOperatorConsentCommand(
      { ...consentInput, operatorId: "operator-2" },
      policy
    ),
  /cannot select an Operator/
);
assert.throws(
  () =>
    assertExactOperatorControlCommandReplay(consent, {
      ...consent,
      decision: "revoked",
    }),
  (error) =>
    error instanceof OperatorControlFailure &&
    error.code === "immutable-conflict"
);

const declarationInput = {
  contract: {
    name: OPERATOR_DECLARATION_COMMAND_CONTRACT,
    version: OPERATOR_CONTROL_CONTRACT_VERSION,
  },
  commandId: "declaration-command-1",
  action: "create",
  declarationId: "goal-1",
  revisionId: "goal-1-revision-1",
  expectedCurrentRevisionId: null,
  domain: "goal",
  key: "current-goal",
  value: { target: "improve-positioning" },
  purpose: "operator-control",
  scope: { type: "operator" },
  effectiveAt: controlVerifiedAt,
  expiresAt: controlExpiresAt,
  reasonCode: "operator-created",
  policySetId: policy.id,
  policySetVersion: policy.policyVersion,
};
const declaration = createOperatorDeclarationCommand(declarationInput, policy);
declarationInput.value.target = "mutated-after-validation";
assert.deepEqual(declaration.value, { target: "improve-positioning" });
assert.equal(Object.isFrozen(declaration.value), true);

assert.throws(
  () =>
    createOperatorDeclarationCommand(
      { ...declarationInput, expiresAt: null },
      policy
    ),
  /requires an explicit expiry/
);
assert.throws(
  () =>
    createOperatorDeclarationCommand(
      {
        ...declarationInput,
        action: "withdraw",
        expectedCurrentRevisionId: "goal-1-revision-1",
      },
      policy
    ),
  /cannot carry content/
);

const dispute = createOperatorClaimControlCommand(
  {
    contract: {
      name: OPERATOR_CLAIM_CONTROL_COMMAND_CONTRACT,
      version: OPERATOR_CONTROL_CONTRACT_VERSION,
    },
    commandId: "dispute-command-1",
    action: "dispute",
    claimId: "claim-1",
    expectedCurrentRevisionId: "claim-1-revision-1",
    correctedValue: null,
    purpose: "operator-control",
    reasonCode: "operator-disputed",
    effectiveAt: controlVerifiedAt,
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  },
  policy
);
assert.equal(dispute.action, "dispute");
assert.equal(dispute.correctedValue, null);
assert.doesNotThrow(() =>
  assertOperatorDeclarationLifecycleTransition("active", "expired")
);

const evidence = createOperatorEvidenceReference(evidenceInput);
const claim = createOperatorIntelligenceClaimRevision(activeClaimInput, [
  evidence,
]);
const inspection = createOperatorClaimInspection({
  contract: {
    name: OPERATOR_CLAIM_INSPECTION_CONTRACT,
    version: OPERATOR_CONTROL_CONTRACT_VERSION,
  },
  claim,
  evidenceReferences: [evidence],
  explanation: claim.explanation,
  confidence: claim.confidence,
  eligibility: claim.eligibility,
});
assert.equal(inspection.evidenceReferences[0]?.id, evidence.id);
assert.equal(Object.isFrozen(inspection.evidenceReferences), true);

const exportRequest = createOperatorUnderstandingExportRequest(
  {
    contract: {
      name: OPERATOR_UNDERSTANDING_EXPORT_REQUEST_CONTRACT,
      version: OPERATOR_CONTROL_CONTRACT_VERSION,
    },
    commandId: "export-command-1",
    asOf: controlVerifiedAt,
    purpose: "operator-control",
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  },
  policy
);
assert.equal(exportRequest.asOf, controlVerifiedAt);

const exported = createOperatorUnderstandingExport(
  {
    generatedAt: controlVerifiedAt,
    asOf: controlVerifiedAt,
    operatorId: "operator-1",
    purpose: "operator-control",
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
    declarations: [],
    claims: [],
    evidenceReferences: [],
    retentionStates: [],
  },
  policy
);
assert.equal(exported.itemCount, 0);
assert.equal(exported.contract.version, 1);
assert.equal(Object.isFrozen(exported), true);

const declarationTombstoneB = createOperatorDeclarationTombstone({
  contract: {
    name: "oracle.operator-declaration-revision",
    version: 1,
  },
  id: "declaration-b-revision-2",
  declarationId: "declaration-b",
  operatorId: "operator-1",
  revision: 2,
  status: "deleted",
  deletedAt: controlVerifiedAt,
  policyId: "operator-control-policy",
  policyVersion: "1.0.0",
  supersedesRevisionId: "declaration-b-revision-1",
});
const declarationTombstoneA = createOperatorDeclarationTombstone({
  ...declarationTombstoneB,
  id: "declaration-a-revision-2",
  declarationId: "declaration-a",
  supersedesRevisionId: "declaration-a-revision-1",
});
const canonicalExport = createOperatorUnderstandingExport(
  {
    generatedAt: controlVerifiedAt,
    asOf: controlVerifiedAt,
    operatorId: "operator-1",
    purpose: "operator-control",
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
    declarations: [declarationTombstoneB, declarationTombstoneA],
    claims: [],
    evidenceReferences: [],
    retentionStates: [],
  },
  policy
);
assert.deepEqual(
  canonicalExport.declarations.map((item) => item.id),
  ["declaration-a-revision-2", "declaration-b-revision-2"]
);
assert.throws(
  () =>
    createOperatorUnderstandingExport(
      {
        ...canonicalExport,
        declarations: [
          {
            ...declarationTombstoneA,
            operatorId: "operator-2",
          },
        ],
      },
      policy
    ),
  /another Operator/
);

assert.throws(
  () =>
    createOperatorUnderstandingExport(
      {
        generatedAt: controlVerifiedAt,
        asOf: controlVerifiedAt,
        operatorId: "operator-1",
        purpose: "operator-control",
        policySetId: policy.id,
        policySetVersion: policy.policyVersion,
        declarations: [],
        claims: [],
        evidenceReferences: [],
        retentionStates: Array.from({ length: 4 }, (_, index) => ({
          itemId: `item-${index}`,
          informationCategory: "claim",
          retentionClass: "test",
          state: "retained" as const,
          policyId: "retention",
          policyVersion: "1.0.0",
        })),
      },
      policy
    ),
  (error) =>
    error instanceof OperatorControlFailure &&
    error.code === "result-bound-exceeded"
);

const deletion = createOperatorDeletionCommand(
  {
    contract: {
      name: OPERATOR_DELETION_COMMAND_CONTRACT,
      version: OPERATOR_CONTROL_CONTRACT_VERSION,
    },
    commandId: "delete-command-1",
    scope: { type: "complete-operator" },
    requestedAt: controlVerifiedAt,
    reasonCode: "operator-requested",
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  },
  policy
);
assert.equal(deletion.scope.type, "complete-operator");

const retention = createOperatorRetentionCommand(
  {
    contract: {
      name: OPERATOR_RETENTION_COMMAND_CONTRACT,
      version: OPERATOR_CONTROL_CONTRACT_VERSION,
    },
    commandId: "retention-command-1",
    informationCategory: "control-audit",
    purpose: "operator-control",
    asOf: controlVerifiedAt,
    cursor: null,
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  },
  policy
);
assert.equal(retention.informationCategory, "control-audit");

const evidenceDisposition = createOperatorEvidenceDispositionCommand(
  {
    contract: {
      name: OPERATOR_EVIDENCE_DISPOSITION_COMMAND_CONTRACT,
      version: OPERATOR_CONTROL_CONTRACT_VERSION,
    },
    commandId: "evidence-disposition-command-1",
    evidenceReferenceId: "evidence-1",
    disposition: "withdrawn",
    effectiveAt: controlVerifiedAt,
    reasonCode: "operator-withdrew-source",
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  },
  policy
);
assert.equal(evidenceDisposition.disposition, "withdrawn");

const receipt = createOperatorControlOperationReceipt(
  {
    contract: {
      name: OPERATOR_CONTROL_OPERATION_RECEIPT_CONTRACT,
      version: OPERATOR_CONTROL_CONTRACT_VERSION,
    },
    id: "operation-1",
    operatorId: "operator-1",
    commandId: deletion.commandId,
    type: "deletion",
    scopeType: "complete-operator",
    status: "accepted",
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
    requestedAt: controlVerifiedAt,
    eligibilityRemovalRequired: true,
    eligibilityRemovedAt: null,
    completedAt: null,
    affectedRecordCounts: {},
    recoveryState: "none",
    failureCode: null,
  },
  policy
);
assert.equal(receipt.status, "accepted");

const completedExportReceipt = createOperatorControlOperationReceipt(
  {
    ...receipt,
    id: "operation-export-1",
    commandId: exportRequest.commandId,
    type: "export",
    scopeType: null,
    status: "completed",
    eligibilityRemovalRequired: false,
    eligibilityRemovedAt: null,
    completedAt: controlVerifiedAt,
    recoveryState: "none",
  },
  policy
);
assert.equal(completedExportReceipt.eligibilityRemovedAt, null);
assert.throws(
  () =>
    createOperatorControlOperationReceipt(
      {
        ...receipt,
        status: "completed",
        completedAt: controlVerifiedAt,
      },
      policy
    ),
  /without recorded eligibility removal/
);

assert.throws(
  () =>
    createOperatorControlOperationReceipt(
      {
        ...receipt,
        value: "prohibited shadow content",
      },
      policy
    ),
  /contains prohibited personal content/
);

const step = createOperatorControlOperationStep({
  contract: {
    name: OPERATOR_CONTROL_OPERATION_STEP_CONTRACT,
    version: OPERATOR_CONTROL_CONTRACT_VERSION,
  },
  id: "operation-step-1",
  operationId: receipt.id,
  owner: "operator-intelligence-service",
  action: "remove-intelligence",
  status: "succeeded",
  attempt: 1,
  startedAt: controlVerifiedAt,
  completedAt: controlVerifiedAt,
  affectedRecordCount: 0,
  failureCode: null,
  checkpoint: "checkpoint-1",
});
assert.equal(step.status, "succeeded");

assert.doesNotThrow(() =>
  assertOperatorControlOperationTransition("accepted", "eligibility-removed")
);
assert.throws(
  () => assertOperatorControlOperationTransition("completed", "in-progress"),
  /invalid/
);
assert.doesNotThrow(() =>
  assertOperatorControlOperationStepTransition("pending", "running")
);
assert.doesNotThrow(() => assertOperatorControlOperationCanComplete([step]));
assert.throws(
  () => assertOperatorControlOperationCanComplete([{ status: "backup-pending" }]),
  /every approved live-system step/
);

const tombstone = createOperatorControlTombstone(
  {
    contract: {
      name: OPERATOR_CONTROL_TOMBSTONE_CONTRACT,
      version: OPERATOR_CONTROL_CONTRACT_VERSION,
    },
    id: "tombstone-1",
    operationId: receipt.id,
    subjectType: "operator",
    nonContentSubjectIdentity: "subject-token-1",
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
    justification: "coordinate-deletion-recovery",
    deletedAt: controlVerifiedAt,
    predecessorIdentity: null,
    integrityDigest: `sha256:${"a".repeat(64)}`,
  },
  policy
);
assert.equal(tombstone.subjectType, "operator");
assert.equal(Object.isFrozen(tombstone), true);

assert.throws(
  () =>
    createOperatorControlTombstone(
      {
        ...tombstone,
        explanation: "prohibited",
      },
      policy
    ),
  /contains prohibited personal content/
);

const unconfiguredPolicy = createOperatorControlPolicySet({
  ...operatorControlPolicyInput,
  id: "operator-control-unconfigured",
  export: { state: "unconfigured" },
  deletion: { state: "unconfigured" },
});

assert.throws(
  () =>
    createOperatorUnderstandingExportRequest(
      {
        ...exportRequest,
        policySetId: unconfiguredPolicy.id,
      },
      unconfiguredPolicy
    ),
  (error) =>
    error instanceof OperatorControlFailure &&
    error.code === "policy-unconfigured"
);
assert.throws(
  () =>
    createOperatorDeletionCommand(
      {
        ...deletion,
        policySetId: unconfiguredPolicy.id,
      },
      unconfiguredPolicy
    ),
  (error) =>
    error instanceof OperatorControlFailure &&
    error.code === "policy-unconfigured"
);

assert.throws(
  () =>
    createOperatorControlPolicySet({
      ...operatorControlPolicyInput,
      purposes: [
        {
          ...operatorControlPolicyInput.purposes[0],
          consentRequired: false,
        },
      ],
    }),
  /must require explicit consent/
);
assert.throws(
  () =>
    createOperatorControlPolicySet({
      ...operatorControlPolicyInput,
      bounds: {
        state: "configured",
        value: {
          ...operatorControlPolicyInput.bounds.value,
          inspectionPageSize: 101,
        },
      },
    }),
  /engineering ceiling/
);
assert.throws(
  () =>
    createOperatorControlPolicySet({
      ...operatorControlPolicyInput,
      backup: {
        state: "unconfigured",
        value: { retentionDays: 30 },
      },
    }),
  /cannot carry a value while unconfigured/
);

const success = createOperatorControlSuccess(receipt);
const failure = createOperatorControlFailureResult(
  new OperatorControlFailure(
    "stale-concurrency",
    true,
    "Competing command won."
  )
);
assert.equal(success.outcome, "succeeded");
assert.deepEqual(failure, {
  outcome: "failed",
  code: "stale-concurrency",
  recoverable: true,
});

process.stdout.write("Operator control contract verification passed.\n");
