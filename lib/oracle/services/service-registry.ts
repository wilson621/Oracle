import type {
  OracleService,
  OracleServiceId,
} from "./service-types";

const services = new Map<
  OracleServiceId,
  OracleService
>();

export function registerOracleService(
  service: OracleService
): void {
  services.set(service.id, service);
}

export function getOracleServices(): OracleService[] {
  return [...services.values()];
}

export function getOracleService(
  id: OracleServiceId
): OracleService | undefined {
  return services.get(id);
}

export function clearOracleServices(): void {
  services.clear();
}