import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createOracleSession,
  createOracleSessionCommand,
  type OracleSession,
  type OracleSessionCommand,
  type OracleSessionHistoryPage,
  type OracleSessionHistoryQuery,
  type OracleSessionMutationResult,
} from "../sessions";
import {
  OracleSessionRepositoryConflictError,
  OracleSessionRepositoryIdempotencyError,
  type OracleSessionLifecycleRepository,
} from "./session-lifecycle-repository";

export class SupabaseOracleSessionLifecycleRepository
  implements OracleSessionLifecycleRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async findById(
    operatorId: string,
    sessionId: string
  ): Promise<OracleSession | null> {
    const { data, error } = await this.client
      .from("oracle_sessions")
      .select("session_contract")
      .eq("operator_id", operatorId)
      .eq("id", sessionId)
      .maybeSingle();
    if (error) throw error;
    return data ? createOracleSession(data.session_contract) : null;
  }

  async findIdempotentResult(
    operatorId: string,
    idempotencyKey: string
  ) {
    const { data, error } = await this.client
      .from("oracle_session_command_receipts")
      .select("command_contract,result_contract")
      .eq("operator_id", operatorId)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return Object.freeze({
      command: createOracleSessionCommand(data.command_contract),
      result: requireResult(data.result_contract),
    });
  }

  async commit(
    command: OracleSessionCommand,
    previousVersion: number | null,
    result: OracleSessionMutationResult
  ): Promise<OracleSessionMutationResult> {
    if (command.expectedVersion !== previousVersion) {
      throw new OracleSessionRepositoryConflictError();
    }
    const canonical = JSON.stringify(command);
    const digest = `sha256:${createHash("sha256")
      .update(canonical)
      .digest("hex")}`;
    const { data, error } = await this.client.rpc(
      "persist_oracle_session_mutation",
      {
        p_operator_id: command.operatorId,
        p_command_digest: digest,
        p_command: command,
        p_session: result.session,
        p_receipt: result.receipt,
      }
    );
    if (error) throw translate(error);
    return requireResult(data);
  }

  async list(query: OracleSessionHistoryQuery): Promise<OracleSessionHistoryPage> {
    if (
      !Number.isInteger(query.pageSize) ||
      query.pageSize < 1 ||
      query.pageSize > 100
    ) {
      throw new Error("Oracle Session page size must be between 1 and 100.");
    }
    let request = this.client
      .from("oracle_sessions")
      .select("session_contract")
      .eq("operator_id", query.operatorId)
      .eq("eligible", true)
      .order("started_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(query.pageSize + 1);
    if (query.statuses.length > 0) {
      request = request.in("lifecycle_status", [...query.statuses]);
    }
    if (query.integrationId) {
      request = request.eq("integration_id", query.integrationId);
    }
    if (query.search) {
      const term = query.search.replace(/[%_,()]/gu, "");
      request = request.or(
        `id.eq.${term},application_id.ilike.%${term}%,integration_id.ilike.%${term}%`
      );
    }
    if (query.beforeStartedAt && query.beforeSessionId) {
      request = request.or(
        `started_at.lt.${query.beforeStartedAt},and(started_at.eq.${query.beforeStartedAt},id.lt.${query.beforeSessionId})`
      );
    }
    const { data, error } = await request;
    if (error) throw error;
    const rows = data ?? [];
    const hasNext = rows.length > query.pageSize;
    const sessions = rows
      .slice(0, query.pageSize)
      .map((row) => createOracleSession(row.session_contract));
    const last = sessions.at(-1);
    return Object.freeze({
      sessions: Object.freeze(sessions),
      nextCursor:
        hasNext && last
          ? Object.freeze({
              beforeStartedAt: last.startedAt,
              beforeSessionId: last.id,
            })
          : null,
    });
  }
}

function requireResult(value: unknown): OracleSessionMutationResult {
  if (
    typeof value !== "object" ||
    value === null ||
    !("session" in value) ||
    !("receipt" in value)
  ) {
    throw new Error("Oracle Session persistence result is invalid.");
  }
  const input = value as OracleSessionMutationResult;
  return Object.freeze({
    session: createOracleSession(input.session),
    receipt: Object.freeze({ ...input.receipt }),
  });
}

function translate(error: unknown): Error {
  if (typeof error !== "object" || error === null) {
    return new Error("Oracle Session persistence failed.");
  }
  const code = "code" in error ? String(error.code) : "";
  if (code === "23505") return new OracleSessionRepositoryIdempotencyError();
  if (code === "40001") return new OracleSessionRepositoryConflictError();
  return error instanceof Error
    ? error
    : new Error("Oracle Session persistence failed.");
}
