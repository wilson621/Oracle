import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createOperatorConsentCommand,
  createOperatorControlPolicySet,
  createOperatorDeclarationCommand,
  type OperatorConsentCommand,
  type OperatorControlPolicySet,
  type OperatorDeclarationCommand,
} from "../controls";
import {
  createOperatorDeclarationRevision,
  createOperatorDeclarationTombstone,
  type OperatorDeclarationRevision,
  type OperatorDeclarationTombstone,
} from "../understanding";
import {
  createOperatorProvisioningCommand,
  type OperatorCommissioningPolicy,
  type OperatorProvisioningCommand,
  type OperatorProvisioningResult,
} from "../services/operator/operator-provisioning-types";

export type OperatorRecord = {
  id: string;
  email: string | null;
  callsign: string | null;
  designation: string | null;
  primary_game: string | null;
  combat_rating: string | null;
  xp: number;
  level: number;
  total_sessions: number;
  created_at: string;
};

export interface OperatorRepository {
  getAuthenticatedAccountId(): Promise<string | null>;
  findOperatorIdForAccount(accountId: string): Promise<string | null>;
  findOperatorById(operatorId: string): Promise<OperatorRecord | null>;
  provisionOperator(
    accountId: string,
    command: OperatorProvisioningCommand,
    policy: OperatorCommissioningPolicy
  ): Promise<OperatorProvisioningResult>;
}

export interface OperatorControlDecisionRepository
  extends OperatorRepository {
  appendControlConsent(
    operatorId: string,
    command: OperatorConsentCommand,
    recordedAt: string,
    policy: OperatorControlPolicySet
  ): Promise<OperatorConsentCommand>;
  persistDeclarationRevision(
    operatorId: string,
    command: OperatorDeclarationCommand,
    revision: OperatorDeclarationRevision | OperatorDeclarationTombstone,
    policy: OperatorControlPolicySet
  ): Promise<OperatorDeclarationRevision | OperatorDeclarationTombstone>;
  listDeclarations(
    query: OperatorDeclarationQuery
  ): Promise<readonly (OperatorDeclarationRevision | OperatorDeclarationTombstone)[]>;
  listDeclarationLifecycle(
    query: OperatorDeclarationLifecycleQuery
  ): Promise<readonly (OperatorDeclarationRevision | OperatorDeclarationTombstone)[]>;
}

export type OperatorDeclarationQuery = Readonly<{
  operatorId: string;
  purpose: string;
  domain: "identity" | "preference" | "goal" | null;
  asOf: string;
  pageSize: number;
  afterEffectiveAt: string | null;
  afterRevisionId: string | null;
}>;

export type OperatorDeclarationLifecycleQuery = Readonly<{
  operatorId: string;
  declarationId: string;
  pageSize: number;
  beforeRevision: number | null;
}>;

const OPERATOR_COLUMNS = [
  "id",
  "email",
  "callsign",
  "designation",
  "primary_game",
  "combat_rating",
  "xp",
  "level",
  "total_sessions",
  "created_at",
].join(",");

