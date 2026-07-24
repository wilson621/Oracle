import type {
  OracleService,
  OracleServiceId,
} from "./service-types";
import { OracleServiceRegistry } from "./service-registry";

export type OracleServiceAvailability =
  | "available"
  | "unavailable";

export type OracleServiceRuntimeState = {
  serviceId: OracleServiceId;
  availability: OracleServiceAvailability;
  reason: string | null;
};

export class OracleServiceRuntime {
  constructor(private readonly registry: OracleServiceRegistry) {}

  getState(
    serviceId: OracleServiceId
  ): OracleServiceRuntimeState {
    const service = this.registry.get(serviceId);

    if (!service) {
      return {
        serviceId,
        availability: "unavailable",
        reason: "Service is not registered.",
      };
    }

    if (service.status !== "available") {
      return {
        serviceId,
        availability: "unavailable",
        reason: "Service is disabled.",
      };
    }

    return {
      serviceId,
      availability: "available",
      reason: null,
    };
  }

  getAvailableServices(): OracleService[] {
        const serviceIds: OracleServiceId[] = [
      "ai-coach",
      "oracle-brain",
      "loadouts",
      "reports",
      "sessions",
      "progression",
      "missions",
      "memory",
      "operator",
      "companion",
    ];

    return serviceIds
      .map((id) => this.registry.get(id))
      .filter(
        (service): service is OracleService =>
          service !== undefined &&
          service.status === "available"
      );
  }
}
