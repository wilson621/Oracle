import {
  ORACLE_OPERATIONAL_DIAGNOSTIC_CONTRACT,
  ORACLE_OPERATIONAL_DIAGNOSTIC_CONTRACT_VERSION,
  type OracleOperationalDiagnosticAdmissionResult,
  type OracleOperationalDiagnosticDefinition,
  type OracleOperationalDiagnosticEnvelope,
  type OracleOperationalDiagnosticMetrics,
  type ReportOracleOperationalDiagnosticInput,
} from "./operational-diagnostic-contract";
import type {
  OracleOperationalDiagnosticSink,
} from "./local-operational-diagnostic-sink";
import {
  deepFreeze,
  isValidOperationalDiagnosticCorrelationId,
  isValidOperationalDiagnosticId,
  isValidOperationalDiagnosticTimestamp,
  requireOperationalDiagnosticDefinitions,
  validateOperationalDiagnosticAttributes,
} from "./operational-diagnostic-policy";

export type OracleOperationalDiagnosticsMode =
  | "disabled"
  | "local-certification";

export type OracleOperationalDiagnosticsOptions = Readonly<{
  mode: OracleOperationalDiagnosticsMode;
  definitions: readonly OracleOperationalDiagnosticDefinition[];
  sink: OracleOperationalDiagnosticSink | null;
  now?: () => string;
  createId?: () => string;
}>;

type MutableMetrics = {
  attempts: number;
  admitted: number;
  rejected: number;
  sinkFailures: number;
};

/**
 * Instance-owned admission authority for non-authoritative software-support
 * diagnostics. It has no dependency on Oracle Services or intelligence.
 */
export class OracleOperationalDiagnosticsService {
  private readonly mode: OracleOperationalDiagnosticsMode;
  private readonly sink: OracleOperationalDiagnosticSink | null;
  private readonly definitions: ReadonlyMap<
    string,
    OracleOperationalDiagnosticDefinition
  >;
  private readonly now: () => string;
  private readonly createId: () => string;
  private readonly metrics: MutableMetrics = {
    attempts: 0,
    admitted: 0,
    rejected: 0,
    sinkFailures: 0,
  };
  private stopped = false;

  constructor(options: OracleOperationalDiagnosticsOptions) {
    this.mode = options.mode;
    this.sink = options.sink;
    this.definitions = requireOperationalDiagnosticDefinitions(
      options.definitions
    );
    this.now = options.now ?? (() => new Date().toISOString());
    this.createId =
      options.createId ??
      (() => globalThis.crypto.randomUUID());

    if (
      (this.mode === "disabled" && this.sink !== null) ||
      (this.mode === "local-certification" &&
        this.sink?.classification !== "local-transient")
    ) {
      throw new Error(
        "Operational diagnostics mode and local transient sink diverged."
      );
    }
  }

  report(
    input: ReportOracleOperationalDiagnosticInput
  ): OracleOperationalDiagnosticAdmissionResult {
    this.metrics.attempts += 1;

    if (this.stopped) {
      return this.reject("diagnostics-stopped");
    }
    if (this.mode === "disabled" || this.sink === null) {
      return this.reject("diagnostics-disabled");
    }

    const definition = this.definitions.get(input.code);
    if (!definition) {
      return this.reject("unknown-code");
    }

    const occurredAt = input.occurredAt ?? this.now();
    if (!isValidOperationalDiagnosticTimestamp(occurredAt)) {
      return this.reject("invalid-timestamp");
    }

    const correlationId = input.correlationId ?? null;
    if (
      correlationId !== null &&
      !isValidOperationalDiagnosticCorrelationId(correlationId)
    ) {
      return this.reject("invalid-correlation-id");
    }

    const attributes = input.attributes ?? {};
    const attributeRejection = validateOperationalDiagnosticAttributes(
      definition,
      attributes
    );
    if (attributeRejection) {
      return this.reject(attributeRejection);
    }

    const diagnosticId = this.createId();
    if (!isValidOperationalDiagnosticId(diagnosticId)) {
      return this.reject("invalid-diagnostic-id");
    }

    const envelope = deepFreeze({
      contract: {
        name: ORACLE_OPERATIONAL_DIAGNOSTIC_CONTRACT,
        version: ORACLE_OPERATIONAL_DIAGNOSTIC_CONTRACT_VERSION,
      },
      purpose: "software-support",
      authority: "non-authoritative",
      diagnosticId,
      occurredAt,
      code: definition.code,
      subsystem: definition.subsystem,
      severity: definition.severity,
      summary: definition.summary,
      correlationId,
      attributes: { ...attributes },
    }) satisfies OracleOperationalDiagnosticEnvelope;

    try {
      this.sink.write(envelope);
    } catch {
      this.metrics.sinkFailures += 1;
      return this.reject("sink-failed");
    }

    this.metrics.admitted += 1;
    return Object.freeze({
      accepted: true,
      envelope,
    });
  }

  getMetrics(): OracleOperationalDiagnosticMetrics {
    return Object.freeze({ ...this.metrics });
  }

  stop(): void {
    this.sink?.clear();
    this.stopped = true;
  }

  private reject(
    reason: Exclude<
      OracleOperationalDiagnosticAdmissionResult,
      { accepted: true }
    >["reason"]
  ): OracleOperationalDiagnosticAdmissionResult {
    this.metrics.rejected += 1;
    return Object.freeze({
      accepted: false,
      reason,
    });
  }
}
