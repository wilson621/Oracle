import type {
  OracleDesktopHostSnapshot,
} from "./desktop-host-snapshot.js";

export const ORACLE_DESKTOP_HOST_EVENT_CONTRACT =
  "oracle.desktop-host-event" as const;

export const ORACLE_DESKTOP_HOST_EVENT_CONTRACT_VERSION =
  1 as const;

export type OracleDesktopHostEventContract = {
  readonly name:
    typeof ORACLE_DESKTOP_HOST_EVENT_CONTRACT;

  readonly version:
    typeof ORACLE_DESKTOP_HOST_EVENT_CONTRACT_VERSION;
};

type OracleDesktopHostEventBase = {
  readonly contract:
    OracleDesktopHostEventContract;

  readonly eventId: string;
  readonly sequence: number;
  readonly occurredAt: string;
};

export type OracleDesktopHostSnapshotCapturedEvent =
  OracleDesktopHostEventBase & {
    readonly type:
      "desktop-host.snapshot-captured";

    readonly snapshot:
      OracleDesktopHostSnapshot;
  };

export type OracleDesktopHostSnapshotClearedEvent =
  OracleDesktopHostEventBase & {
    readonly type:
      "desktop-host.snapshot-cleared";

    readonly previousSnapshot:
      OracleDesktopHostSnapshot | null;
  };

/**
 * Versioned event contract emitted by the Oracle Desktop Platform.
 *
 * Events contain plain serializable data only. Consumers must never receive
 * Electron objects, desktop controllers or mutable host-state references.
 */
export type OracleDesktopHostEvent =
  | OracleDesktopHostSnapshotCapturedEvent
  | OracleDesktopHostSnapshotClearedEvent;
