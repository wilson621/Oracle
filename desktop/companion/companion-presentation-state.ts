import type {
  OracleCompanionSession,
} from "./companion-session.js";

export const ORACLE_COMPANION_PRESENTATION_CONTRACT =
  "oracle.companion-presentation-state" as const;

export const ORACLE_COMPANION_PRESENTATION_CONTRACT_VERSION =
  1 as const;

export type OracleCompanionActiveGamePresentation =
  Readonly<{
    integrationId: string;
    displayName: string;
  }>;

type OracleCompanionPresentationStateBase =
  Readonly<{
    contract: Readonly<{
      name:
        typeof ORACLE_COMPANION_PRESENTATION_CONTRACT;

      version:
        typeof ORACLE_COMPANION_PRESENTATION_CONTRACT_VERSION;
    }>;

    /**
     * UTC ISO 8601 timestamp produced by Date.prototype.toISOString().
     */
    capturedAt: string;
  }>;

export type OracleCompanionPresentationState =
  OracleCompanionPresentationStateBase &
    (
      | Readonly<{
          status:
            | "unavailable"
            | "starting"
            | "ready";

          activeGame: null;
        }>
      | Readonly<{
          status: "attached";

          activeGame:
            OracleCompanionActiveGamePresentation;
        }>
    );

export function createOracleCompanionPresentationState(
  session:
    OracleCompanionSession | null,
  capturedAt =
    new Date().toISOString()
): OracleCompanionPresentationState {
  if (!isIsoTimestamp(capturedAt)) {
    throw new Error(
      "Oracle Companion presentation capturedAt must be a UTC ISO 8601 timestamp."
    );
  }

  const contract =
    createContract();

  if (!session) {
    return Object.freeze({
      contract,
      capturedAt,
      status: "unavailable",
      activeGame: null,
    });
  }

  if (session.status === "created") {
    return Object.freeze({
      contract,
      capturedAt,
      status: "starting",
      activeGame: null,
    });
  }

  if (session.status === "ready") {
    return Object.freeze({
      contract,
      capturedAt,
      status: "ready",
      activeGame: null,
    });
  }

  const game =
    session.currentContext?.game ??
    null;

  if (
    session.status !== "attached" ||
    !game
  ) {
    return Object.freeze({
      contract,
      capturedAt,
      status: "unavailable",
      activeGame: null,
    });
  }

  return Object.freeze({
    contract,
    capturedAt,
    status: "attached",

    activeGame:
      Object.freeze({
        integrationId:
          game.integrationId,

        displayName:
          game.gameName,
      }),
  });
}

export function isOracleCompanionPresentationState(
  value: unknown
): value is OracleCompanionPresentationState {
  if (!isRecord(value)) {
    return false;
  }

  if (
    !hasExactKeys(
      value,
      [
        "contract",
        "capturedAt",
        "status",
        "activeGame",
      ]
    )
  ) {
    return false;
  }

  if (
    !isContract(value.contract) ||
    !isIsoTimestamp(
      value.capturedAt
    )
  ) {
    return false;
  }

  if (
    value.status ===
      "unavailable" ||
    value.status === "starting" ||
    value.status === "ready"
  ) {
    return value.activeGame === null;
  }

  return (
    value.status === "attached" &&
    isActiveGame(value.activeGame)
  );
}

function createContract() {
  return Object.freeze({
    name:
      ORACLE_COMPANION_PRESENTATION_CONTRACT,

    version:
      ORACLE_COMPANION_PRESENTATION_CONTRACT_VERSION,
  });
}

function isContract(
  value: unknown
): boolean {
  return (
    isRecord(value) &&
    hasExactKeys(
      value,
      ["name", "version"]
    ) &&
    value.name ===
      ORACLE_COMPANION_PRESENTATION_CONTRACT &&
    value.version ===
      ORACLE_COMPANION_PRESENTATION_CONTRACT_VERSION
  );
}

function isActiveGame(
  value: unknown
): boolean {
  return (
    isRecord(value) &&
    hasExactKeys(
      value,
      [
        "integrationId",
        "displayName",
      ]
    ) &&
    isNonEmptyString(
      value.integrationId
    ) &&
    isNonEmptyString(
      value.displayName
    )
  );
}

function isIsoTimestamp(
  value: unknown
): boolean {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const timestamp =
    Date.parse(value);

  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp)
      .toISOString() === value
  );
}

function isNonEmptyString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[]
): boolean {
  const keys =
    Reflect.ownKeys(value);

  return (
    keys.length ===
      expectedKeys.length &&
    expectedKeys.every(
      (key) =>
        keys.includes(key)
    )
  );
}
