export const ORACLE_OPERATIONAL_DIAGNOSTIC_CONTRACT =
  "oracle.operational-diagnostic-envelope" as const;
export const ORACLE_OPERATIONAL_DIAGNOSTIC_CONTRACT_VERSION = 1 as const;
export const ORACLE_OPERATIONAL_DIAGNOSTICS_RUNTIME_CONTRACT =
  "oracle.operational-diagnostics" as const;
export const ORACLE_OPERATIONAL_DIAGNOSTICS_RUNTIME_CONTRACT_VERSION =
  1 as const;

export type OracleOperationalDiagnosticsMode =
  | "disabled"
  | "local-certification";

export type OracleOperationalDiagnosticsRuntimeDeclaration = Readonly<{
  contract: typeof ORACLE_OPERATIONAL_DIAGNOSTICS_RUNTIME_CONTRACT;
  contractVersion:
    typeof ORACLE_OPERATIONAL_DIAGNOSTICS_RUNTIME_CONTRACT_VERSION;
  purpose: "software-support";
  authority: "non-authoritative";
  mode: OracleOperationalDiagnosticsMode;
  transport: "none" | "local-transient";
  retention: "none";
  definitions: readonly OracleOperationalDiagnosticDefinition[];
}>;

export type OracleOperationalDiagnosticSeverity =
  | "info"
  | "warning"
  | "error"
  | "critical";

export type OracleOperationalDiagnosticValue =
  | string
  | number
  | boolean
  | null;

export type OracleOperationalDiagnosticAttributes = Readonly<
  Record<string, OracleOperationalDiagnosticValue>
>;

export type OracleOperationalDiagnosticDefinition = Readonly<{
  code: string;
  subsystem: string;
  severity: OracleOperationalDiagnosticSeverity;
  summary: string;
  allowedAttributes: readonly string[];
}>;

/**
 * A software-support record only. This envelope is deliberately unable to
 * carry Evidence, Understanding, Memory or arbitrary diagnostic messages.
 */
export type OracleOperationalDiagnosticEnvelope = Readonly<{
  contract: Readonly<{
    name: typeof ORACLE_OPERATIONAL_DIAGNOSTIC_CONTRACT;
    version: typeof ORACLE_OPERATIONAL_DIAGNOSTIC_CONTRACT_VERSION;
  }>;
  purpose: "software-support";
  authority: "non-authoritative";
  diagnosticId: string;
  occurredAt: string;
  code: string;
  subsystem: string;
  severity: OracleOperationalDiagnosticSeverity;
  summary: string;
  correlationId: string | null;
  attributes: OracleOperationalDiagnosticAttributes;
}>;

export type ReportOracleOperationalDiagnosticInput = Readonly<{
  code: string;
  occurredAt?: string;
  correlationId?: string | null;
  attributes?: OracleOperationalDiagnosticAttributes;
}>;

export type OracleOperationalDiagnosticRejectionReason =
  | "diagnostics-disabled"
  | "diagnostics-stopped"
  | "unknown-code"
  | "invalid-diagnostic-id"
  | "invalid-timestamp"
  | "invalid-correlation-id"
  | "undeclared-attribute"
  | "prohibited-attribute"
  | "unsafe-attribute-value"
  | "sink-failed";

export type OracleOperationalDiagnosticAdmissionResult =
  | Readonly<{
      accepted: true;
      envelope: OracleOperationalDiagnosticEnvelope;
    }>
  | Readonly<{
      accepted: false;
      reason: OracleOperationalDiagnosticRejectionReason;
    }>;

export type OracleOperationalDiagnosticMetrics = Readonly<{
  attempts: number;
  admitted: number;
  rejected: number;
  sinkFailures: number;
}>;

export type OracleOperationalDiagnosticsHealth = Readonly<{
  contract: typeof ORACLE_OPERATIONAL_DIAGNOSTICS_RUNTIME_CONTRACT;
  contractVersion:
    typeof ORACLE_OPERATIONAL_DIAGNOSTICS_RUNTIME_CONTRACT_VERSION;
  purpose: "software-support";
  authority: "non-authoritative";
  mode: OracleOperationalDiagnosticsMode;
  status: "disabled" | "ready" | "degraded" | "stopped";
  transport: "none" | "local-transient";
  retention: "none";
  metrics: OracleOperationalDiagnosticMetrics;
}>;
