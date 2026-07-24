import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createOperatorControlOperationReceipt,
  createOperatorControlOperationStep,
  createOperatorControlPolicySet,
  createOperatorControlTombstone,
  type OperatorControlOperationReceipt,
  type OperatorControlOperationStep,
  type OperatorControlPolicySet,
  type OperatorControlTombstone,
} from "../controls";

export type OperatorControlOperationQuery = Readonly<{
  operatorId: string;
  pageSize: number;
  beforeRequestedAt: string | null;
  beforeOperationId: string | null;
}>;

export interface OperatorControlRepository {
  registerPolicySet(
    policy: OperatorControlPolicySet
  ): Promise<OperatorControlPolicySet>;
  persistOperation(
    operatorId: string,
    commandDigest: string,
    receipt: OperatorControlOperationReceipt,
    policy: OperatorControlPolicySet
  ): Promise<OperatorControlOperationReceipt>;
  persistOperationStep(
    operatorId: string,
    step: OperatorControlOperationStep
  ): Promise<OperatorControlOperationStep>;
  persistTombstone(
    operatorId: string,
    tombstone: OperatorControlTombstone,
    policy: OperatorControlPolicySet
  ): Promise<OperatorControlTombstone>;
  listOperations(
    query: OperatorControlOperationQuery,
    policy: OperatorControlPolicySet
  ): Promise<readonly OperatorControlOperationReceipt[]>;
  listOperationSteps(
    operatorId: string,
    operationId: string
  ): Promise<readonly OperatorControlOperationStep[]>;
}

export class OperatorControlRepositoryImmutableConflictError extends Error {
  readonly code = "OPERATOR_CONTROL_IMMUTABLE_CONFLICT";

  constructor() {
    super("Operator control identity already has different immutable content.");
    this.name = "OperatorControlRepositoryImmutableConflictError";
  }
}

export class OperatorControlRepositoryStaleConflictError extends Error {
  readonly code = "OPERATOR_CONTROL_STALE_CONCURRENCY";

  constructor() {
    super("Operator control operation lost a concurrency race.");
    this.name = "OperatorControlRepositoryStaleConflictError";
  }
}

export class SupabaseOperatorControlRepository
  implements OperatorControlRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async registerPolicySet(
    policy: OperatorControlPolicySet
  ): Promise<OperatorControlPolicySet> {
    const validated = createOperatorControlPolicySet(policy);
    const { data, error } = await this.client.rpc(
      "register_operator_control_policy_set",
      { p_policy: validated }
    );

    if (error) {
      throw translateOperatorControlPersistenceError(error);
    }

    return createOperatorControlPolicySet(data);
  }

  async persistOperation(
    operatorId: string,
    commandDigest: string,
    receipt: OperatorControlOperationReceipt,
    policy: OperatorControlPolicySet
  ): Promise<OperatorControlOperationReceipt> {
    const validatedPolicy = createOperatorControlPolicySet(policy);
    const validated = createOperatorControlOperationReceipt(
      receipt,
      validatedPolicy
    );
    assertOperatorId(operatorId, validated.operatorId);
    assertCommandDigest(commandDigest);

    const { data, error } = await this.client.rpc(
      "persist_operator_control_operation",
      {
        p_operator_id: operatorId,
        p_command_digest: commandDigest,
        p_receipt: validated,
      }
    );

    if (error) {
      throw translateOperatorControlPersistenceError(error);
    }

    return createOperatorControlOperationReceipt(data, validatedPolicy);
  }

  async persistOperationStep(
    operatorId: string,
    step: OperatorControlOperationStep
  ): Promise<OperatorControlOperationStep> {
    const validated = createOperatorControlOperationStep(step);
    const { data, error } = await this.client.rpc(
      "persist_operator_control_operation_step",
      {
        p_operator_id: operatorId,
        p_step: validated,
      }
    );

    if (error) {
      throw translateOperatorControlPersistenceError(error);
    }

    return createOperatorControlOperationStep(data);
  }

  async persistTombstone(
    operatorId: string,
    tombstone: OperatorControlTombstone,
    policy: OperatorControlPolicySet
  ): Promise<OperatorControlTombstone> {
    const validatedPolicy = createOperatorControlPolicySet(policy);
    const validated = createOperatorControlTombstone(
      tombstone,
      validatedPolicy
    );
    const { data, error } = await this.client.rpc(
      "persist_operator_control_tombstone",
      {
        p_operator_id: operatorId,
        p_tombstone: validated,
      }
    );

    if (error) {
      throw translateOperatorControlPersistenceError(error);
    }

    return createOperatorControlTombstone(data, validatedPolicy);
  }

  async listOperations(
    query: OperatorControlOperationQuery,
    policy: OperatorControlPolicySet
  ): Promise<readonly OperatorControlOperationReceipt[]> {
    assertPageSize(query.pageSize);
    const validatedPolicy = createOperatorControlPolicySet(policy);
    const { data, error } = await this.client.rpc(
      "read_operator_control_operation_page",
      {
        p_operator_id: query.operatorId,
        p_page_size: query.pageSize,
        p_before_requested_at: query.beforeRequestedAt,
        p_before_operation_id: query.beforeOperationId,
      }
    );

    if (error) {
      throw translateOperatorControlPersistenceError(error);
    }

    return requireRows(data).map((receipt) => {
      const validated = createOperatorControlOperationReceipt(
        receipt,
        validatedPolicy
      );
      assertOperatorId(query.operatorId, validated.operatorId);
      return validated;
    });
  }

  async listOperationSteps(
    operatorId: string,
    operationId: string
  ): Promise<readonly OperatorControlOperationStep[]> {
    const { data, error } = await this.client.rpc(
      "read_operator_control_operation_steps",
      {
        p_operator_id: operatorId,
        p_operation_id: operationId,
      }
    );

    if (error) {
      throw translateOperatorControlPersistenceError(error);
    }

    if (!Array.isArray(data)) {
      throw new Error("Operator control step response is invalid.");
    }

    return data.map((step) => {
      const validated = createOperatorControlOperationStep(step);
      if (validated.operationId !== operationId) {
        throw new Error("Operator control step operation ownership mismatches.");
      }
      return validated;
    });
  }
}

function assertOperatorId(expected: string, actual: string): void {
  if (actual !== expected) {
    throw new Error("Operator control Repository ownership mismatches.");
  }
}

function assertCommandDigest(value: string): void {
  if (!/^sha256:[0-9a-f]{64}$/.test(value)) {
    throw new Error("Operator control command digest must be SHA-256.");
  }
}

function assertPageSize(value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new Error("Operator control page size must be between 1 and 100.");
  }
}

function requireRows(value: unknown): readonly unknown[] {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !Array.isArray((value as { rows?: unknown }).rows)
  ) {
    throw new Error("Operator control page response is invalid.");
  }

  return (value as { rows: readonly unknown[] }).rows;
}

function translateOperatorControlPersistenceError(error: unknown): Error {
  if (typeof error !== "object" || error === null) {
    return new Error("Operator control persistence failed.");
  }

  const code = "code" in error ? error.code : null;
  if (code === "23505") {
    return new OperatorControlRepositoryImmutableConflictError();
  }
  if (code === "40001") {
    return new OperatorControlRepositoryStaleConflictError();
  }

  return error instanceof Error
    ? error
    : new Error("Operator control persistence failed.");
}
