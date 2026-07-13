import type {
  OracleApplication,
  OracleApplicationId,
} from "./application-types";

const applications = new Map<
  OracleApplicationId,
  OracleApplication
>();

export function registerOracleApplication(
  application: OracleApplication
): void {
  applications.set(application.id, application);
}

export function getOracleApplications(): OracleApplication[] {
  return [...applications.values()];
}

export function getOracleApplication(
  id: OracleApplicationId
): OracleApplication | undefined {
  return applications.get(id);
}

export function clearOracleApplications(): void {
  applications.clear();
}