import { randomUUID } from "node:crypto";
import type {
  OracleDesktopDiagnostic,
} from "./desktop-diagnostic.js";
import {
  ORACLE_DESKTOP_RECOVERY_CONTRACT,
  ORACLE_DESKTOP_RECOVERY_CONTRACT_VERSION,
  type OracleDesktopRecovery,
  type OracleDesktopRecoveryEvidence,
  type OracleDesktopRecoveryKind,
  type OracleDesktopRecoveryStrategy,
} from "./desktop-recovery.js";

export type OracleDesktopRecoveryListener = (
  recovery: OracleDesktopRecovery
) => void;

export type OracleDesktopRecoveryServiceOptions = {
  historyLimit?: number;
};

export type OracleDesktopRecoveryQuery = {
  status?: OracleDesktopRecovery["status"];
  kind?: OracleDesktopRecoveryKind;
  limit?: number;
};

type RecoveryRule = {
  kind: OracleDesktopRecoveryKind;
  strategy: OracleDesktopRecoveryStrategy;
};

const DEFAULT_HISTORY_LIMIT = 100;

/**
 * Authoritative in-process recovery lifecycle tracker for the Oracle Desktop
 * Platform.
 *
 * Diagnostics explain meaningful faults and transitions. This service turns
 * recoverable diagnostics into correlated recovery lifecycles without owning
 * Electron retry mechanics. Recovery actions can later be delegated to
 * strategy executors while this stable contract remains unchanged.
 */
export class OracleDesktopRecoveryService {
  private readonly listeners =
    new Set<OracleDesktopRecoveryListener>();

  private readonly history:
    OracleDesktopRecovery[] = [];

  private readonly activeByKind =
    new Map<
      OracleDesktopRecoveryKind,
      OracleDesktopRecovery
    >();

  private readonly historyLimit: number;

  constructor(
    options: OracleDesktopRecoveryServiceOptions = {}
  ) {
    const historyLimit =
      options.historyLimit ?? DEFAULT_HISTORY_LIMIT;

    if (
      !Number.isInteger(historyLimit) ||
      historyLimit < 0
    ) {
      throw new Error(
        "Oracle desktop recovery history limit must be a non-negative integer."
      );
    }

    this.historyLimit = historyLimit;
  }

  consumeDiagnostic(
    diagnostic: OracleDesktopDiagnostic
  ): OracleDesktopRecovery | null {
    const triggerRule =
      getTriggerRule(diagnostic);

    if (triggerRule) {
      return this.openOrUpdate(
        triggerRule,
        diagnostic
      );
    }

    const resolvedKind =
      getResolvedKind(diagnostic);

    if (!resolvedKind) {
      return null;
    }

    return this.complete(
      resolvedKind,
      diagnostic
    );
  }

