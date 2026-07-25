import type {
  OracleGameIntegrationCertificateState,
} from "../../lib/oracle/game-integrations/compatibility/index.js";

export const ORACLE_COMPANION_SCREEN_OBSERVATION_CONTRACT =
  "oracle.companion-screen-observation-state" as const;
export const ORACLE_COMPANION_SCREEN_OBSERVATION_CONTRACT_VERSION = 1 as const;

export type OracleCompanionScreenObservationControl =
  Readonly<{
    action: "enable" | "observe" | "pause" | "revoke";
    locale: "en-US";
    uiScale: 3;
    displayMode: "windowed" | "borderless-windowed";
    playerMode: "single-player";
  }>;

export type OracleCompanionDerivedScreenObservation =
  Readonly<{
    kind: "visible-game-frame";
    purpose: "minecraft-diamond-discovery";
    confidence: Readonly<{
      score: number;
      level: "low" | "medium" | "high";
      rationale: string;
    }>;
    observedAt: string;
    expiresAt: string;
    authoritative: false;
  }>;

export type OracleCompanionScreenObservationState =
  Readonly<{
    contract: Readonly<{
      name: typeof ORACLE_COMPANION_SCREEN_OBSERVATION_CONTRACT;
      version: typeof ORACLE_COMPANION_SCREEN_OBSERVATION_CONTRACT_VERSION;
    }>;
    status: "disabled" | "ready" | "observing" | "paused" | "unavailable";
    active: boolean;
    consented: boolean;
    indicator: "observation-off" | "observation-on" | "observation-paused";
    gameIntegrationId: "minecraft-java" | null;
    certificateState: OracleGameIntegrationCertificateState | null;
    latestObservation: OracleCompanionDerivedScreenObservation | null;
    message: string;
    updatedAt: string;
  }>;

export function createOracleCompanionScreenObservationControl(
  value: unknown
): OracleCompanionScreenObservationControl {
  if (!isRecord(value) || Reflect.ownKeys(value).length !== 5) {
    throw new Error("Companion screen observation control shape is invalid.");
  }
  const actions = ["enable", "observe", "pause", "revoke"] as const;
  if (
    typeof value.action !== "string" ||
    !actions.includes(value.action as (typeof actions)[number]) ||
    value.locale !== "en-US" ||
    value.uiScale !== 3 ||
    (value.displayMode !== "windowed" &&
      value.displayMode !== "borderless-windowed") ||
    value.playerMode !== "single-player"
  ) {
    throw new Error(
      "Companion screen observation control is outside the certified profile."
    );
  }
  return Object.freeze({
    action: value.action as OracleCompanionScreenObservationControl["action"],
    locale: "en-US",
    uiScale: 3,
    displayMode: value.displayMode,
    playerMode: "single-player",
  });
}

export function createInitialOracleCompanionScreenObservationState(
  updatedAt = new Date().toISOString()
): OracleCompanionScreenObservationState {
  return createState({
    status: "disabled",
    active: false,
    consented: false,
    indicator: "observation-off",
    gameIntegrationId: null,
    certificateState: null,
    latestObservation: null,
    message: "Local screen observation is off.",
    updatedAt,
  });
}

export function createOracleCompanionScreenObservationState(
  input: Omit<OracleCompanionScreenObservationState, "contract">
): OracleCompanionScreenObservationState {
  return createState(input);
}

export function isOracleCompanionScreenObservationState(
  value: unknown
): value is OracleCompanionScreenObservationState {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "contract",
      "status",
      "active",
      "consented",
      "indicator",
      "gameIntegrationId",
      "certificateState",
      "latestObservation",
      "message",
      "updatedAt",
    ]) &&
    isRecord(value.contract) &&
    hasExactKeys(value.contract, ["name", "version"]) &&
    value.contract.name === ORACLE_COMPANION_SCREEN_OBSERVATION_CONTRACT &&
    value.contract.version ===
      ORACLE_COMPANION_SCREEN_OBSERVATION_CONTRACT_VERSION &&
    isStatePayload(value)
  );
}

function createState(
  input: Omit<OracleCompanionScreenObservationState, "contract">
): OracleCompanionScreenObservationState {
  if (!isStatePayload(input as unknown as Record<string, unknown>)) {
    throw new Error("Companion screen observation state is invalid.");
  }
  return deepFreeze({
    contract: {
      name: ORACLE_COMPANION_SCREEN_OBSERVATION_CONTRACT,
      version: ORACLE_COMPANION_SCREEN_OBSERVATION_CONTRACT_VERSION,
    },
    ...input,
    message: input.message.trim(),
  });
}

function isStatePayload(value: Record<string, unknown>): boolean {
  const statuses = ["disabled", "ready", "observing", "paused", "unavailable"];
  const indicators = [
    "observation-off",
    "observation-on",
    "observation-paused",
  ];
  const certificateStates = [
    "certified",
    "provisionally-certified",
    "expired",
    "revoked",
  ];
  return (
    typeof value.status === "string" &&
    statuses.includes(value.status) &&
    typeof value.active === "boolean" &&
    typeof value.consented === "boolean" &&
    typeof value.indicator === "string" &&
    indicators.includes(value.indicator) &&
    (value.gameIntegrationId === null ||
      value.gameIntegrationId === "minecraft-java") &&
    (value.certificateState === null ||
      (typeof value.certificateState === "string" &&
        certificateStates.includes(value.certificateState))) &&
    (value.latestObservation === null ||
      isDerivedObservation(value.latestObservation)) &&
    typeof value.message === "string" &&
    value.message.trim().length > 0 &&
    isIsoTimestamp(value.updatedAt) &&
    (value.status !== "observing" || value.active === true) &&
    (value.active === false || value.consented === true)
  );
}

function isDerivedObservation(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "purpose",
      "confidence",
      "observedAt",
      "expiresAt",
      "authoritative",
    ]) &&
    value.kind === "visible-game-frame" &&
    value.purpose === "minecraft-diamond-discovery" &&
    value.authoritative === false &&
    isRecord(value.confidence) &&
    hasExactKeys(value.confidence, ["score", "level", "rationale"]) &&
    typeof value.confidence.score === "number" &&
    value.confidence.score >= 0 &&
    value.confidence.score <= 1 &&
    (value.confidence.level === "low" ||
      value.confidence.level === "medium" ||
      value.confidence.level === "high") &&
    typeof value.confidence.rationale === "string" &&
    value.confidence.rationale.length > 0 &&
    isIsoTimestamp(value.observedAt) &&
    isIsoTimestamp(value.expiresAt) &&
    Date.parse(value.expiresAt) > Date.parse(value.observedAt)
  );
}

function hasExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[]
): boolean {
  const keys = Reflect.ownKeys(value);
  return (
    keys.length === expected.length &&
    expected.every((key) => keys.includes(key))
  );
}

function isIsoTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}
