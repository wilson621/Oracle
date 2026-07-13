import { CompanionRuntime } from "@/lib/companion/companion-runtime";
import { createInitialCompanionRuntimeState } from "@/lib/companion/companion-state";
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
  OraclePlatformBootPhase,
  OraclePlatformDiagnostic,
  OraclePlatformDiagnosticLevel,
  OraclePlatformState,
  OraclePlatformSubsystem,
  OraclePlatformSubsystemId,
  OraclePlatformSubsystemStatus,
} from "./platform-types";

type MutablePlatformState = {
  -readonly [Key in keyof OraclePlatformState]: OraclePlatformState[Key];
};

export class OraclePlatformRuntime {
  private state: MutablePlatformState;

  private readonly companionRuntime: CompanionRuntime;

  constructor(companionRuntime = new CompanionRuntime()) {
    this.companionRuntime = companionRuntime;
    this.state = createInitialPlatformState();
  }

  getState(): OraclePlatformState {
    return {
      ...this.state,
      services: [...this.state.services],
      applications: [...this.state.applications],
      companion: {
        ...this.state.companion,
      },
      subsystems: this.state.subsystems.map((subsystem) => ({
        ...subsystem,
      })),
      diagnostics: this.state.diagnostics.map((diagnostic) => ({
        ...diagnostic,
      })),
      errors: [...this.state.errors],
    };
  }

  start(): OraclePlatformState {
    if (
      this.state.status === "booting" ||
      this.state.status === "ready" ||
      this.state.status === "degraded"
    ) {
      return this.getState();
    }

    const startedAt = new Date().toISOString();

    this.state = {
      ...createInitialPlatformState(),
      status: "booting",
      phase: "registering-services",
      startedAt,
      diagnostics: [
        createDiagnostic(
          "platform.boot.started",
          "info",
          "Oracle Platform boot started.",
          "idle",
          null
        ),
      ],
    };

    this.registerServices();
    this.registerApplications();
    this.initialiseExtensions();
    this.startCompanion();
    this.completeBoot();

    return this.getState();
  }

  stop(): OraclePlatformState {
    if (this.state.status === "stopped") {
      return this.getState();
    }

    this.updateState({
      status: "stopping",
      phase: "stopping",
    });

    this.addDiagnostic(
      "platform.stop.started",
      "info",
      "Oracle Platform shutdown started.",
      "stopping"
    );

    try {
      this.companionRuntime.stop();

      this.updateSubsystem(
        "companion",
        "stopped",
        "Companion Runtime stopped."
      );

      this.addDiagnostic(
        "platform.companion.stopped",
        "info",
        "Companion Runtime stopped successfully.",
        "stopping",
        "companion"
      );
    } catch (error) {
      const message = getErrorMessage(error);

      this.addError(
        "platform.companion.stop.failed",
        `Companion Runtime failed to stop: ${message}`,
        "stopping",
        "companion"
      );
    }

    const stoppedWithErrors = this.state.errors.length > 0;

this.updateState({
  status: stoppedWithErrors ? "failed" : "stopped",
  phase: stoppedWithErrors ? "failed" : "stopped",
  stoppedAt: new Date().toISOString(),
  companion: this.companionRuntime.getState(),
});

this.addDiagnostic(
  "platform.stop.completed",
  stoppedWithErrors ? "error" : "info",
  stoppedWithErrors
    ? "Oracle Platform stopped with errors."
    : "Oracle Platform stopped successfully.",
  stoppedWithErrors ? "failed" : "stopped"
);

    return this.getState();
  }

  private registerServices(): void {
    this.setPhase("registering-services");

    try {
      registerCoreOracleServices();

      const services = getOracleServices();
      const status: OraclePlatformSubsystemStatus =
        services.length > 0 ? "ready" : "unavailable";

      this.updateState({
        services,
      });

      this.updateSubsystem(
        "services",
        status,
        services.length > 0
          ? `${services.length} Oracle services registered.`
          : "No Oracle services are registered."
      );

      this.addDiagnostic(
        "platform.services.registered",
        status === "ready" ? "info" : "warning",
        services.length > 0
          ? `${services.length} Oracle services registered.`
          : "Platform boot continued without registered Oracle services.",
        "registering-services",
        "services"
      );
    } catch (error) {
      const message = getErrorMessage(error);

      this.updateSubsystem(
        "services",
        "failed",
        `Oracle Services registration failed: ${message}`
      );

      this.addError(
        "platform.services.registration.failed",
        `Oracle Services registration failed: ${message}`,
        "registering-services",
        "services"
      );
    }
  }