export class SupabaseOperatorRepository
  implements OperatorControlDecisionRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly authorityClient: SupabaseClient = client
  ) {}

  async getAuthenticatedAccountId(): Promise<string | null> {
    const { data, error } = await this.authorityClient.auth.getUser();

    if (error && error.name !== "AuthSessionMissingError") {
      throw error;
    }

    return data.user?.id ?? null;
  }

  async findOperatorIdForAccount(accountId: string): Promise<string | null> {
    const { data, error } = await this.client
      .from("operator_account_bindings")
      .select("operator_id")
      .eq("account_id", accountId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.operator_id ?? null;
  }

  async findOperatorById(operatorId: string): Promise<OperatorRecord | null> {
    const { data, error } = await this.client
      .from("operators")
      .select(OPERATOR_COLUMNS)
      .eq("id", operatorId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as OperatorRecord | null;
  }

  async provisionOperator(
    accountId: string,
    command: OperatorProvisioningCommand,
    policy: OperatorCommissioningPolicy
  ): Promise<OperatorProvisioningResult> {
    const validated = createOperatorProvisioningCommand(command, policy);
    const { data, error } = await this.client.rpc(
      "provision_operator_for_account",
      {
        p_account_id: accountId,
        p_command: validated,
      }
    );

    if (error) {
      throw error;
    }

    return requireOperatorProvisioningResult(data);
  }

  async appendControlConsent(
    operatorId: string,
    command: OperatorConsentCommand,
    recordedAt: string,
    policy: OperatorControlPolicySet
  ): Promise<OperatorConsentCommand> {
    const validatedPolicy = createOperatorControlPolicySet(policy);
    const validated = createOperatorConsentCommand(command, validatedPolicy);
    const { data, error } = await this.client.rpc(
      "append_operator_control_consent_decision",
      {
        p_operator_id: operatorId,
        p_command: validated,
        p_recorded_at: recordedAt,
      }
    );

    if (error) {
      throw error;
    }

    return createOperatorConsentCommand(data, validatedPolicy);
  }

  async persistDeclarationRevision(
    operatorId: string,
    command: OperatorDeclarationCommand,
    revision: OperatorDeclarationRevision | OperatorDeclarationTombstone,
    policy: OperatorControlPolicySet
  ): Promise<OperatorDeclarationRevision | OperatorDeclarationTombstone> {
    const validatedPolicy = createOperatorControlPolicySet(policy);
    const validatedCommand = createOperatorDeclarationCommand(
      command,
      validatedPolicy
    );
    const validatedRevision = revision.status === "deleted"
      ? createOperatorDeclarationTombstone(revision)
      : createOperatorDeclarationRevision(revision);
    if (validatedRevision.operatorId !== operatorId) {
      throw new Error("Operator declaration Repository ownership mismatches.");
    }

    const { data, error } = await this.client.rpc(
      "persist_operator_declaration_revision",
      {
        p_operator_id: operatorId,
        p_command: validatedCommand,
        p_revision: validatedRevision,
      }
    );

    if (error) {
      throw error;
    }

    return validatedRevision.status === "deleted"
      ? createOperatorDeclarationTombstone(data)
      : createOperatorDeclarationRevision(data);
  }

  async listDeclarations(
    query: OperatorDeclarationQuery
  ): Promise<readonly (OperatorDeclarationRevision | OperatorDeclarationTombstone)[]> {
    assertOperatorPageSize(query.pageSize);
    const { data, error } = await this.client.rpc(
      "read_operator_declaration_page",
      {
        p_operator_id: query.operatorId,
        p_purpose: query.purpose,
        p_domain: query.domain,
        p_as_of: query.asOf,
        p_page_size: query.pageSize,
        p_after_effective_at: query.afterEffectiveAt,
        p_after_revision_id: query.afterRevisionId,
      }
    );
    if (error) {
      throw error;
    }
    return requireOperatorDeclarationRows(data, query.operatorId);
  }

  async listDeclarationLifecycle(
    query: OperatorDeclarationLifecycleQuery
  ): Promise<readonly (OperatorDeclarationRevision | OperatorDeclarationTombstone)[]> {
    assertOperatorPageSize(query.pageSize);
    const { data, error } = await this.client.rpc(
      "read_operator_declaration_lifecycle_page",
      {
        p_operator_id: query.operatorId,
        p_declaration_id: query.declarationId,
        p_page_size: query.pageSize,
        p_before_revision: query.beforeRevision,
      }
    );
    if (error) {
      throw error;
    }
    return requireOperatorDeclarationRows(data, query.operatorId);
  }
}

function requireOperatorProvisioningResult(
  value: unknown
): OperatorProvisioningResult {
  if (!isRecord(value) || !isRecord(value.operator)) {
    throw new Error("Operator provisioning response is invalid.");
  }

  if (value.outcome !== "created") {
    throw new Error("Operator provisioning outcome is invalid.");
  }

  const record = requireOperatorRecord(value.operator);
  if (!record.callsign || !record.designation) {
    throw new Error("Provisioned Operator identity is incomplete.");
  }

  return Object.freeze({
    outcome: value.outcome,
    operator: Object.freeze({
      ...record,
      callsign: record.callsign,
      designation: record.designation,
    }),
  });
}

function requireOperatorRecord(value: Record<string, unknown>): OperatorRecord {
  for (const field of ["id", "callsign", "designation", "created_at"] as const) {
    if (typeof value[field] !== "string" || value[field].length === 0) {
      throw new Error(`Operator provisioning ${field} is invalid.`);
    }
  }

  for (const field of ["xp", "level", "total_sessions"] as const) {
    if (!Number.isInteger(value[field])) {
      throw new Error(`Operator provisioning ${field} is invalid.`);
    }
  }

  for (const field of ["email", "primary_game", "combat_rating"] as const) {
    if (value[field] !== null && typeof value[field] !== "string") {
      throw new Error(`Operator provisioning ${field} is invalid.`);
    }
  }

  return value as OperatorRecord;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertOperatorPageSize(value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new Error("Operator declaration page size must be between 1 and 100.");
  }
}

function requireOperatorDeclarationRows(
  value: unknown,
  operatorId: string
): readonly (OperatorDeclarationRevision | OperatorDeclarationTombstone)[] {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !Array.isArray((value as { rows?: unknown }).rows)
  ) {
    throw new Error("Operator declaration page response is invalid.");
  }

  return (value as { rows: readonly unknown[] }).rows.map((row) => {
    if (typeof row !== "object" || row === null || Array.isArray(row)) {
      throw new Error("Operator declaration row is invalid.");
    }
    const status = (row as { status?: unknown }).status;
    const declaration = status === "deleted"
      ? createOperatorDeclarationTombstone(row)
      : createOperatorDeclarationRevision(row);
    if (declaration.operatorId !== operatorId) {
      throw new Error("Operator declaration page crossed Operator ownership.");
    }
    return declaration;
  });
}
