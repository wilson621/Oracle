import {
  type OracleSessionLifecycleRepository,
  OracleSessionRepositoryIdempotencyError,
} from "../../repositories/session-lifecycle-repository";
import {
  createOracleSession,
  createOracleSessionCommand,
  projectOracleSessionStatus,
  ORACLE_SESSION_CONTRACT,
  ORACLE_SESSION_CONTRACT_VERSION,
  type OracleSession,
  type OracleSessionCommand,
  type OracleSessionCommandReceipt,
  type OracleSessionHistoryPage,
  type OracleSessionHistoryQuery,
  type OracleSessionMutationResult,
  type OracleSessionStatusProjection,
} from "../../sessions";

export type AuthenticatedOracleSessionAuthority = Readonly<{
  accountId: string;
  operatorId: string;
}>;

export type OracleSessionServiceMetrics = Readonly<{
  commandAttempts: number;
  committedMutations: number;
  idempotentReplays: number;
  rejectedCommands: number;
}>;

export class OracleSessionService {
  private metrics = {
    commandAttempts: 0,
    committedMutations: 0,
    idempotentReplays: 0,
    rejectedCommands: 0,
  };

  constructor(private readonly repository: OracleSessionLifecycleRepository) {}

  async execute(
    authority: AuthenticatedOracleSessionAuthority,
    commandInput: OracleSessionCommand
  ): Promise<OracleSessionMutationResult> {
    this.metrics.commandAttempts += 1;
    try {
      const command = createOracleSessionCommand(commandInput);
      assertAuthority(authority, command.operatorId);
      const replay = await this.repository.findIdempotentResult(
        command.operatorId,
        command.idempotencyKey
      );
      if (replay) {
        if (JSON.stringify(replay.command) !== JSON.stringify(command)) {
          throw new OracleSessionRepositoryIdempotencyError();
        }
        this.metrics.idempotentReplays += 1;
        return Object.freeze({
          session: createOracleSession(replay.result.session),
          receipt: Object.freeze({
            ...replay.result.receipt,
            replayed: true,
          }),
        });
      }

      const current = await this.repository.findById(
        command.operatorId,
        command.sessionId
      );
      const session = transition(command, current);
      const result = Object.freeze({
        session,
        receipt: receipt(command, session, false),
      });
      const committed = await this.repository.commit(
        command,
        current?.version ?? null,
        result
      );
      this.metrics.committedMutations += 1;
      return committed;
    } catch (error) {
      this.metrics.rejectedCommands += 1;
      throw error;
    }
  }

  async getStatus(
    authority: AuthenticatedOracleSessionAuthority,
    sessionId: string
  ): Promise<OracleSessionStatusProjection | null> {
    const session = await this.repository.findById(
      authority.operatorId,
      sessionId
    );
    return session ? projectOracleSessionStatus(session) : null;
  }

  async listHistory(
    authority: AuthenticatedOracleSessionAuthority,
    query: Omit<OracleSessionHistoryQuery, "operatorId">
  ): Promise<OracleSessionHistoryPage> {
    return this.repository.list({
      ...query,
      operatorId: authority.operatorId,
    });
  }

  async exportSession(
    authority: AuthenticatedOracleSessionAuthority,
    sessionId: string
  ): Promise<Readonly<{ session: OracleSessionStatusProjection }> | null> {
    const session = await this.repository.findById(
      authority.operatorId,
      sessionId
    );
    return session
      ? Object.freeze({ session: projectOracleSessionStatus(session) })
      : null;
  }

  getMetrics(): OracleSessionServiceMetrics {
    return Object.freeze({ ...this.metrics });
  }
}

function transition(
  command: OracleSessionCommand,
  current: OracleSession | null
): OracleSession {
  if (command.type === "begin") {
    if (current) throw new Error("Oracle Session identity already exists.");
    if (command.expectedVersion !== null) {
      throw new Error("Begin Session cannot declare a previous version.");
    }
    return createOracleSession({
      contract: ORACLE_SESSION_CONTRACT,
      contractVersion: ORACLE_SESSION_CONTRACT_VERSION,
      id: command.sessionId,
      operatorId: command.operatorId,
      status: "active",
      version: 1,
      startedAt: command.occurredAt,
      updatedAt: command.occurredAt,
      endedAt: null,
      context: command.context,
      evidence: Object.freeze([]),
      deletionOperationId: null,
    });
  }
  if (!current) throw new Error("Oracle Session does not exist.");
  if (command.expectedVersion === null) {
    throw new Error("Existing Oracle Session command requires expectedVersion.");
  }
  if (command.expectedVersion !== current.version) {
    throw new Error("Oracle Session command has a stale expected version.");
  }

  switch (command.type) {
    case "resume":
    case "recover":
      requireStatus(current, ["active"], command.type);
      return evolve(current, command.occurredAt, {});
    case "complete":
      requireStatus(current, ["active"], command.type);
      return evolve(current, command.occurredAt, {
        status: "completed",
        endedAt: command.occurredAt,
      });
    case "abandon":
      requireStatus(current, ["active"], command.type);
      return evolve(current, command.occurredAt, {
        status: "abandoned",
        endedAt: command.occurredAt,
      });
    case "admit-evidence":
      requireStatus(current, ["active"], command.type);
      if (
        command.evidence.sourceType !== "operator-supplied" &&
        command.evidence.sourceOwnerId !== current.context.integrationId
      ) {
        throw new Error(
          "Game Session Evidence source owner must match the Session integration."
        );
      }
      if (current.evidence.some(({ id }) => id === command.evidence.id)) {
        throw new Error("Oracle Session Evidence identity already exists.");
      }
      return evolve(current, command.occurredAt, {
        evidence: Object.freeze([...current.evidence, command.evidence]),
      });
    case "delete":
      if (current.status === "deleted") {
        throw new Error("Deleted Oracle Session cannot be deleted again.");
      }
      return evolve(current, command.occurredAt, {
        status: "deletion-pending",
        deletionOperationId: command.deletionOperationId,
      });
    case "finalize-deletion":
      requireStatus(current, ["deletion-pending"], command.type);
      if (current.deletionOperationId !== command.deletionOperationId) {
        throw new Error("Session deletion operation identity mismatches.");
      }
      return evolve(current, command.occurredAt, {
        status: "deleted",
        endedAt: current.endedAt ?? command.occurredAt,
        evidence: Object.freeze([]),
      });
  }
}

function evolve(
  current: OracleSession,
  occurredAt: string,
  update: Partial<OracleSession>
): OracleSession {
  return createOracleSession({
    ...current,
    ...update,
    version: current.version + 1,
    updatedAt: occurredAt,
  });
}

function requireStatus(
  session: OracleSession,
  allowed: readonly OracleSession["status"][],
  operation: string
): void {
  if (!allowed.includes(session.status)) {
    throw new Error(
      `Oracle Session cannot ${operation} from '${session.status}'.`
    );
  }
}

function receipt(
  command: OracleSessionCommand,
  session: OracleSession,
  replayed: boolean
): OracleSessionCommandReceipt {
  return Object.freeze({
    commandId: command.commandId,
    idempotencyKey: command.idempotencyKey,
    commandType: command.type,
    operatorId: command.operatorId,
    sessionId: command.sessionId,
    sessionVersion: session.version,
    status: session.status,
    recordedAt: command.occurredAt,
    replayed,
  });
}

function assertAuthority(
  authority: AuthenticatedOracleSessionAuthority,
  operatorId: string
): void {
  if (!authority.accountId || authority.operatorId !== operatorId) {
    throw new Error(
      "Oracle Session command requires the authenticated owning Operator."
    );
  }
}
