import {
  createOracleSessionReport,
  type OracleSessionReport,
} from "../reports";

export interface OracleSessionReportRepository {
  findByFingerprint(
    operatorId: string,
    sessionId: string,
    inputFingerprint: string
  ): Promise<OracleSessionReport | null>;
  save(report: OracleSessionReport): Promise<OracleSessionReport>;
  list(
    operatorId: string,
    sessionId: string | null,
    pageSize: number
  ): Promise<readonly OracleSessionReport[]>;
  findById(
    operatorId: string,
    reportId: string
  ): Promise<OracleSessionReport | null>;
}

/**
 * Certification-only implementation. Production persistence remains disabled.
 */
export class InMemoryOracleSessionReportRepository
  implements OracleSessionReportRepository
{
  private readonly reports = new Map<string, OracleSessionReport>();

  async findByFingerprint(
    operatorId: string,
    sessionId: string,
    inputFingerprint: string
  ): Promise<OracleSessionReport | null> {
    return (
      [...this.reports.values()].find(
        (report) =>
          report.operatorId === operatorId &&
          report.sessionId === sessionId &&
          report.inputFingerprint === inputFingerprint
      ) ?? null
    );
  }

  async save(report: OracleSessionReport): Promise<OracleSessionReport> {
    const validated = createOracleSessionReport(report);
    const existing = this.reports.get(validated.id);
    if (existing && existing.inputFingerprint !== validated.inputFingerprint) {
      throw new Error("Oracle Session Report identity conflicts.");
    }
    this.reports.set(validated.id, validated);
    return validated;
  }

  async list(
    operatorId: string,
    sessionId: string | null,
    pageSize: number
  ): Promise<readonly OracleSessionReport[]> {
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new Error("Oracle Session Report page size must be between 1 and 100.");
    }
    return Object.freeze(
      [...this.reports.values()]
        .filter(
          (report) =>
            report.operatorId === operatorId &&
            (sessionId === null || report.sessionId === sessionId)
        )
        .sort(
          (left, right) =>
            right.generatedAt.localeCompare(left.generatedAt) ||
            right.revision - left.revision
        )
        .slice(0, pageSize)
    );
  }

  async findById(
    operatorId: string,
    reportId: string
  ): Promise<OracleSessionReport | null> {
    const report = this.reports.get(reportId);
    return report?.operatorId === operatorId ? report : null;
  }
}
