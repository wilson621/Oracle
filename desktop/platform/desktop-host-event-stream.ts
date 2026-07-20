import { randomUUID } from "node:crypto";
import {
  ORACLE_DESKTOP_HOST_EVENT_CONTRACT,
  ORACLE_DESKTOP_HOST_EVENT_CONTRACT_VERSION,
  type OracleDesktopHostEvent,
  type OracleDesktopHostSnapshotCapturedEvent,
  type OracleDesktopHostSnapshotClearedEvent,
} from "./desktop-host-event.js";
import type {
  OracleDesktopHostSnapshot,
} from "./desktop-host-snapshot.js";

export type OracleDesktopHostEventListener = (
  event: OracleDesktopHostEvent
) => void;

export type OracleDesktopHostEventStreamOptions = {
  historyLimit?: number;
};

const DEFAULT_HISTORY_LIMIT = 200;

/**
 * In-process event stream for immutable Oracle Desktop Platform events.
 *
 * The bounded history is intended for diagnostics and replay foundations. It
 * is not durable storage and can later be replaced or bridged without changing
 * the public event contract.
 */
export class OracleDesktopHostEventStream {
  private readonly listeners =
    new Set<OracleDesktopHostEventListener>();

  private readonly history:
    OracleDesktopHostEvent[] = [];

  private readonly historyLimit: number;
  private sequence = 0;

  constructor(
    options:
      OracleDesktopHostEventStreamOptions = {}
  ) {
    const historyLimit =
      options.historyLimit ??
      DEFAULT_HISTORY_LIMIT;

    if (
      !Number.isInteger(historyLimit) ||
      historyLimit < 0
    ) {
      throw new Error(
        "Oracle desktop host event history limit must be a non-negative integer."
      );
    }

    this.historyLimit = historyLimit;
  }

  publishSnapshotCaptured(
    snapshot: OracleDesktopHostSnapshot
  ): OracleDesktopHostSnapshotCapturedEvent {
    return this.publish({
      type:
        "desktop-host.snapshot-captured",
      snapshot,
    });
  }

  publishSnapshotCleared(
    previousSnapshot:
      OracleDesktopHostSnapshot | null
  ): OracleDesktopHostSnapshotClearedEvent {
    return this.publish({
      type:
        "desktop-host.snapshot-cleared",
      previousSnapshot,
    });
  }

  subscribe(
    listener: OracleDesktopHostEventListener
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getRecentEvents(): readonly OracleDesktopHostEvent[] {
    return structuredClone(
      this.history
    );
  }

  clearHistory(): void {
    this.history.length = 0;
  }

  private publish<
    Event extends OracleDesktopHostEvent
  >(
    payload: Omit<
      Event,
      | "contract"
      | "eventId"
      | "sequence"
      | "occurredAt"
    >
  ): Event {
    const sequence =
      ++this.sequence;

    const event = deepFreeze({
      contract: {
        name:
          ORACLE_DESKTOP_HOST_EVENT_CONTRACT,

        version:
          ORACLE_DESKTOP_HOST_EVENT_CONTRACT_VERSION,
      },

      eventId: randomUUID(),
      sequence,
      occurredAt:
        new Date().toISOString(),

      ...payload,
    }) as Event;

    if (this.historyLimit > 0) {
      this.history.push(event);

      const overflow =
        this.history.length -
        this.historyLimit;

      if (overflow > 0) {
        this.history.splice(
          0,
          overflow
        );
      }
    }

    for (const listener of this.listeners) {
      listener(event);
    }

    return event;
  }
}

function deepFreeze<T>(value: T): T {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (
    const nestedValue of
      Object.values(value)
  ) {
    deepFreeze(nestedValue);
  }

  return Object.freeze(value);
}
