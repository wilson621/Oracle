import type {
  OracleOperationalDiagnosticEnvelope,
} from "./operational-diagnostic-contract";

export interface OracleOperationalDiagnosticSink {
  readonly classification: "local-transient";
  write(envelope: OracleOperationalDiagnosticEnvelope): void;
  clear(): void;
}

/**
 * Bounded process-memory sink used only for local qualification. It has no
 * filesystem or network transport and is cleared when its owner stops.
 */
export class LocalTransientOperationalDiagnosticSink
  implements OracleOperationalDiagnosticSink
{
  readonly classification = "local-transient" as const;
  private readonly history: OracleOperationalDiagnosticEnvelope[] = [];

  constructor(private readonly limit = 100) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 1_000) {
      throw new Error(
        "Local operational diagnostic limit must be an integer from 1 to 1000."
      );
    }
  }

  write(envelope: OracleOperationalDiagnosticEnvelope): void {
    this.history.push(envelope);
    const overflow = this.history.length - this.limit;
    if (overflow > 0) {
      this.history.splice(0, overflow);
    }
  }

  getSnapshot(): readonly OracleOperationalDiagnosticEnvelope[] {
    return Object.freeze([...this.history]);
  }

  clear(): void {
    this.history.length = 0;
  }
}
