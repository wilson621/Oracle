import { randomUUID } from "node:crypto";
import {
  ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT,
  ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT_VERSION,
  type OracleDesktopDiagnostic,
  type OracleDesktopDiagnosticCategory,
  type OracleDesktopDiagnosticSeverity,
  type ReportOracleDesktopDiagnosticInput,
} from "./desktop-diagnostic.js";
import type {
  OracleDesktopHostEvent,
  OracleDesktopHostSnapshotCapturedEvent,
} from "./desktop-host-event.js";
import type {
  OracleDesktopHostSnapshot,
} from "./desktop-host-snapshot.js";

export type OracleDesktopDiagnosticListener = (
  diagnostic: OracleDesktopDiagnostic
) => void;

export type OracleDesktopDiagnosticsOptions = {
  historyLimit?: number;
};

export type OracleDesktopDiagnosticQuery = {
  severity?: OracleDesktopDiagnosticSeverity;
  category?: OracleDesktopDiagnosticCategory;
  limit?: number;
};

const DEFAULT_HISTORY_LIMIT = 200;

/**
 * Authoritative in-process diagnostics service for the Oracle Desktop
 * Platform.
 *
 * The service consumes immutable desktop-host events and emits diagnostics
 * only for meaningful state transitions. Raw events remain available from the
 * event stream while diagnostics provide a concise, queryable explanation of
 * what changed and why it matters.
 */
export class OracleDesktopDiagnostics {
  private readonly listeners =
    new Set<OracleDesktopDiagnosticListener>();

  private readonly history:
    OracleDesktopDiagnostic[] = [];

  private readonly historyLimit: number;

  private previousSnapshot:
    OracleDesktopHostSnapshot | null = null;

  constructor(
    options: OracleDesktopDiagnosticsOptions = {}
  ) {
    const historyLimit =
      options.historyLimit ??
      DEFAULT_HISTORY_LIMIT;

    if (
      !Number.isInteger(historyLimit) ||
      historyLimit < 0
    ) {
      throw new Error(
        "Oracle desktop diagnostic history limit must be a non-negative integer."
      );
    }

    this.historyLimit = historyLimit;
  }

  consumeHostEvent(
    event: OracleDesktopHostEvent
  ): readonly OracleDesktopDiagnostic[] {
    if (
      event.type ===
      "desktop-host.snapshot-cleared"
    ) {
      this.previousSnapshot = null;

      return [
        this.report({
          severity: "info",
          category: "lifecycle",
          code: "desktop-host.snapshot-cleared",
          message:
            "The authoritative desktop host snapshot was cleared.",
          correlationId: event.eventId,
          sourceEventId: event.eventId,
          sourceEventSequence:
            event.sequence,
          occurredAt: event.occurredAt,
          data: {
            hadPreviousSnapshot:
              event.previousSnapshot !== null,
          },
        }),
      ];
    }

    return this.consumeSnapshotCaptured(
      event
    );
  }

  report(
    input: ReportOracleDesktopDiagnosticInput
  ): OracleDesktopDiagnostic {
    const diagnostic = deepFreeze({
      contract: {
        name:
          ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT,
        version:
          ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT_VERSION,
      },

      diagnosticId: randomUUID(),
      occurredAt:
        input.occurredAt ??
        new Date().toISOString(),

      severity: input.severity,
      category: input.category,
      code: input.code,
      message: input.message,

      correlationId:
        input.correlationId ?? null,
      sourceEventId:
        input.sourceEventId ?? null,
      sourceEventSequence:
        input.sourceEventSequence ?? null,

      data: {
        ...(input.data ?? {}),
      },
    }) satisfies OracleDesktopDiagnostic;

    if (this.historyLimit > 0) {
      this.history.push(diagnostic);

      const overflow =
        this.history.length -
        this.historyLimit;

      if (overflow > 0) {
        this.history.splice(0, overflow);
      }
    }

    for (const listener of this.listeners) {
      listener(diagnostic);
    }

    return diagnostic;
  }

