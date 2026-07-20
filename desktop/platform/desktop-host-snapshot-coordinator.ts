import type {
  OracleDesktopHostState,
} from "../host-state.js";
import type {
  OracleDesktopHostEvent,
} from "./desktop-host-event.js";
import {
  OracleDesktopHostEventStream,
  type OracleDesktopHostEventListener,
} from "./desktop-host-event-stream.js";
import {
  createOracleDesktopHostSnapshot,
} from "./desktop-host-snapshot-builder.js";
import type {
  OracleDesktopHostSnapshot,
} from "./desktop-host-snapshot.js";

export type OracleDesktopHostSnapshotListener = (
  snapshot: OracleDesktopHostSnapshot
) => void;

/**
 * Authoritative owner of the latest Oracle desktop-host snapshot.
 *
 * Desktop infrastructure captures plain host state through this coordinator.
 * Consumers receive stable immutable platform contracts and events, and never
 * need to depend on Electron objects, host-state models or controllers.
 */
export class OracleDesktopHostSnapshotCoordinator {
  private currentSnapshot:
    OracleDesktopHostSnapshot | null = null;

  private readonly listeners =
    new Set<OracleDesktopHostSnapshotListener>();

  constructor(
    private readonly events =
      new OracleDesktopHostEventStream()
  ) {}

  capture(
    hostState: OracleDesktopHostState,
    capturedAt?: string
  ): OracleDesktopHostSnapshot {
    const snapshot =
      createOracleDesktopHostSnapshot({
        hostState,
        capturedAt,
      });

    this.currentSnapshot = snapshot;

    this.events
      .publishSnapshotCaptured(snapshot);

    for (const listener of this.listeners) {
      listener(snapshot);
    }

    return snapshot;
  }

  getSnapshot(): OracleDesktopHostSnapshot | null {
    return this.currentSnapshot;
  }

  subscribe(
    listener: OracleDesktopHostSnapshotListener
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeEvents(
    listener: OracleDesktopHostEventListener
  ): () => void {
    return this.events.subscribe(listener);
  }

  getRecentEvents(): readonly OracleDesktopHostEvent[] {
    return this.events.getRecentEvents();
  }

  clear(): void {
    const previousSnapshot =
      this.currentSnapshot;

    this.currentSnapshot = null;

    this.events
      .publishSnapshotCleared(
        previousSnapshot
      );
  }
}