  subscribe(
    listener: OracleDesktopRecoveryListener
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getActiveRecoveries(): readonly OracleDesktopRecovery[] {
    return structuredClone(
      [...this.activeByKind.values()]
    );
  }

  getRecentRecoveries(
    query: OracleDesktopRecoveryQuery = {}
  ): readonly OracleDesktopRecovery[] {
    const limit = normaliseQueryLimit(query.limit);

    const recoveries = this.history.filter(
      (recovery) =>
        (query.status === undefined ||
          recovery.status === query.status) &&
        (query.kind === undefined ||
          recovery.kind === query.kind)
    );

    const selected =
      limit === undefined
        ? recoveries
        : recoveries.slice(-limit);

    return structuredClone(selected);
  }

  clearHistory(): void {
    this.history.length = 0;
    this.activeByKind.clear();
  }

  private openOrUpdate(
    rule: RecoveryRule,
    diagnostic: OracleDesktopDiagnostic
  ): OracleDesktopRecovery {
    const evidence =
      createEvidence(diagnostic);

    const active =
      this.activeByKind.get(rule.kind);

    if (active) {
      const updated = deepFreeze({
        ...active,
        attemptCount:
          active.attemptCount + 1,
        latestEvidence: evidence,
        correlationId:
          active.correlationId ??
          diagnostic.correlationId,
      }) satisfies OracleDesktopRecovery;

      this.replaceHistoryRecord(updated);
      this.activeByKind.set(rule.kind, updated);
      this.emit(updated);

      return updated;
    }

    const recovery = deepFreeze({
      contract: {
        name: ORACLE_DESKTOP_RECOVERY_CONTRACT,
        version:
          ORACLE_DESKTOP_RECOVERY_CONTRACT_VERSION,
      },
      recoveryId: randomUUID(),
      kind: rule.kind,
      status: "active",
      strategy: rule.strategy,
      startedAt: diagnostic.occurredAt,
      completedAt: null,
      durationMs: null,
      attemptCount: 1,
      correlationId: diagnostic.correlationId,
      trigger: evidence,
      latestEvidence: evidence,
      resolution: null,
    }) satisfies OracleDesktopRecovery;

    this.activeByKind.set(rule.kind, recovery);
    this.appendHistory(recovery);
    this.emit(recovery);

    return recovery;
  }

  private complete(
    kind: OracleDesktopRecoveryKind,
    diagnostic: OracleDesktopDiagnostic
  ): OracleDesktopRecovery | null {
    const active =
      this.activeByKind.get(kind);

    if (!active) {
      return null;
    }

    const completedAt = diagnostic.occurredAt;
    const resolution = createEvidence(diagnostic);

    const recovery = deepFreeze({
      ...active,
      status: "recovered",
      completedAt,
      durationMs: calculateDurationMs(
        active.startedAt,
        completedAt
      ),
      latestEvidence: resolution,
      resolution,
    }) satisfies OracleDesktopRecovery;

    this.activeByKind.delete(kind);
    this.replaceHistoryRecord(recovery);
    this.emit(recovery);

    return recovery;
  }

  private appendHistory(
    recovery: OracleDesktopRecovery
  ): void {
    if (this.historyLimit === 0) {
      return;
    }

    this.history.push(recovery);

    const overflow =
      this.history.length - this.historyLimit;

    if (overflow > 0) {
      const removed = this.history.splice(
        0,
        overflow
      );

      for (const recovery of removed) {
        const active =
          this.activeByKind.get(recovery.kind);

        if (
          active?.recoveryId ===
          recovery.recoveryId
        ) {
          this.activeByKind.delete(
            recovery.kind
          );
        }
      }
    }
  }

  private replaceHistoryRecord(
    recovery: OracleDesktopRecovery
  ): void {
    const index = this.history.findIndex(
      (candidate) =>
        candidate.recoveryId ===
        recovery.recoveryId
    );

    if (index >= 0) {
      this.history[index] = recovery;
    }
  }

  private emit(
    recovery: OracleDesktopRecovery
  ): void {
    for (const listener of this.listeners) {
      listener(recovery);
    }
  }
}

function getTriggerRule(
  diagnostic: OracleDesktopDiagnostic
): RecoveryRule | null {
  switch (diagnostic.code) {
    case "desktop-attachment.status-changed":
      return diagnostic.data.status === "detached" &&
        diagnostic.data.previousStatus === "attached"
        ? {
            kind: "attachment",
            strategy: "await-attachment",
          }
        : null;

    case "desktop-attachment.observation-failed":
      return {
        kind: "attachment-observation",
        strategy: "await-observation",
      };

    case "desktop-discovery.status-changed":
      return diagnostic.data.status === "failed"
        ? {
            kind: "window-discovery",
            strategy: "retry-window-discovery",
          }
        : null;

    case "desktop-window.unresponsive":
      return {
        kind: "window-responsiveness",
        strategy: "await-window-response",
      };

    case "desktop-renderer.load-failed":
      return {
        kind: "renderer-load",
        strategy: "reload-application-surface",
      };

    case "desktop-renderer.process-gone":
      return {
        kind: "renderer-process",
        strategy: "recreate-renderer",
      };

    default:
      return null;
  }
}

function getResolvedKind(
  diagnostic: OracleDesktopDiagnostic
): OracleDesktopRecoveryKind | null {
  switch (diagnostic.code) {
    case "desktop-attachment.status-changed":
      return diagnostic.data.status === "attached"
        ? "attachment"
        : null;

    case "desktop-attachment.observation-recovered":
      return "attachment-observation";

    case "desktop-discovery.status-changed":
      return diagnostic.data.previousStatus === "failed" &&
        diagnostic.data.status !== "failed"
        ? "window-discovery"
        : null;

    case "desktop-window.responsive":
      return "window-responsiveness";

    case "desktop-renderer.load-succeeded":
      return "renderer-load";

    case "desktop-renderer.process-restored":
      return "renderer-process";

    default:
      return null;
  }
}

function createEvidence(
  diagnostic: OracleDesktopDiagnostic
): OracleDesktopRecoveryEvidence {
  return deepFreeze({
    diagnosticId: diagnostic.diagnosticId,
    diagnosticCode: diagnostic.code,
    occurredAt: diagnostic.occurredAt,
  });
}

function calculateDurationMs(
  startedAt: string,
  completedAt: string
): number {
  const duration =
    Date.parse(completedAt) - Date.parse(startedAt);

  return Number.isFinite(duration)
    ? Math.max(0, duration)
    : 0;
}

function normaliseQueryLimit(
  limit: number | undefined
): number | undefined {
  if (limit === undefined) {
    return undefined;
  }

  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error(
      "Oracle desktop recovery query limit must be a non-negative integer."
    );
  }

  return limit;
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