  private registerApplications(): void {
    this.setPhase("registering-applications");

    try {
      registerCoreOracleApplications();

      const applications = getOracleApplications();
      const status: OraclePlatformSubsystemStatus =
        applications.length > 0 ? "ready" : "unavailable";

      this.updateState({
        applications,
      });

      this.updateSubsystem(
        "applications",
        status,
        applications.length > 0
          ? `${applications.length} Oracle applications registered.`
          : "No Oracle applications are registered."
      );

      this.addDiagnostic(
        "platform.applications.registered",
        status === "ready" ? "info" : "warning",
        applications.length > 0
          ? `${applications.length} Oracle applications registered.`
          : "Platform boot continued without registered Oracle applications.",
        "registering-applications",
        "applications"
      );
    } catch (error) {
      const message = getErrorMessage(error);

      this.updateSubsystem(
        "applications",
        "failed",
        `Oracle Applications registration failed: ${message}`
      );

      this.addError(
        "platform.applications.registration.failed",
        `Oracle Applications registration failed: ${message}`,
        "registering-applications",
        "applications"
      );
    }
  }

  private initialiseExtensions(): void {
    this.setPhase("initialising-extensions");

    try {
      const extensionRuntime = new OracleExtensionRuntime();
      const extensionStates = extensionRuntime.getStates();

      this.updateSubsystem(
        "extensions",
        "ready",
        extensionStates.length > 0
          ? `${extensionStates.length} extensions registered.`
          : "Extension Runtime ready. No extensions registered yet."
      );

      this.addDiagnostic(
        "platform.extensions.initialised",
        "info",
        extensionStates.length > 0
          ? `${extensionStates.length} Oracle extensions initialised.`
          : "Oracle Extension Runtime initialised without registered extensions.",
        "initialising-extensions",
        "extensions"
      );
    } catch (error) {
      const message = getErrorMessage(error);

      this.updateSubsystem(
        "extensions",
        "failed",
        `Oracle Extension Runtime failed: ${message}`
      );

      this.addError(
        "platform.extensions.initialisation.failed",
        `Oracle Extension Runtime failed: ${message}`,
        "initialising-extensions",
        "extensions"
      );
    }
  }

  private startCompanion(): void {
    this.setPhase("starting-companion");

    try {
      this.companionRuntime.start();

      const companion = this.companionRuntime.getState();
      const isReady = companion.status === "ready";

      this.updateState({
        companion,
      });

      this.updateSubsystem(
        "companion",
        isReady ? "ready" : "failed",
        isReady
          ? "Companion Runtime ready."
          : `Companion Runtime entered status '${companion.status}'.`
      );

      if (isReady) {
        this.addDiagnostic(
          "platform.companion.started",
          "info",
          "Companion Runtime started successfully.",
          "starting-companion",
          "companion"
        );
      } else {
        this.addError(
          "platform.companion.start.failed",
          `Companion Runtime entered status '${companion.status}' during startup.`,
          "starting-companion",
          "companion"
        );
      }
    } catch (error) {
      const message = getErrorMessage(error);

      this.updateSubsystem(
        "companion",
        "failed",
        `Companion Runtime failed to start: ${message}`
      );

      this.addError(
        "platform.companion.start.failed",
        `Companion Runtime failed to start: ${message}`,
        "starting-companion",
        "companion"
      );
    }
  }

