import type {
  OracleDeepReadonly,
} from "./desktop-host-snapshot.js";

export const ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT =
  "oracle.desktop-telemetry-snapshot" as const;

export const ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT_VERSION =
  1 as const;

export type OracleDesktopTelemetrySnapshotContract = {
  readonly name:
    typeof ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT;

  readonly version:
    typeof ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT_VERSION;
};

export type OracleDesktopPlatformHealth =
  | "healthy"
  | "degraded"
  | "unhealthy";

export type OracleDesktopTelemetryCounts = {
  readonly timelineEntries: number;
  readonly hostEvents: number;
  readonly diagnostics: number;
  readonly recoveries: number;
  readonly activeRecoveries: number;
  readonly completedRecoveries: number;
};

export type OracleDesktopTelemetryDiagnostics = {
  readonly info: number;
  readonly warning: number;
  readonly error: number;
  readonly critical: number;
};

export type OracleDesktopTelemetryRecovery = {
  readonly successRate: number | null;
  readonly averageDurationMs: number | null;
  readonly fastestDurationMs: number | null;
  readonly slowestDurationMs: number | null;
  readonly averageAttemptCount: number | null;
};

export type OracleDesktopTelemetryThroughput = {
  readonly observationWindowMs: number;
  readonly entriesPerMinute: number | null;
  readonly hostEventsPerMinute: number | null;
};

/**
 * Stable, serializable health summary derived from the authoritative desktop
 * timeline. The snapshot contains aggregate values only and never owns or
 * duplicates the source event, diagnostic or recovery histories.
 */
export type OracleDesktopTelemetrySnapshot = {
  readonly contract:
    OracleDesktopTelemetrySnapshotContract;

  readonly generatedAt: string;
  readonly sessionStartedAt: string;
  readonly sessionUptimeMs: number;

  readonly health: OracleDesktopPlatformHealth;
  readonly healthScore: number;

  readonly counts:
    OracleDeepReadonly<OracleDesktopTelemetryCounts>;

  readonly diagnostics:
    OracleDeepReadonly<OracleDesktopTelemetryDiagnostics>;

  readonly recovery:
    OracleDeepReadonly<OracleDesktopTelemetryRecovery>;

  readonly throughput:
    OracleDeepReadonly<OracleDesktopTelemetryThroughput>;

  readonly meanTimeBetweenFaultsMs: number | null;
};
