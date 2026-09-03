export const ORACLE_MATCH_VIDEO_RECORDING_CONTRACT =
  "oracle.companion-match-video-recording-state" as const;
export const ORACLE_MATCH_VIDEO_RECORDING_CONTRACT_VERSION = 1 as const;

export type OracleMatchVideoRecordingStatus =
  | "idle"
  | "recording"
  | "stopped"
  | "unavailable";

export type OracleMatchVideoRecordingState = Readonly<{
  contract: Readonly<{
    name: typeof ORACLE_MATCH_VIDEO_RECORDING_CONTRACT;
    version: typeof ORACLE_MATCH_VIDEO_RECORDING_CONTRACT_VERSION;
  }>;
  status: OracleMatchVideoRecordingStatus;
  sessionId: string | null;
  startedAt: string | null;
  elapsedMs: number;
  message: string;
  updatedAt: string;
}>;

/**
 * Handed back once a Full Match Analysis recording is stopped. videoPath
 * points at a file already on disk (written incrementally as the hidden
 * recorder window streamed MediaRecorder chunks over IPC, never held
 * entirely in memory) -- the caller is responsible for uploading it and,
 * per the agreed retention policy, deleting it once a report is generated.
 *
 * matchStartOffsetMs is a best-effort estimate, from local motion sampling,
 * of how far into the video the actual match likely begins (as opposed to
 * lobby/loadout/deploy-screen time beforehand). It is purely a quality hint
 * passed to Gemini's timestamp-aware prompting -- null whenever the
 * estimate isn't confident, in which case the whole video is analysed with
 * no hint and nothing about upload cost changes either way.
 */
export type OracleMatchVideoRecordingResult = Readonly<{
  sessionId: string;
  startedAt: string;
  stoppedAt: string;
  videoPath: string;
  mimeType: string;
  hasAudio: boolean;
  sizeBytes: number;
  durationMs: number;
  matchStartOffsetMs: number | null;
}>;

export function createInitialOracleMatchVideoRecordingState(
  updatedAt = new Date().toISOString()
): OracleMatchVideoRecordingState {
  return createState({
    status: "idle",
    sessionId: null,
    startedAt: null,
    elapsedMs: 0,
    message:
      "Not recording. Attach Call of Duty and start Full Match Analysis before a match.",
    updatedAt,
  });
}

export function createOracleMatchVideoRecordingState(
  input: Omit<OracleMatchVideoRecordingState, "contract">
): OracleMatchVideoRecordingState {
  return createState(input);
}

export function isOracleMatchVideoRecordingState(
  value: unknown
): value is OracleMatchVideoRecordingState {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const contract = record.contract as Record<string, unknown> | undefined;
  const statuses = ["idle", "recording", "stopped", "unavailable"];
  return (
    !!contract &&
    contract.name === ORACLE_MATCH_VIDEO_RECORDING_CONTRACT &&
    contract.version === ORACLE_MATCH_VIDEO_RECORDING_CONTRACT_VERSION &&
    typeof record.status === "string" &&
    statuses.includes(record.status) &&
    (record.sessionId === null || typeof record.sessionId === "string") &&
    (record.startedAt === null || typeof record.startedAt === "string") &&
    typeof record.elapsedMs === "number" &&
    typeof record.message === "string" &&
    typeof record.updatedAt === "string"
  );
}

function createState(
  input: Omit<OracleMatchVideoRecordingState, "contract">
): OracleMatchVideoRecordingState {
  return Object.freeze({
    contract: {
      name: ORACLE_MATCH_VIDEO_RECORDING_CONTRACT,
      version: ORACLE_MATCH_VIDEO_RECORDING_CONTRACT_VERSION,
    },
    ...input,
  });
}
