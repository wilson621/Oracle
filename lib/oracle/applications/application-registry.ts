import type {
  OracleApplication,
  OracleApplicationId,
} from "./application-types";

export class OracleApplicationRegistry {
  private readonly applications =
    new Map<OracleApplicationId, OracleApplication>();

  register(application: OracleApplication): void {
    if (this.applications.has(application.id)) {
      throw new Error(
        `Oracle Application '${application.id}' is already registered.`
      );
    }
    this.applications.set(
      application.id,
      Object.freeze({
        ...application,
        requiredServices: Object.freeze([
          ...application.requiredServices,
        ]),
      })
    );
  }

  has(id: OracleApplicationId): boolean {
    return this.applications.has(id);
  }

  getAll(): OracleApplication[] {
    return [...this.applications.values()];
  }

  get(id: OracleApplicationId): OracleApplication | undefined {
    return this.applications.get(id);
  }

  clear(): void {
    this.applications.clear();
  }
}
