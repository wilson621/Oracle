import { randomUUID } from "node:crypto";
import type {
  OracleDesktopDiagnostic,
} from "./desktop-diagnostic.js";
import type {
  OracleDesktopHostEvent,
} from "./desktop-host-event.js";
import type {
  OracleDesktopRecovery,
} from "./desktop-recovery.js";
import {
  ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT,
  ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT_VERSION,
  type OracleDesktopTimelineEntry,
  type OracleDesktopTimelineEntryKind,
} from "./desktop-timeline.js";

export type OracleDesktopTimelineListener = (
  entry: OracleDesktopTimelineEntry
) => void;

export type OracleDesktopTimelineOptions = {
  historyLimit?: number;
};

export type OracleDesktopTimelineQuery = {
  kind?: OracleDesktopTimelineEntryKind;
  correlationId?: string | null;
  limit?: number;
};

const DEFAULT_HISTORY_LIMIT = 500;

/**
 * Authoritative in-process chronological record for the Oracle Desktop
 * Platform.
 *
 * The timeline combines raw host events, interpreted diagnostics and recovery
 * lifecycle updates into one immutable, monotonically ordered history. It is
 * intentionally independent from Electron and durable storage so consumers
 * can later bridge it to diagnostics UI, telemetry or replay infrastructure.
 */
export class OracleDesktopTimelineService {
  private readonly listeners =
    new Set<OracleDesktopTimelineListener>();

  private readonly history:
    OracleDesktopTimelineEntry[] = [];

  private readonly historyLimit: number;
  private sequence = 0;

  constructor(
    options: OracleDesktopTimelineOptions = {}
  ) {
    const historyLimit =
      options.historyLimit ?? DEFAULT_HISTORY_LIMIT;

    if (
      !Number.isInteger(historyLimit) ||
      historyLimit < 0
    ) {
      throw new Error(
        "Oracle desktop timeline history limit must be a non-negative integer."
      );
    }

    this.historyLimit = historyLimit;
  }

  consumeHostEvent(
    event: OracleDesktopHostEvent
  ): OracleDesktopTimelineEntry {
    return this.append({
      occurredAt: event.occurredAt,
      kind: "host-event",
      correlationId: event.eventId,
      sourceId: event.eventId,
      payload: event,
    });
  }

  consumeDiagnostic(
    diagnostic: OracleDesktopDiagnostic
  ): OracleDesktopTimelineEntry {
    return this.append({
      occurredAt: diagnostic.occurredAt,
      kind: "diagnostic",
      correlationId: diagnostic.correlationId,
      sourceId: diagnostic.diagnosticId,
      payload: diagnostic,
    });
  }

  consumeRecovery(
    recovery: OracleDesktopRecovery
  ): OracleDesktopTimelineEntry {
    return this.append({
      occurredAt:
        recovery.completedAt ??
        recovery.latestEvidence.occurredAt,
      kind: "recovery",
      correlationId: recovery.correlationId,
      sourceId: recovery.recoveryId,
      payload: recovery,
    });
  }

  subscribe(
    listener: OracleDesktopTimelineListener
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getRecentEntries(
    query: OracleDesktopTimelineQuery = {}
  ): readonly OracleDesktopTimelineEntry[] {
    const limit = normaliseQueryLimit(query.limit);

    const entries = this.history.filter(
      (entry) =>
        (query.kind === undefined ||
          entry.kind === query.kind) &&
        (query.correlationId === undefined ||
          entry.correlationId === query.correlationId)
    );

    const selected =
      limit === undefined
        ? entries
        : entries.slice(-limit);

    return structuredClone(selected);
  }

  clearHistory(): void {
    this.history.length = 0;
  }

  private append(
    input: Omit<
      OracleDesktopTimelineEntry,
      "contract" | "entryId" | "sequence"
    >
  ): OracleDesktopTimelineEntry {
    const entry = deepFreeze({
      contract: {
        name: ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT,
        version:
          ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT_VERSION,
      },
      entryId: randomUUID(),
      sequence: ++this.sequence,
      ...input,
    }) as OracleDesktopTimelineEntry;

    if (this.historyLimit > 0) {
      this.history.push(entry);

      const overflow =
        this.history.length - this.historyLimit;

      if (overflow > 0) {
        this.history.splice(0, overflow);
      }
    }

    for (const listener of this.listeners) {
      listener(entry);
    }

    return entry;
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
      "Oracle desktop timeline query limit must be a non-negative integer."
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
