import {
  createOracleSession,
  createOracleSessionCommand,
  type OracleSession,
  type OracleSessionCommand,
  type OracleSessionHistoryPage,
  type OracleSessionHistoryQuery,
  type OracleSessionMutationResult,
} from "../sessions";

export interface OracleSessionLifecycleRepository {
  findById(operatorId: string, sessionId: string): Promise<OracleSession | null>;
  findIdempotentResult(
    operatorId: string,
    idempotencyKey: string
  ): Promise<
    Readonly<{
      command: OracleSessionCommand;
      result: OracleSessionMutationResult;
    }> | null
  >;
  commit(
    command: OracleSessionCommand,
    previousVersion: number | null,
    result: OracleSessionMutationResult
  ): Promise<OracleSessionMutationResult>;
  list(query: OracleSessionHistoryQuery): Promise<OracleSessionHistoryPage>;
}

export class OracleSessionRepositoryConflictError extends Error {
  readonly code = "ORACLE_SESSION_STALE_CONCURRENCY";

  constructor() {
    super("Oracle Session mutation lost an optimistic concurrency race.");
    this.name = "OracleSessionRepositoryConflictError";
  }
}

export class OracleSessionRepositoryIdempotencyError extends Error {
  readonly code = "ORACLE_SESSION_IDEMPOTENCY_CONFLICT";

  constructor() {
    super("Oracle Session idempotency key was reused for another command.");
    this.name = "OracleSessionRepositoryIdempotencyError";
  }
}

export class InMemoryOracleSessionLifecycleRepository
  implements OracleSessionLifecycleRepository
{
  private readonly sessions = new Map<string, OracleSession>();
  private readonly receipts = new Map<
    string,
    Readonly<{
      command: OracleSessionCommand;
      result: OracleSessionMutationResult;
    }>
  >();

  async findById(
    operatorId: string,
    sessionId: string
  ): Promise<OracleSession | null> {
    const session = this.sessions.get(key(operatorId, sessionId));
    return session ? createOracleSession(session) : null;
  }

  async findIdempotentResult(
    operatorId: string,
    idempotencyKey: string
  ) {
    const value = this.receipts.get(key(operatorId, idempotencyKey));
    return value ? structuredClone(value) : null;
  }

  async commit(
    command: OracleSessionCommand,
    previousVersion: number | null,
    result: OracleSessionMutationResult
  ): Promise<OracleSessionMutationResult> {
    const validatedCommand = createOracleSessionCommand(command);
    const receiptKey = key(command.operatorId, command.idempotencyKey);
    const replay = this.receipts.get(receiptKey);
    if (replay) {
      if (JSON.stringify(replay.command) !== JSON.stringify(validatedCommand)) {
        throw new OracleSessionRepositoryIdempotencyError();
      }
      return structuredClone(replay.result);
    }

    const sessionKey = key(command.operatorId, command.sessionId);
    const current = this.sessions.get(sessionKey);
    if (
      (previousVersion === null && current !== undefined) ||
      (previousVersion !== null && current?.version !== previousVersion)
    ) {
      throw new OracleSessionRepositoryConflictError();
    }

    const session = createOracleSession(result.session);
    const committed = Object.freeze({
      session,
      receipt: Object.freeze({ ...result.receipt }),
    });
    this.sessions.set(sessionKey, session);
    this.receipts.set(
      receiptKey,
      Object.freeze({
        command: structuredClone(validatedCommand),
        result: committed,
      })
    );
    return structuredClone(committed);
  }

  async list(query: OracleSessionHistoryQuery): Promise<OracleSessionHistoryPage> {
    assertQuery(query);
    const statusSet = new Set(query.statuses);
    const search = query.search?.trim().toLowerCase() ?? null;
    const sessions = [...this.sessions.values()]
      .filter((session) => session.operatorId === query.operatorId)
      .filter(
        (session) =>
          session.status !== "deletion-pending" &&
          session.status !== "deleted"
      )
      .filter(
        (session) =>
          session.status !== "deletion-pending" &&
          session.status !== "deleted"
      )
      .filter((session) => statusSet.size === 0 || statusSet.has(session.status))
      .filter(
        (session) =>
          query.integrationId === null ||
          session.context.integrationId === query.integrationId
      )
      .filter(
        (session) =>
          search === null ||
          session.id.includes(search) ||
          session.context.applicationId.toLowerCase().includes(search) ||
          session.context.integrationId.toLowerCase().includes(search)
      )
      .filter(
        (session) =>
          query.beforeStartedAt === null ||
          session.startedAt < query.beforeStartedAt ||
          (session.startedAt === query.beforeStartedAt &&
            query.beforeSessionId !== null &&
            session.id < query.beforeSessionId)
      )
      .sort(
        (left, right) =>
          right.startedAt.localeCompare(left.startedAt) ||
          right.id.localeCompare(left.id)
      );
    const selected = sessions.slice(0, query.pageSize);
    const last = selected.at(-1);
    return Object.freeze({
      sessions: Object.freeze(selected.map(createOracleSession)),
      nextCursor:
        sessions.length > selected.length && last
          ? Object.freeze({
              beforeStartedAt: last.startedAt,
              beforeSessionId: last.id,
            })
          : null,
    });
  }
}

function key(left: string, right: string): string {
  return `${left}|${right}`;
}

function assertQuery(query: OracleSessionHistoryQuery): void {
  if (!Number.isInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 100) {
    throw new Error("Oracle Session page size must be between 1 and 100.");
  }
  if ((query.beforeStartedAt === null) !== (query.beforeSessionId === null)) {
    throw new Error("Oracle Session cursor fields must be supplied together.");
  }
}
