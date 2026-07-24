import {
  createOracleDevelopmentProgramme,
  type OracleDevelopmentProgramme,
} from "../development";

export interface OracleDevelopmentRepository {
  find(operatorId: string, missionId: string): Promise<OracleDevelopmentProgramme | null>;
  findByReport(operatorId: string, reportId: string): Promise<OracleDevelopmentProgramme | null>;
  save(
    programme: OracleDevelopmentProgramme,
    expectedVersion: number | null
  ): Promise<OracleDevelopmentProgramme>;
}

export class InMemoryOracleDevelopmentRepository
  implements OracleDevelopmentRepository
{
  private readonly values = new Map<string, OracleDevelopmentProgramme>();

  async find(operatorId: string, missionId: string) {
    return this.values.get(`${operatorId}|${missionId}`) ?? null;
  }

  async findByReport(operatorId: string, reportId: string) {
    return (
      [...this.values.values()].find(
        (value) =>
          value.operatorId === operatorId &&
          value.coachingFocus.reportId === reportId
      ) ?? null
    );
  }

  async save(
    programme: OracleDevelopmentProgramme,
    expectedVersion: number | null
  ) {
    const validated = createOracleDevelopmentProgramme(programme);
    const key = `${validated.operatorId}|${validated.mission.id}`;
    const current = this.values.get(key);
    if (
      (expectedVersion === null && current) ||
      (expectedVersion !== null && current?.mission.version !== expectedVersion)
    ) {
      throw new Error("Oracle Mission mutation lost optimistic concurrency.");
    }
    this.values.set(key, validated);
    return validated;
  }
}
