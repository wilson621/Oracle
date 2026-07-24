import type { OraclePlatformState } from "./platform-types";

export const ORACLE_PLATFORM_HEALTH_CONTRACT = "oracle.platform-health";
export const ORACLE_PLATFORM_HEALTH_CONTRACT_VERSION = 1;

export type OraclePlatformHealthSnapshot = Readonly<{
  contract: typeof ORACLE_PLATFORM_HEALTH_CONTRACT;
  contractVersion: typeof ORACLE_PLATFORM_HEALTH_CONTRACT_VERSION;
  capturedAt: string;
  attempt: number;
  target: "web" | "electron";
  manifestVersion: string;
  manifestVerified: boolean;
  status: OraclePlatformState["status"];
  phase: OraclePlatformState["phase"];
  subsystems: readonly Readonly<{
    id: string;
    required: boolean;
    status: string;
    message: string;
  }>[];
  capabilities: Readonly<{
    services: readonly string[];
    applications: readonly string[];
    gameIntegrations: readonly string[];
    guidanceProviders: readonly string[];
  }>;
  diagnostics: readonly Readonly<{
    code: string;
    level: string;
    message: string;
    subsystemId: string | null;
  }>[];
}>;

export function createOraclePlatformHealthSnapshot(
  state: OraclePlatformState,
  attempt: number
): OraclePlatformHealthSnapshot {
  return Object.freeze({
    contract: ORACLE_PLATFORM_HEALTH_CONTRACT,
    contractVersion: ORACLE_PLATFORM_HEALTH_CONTRACT_VERSION,
    capturedAt: new Date().toISOString(),
    attempt,
    target: state.manifest.target,
    manifestVersion: state.manifest.manifestVersion,
    manifestVerified: state.manifestVerified,
    status: state.status,
    phase: state.phase,
    subsystems: Object.freeze(
      state.subsystems.map(({ id, required, status, message }) =>
        Object.freeze({
          id,
          required,
          status,
          message: sanitizeHealthText(message),
        })
      )
    ),
    capabilities: Object.freeze({
      services: Object.freeze(state.services.map(({ id }) => id)),
      applications: Object.freeze(state.applications.map(({ id }) => id)),
      gameIntegrations: Object.freeze([...state.gameIntegrations]),
      guidanceProviders: Object.freeze([...state.guidanceProviders]),
    }),
    diagnostics: Object.freeze(
      state.diagnostics.map(({ code, level, message, subsystemId }) =>
        Object.freeze({
          code,
          level,
          message: sanitizeHealthText(message),
          subsystemId,
        })
      )
    ),
  });
}

export function isOraclePlatformHealthSnapshot(
  value: unknown
): value is OraclePlatformHealthSnapshot {
  if (!isRecord(value)) return false;
  return (
    value.contract === ORACLE_PLATFORM_HEALTH_CONTRACT &&
    value.contractVersion === ORACLE_PLATFORM_HEALTH_CONTRACT_VERSION &&
    typeof value.capturedAt === "string" &&
    Number.isInteger(value.attempt) &&
    Number(value.attempt) >= 1 &&
    (value.target === "web" || value.target === "electron") &&
    typeof value.manifestVersion === "string" &&
    typeof value.manifestVerified === "boolean" &&
    typeof value.status === "string" &&
    typeof value.phase === "string" &&
    Array.isArray(value.subsystems) &&
    value.subsystems.every(isHealthSubsystem) &&
    isRecord(value.capabilities) &&
    isStringArray(value.capabilities.services) &&
    isStringArray(value.capabilities.applications) &&
    isStringArray(value.capabilities.gameIntegrations) &&
    isStringArray(value.capabilities.guidanceProviders) &&
    Array.isArray(value.diagnostics) &&
    value.diagnostics.every(isHealthDiagnostic)
  );
}

function isHealthSubsystem(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.required === "boolean" &&
    typeof value.status === "string" &&
    typeof value.message === "string"
  );
}

function isHealthDiagnostic(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.level === "string" &&
    typeof value.message === "string" &&
    (value.subsystemId === null || typeof value.subsystemId === "string")
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) &&
    value.every((item) => typeof item === "string");
}

function sanitizeHealthText(value: string): string {
  return value
    .replace(
      /\b(password|token|secret|key)\s*[:=]\s*[^\s,;]+/giu,
      "$1=[redacted]"
    )
    .replace(
      /\b(?:postgres(?:ql)?|https?):\/\/[^@\s]+@/giu,
      "connection://[redacted]@"
    )
    .replace(/[\r\n\t]+/gu, " ")
    .slice(0, 240);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
