import type {
  OracleDeepReadonly,
} from "./desktop-host-snapshot.js";

export const ORACLE_DESKTOP_RECOVERY_CONTRACT =
  "oracle.desktop-recovery" as const;

export const ORACLE_DESKTOP_RECOVERY_CONTRACT_VERSION =
  1 as const;

export type OracleDesktopRecoveryContract = {
  readonly name:
    typeof ORACLE_DESKTOP_RECOVERY_CONTRACT;

  readonly version:
    typeof ORACLE_DESKTOP_RECOVERY_CONTRACT_VERSION;
};

export type OracleDesktopRecoveryKind =
  | "attachment"
  | "attachment-observation"
  | "window-discovery"
  | "window-responsiveness"
  | "renderer-load"
  | "renderer-process";

export type OracleDesktopRecoveryStatus =
  | "active"
  | "recovered";

export type OracleDesktopRecoveryStrategy =
  | "await-attachment"
  | "await-observation"
  | "retry-window-discovery"
  | "await-window-response"
  | "reload-application-surface"
  | "recreate-renderer";

export type OracleDesktopRecoveryEvidence = {
  readonly diagnosticId: string;
  readonly diagnosticCode: string;
  readonly occurredAt: string;
};

/**
 * Stable, serializable record describing one desktop recovery lifecycle.
 *
 * A recovery record explains which fault opened the lifecycle, how many fault
 * observations occurred, which strategy applies and which diagnostic proved
 * recovery. It contains no Electron objects or mutable implementation state.
 */
export type OracleDesktopRecovery = {
  readonly contract:
    OracleDesktopRecoveryContract;

  readonly recoveryId: string;
  readonly kind: OracleDesktopRecoveryKind;
  readonly status: OracleDesktopRecoveryStatus;
  readonly strategy: OracleDesktopRecoveryStrategy;

  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly durationMs: number | null;

  readonly attemptCount: number;
  readonly correlationId: string | null;

  readonly trigger:
    OracleDeepReadonly<OracleDesktopRecoveryEvidence>;

  readonly latestEvidence:
    OracleDeepReadonly<OracleDesktopRecoveryEvidence>;

  readonly resolution:
    OracleDeepReadonly<OracleDesktopRecoveryEvidence> | null;
};
