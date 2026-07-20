import type {
  OracleDeepReadonly,
} from "./desktop-host-snapshot.js";

export const ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT =
  "oracle.desktop-diagnostic" as const;

export const ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT_VERSION =
  1 as const;

export type OracleDesktopDiagnosticContract = {
  readonly name:
    typeof ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT;

  readonly version:
    typeof ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT_VERSION;
};

export type OracleDesktopDiagnosticSeverity =
  | "info"
  | "warning"
  | "error"
  | "critical";

export type OracleDesktopDiagnosticCategory =
  | "lifecycle"
  | "window"
  | "overlay"
  | "discovery"
  | "attachment"
  | "runtime";

export type OracleDesktopDiagnosticValue =
  | string
  | number
  | boolean
  | null;

export type OracleDesktopDiagnosticData =
  Readonly<
    Record<
      string,
      OracleDesktopDiagnosticValue
    >
  >;

/**
 * Stable, serializable diagnostic record produced by the Oracle Desktop
 * Platform. Diagnostic records describe meaningful platform transitions and
 * faults without exposing Electron objects or mutable implementation state.
 */
export type OracleDesktopDiagnostic = {
  readonly contract:
    OracleDesktopDiagnosticContract;

  readonly diagnosticId: string;
  readonly occurredAt: string;

  readonly severity:
    OracleDesktopDiagnosticSeverity;

  readonly category:
    OracleDesktopDiagnosticCategory;

  readonly code: string;
  readonly message: string;

  readonly correlationId: string | null;
  readonly sourceEventId: string | null;
  readonly sourceEventSequence: number | null;

  readonly data:
    OracleDeepReadonly<OracleDesktopDiagnosticData>;
};

export type ReportOracleDesktopDiagnosticInput = {
  severity: OracleDesktopDiagnosticSeverity;
  category: OracleDesktopDiagnosticCategory;
  code: string;
  message: string;

  occurredAt?: string;
  correlationId?: string | null;
  sourceEventId?: string | null;
  sourceEventSequence?: number | null;
  data?: OracleDesktopDiagnosticData;
};
