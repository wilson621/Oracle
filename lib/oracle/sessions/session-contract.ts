import {
  ORACLE_SESSION_CONTRACT,
  ORACLE_SESSION_CONTRACT_VERSION,
  ORACLE_SESSION_CORRELATION_CONTRACT,
  ORACLE_SESSION_CORRELATION_VERSION,
  type OracleSession,
  type OracleSessionCommand,
  type OracleSessionCompanionCorrelation,
  type OracleSessionContext,
  type OracleSessionEvidenceReference,
  type OracleSessionStatusProjection,
} from "./session-types";

const IDENTITY = /^[a-z0-9][a-z0-9._:-]{0,127}$/u;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const SHA256 = /^sha256:[0-9a-f]{64}$/u;

export function createOracleSessionContext(
  input: OracleSessionContext
): OracleSessionContext {
  return Object.freeze({
    applicationId: requireIdentity(input.applicationId, "applicationId"),
    deviceId: requireIdentity(input.deviceId, "deviceId"),
    integrationId: requireIdentity(input.integrationId, "integrationId"),
    integrationVersion: requireVersion(
      input.integrationVersion,
      "integrationVersion"
    ),
  });
}

export function createOracleSessionEvidenceReference(
  input: OracleSessionEvidenceReference
): OracleSessionEvidenceReference {
  if (
    ![
      "game-integration-direct-observation",
      "game-integration-deterministic-transformation",
      "operator-supplied",
    ].includes(input.sourceType)
  ) {
    throw new Error("Oracle Session Evidence source type is unsupported.");
  }
  const observedAt = requireTimestamp(input.observedAt, "observedAt");
  const admittedAt = requireTimestamp(input.admittedAt, "admittedAt");
  if (Date.parse(admittedAt) < Date.parse(observedAt)) {
    throw new Error("Session Evidence cannot be admitted before observation.");
  }
  if (!SHA256.test(input.contentDigest)) {
    throw new Error("Session Evidence requires a SHA-256 content digest.");
  }
  return Object.freeze({
    id: requireUuid(input.id, "evidence.id"),
    sourceType: input.sourceType,
    sourceOwnerId: requireIdentity(input.sourceOwnerId, "sourceOwnerId"),
    sourceRecordId: requireIdentity(input.sourceRecordId, "sourceRecordId"),
    purpose: requireIdentity(input.purpose, "purpose"),
    policyId: requireIdentity(input.policyId, "policyId"),
    policyVersion: requireVersion(input.policyVersion, "policyVersion"),
    contentDigest: input.contentDigest,
    observedAt,
    admittedAt,
  });
}

export function createOracleSession(input: OracleSession): OracleSession {
  if (
    input.contract !== ORACLE_SESSION_CONTRACT ||
    input.contractVersion !== ORACLE_SESSION_CONTRACT_VERSION
  ) {
    throw new Error("Oracle Session contract identity is unsupported.");
  }
  if (
    ![
      "active",
      "completed",
      "abandoned",
      "deletion-pending",
      "deleted",
    ].includes(input.status)
  ) {
    throw new Error("Oracle Session status is unsupported.");
  }
  if (!Number.isInteger(input.version) || input.version < 1) {
    throw new Error("Oracle Session version must be a positive integer.");
  }
  const startedAt = requireTimestamp(input.startedAt, "startedAt");
  const updatedAt = requireTimestamp(input.updatedAt, "updatedAt");
  const endedAt =
    input.endedAt === null ? null : requireTimestamp(input.endedAt, "endedAt");
  if (Date.parse(updatedAt) < Date.parse(startedAt)) {
    throw new Error("Oracle Session cannot update before it starts.");
  }
  if (
    input.status !== "active" &&
    input.status !== "deletion-pending" &&
    input.status !== "deleted" &&
    endedAt === null
  ) {
    throw new Error("Terminal Oracle Session requires endedAt.");
  }
  return Object.freeze({
    contract: ORACLE_SESSION_CONTRACT,
    contractVersion: ORACLE_SESSION_CONTRACT_VERSION,
    id: requireUuid(input.id, "session.id"),
    operatorId: requireUuid(input.operatorId, "operatorId"),
    status: input.status,
    version: input.version,
    startedAt,
    updatedAt,
    endedAt,
    context: createOracleSessionContext(input.context),
    evidence: Object.freeze(
      input.evidence.map(createOracleSessionEvidenceReference)
    ),
    deletionOperationId:
      input.deletionOperationId === null
        ? null
        : requireUuid(input.deletionOperationId, "deletionOperationId"),
  });
}