  subscribe(
    listener: OracleDesktopDiagnosticListener
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getRecentDiagnostics(
    query: OracleDesktopDiagnosticQuery = {}
  ): readonly OracleDesktopDiagnostic[] {
    const limit = normaliseQueryLimit(
      query.limit
    );

    const diagnostics = this.history.filter(
      (diagnostic) =>
        (query.severity === undefined ||
          diagnostic.severity ===
            query.severity) &&
        (query.category === undefined ||
          diagnostic.category ===
            query.category)
    );

    const selected =
      limit === undefined
        ? diagnostics
        : diagnostics.slice(-limit);

    return structuredClone(selected);
  }

  clearHistory(): void {
    this.history.length = 0;
  }

  reset(): void {
    this.previousSnapshot = null;
    this.clearHistory();
  }

  private consumeSnapshotCaptured(
    event: OracleDesktopHostSnapshotCapturedEvent
  ): readonly OracleDesktopDiagnostic[] {
    const previousSnapshot =
      this.previousSnapshot;

    this.previousSnapshot =
      event.snapshot;

    if (!previousSnapshot) {
      return [
        this.reportFromEvent(event, {
          severity: "info",
          category: "lifecycle",
          code: "desktop-host.snapshot-initialized",
          message:
            "The authoritative desktop host snapshot was initialized.",
          data: {
            ready:
              event.snapshot.state.ready,
            windowMode:
              event.snapshot.state
                .windowMode,
            attachmentStatus:
              event.snapshot.state
                .attachment.status,
          },
        }),
      ];
    }

    const diagnostics:
      OracleDesktopDiagnostic[] = [];

    const previous =
      previousSnapshot.state;
    const current =
      event.snapshot.state;

    if (previous.ready !== current.ready) {
      diagnostics.push(
        this.reportFromEvent(event, {
          severity: "info",
          category: "lifecycle",
          code: "desktop-host.ready-changed",
          message: current.ready
            ? "The desktop host became ready."
            : "The desktop host is no longer ready.",
          data: {
            previousReady:
              previous.ready,
            ready: current.ready,
          },
        })
      );
    }

    if (
      previous.windowVisible !==
      current.windowVisible
    ) {
      diagnostics.push(
        this.reportFromEvent(event, {
          severity: "info",
          category: "window",
          code: "desktop-window.visibility-changed",
          message: current.windowVisible
            ? "The Companion window became visible."
            : "The Companion window became hidden.",
          data: {
            visible:
              current.windowVisible,
          },
        })
      );
    }

    if (
      previous.windowMode !==
      current.windowMode
    ) {
      diagnostics.push(
        this.reportFromEvent(event, {
          severity: "info",
          category: "overlay",
          code: "desktop-overlay.mode-changed",
          message:
            `The desktop window mode changed from '${previous.windowMode}' to '${current.windowMode}'.`,
          data: {
            previousMode:
              previous.windowMode,
            windowMode:
              current.windowMode,
          },
        })
      );
    }

    if (
      previous.alwaysOnTop !==
      current.alwaysOnTop
    ) {
      diagnostics.push(
        this.reportFromEvent(event, {
          severity: "info",
          category: "overlay",
          code: "desktop-overlay.always-on-top-changed",
          message: current.alwaysOnTop
            ? "Always-on-top was enabled."
            : "Always-on-top was disabled.",
          data: {
            alwaysOnTop:
              current.alwaysOnTop,
          },
        })
      );
    }

    if (
      previous.clickThrough !==
      current.clickThrough
    ) {
      diagnostics.push(
        this.reportFromEvent(event, {
          severity: "info",
          category: "overlay",
          code: "desktop-overlay.click-through-changed",
          message: current.clickThrough
            ? "Click-through interaction was enabled."
            : "Click-through interaction was disabled.",
          data: {
            clickThrough:
              current.clickThrough,
          },
        })
      );
    }

    if (
      previous.windowDiscovery.status !==
      current.windowDiscovery.status
    ) {
      const failed =
        current.windowDiscovery.status ===
        "failed";

      diagnostics.push(
        this.reportFromEvent(event, {
          severity: failed
            ? "error"
            : "info",
          category: "discovery",
          code: "desktop-discovery.status-changed",
          message: failed
            ? "Desktop window discovery failed."
            : `Desktop window discovery entered '${current.windowDiscovery.status}' status.`,
          data: {
            previousStatus:
              previous.windowDiscovery
                .status,
            status:
              current.windowDiscovery
                .status,
            windowCount:
              current.windowDiscovery
                .windows.length,
            error:
              current.windowDiscovery.error,
          },
        })
      );
    }

    if (
      previous.attachment.status !==
      current.attachment.status
    ) {
      const attached =
        current.attachment.status ===
        "attached";

      diagnostics.push(
        this.reportFromEvent(event, {
          severity: attached
            ? "info"
            : "warning",
          category: "attachment",
          code: "desktop-attachment.status-changed",
          message: attached
            ? "Oracle Companion attached to a desktop target."
            : "Oracle Companion detached from its desktop target.",
          data: {
            previousStatus:
              previous.attachment.status,
            status:
              current.attachment.status,
            targetHandle:
              current.attachment.target
                ?.handle ?? null,
            targetTitle:
              current.attachment.target
                ?.title ?? null,
            message:
              current.attachment.message,
          },
        })
      );
    }

    if (
      previous.attachment
        .observationError !==
      current.attachment
        .observationError &&
      current.attachment
        .observationError !== null
    ) {
      diagnostics.push(
        this.reportFromEvent(event, {
          severity: "error",
          category: "attachment",
          code: "desktop-attachment.observation-failed",
          message:
            "Oracle Companion could not observe its attached desktop target.",
          data: {
            targetHandle:
              current.attachment.target
                ?.handle ?? null,
            targetTitle:
              current.attachment.target
                ?.title ?? null,
            error:
              current.attachment
                .observationError,
          },
        })
      );
    }

    if (
      previous.attachment
        .observationError !== null &&
      current.attachment
        .observationError === null
    ) {
      diagnostics.push(
        this.reportFromEvent(event, {
          severity: "info",
          category: "attachment",
          code: "desktop-attachment.observation-recovered",
          message:
            "Oracle Companion resumed observing its attached desktop target.",
          data: {
            targetHandle:
              current.attachment.target
                ?.handle ?? null,
            targetTitle:
              current.attachment.target
                ?.title ?? null,
          },
        })
      );
    }

    return diagnostics;
  }

  private reportFromEvent(
    event: OracleDesktopHostSnapshotCapturedEvent,
    input: Omit<
      ReportOracleDesktopDiagnosticInput,
      | "occurredAt"
      | "correlationId"
      | "sourceEventId"
      | "sourceEventSequence"
    >
  ): OracleDesktopDiagnostic {
    return this.report({
      ...input,
      occurredAt: event.occurredAt,
      correlationId: event.eventId,
      sourceEventId: event.eventId,
      sourceEventSequence:
        event.sequence,
    });
  }
}

function normaliseQueryLimit(
  limit: number | undefined
): number | undefined {
  if (limit === undefined) {
    return undefined;
  }

  if (
    !Number.isInteger(limit) ||
    limit < 0
  ) {
    throw new Error(
      "Oracle desktop diagnostic query limit must be a non-negative integer."
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
