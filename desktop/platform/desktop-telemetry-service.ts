import type {
  OracleDesktopDiagnostic,
} from "./desktop-diagnostic.js";
import type {
  OracleDesktopRecovery,
} from "./desktop-recovery.js";
import {
  ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT,
  ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT_VERSION,
  type OracleDesktopPlatformHealth,
  type OracleDesktopTelemetrySnapshot,
} from "./desktop-telemetry.js";
import type {
  OracleDesktopTimelineEntry,
} from "./desktop-timeline.js";
import type {
  OracleDesktopTimelineService,
} from "./desktop-timeline-service.js";

export type OracleDesktopTelemetryListener = (
  snapshot: OracleDesktopTelemetrySnapshot
) => void;

export type OracleDesktopTelemetryOptions = {
  now?: () => Date;
};

const MILLISECONDS_PER_MINUTE = 60_000;

/**
 * Derived telemetry view over the authoritative Oracle Desktop timeline.
 *
 * The service stores no platform source history and maintains no independent
 * metric counters. Every snapshot is rebuilt from the timeline so telemetry
 * remains deterministic and can be reproduced from the same timeline input.
 */
export class OracleDesktopTelemetryService {
  private readonly listeners =
    new Set<OracleDesktopTelemetryListener>();

  private readonly now: () => Date;
  private readonly sessionStartedAt: string;
  private readonly unsubscribeTimeline: () => void;

  constructor(
    private readonly timeline: OracleDesktopTimelineService,
    options: OracleDesktopTelemetryOptions = {}
  ) {
    this.now = options.now ?? (() => new Date());
    this.sessionStartedAt = this.now().toISOString();

    this.unsubscribeTimeline =
      this.timeline.subscribe(() => {
        this.publish();
      });
  }

  getSnapshot(): OracleDesktopTelemetrySnapshot {
    const generatedAt = this.now();
    const entries = this.timeline.getRecentEntries();

    const hostEvents = entries.filter(
      (entry) => entry.kind === "host-event"
    );

    const diagnostics = entries
      .filter(
        (entry): entry is Extract<
          OracleDesktopTimelineEntry,
          { kind: "diagnostic" }
        > => entry.kind === "diagnostic"
      )
      .map((entry) => entry.payload);

    const latestRecoveries = getLatestRecoveries(entries);
    const completedRecoveries = latestRecoveries.filter(
      (recovery) => recovery.status === "recovered"
    );
    const activeRecoveries = latestRecoveries.filter(
      (recovery) => recovery.status === "active"
    );

    const completedDurations = completedRecoveries
      .map((recovery) => recovery.durationMs)
      .filter(
        (duration): duration is number =>
          duration !== null
      );

    const diagnosticCounts = {
      info: countDiagnostics(diagnostics, "info"),
      warning: countDiagnostics(diagnostics, "warning"),
      error: countDiagnostics(diagnostics, "error"),
      critical: countDiagnostics(diagnostics, "critical"),
    };

    const faultTimes = diagnostics
      .filter(
        (diagnostic) =>
          diagnostic.severity === "error" ||
          diagnostic.severity === "critical"
      )
      .map((diagnostic) => Date.parse(diagnostic.occurredAt))
      .filter(Number.isFinite)
      .sort((left, right) => left - right);

    const observationWindowMs = getObservationWindowMs(entries);
    const healthScore = calculateHealthScore({
      diagnostics: diagnosticCounts,
      activeRecoveries: activeRecoveries.length,
    });

    return deepFreeze({
      contract: {
        name: ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT,
        version:
          ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT_VERSION,
      },
      generatedAt: generatedAt.toISOString(),
      sessionStartedAt: this.sessionStartedAt,
      sessionUptimeMs: Math.max(
        0,
        generatedAt.getTime() -
          Date.parse(this.sessionStartedAt)
      ),
      health: classifyHealth(healthScore),
      healthScore,
      counts: {
        timelineEntries: entries.length,
        hostEvents: hostEvents.length,
        diagnostics: diagnostics.length,
        recoveries: latestRecoveries.length,
        activeRecoveries: activeRecoveries.length,
        completedRecoveries: completedRecoveries.length,
      },
      diagnostics: diagnosticCounts,
      recovery: {
        successRate:
          latestRecoveries.length === 0
            ? null
            : completedRecoveries.length /
              latestRecoveries.length,
        averageDurationMs: average(completedDurations),
        fastestDurationMs:
          completedDurations.length === 0
            ? null
            : Math.min(...completedDurations),
        slowestDurationMs:
          completedDurations.length === 0
            ? null
            : Math.max(...completedDurations),
        averageAttemptCount: average(
          latestRecoveries.map(
            (recovery) => recovery.attemptCount
          )
        ),
      },
      throughput: {
        observationWindowMs,
        entriesPerMinute: calculateRatePerMinute(
          entries.length,
          observationWindowMs
        ),
        hostEventsPerMinute: calculateRatePerMinute(
          hostEvents.length,
          observationWindowMs
        ),
      },
      meanTimeBetweenFaultsMs:
        calculateMeanTimeBetween(faultTimes),
    }) as OracleDesktopTelemetrySnapshot;
  }

