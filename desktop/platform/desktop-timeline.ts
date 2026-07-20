import type {
  OracleDesktopDiagnostic,
} from "./desktop-diagnostic.js";
import type {
  OracleDesktopHostEvent,
} from "./desktop-host-event.js";
import type {
  OracleDeepReadonly,
} from "./desktop-host-snapshot.js";
import type {
  OracleDesktopRecovery,
} from "./desktop-recovery.js";

export const ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT =
  "oracle.desktop-timeline-entry" as const;

export const ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT_VERSION =
  1 as const;

export type OracleDesktopTimelineEntryContract = {
  readonly name:
    typeof ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT;

  readonly version:
    typeof ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT_VERSION;
};

export type OracleDesktopTimelineEntryKind =
  | "host-event"
  | "diagnostic"
  | "recovery";

type OracleDesktopTimelineEntryBase = {
  readonly contract:
    OracleDesktopTimelineEntryContract;

  readonly entryId: string;
  readonly sequence: number;
  readonly occurredAt: string;
  readonly kind: OracleDesktopTimelineEntryKind;
  readonly correlationId: string | null;
  readonly sourceId: string;
};

export type OracleDesktopHostEventTimelineEntry =
  OracleDesktopTimelineEntryBase & {
    readonly kind: "host-event";
    readonly sourceId: string;
    readonly payload:
      OracleDeepReadonly<OracleDesktopHostEvent>;
  };

export type OracleDesktopDiagnosticTimelineEntry =
  OracleDesktopTimelineEntryBase & {
    readonly kind: "diagnostic";
    readonly sourceId: string;
    readonly payload:
      OracleDeepReadonly<OracleDesktopDiagnostic>;
  };

export type OracleDesktopRecoveryTimelineEntry =
  OracleDesktopTimelineEntryBase & {
    readonly kind: "recovery";
    readonly sourceId: string;
    readonly payload:
      OracleDeepReadonly<OracleDesktopRecovery>;
  };

/**
 * Stable, serializable record in the unified Oracle Desktop Platform timeline.
 *
 * Timeline entries preserve the original immutable platform payload and add a
 * monotonic sequence so consumers can reconstruct exact in-process ordering
 * even when multiple records share the same timestamp.
 */
export type OracleDesktopTimelineEntry =
  | OracleDesktopHostEventTimelineEntry
  | OracleDesktopDiagnosticTimelineEntry
  | OracleDesktopRecoveryTimelineEntry;
