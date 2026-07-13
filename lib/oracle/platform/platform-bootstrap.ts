import { CompanionRuntime } from "@/lib/companion/companion-runtime";
import { OracleExtensionRuntime } from "@/lib/companion/extensions/extension-runtime";
import {
  getOracleApplications,
  registerCoreOracleApplications,
} from "../applications";
import {
  getOracleServices,
  registerCoreOracleServices,
} from "../services";
import type {
  OraclePlatformState,
  OraclePlatformSubsystem,
} from "./platform-types";

export function bootstrapOraclePlatform(): OraclePlatformState {
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  const subsystems: OraclePlatformSubsystem[] = [];

  registerCoreOracleServices();

  const services = getOracleServices();

  subsystems.push({
    id: "services",
    name: "Oracle Services",
    status: services.length > 0 ? "ready" : "unavailable",
    message:
      services.length > 0
        ? `${services.length} Oracle services registered.`
        : "No Oracle services are registered.",
  });

  registerCoreOracleApplications();

  const applications = getOracleApplications();

  subsystems.push({
    id: "applications",
    name: "Oracle Applications",
    status: applications.length > 0 ? "ready" : "unavailable",
    message:
      applications.length > 0
        ? `${applications.length} Oracle applications registered.`
        : "No Oracle applications are registered.",
  });

  const extensionRuntime = new OracleExtensionRuntime();
  const extensionStates = extensionRuntime.getStates();

  subsystems.push({
    id: "extensions",
    name: "Oracle Extension Runtime",
    status: "ready",
    message:
      extensionStates.length > 0
        ? `${extensionStates.length} extensions registered.`
        : "Extension Runtime ready. No extensions registered yet.",
  });

  const companionRuntime = new CompanionRuntime();
  companionRuntime.start();

  const companion = companionRuntime.getState();

  subsystems.push({
    id: "companion",
    name: "Oracle Companion Runtime",
    status: companion.status === "ready" ? "ready" : "failed",
    message:
      companion.status === "ready"
        ? "Companion Runtime ready."
        : `Companion Runtime entered status '${companion.status}'.`,
  });

  const failedSubsystems = subsystems.filter(
    (subsystem) => subsystem.status === "failed"
  );

  if (failedSubsystems.length > 0) {
    errors.push(
      ...failedSubsystems.map(
        (subsystem) =>
          `${subsystem.name}: ${subsystem.message}`
      )
    );
  }

  const status =
    errors.length === 0 ? "ready" : "failed";

  return {
    status,
    startedAt,
    readyAt:
      status === "ready"
        ? new Date().toISOString()
        : null,
    services,
    applications,
    companion,
    subsystems,
    errors,
  };
}