  subscribe(
    listener: OracleDesktopTelemetryListener
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  dispose(): void {
    this.unsubscribeTimeline();
    this.listeners.clear();
  }

  private publish(): void {
    if (this.listeners.size === 0) {
      return;
    }

    const snapshot = this.getSnapshot();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

function getLatestRecoveries(
  entries: readonly OracleDesktopTimelineEntry[]
): OracleDesktopRecovery[] {
  const recoveries = new Map<
    string,
    OracleDesktopRecovery
  >();

  for (const entry of entries) {
    if (entry.kind === "recovery") {
      recoveries.set(
        entry.payload.recoveryId,
        entry.payload as OracleDesktopRecovery
      );
    }
  }

  return [...recoveries.values()];
}

function countDiagnostics(
  diagnostics: readonly OracleDesktopDiagnostic[],
  severity: OracleDesktopDiagnostic["severity"]
): number {
  return diagnostics.filter(
    (diagnostic) => diagnostic.severity === severity
  ).length;
}

function getObservationWindowMs(
  entries: readonly OracleDesktopTimelineEntry[]
): number {
  if (entries.length < 2) {
    return 0;
  }

  const first = Date.parse(entries[0].occurredAt);
  const last = Date.parse(
    entries[entries.length - 1].occurredAt
  );

  if (!Number.isFinite(first) || !Number.isFinite(last)) {
    return 0;
  }

  return Math.max(0, last - first);
}

function calculateRatePerMinute(
  count: number,
  observationWindowMs: number
): number | null {
  if (count === 0 || observationWindowMs <= 0) {
    return null;
  }

  return count /
    (observationWindowMs / MILLISECONDS_PER_MINUTE);
}

function calculateMeanTimeBetween(
  timestamps: readonly number[]
): number | null {
  if (timestamps.length < 2) {
    return null;
  }

  const intervals: number[] = [];

  for (let index = 1; index < timestamps.length; index += 1) {
    intervals.push(
      timestamps[index] - timestamps[index - 1]
    );
  }

  return average(intervals);
}

function average(
  values: readonly number[]
): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce(
    (total, value) => total + value,
    0
  ) / values.length;
}

function calculateHealthScore(input: {
  diagnostics: {
    warning: number;
    error: number;
    critical: number;
  };
  activeRecoveries: number;
}): number {
  const penalty =
    input.diagnostics.warning * 2 +
    input.diagnostics.error * 8 +
    input.diagnostics.critical * 20 +
    input.activeRecoveries * 12;

  return Math.max(0, Math.min(100, 100 - penalty));
}

function classifyHealth(
  healthScore: number
): OracleDesktopPlatformHealth {
  if (healthScore >= 90) {
    return "healthy";
  }

  if (healthScore >= 60) {
    return "degraded";
  }

  return "unhealthy";
}

function deepFreeze<T>(value: T): T {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nestedValue of Object.values(value)) {
    deepFreeze(nestedValue);
  }

  return Object.freeze(value);
}
