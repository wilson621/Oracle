export const ORACLE_SESSION_CONTRACT = "oracle.session" as const;
export const ORACLE_SESSION_CONTRACT_VERSION = 1 as const;
export const ORACLE_SESSION_CORRELATION_CONTRACT =
  "oracle.session-companion-correlation" as const;
export const ORACLE_SESSION_CORRELATION_VERSION = 1 as const;

export type OracleSessionStatus =
  | "active"
  | "completed"
  | "abandoned"
  | "deletion-pending"
  | "deleted";

export type OracleSessionContext = Readonly<{
  applicationId: string;
  deviceId: string;
  integrationId: string;
  integrationVersion: string;
}>;

export type OracleSessionEvidenceReference = Readonly<{
  id: string;
  sourceType:
    | "game-integration-direct-observation"
    | "game-integration-deterministic-transformation"
    | "operator-supplied";
  sourceOwnerId: string;
  sourceRecordId: string;
  purpose: string;
  policyId: string;
  policyVersion: string;
  contentDigest: string;
  observedAt: string;
  admittedAt: string;
}>;

export type OracleSession = Readonly<{
  contract: typeof ORACLE_SESSION_CONTRACT;
  contractVersion: typeof ORACLE_SESSION_CONTRACT_VERSION;
  id: string;
  operatorId: string;
  status: OracleSessionStatus;
  version: number;
  startedAt: string;
  updatedAt: string;
  endedAt: string | null;
  context: OracleSessionContext;
  evidence: readonly OracleSessionEvidenceReference[];
  deletionOperationId: string | null;
}>;

export type OracleSessionCommandBase = Readonly<{
  commandId: string;
  idempotencyKey: string;
  operatorId: string;
  occurredAt: string;
  expectedVersion: number | null;
}>;

export type BeginOracleSessionCommand = OracleSessionCommandBase &
  Readonly<{
    type: "begin";
    sessionId: string;
    context: OracleSessionContext;
  }>;

export type ResumeOracleSessionCommand = OracleSessionCommandBase &
  Readonly<{ type: "resume"; sessionId: string }>;

export type CompleteOracleSessionCommand = OracleSessionCommandBase &
  Readonly<{ type: "complete"; sessionId: string }>;

export type AbandonOracleSessionCommand = OracleSessionCommandBase &
  Readonly<{ type: "abandon"; sessionId: string }>;

export type RecoverOracleSessionCommand = OracleSessionCommandBase &
  Readonly<{ type: "recover"; sessionId: string }>;

export type AdmitOracleSessionEvidenceCommand = OracleSessionCommandBase &
  Readonly<{
    type: "admit-evidence";
    sessionId: string;
    evidence: OracleSessionEvidenceReference;
  }>;

export type DeleteOracleSessionCommand = OracleSessionCommandBase &
  Readonly<{
    type: "delete";
    sessionId: string;
    deletionOperationId: string;
  }>;

export type FinalizeOracleSessionDeletionCommand = OracleSessionCommandBase &
  Readonly<{
    type: "finalize-deletion";
    sessionId: string;
    deletionOperationId: string;
  }>;

export type OracleSessionCommand =
  | BeginOracleSessionCommand
  | ResumeOracleSessionCommand
  | CompleteOracleSessionCommand
  | AbandonOracleSessionCommand
  | RecoverOracleSessionCommand
  | AdmitOracleSessionEvidenceCommand
  | DeleteOracleSessionCommand
  | FinalizeOracleSessionDeletionCommand;

export type OracleSessionCommandReceipt = Readonly<{
  commandId: string;
  idempotencyKey: string;
  commandType: OracleSessionCommand["type"];
  operatorId: string;
  sessionId: string;
  sessionVersion: number;
  status: OracleSessionStatus;
  recordedAt: string;
  replayed: boolean;
}>;

export type OracleSessionMutationResult = Readonly<{
  session: OracleSession;
  receipt: OracleSessionCommandReceipt;
}>;

export type OracleSessionHistoryQuery = Readonly<{
  operatorId: string;
  statuses: readonly OracleSessionStatus[];
  integrationId: string | null;
  search: string | null;
  pageSize: number;
  beforeStartedAt: string | null;
  beforeSessionId: string | null;
}>;

export type OracleSessionHistoryPage = Readonly<{
  sessions: readonly OracleSession[];
  nextCursor: Readonly<{
    beforeStartedAt: string;
    beforeSessionId: string;
  }> | null;
}>;

export type OracleSessionCompanionCorrelation = Readonly<{
  contract: typeof ORACLE_SESSION_CORRELATION_CONTRACT;
  contractVersion: typeof ORACLE_SESSION_CORRELATION_VERSION;
  sessionId: string;
  operatorId: string;
  desktopSessionId: string;
  deviceId: string;
  integrationId: string;
  integrationVersion: string;
  establishedAt: string;
}>;

export type OracleSessionStatusProjection = Readonly<{
  contract: "oracle.session-status";
  contractVersion: 1;
  id: string;
  status: OracleSessionStatus;
  version: number;
  startedAt: string;
  updatedAt: string;
  endedAt: string | null;
  applicationId: string;
  integrationId: string;
  integrationVersion: string;
  evidenceCount: number;
  deletionPending: boolean;
}>;
