import type {
  OracleService,
  OracleServiceId,
} from "./service-types";

export class OracleServiceRegistry {
  private readonly services = new Map<OracleServiceId, OracleService>();

  register(service: OracleService): void {
    if (this.services.has(service.id)) {
      throw new Error(`Oracle Service '${service.id}' is already registered.`);
    }
    this.services.set(
      service.id,
      Object.freeze({
        ...service,
        requiredCapabilities: Object.freeze([
          ...service.requiredCapabilities,
        ]),
      })
    );
  }

  has(id: OracleServiceId): boolean {
    return this.services.has(id);
  }

  getAll(): OracleService[] {
    return [...this.services.values()];
  }

  get(id: OracleServiceId): OracleService | undefined {
    return this.services.get(id);
  }

  clear(): void {
    this.services.clear();
  }
}
