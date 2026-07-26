import {
  ORACLE_OPERATIONAL_DIAGNOSTICS_RUNTIME_CONTRACT,
  ORACLE_OPERATIONAL_DIAGNOSTICS_RUNTIME_CONTRACT_VERSION,
  type OracleOperationalDiagnosticDefinition,
  type OracleOperationalDiagnosticsMode,
  type OracleOperationalDiagnosticsRuntimeDeclaration,
} from "./operational-diagnostic-contract";
import { LocalTransientOperationalDiagnosticSink } from "./local-operational-diagnostic-sink";
import { OracleOperationalDiagnosticsService } from "./operational-diagnostics-service";

export const ORACLE_RUNTIME_OPERATIONAL_DIAGNOSTIC_DEFINITIONS:
  readonly OracleOperationalDiagnosticDefinition[] = Object.freeze([
    Object.freeze({
      code: "platform.runtime.started",
      subsystem: "platform",
      severity: "info",
      summary: "Oracle Platform runtime started.",
      allowedAttributes: Object.freeze(["runtimeTarget", "attempt"]),
    }),
    Object.freeze({
      code: "platform.runtime.failed",
      subsystem: "platform",
      severity: "error",
      summary: "Oracle Platform runtime failed closed.",
      allowedAttributes: Object.freeze([
        "runtimeTarget",
        "phase",
        "subsystem",
        "failureClass",
      ]),
    }),
    Object.freeze({
      code: "platform.runtime.stopping",
      subsystem: "platform",
      severity: "info",
      summary: "Oracle Platform runtime is stopping.",
      allowedAttributes: Object.freeze(["runtimeTarget"]),
    }),
    Object.freeze({
      code: "platform.runtime.recovery-started",
      subsystem: "platform",
      severity: "warning",
      summary: "Oracle Platform fresh-runtime recovery started.",
      allowedAttributes: Object.freeze(["runtimeTarget", "attempt"]),
    }),
    Object.freeze({
      code: "platform.runtime.recovery-completed",
      subsystem: "platform",
      severity: "info",
      summary: "Oracle Platform fresh-runtime recovery completed.",
      allowedAttributes: Object.freeze([
        "runtimeTarget",
        "attempt",
        "status",
      ]),
    }),
  ]);

export function createOracleOperationalDiagnosticsDeclaration(
  mode: OracleOperationalDiagnosticsMode
): OracleOperationalDiagnosticsRuntimeDeclaration {
  return Object.freeze({
    contract: ORACLE_OPERATIONAL_DIAGNOSTICS_RUNTIME_CONTRACT,
    contractVersion:
      ORACLE_OPERATIONAL_DIAGNOSTICS_RUNTIME_CONTRACT_VERSION,
    purpose: "software-support",
    authority: "non-authoritative",
    mode,
    transport:
      mode === "local-certification" ? "local-transient" : "none",
    retention: "none",
    definitions: Object.freeze(
      ORACLE_RUNTIME_OPERATIONAL_DIAGNOSTIC_DEFINITIONS.map((definition) =>
        Object.freeze({
          ...definition,
          allowedAttributes: Object.freeze([
            ...definition.allowedAttributes,
          ]),
        })
      )
    ),
  });
}

export function createOracleOperationalDiagnosticsService(
  declaration: OracleOperationalDiagnosticsRuntimeDeclaration,
  options: Readonly<{
    sinkLimit?: number;
    now?: () => string;
    createId?: () => string;
  }> = {}
): OracleOperationalDiagnosticsService {
  return new OracleOperationalDiagnosticsService({
    mode: declaration.mode,
    definitions: ORACLE_RUNTIME_OPERATIONAL_DIAGNOSTIC_DEFINITIONS,
    sink:
      declaration.mode === "local-certification"
        ? new LocalTransientOperationalDiagnosticSink(options.sinkLimit)
        : null,
    now: options.now,
    createId: options.createId,
  });
}
