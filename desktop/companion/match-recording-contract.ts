export const ORACLE_MATCH_RECORDING_CONTRACT =
  "oracle.companion-match-recording-state" as const;
export const ORACLE_MATCH_RECORDING_CONTRACT_VERSION = 1 as const;

export type OracleMatchRecordingStatus =
  | "idle"
  | "recording"
  | "stopped"
  | "unavailable";

export type OracleMatchRecordingFrameSummary = Readonly<{
  capturedAt: string;
  jpegBase64: string;
  diffScore: number;
}>;

export type OracleMatchRecordingState = Readonly<{
  contract: Readonly<{
    name: typeof ORACLE_MATCH_RECORDING_CONTRACT;
    version: typeof ORACLE_MATCH_RECORDING_CONTRACT_VERSION;
  }>;
  status: OracleMatchRecordingStatus;
  sessionId: string | null;
  startedAt: string | null;
  frameCount: number;
  message: string;
  updatedAt: string;
}>;

export type OracleMatchRecordingResult = Readonly<{
  sessionId: string;
  startedAt: string;
  stoppedAt: string;
  frames: readonly OracleMatchRecordingFrameSummary[];
}>;

export function createInitialOracleMatchRecordingState(
  updatedAt = new Date().toISOString()
): OracleMatchRecordingState {
  return createState({
    status: "idle",
    sessionId: null,
    startedAt: null,
    frameCount: 0,
    message: "Not watching. Attach Call of Duty and press Start Watching before a match.",
    updatedAt,
  });
}

export function createOracleMatchRecordingState(
  input: Omit<OracleMatchRecordingState, "contract">
): OracleMatchRecordingState {
  return createState(input);
}

export function isOracleMatchRecordingState(
  value: unknown
): value is OracleMatchRecordingState {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const contract = record.contract as Record<string, unknown> | undefined;
  const statuses = ["idle", "recording", "stopped", "unavailable"];
  return (
    !!contract &&
    contract.name === ORACLE_MATCH_RECORDING_CONTRACT &&
    contract.version === ORACLE_MATCH_RECORDING_CONTRACT_VERSION &&
    typeof record.status === "string" &&
    statuses.includes(record.status) &&
    (record.sessionId === null || typeof record.sessionId === "string") &&
    (record.startedAt === null || typeof record.startedAt === "string") &&
    typeof record.frameCount === "number" &&
    typeof record.message === "string" &&
    typeof record.updatedAt === "string"
  );
}

function createState(
  input: Omit<OracleMatchRecordingState, "contract">
): OracleMatchRecordingState {
  return Object.freeze({
    contract: {
      name: ORACLE_MATCH_RECORDING_CONTRACT,
      version: ORACLE_MATCH_RECORDING_CONTRACT_VERSION,
    },
    ...input,
  });
}