export function createOracleSessionCommand<T extends OracleSessionCommand>(
  input: T
): T {
  requireUuid(input.commandId, "commandId");
  requireIdentity(input.idempotencyKey, "idempotencyKey");
  requireUuid(input.operatorId, "operatorId");
  requireTimestamp(input.occurredAt, "occurredAt");
  if (
    input.expectedVersion !== null &&
    (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 1)
  ) {
    throw new Error("Expected Session version must be null or positive.");
  }
  requireUuid(input.sessionId, "sessionId");
  if (input.type === "begin") createOracleSessionContext(input.context);
  if (input.type === "admit-evidence") {
    createOracleSessionEvidenceReference(input.evidence);
  }
  if (input.type === "delete" || input.type === "finalize-deletion") {
    requireUuid(input.deletionOperationId, "deletionOperationId");
  }
  return structuredClone(input);
}

export function createOracleSessionCompanionCorrelation(
  input: OracleSessionCompanionCorrelation
): OracleSessionCompanionCorrelation {
  if (
    input.contract !== ORACLE_SESSION_CORRELATION_CONTRACT ||
    input.contractVersion !== ORACLE_SESSION_CORRELATION_VERSION
  ) {
    throw new Error("Oracle Session Companion correlation is unsupported.");
  }
  return Object.freeze({
    contract: ORACLE_SESSION_CORRELATION_CONTRACT,
    contractVersion: ORACLE_SESSION_CORRELATION_VERSION,
    sessionId: requireUuid(input.sessionId, "sessionId"),
    operatorId: requireUuid(input.operatorId, "operatorId"),
    desktopSessionId: requireUuid(input.desktopSessionId, "desktopSessionId"),
    deviceId: requireIdentity(input.deviceId, "deviceId"),
    integrationId: requireIdentity(input.integrationId, "integrationId"),
    integrationVersion: requireVersion(
      input.integrationVersion,
      "integrationVersion"
    ),
    establishedAt: requireTimestamp(input.establishedAt, "establishedAt"),
  });
}

export function projectOracleSessionStatus(
  session: OracleSession
): OracleSessionStatusProjection {
  const validated = createOracleSession(session);
  return Object.freeze({
    contract: "oracle.session-status",
    contractVersion: 1,
    id: validated.id,
    status: validated.status,
    version: validated.version,
    startedAt: validated.startedAt,
    updatedAt: validated.updatedAt,
    endedAt: validated.endedAt,
    applicationId: validated.context.applicationId,
    integrationId: validated.context.integrationId,
    integrationVersion: validated.context.integrationVersion,
    evidenceCount: validated.evidence.length,
    deletionPending: validated.status === "deletion-pending",
  });
}

function requireUuid(value: string, path: string): string {
  if (!UUID.test(value)) throw new Error(`${path} must be a UUID.`);
  return value.toLowerCase();
}

function requireIdentity(value: string, path: string): string {
  if (!IDENTITY.test(value)) {
    throw new Error(`${path} must be a bounded canonical identity.`);
  }
  return value;
}

function requireVersion(value: string, path: string): string {
  if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/u.test(value)) {
    throw new Error(`${path} must be a semantic version.`);
  }
  return value;
}

function requireTimestamp(value: string, path: string): string {
  if (!Number.isFinite(Date.parse(value)) || !value.endsWith("Z")) {
    throw new Error(`${path} must be a UTC ISO 8601 timestamp.`);
  }
  return value;
}