  private completeBoot(): void {
    this.setPhase("validating");

    const hasFailedSubsystem = this.state.subsystems.some(
      (subsystem) => subsystem.status === "failed"
    );

    const hasUnavailableSubsystem = this.state.subsystems.some(
      (subsystem) => subsystem.status === "unavailable"
    );

    if (hasFailedSubsystem || this.state.errors.length > 0) {
      this.updateState({
        status: "failed",
        phase: "failed",
        readyAt: null,
      });

      this.addDiagnostic(
        "platform.boot.failed",
        "error",
        "Oracle Platform boot failed.",
        "failed"
      );

      return;
    }

    if (hasUnavailableSubsystem) {
      this.updateState({
        status: "degraded",
        phase: "complete",
        readyAt: new Date().toISOString(),
      });

      this.addDiagnostic(
        "platform.boot.degraded",
        "warning",
        "Oracle Platform boot completed in a degraded state.",
        "complete"
      );

      return;
    }

    this.updateState({
      status: "ready",
      phase: "complete",
      readyAt: new Date().toISOString(),
    });

    this.addDiagnostic(
      "platform.boot.ready",
      "info",
      "Oracle Platform is ready.",
      "complete"
    );
  }

  private setPhase(phase: OraclePlatformBootPhase): void {
    this.updateState({
      phase,
    });
  }

  private updateSubsystem(
    id: OraclePlatformSubsystemId,
    status: OraclePlatformSubsystemStatus,
    message: string
  ): void {
    const subsystem = createSubsystem(id, status, message);
    const existingIndex = this.state.subsystems.findIndex(
      (candidate) => candidate.id === id
    );

    if (existingIndex === -1) {
      this.updateState({
        subsystems: [...this.state.subsystems, subsystem],
      });

      return;
    }

    const subsystems = [...this.state.subsystems];
    subsystems[existingIndex] = subsystem;

    this.updateState({
      subsystems,
    });
  }

  private addDiagnostic(
    code: string,
    level: OraclePlatformDiagnosticLevel,
    message: string,
    phase: OraclePlatformBootPhase,
    subsystemId: OraclePlatformSubsystemId | null = null
  ): void {
    this.updateState({
      diagnostics: [
        ...this.state.diagnostics,
        createDiagnostic(code, level, message, phase, subsystemId),
      ],
    });
  }

  private addError(
    code: string,
    message: string,
    phase: OraclePlatformBootPhase,
    subsystemId: OraclePlatformSubsystemId | null = null
  ): void {
    this.updateState({
      errors: [...this.state.errors, message],
      diagnostics: [
        ...this.state.diagnostics,
        createDiagnostic(code, "error", message, phase, subsystemId),
      ],
    });
  }

  private updateState(update: Partial<MutablePlatformState>): void {
    this.state = {
      ...this.state,
      ...update,
      updatedAt: new Date().toISOString(),
    };
  }
}

export function createInitialPlatformState(): MutablePlatformState {
  const now = new Date().toISOString();

  return {
    status: "idle",
    phase: "idle",
    startedAt: null,
    readyAt: null,
    stoppedAt: null,
    updatedAt: now,
    services: [],
    applications: [],
    companion: createInitialCompanionRuntimeState(),
    subsystems: [],
    diagnostics: [],
    errors: [],
  };
}

function createSubsystem(
  id: OraclePlatformSubsystemId,
  status: OraclePlatformSubsystemStatus,
  message: string
): OraclePlatformSubsystem {
  return {
    id,
    name: getSubsystemName(id),
    status,
    message,
    updatedAt: new Date().toISOString(),
  };
}

function createDiagnostic(
  code: string,
  level: OraclePlatformDiagnosticLevel,
  message: string,
  phase: OraclePlatformBootPhase,
  subsystemId: OraclePlatformSubsystemId | null
): OraclePlatformDiagnostic {
  return {
    code,
    level,
    message,
    phase,
    subsystemId,
    timestamp: new Date().toISOString(),
  };
}

function getSubsystemName(id: OraclePlatformSubsystemId): string {
  switch (id) {
    case "services":
      return "Oracle Services";
    case "applications":
      return "Oracle Applications";
    case "extensions":
      return "Oracle Extension Runtime";
    case "companion":
      return "Oracle Companion Runtime";
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}