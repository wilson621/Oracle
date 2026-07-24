import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  OPERATOR_CONTROL_CONTRACT_VERSION,
  OPERATOR_CONTROL_OPERATION_RECEIPT_CONTRACT,
  OPERATOR_CONTROL_OPERATION_STEP_CONTRACT,
  OPERATOR_CONTROL_TOMBSTONE_CONTRACT,
  createOperatorControlOperationReceipt,
  createOperatorControlOperationStep,
  createOperatorControlPolicySet,
  createOperatorControlTombstone,
} from "../lib/oracle/controls";
import { SupabaseOperatorControlRepository } from "../lib/oracle/repositories/operator-control-repository";
import {
  controlVerifiedAt,
  operatorControlPolicyInput,
} from "./operator-control-verification-fixtures";

const policy = createOperatorControlPolicySet(operatorControlPolicyInput);
const receipt = createOperatorControlOperationReceipt({
  contract: {
    name: OPERATOR_CONTROL_OPERATION_RECEIPT_CONTRACT,
    version: OPERATOR_CONTROL_CONTRACT_VERSION,
  },
  id: "repository-operation-1",
  operatorId: "operator-1",
  commandId: "repository-command-1",
  type: "deletion",
  scopeType: "item",
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
}, policy);
const step = createOperatorControlOperationStep({
  contract: {
    name: OPERATOR_CONTROL_OPERATION_STEP_CONTRACT,
    version: OPERATOR_CONTROL_CONTRACT_VERSION,
  },
  id: "repository-step-1",
  operationId: receipt.id,
  owner: "operator-service",
  action: "remove-declaration",
  status: "pending",
  attempt: 1,
  startedAt: null,
  completedAt: null,
  affectedRecordCount: 0,
  failureCode: null,
  checkpoint: null,
});
const tombstone = createOperatorControlTombstone({
  contract: {
    name: OPERATOR_CONTROL_TOMBSTONE_CONTRACT,
    version: OPERATOR_CONTROL_CONTRACT_VERSION,
  },
  id: "repository-tombstone-1",
  operationId: receipt.id,
  subjectType: "declaration",
  nonContentSubjectIdentity: "opaque-declaration-1",
  policySetId: policy.id,
  policySetVersion: policy.policyVersion,
  justification: "prove-deletion-transition",
  deletedAt: controlVerifiedAt,
  predecessorIdentity: "opaque-revision-1",
  integrityDigest: `sha256:${"a".repeat(64)}`,
}, policy);

const calls: Array<Readonly<{ name: string; args: unknown }>> = [];
const fakeClient = {
  rpc: async (name: string, args: unknown) => {
    calls.push({ name, args });
    const data: Record<string, unknown> = {
      register_operator_control_policy_set: policy,
      persist_operator_control_operation: receipt,
      persist_operator_control_operation_step: step,
      persist_operator_control_tombstone: tombstone,
      read_operator_control_operation_page: { rows: [receipt] },
      read_operator_control_operation_steps: [step],
    };
    return { data: data[name], error: null };
  },
} as unknown as SupabaseClient;

async function main(): Promise<void> {
  const repository = new SupabaseOperatorControlRepository(fakeClient);
  assert.deepEqual(await repository.registerPolicySet(policy), policy);
  assert.deepEqual(
    await repository.persistOperation(
      receipt.operatorId,
      `sha256:${"b".repeat(64)}`,
      receipt,
      policy
    ),
    receipt
  );
  assert.deepEqual(
    await repository.persistOperationStep(receipt.operatorId, step),
    step
  );
  assert.deepEqual(
    await repository.persistTombstone(
      receipt.operatorId,
      tombstone,
      policy
    ),
    tombstone
  );
  assert.deepEqual(
    await repository.listOperations({
      operatorId: receipt.operatorId,
      pageSize: 25,
      beforeRequestedAt: null,
      beforeOperationId: null,
    }, policy),
    [receipt]
  );
  assert.deepEqual(
    await repository.listOperationSteps(receipt.operatorId, receipt.id),
    [step]
  );
  await assert.rejects(
    repository.persistOperation(
      receipt.operatorId,
      "not-a-digest",
      receipt,
      policy
    ),
    /SHA-256/
  );
  await assert.rejects(
    repository.listOperations({
      operatorId: receipt.operatorId,
      pageSize: 101,
      beforeRequestedAt: null,
      beforeOperationId: null,
    }, policy),
    /between 1 and 100/
  );
  assert.deepEqual(
    calls.map((call) => call.name),
    [
      "register_operator_control_policy_set",
      "persist_operator_control_operation",
      "persist_operator_control_operation_step",
      "persist_operator_control_tombstone",
      "read_operator_control_operation_page",
      "read_operator_control_operation_steps",
    ]
  );
  process.stdout.write("Operator control Repository verification passed.\n");
}

void main();
