import { createInitialCompanionRuntimeState } from "../../companion/companion-state";
import {
  assertOracleCompositionMatchesManifest,
  getOracleSubsystemDeclaration,
  type OraclePlatformComposition,
  type OraclePlatformSubsystemId,
} from "./platform-composition";
import type {
  OraclePlatformBootPhase,
  OraclePlatformDiagnostic,
  OraclePlatformDiagnosticLevel,
  OraclePlatformState,
  OraclePlatformSubsystem,
  OraclePlatformSubsystemStatus,
} from "./platform-types";

type MutablePlatformState = {
  -readonly [Key in keyof OraclePlatformState]: OraclePlatformState[Key];
};

export class OraclePlatformRuntime {
  private state: MutablePlatformState;

  constructor(private readonly composition: OraclePlatformComposition) {
    this.state = createInitialPlatformState(composition);
  }

  getComposition(): OraclePlatformComposition {
    return this.composition;
  }

  getState(): OraclePlatformState {
    return Object.freeze({
      ...this.state,
      services: Object.freeze([...this.state.services]),
      applications: Object.freeze([...this.state.applications]),
      gameIntegrations: Object.freeze([...this.state.gameIntegrations]),
      guidanceProviders: Object.freeze([...this.state.guidanceProviders]),
      companion: cloneCompanion(this.state.companion),
      subsystems: Object.freeze(
        this.state.subsystems.map((subsystem) =>
          Object.freeze({ ...subsystem })
        )
      ),
      diagnostics: Object.freeze(
        this.state.diagnostics.map((diagnostic) =>
          Object.freeze({ ...diagnostic })
        )
      ),
      errors: Object.freeze([...this.state.errors]),
    });
  }

  start(): OraclePlatformState {
    if (
      this.state.status === "booting" ||
      this.state.status === "ready" ||
      this.state.status === "degraded"
    ) {
      return this.getState();
    }

    this.state = {
      ...createInitialPlatformState(this.composition),
      status: "booting",
      phase: "validating-composition",
      startedAt: new Date().toISOString(),
      diagnostics: Object.freeze([
        createDiagnostic(
          "platform.boot.started",
          "info",
          "Oracle Platform boot started.",
          "idle",
          null
        ),
      ]),
    };

    this.validateComposition();
    this.loadServices();
    this.loadSessionLifecycle();
    this.loadApplications();
    this.loadGameIntegrations();
    this.loadGuidance();
    this.initialiseExtensions();
    this.startCompanion();
    this.completeBoot();

    return this.getState();
  }

  stop(): OraclePlatformState {
    if (this.state.status === "stopped") return this.getState();

    this.updateState({ status: "stopping", phase: "stopping" });
    this.addDiagnostic(
      "platform.stop.started",
      "info",
      "Oracle Platform shutdown started.",
      "stopping"
    );

    try {
      this.composition.companion.stop();
      this.updateSubsystem("companion", "stopped", "Companion Runtime stopped.");
    } catch (error) {
      this.recordSubsystemFailure(
        "companion",
        `Companion Runtime failed to stop: ${getErrorMessage(error)}`,
        "stopping"
      );
    }

    const failed = this.state.subsystems.some(
      ({ required, status }) => required && status === "failed"
    );
    this.updateState({
      status: failed ? "failed" : "stopped",
      phase: failed ? "failed" : "stopped",
      stoppedAt: new Date().toISOString(),
      companion: this.composition.companion.getState(),
    });
    return this.getState();
  }

  private validateComposition(): void {
    this.setPhase("validating-composition");
    try {
      assertOracleCompositionMatchesManifest(this.composition);
      this.updateState({ manifestVerified: true });
      this.updateSubsystem(
        "composition",
        "ready",
        "Constructed runtime exactly matches the canonical manifest."
      );
      this.addDiagnostic(
        "platform.composition.verified",
        "info",
        "Runtime composition exactly matches its canonical manifest.",
        "validating-composition",
        "composition"
      );
    } catch (error) {
      this.recordSubsystemFailure(
        "composition",
        getErrorMessage(error),
        "validating-composition"
      );
    }
  }

  private loadServices(): void {
    this.setPhase("registering-services");
    try {
      const services = this.composition.services.getAll();
      this.updateState({
        services: Object.freeze(services) as OraclePlatformState["services"],
      });
      this.markInventory(
        "services",
        services.length,
        `${services.length} Oracle Services composed.`
      );
    } catch (error) {
      this.recordSubsystemFailure(
        "services",
        `Oracle Services composition failed: ${getErrorMessage(error)}`,
        "registering-services"
      );
    }
  }

  private loadApplications(): void {
    this.setPhase("registering-applications");
    try {
      const applications = this.composition.applications.getAll();
      const availableServiceIds = new Set<string>(
        this.state.services.map(({ id }) => id)
      );
      for (const application of applications) {
        for (const serviceId of application.requiredServices) {
          if (!availableServiceIds.has(serviceId)) {
            throw new Error(
              `Application '${application.id}' requires unavailable Service '${serviceId}'.`
            );
          }
        }
      }
      this.updateState({
        applications:
          Object.freeze(applications) as OraclePlatformState["applications"],
      });
      this.markInventory(
        "applications",
        applications.length,
        `${applications.length} Oracle Applications composed.`
      );
    } catch (error) {
      this.recordSubsystemFailure(
        "applications",
        `Oracle Applications composition failed: ${getErrorMessage(error)}`,
        "registering-applications"
      );
    }
  }

  private loadSessionLifecycle(): void {
    this.setPhase("starting-session-lifecycle");
    try {
      const { declaration, service } = this.composition.sessionLifecycle;
      if (
        declaration.authority !== "session-service" ||
        declaration.persistence !== "disabled" ||
        !service
      ) {
        throw new Error("Authoritative Session Service composition is invalid.");
      }
      this.updateSubsystem(
        "session-lifecycle",
        "ready",
        "Authoritative Session Service is composed with persistence disabled."
      );
    } catch (error) {
      this.recordSubsystemFailure(
        "session-lifecycle",
        `Oracle Session lifecycle composition failed: ${getErrorMessage(error)}`,
        "starting-session-lifecycle"
      );
    }
  }

  private loadGameIntegrations(): void {
    this.setPhase("registering-game-integrations");
    try {
      const identities = this.composition.gameIntegrations
        .getAll()
        .map(({ id }) => id);
      this.updateState({ gameIntegrations: Object.freeze(identities) });
      this.markInventory(
        "game-integrations",
        identities.length,
        `${identities.length} Game Integrations composed.`
      );
    } catch (error) {
      this.recordSubsystemFailure(
        "game-integrations",
        `Game Integration composition failed: ${getErrorMessage(error)}`,
        "registering-game-integrations"
      );
    }
  }

  private loadGuidance(): void {
    this.setPhase("registering-guidance");
    try {
      const identities = this.composition.guidance
        .getProviderManifests()
        .map(({ id }) => id);
      this.updateState({ guidanceProviders: Object.freeze(identities) });
      this.markInventory(
        "guidance",
        identities.length,
        `${identities.length} Guidance providers composed.`
      );
    } catch (error) {
      this.recordSubsystemFailure(
        "guidance",
        `Guidance composition failed: ${getErrorMessage(error)}`,
        "registering-guidance"
      );
    }
  }

  private initialiseExtensions(): void {
    this.setPhase("initialising-extensions");
    try {
      const count = this.composition.extensions.getStates().length;
      this.updateSubsystem(
        "extensions",
        "ready",
        count > 0
          ? `${count} extensions composed.`
          : "Extension Runtime ready with no extensions."
      );
    } catch (error) {
      this.recordSubsystemFailure(
        "extensions",
        `Extension Runtime failed: ${getErrorMessage(error)}`,
        "initialising-extensions"
      );
    }
  }

  private startCompanion(): void {
    this.setPhase("starting-companion");
    const prerequisitesReady = this.state.subsystems
      .filter(
        ({ id, required }) =>
          required && id !== "companion"
      )
      .every(({ status }) => status === "ready");

    try {
      this.composition.companion.start({
        platformAuthorized: this.state.status === "booting",
        prerequisitesReady,
        waitingReason: prerequisitesReady
          ? undefined
          : "Required Oracle Platform subsystems are not ready.",
      });
      const companion = this.composition.companion.getState();
      this.updateState({ companion });
      if (companion.status === "ready") {
        this.updateSubsystem(
          "companion",
          "ready",
          "Platform Companion capability lifecycle is ready."
        );
      } else {
        this.recordSubsystemFailure(
          "companion",
          companion.failure?.message ??
            `Companion Runtime entered '${companion.status}'.`,
          "starting-companion",
          companion.status === "waiting-for-platform"
            ? "unavailable"
            : "failed"
        );
      }
    } catch (error) {
      this.recordSubsystemFailure(
        "companion",
        `Companion Runtime failed to start: ${getErrorMessage(error)}`,
        "starting-companion"
      );
    }
  }

  private completeBoot(): void {
    this.setPhase("validating");
    const requiredFailure = this.state.subsystems.some(
      ({ required, status }) =>
        required && status !== "ready"
    );
    if (requiredFailure || !this.state.manifestVerified) {
      this.updateState({ status: "failed", phase: "failed", readyAt: null });
      this.addDiagnostic(
        "platform.boot.failed",
        "error",
        "Oracle Platform boot failed closed.",
        "failed"
      );
      return;
    }

    const optionalFailure = this.state.subsystems.some(
      ({ required, status }) =>
        !required && status !== "ready"
    );
    this.updateState({
      status: optionalFailure ? "degraded" : "ready",
      phase: "complete",
      readyAt: new Date().toISOString(),
    });
    this.addDiagnostic(
      optionalFailure ? "platform.boot.degraded" : "platform.boot.ready",
      optionalFailure ? "warning" : "info",
      optionalFailure
        ? "Oracle Platform is ready with isolated optional degradation."
        : "Oracle Platform is ready.",
      "complete"
    );
  }

  private markInventory(
    id: OraclePlatformSubsystemId,
    count: number,
    message: string
  ): void {
    if (count === 0) {
      this.recordSubsystemFailure(
        id,
        `${getSubsystemName(id)} declared no runtime components.`,
        this.state.phase,
        "unavailable"
      );
      return;
    }
    this.updateSubsystem(id, "ready", message);
  }

  private recordSubsystemFailure(
    id: OraclePlatformSubsystemId,
    message: string,
    phase: OraclePlatformBootPhase,
    status: Extract<
      OraclePlatformSubsystemStatus,
      "failed" | "unavailable"
    > = "failed"
  ): void {
    const { required } = getOracleSubsystemDeclaration(
      this.composition.manifest,
      id
    );
    this.updateSubsystem(id, status, message);
    this.updateState({ errors: Object.freeze([...this.state.errors, message]) });
    this.addDiagnostic(
      `platform.${id}.${status}`,
      required ? "error" : "warning",
      message,
      phase,
      id
    );
  }

  private setPhase(phase: OraclePlatformBootPhase): void {
    this.updateState({ phase });
  }

  private updateSubsystem(
    id: OraclePlatformSubsystemId,
    status: OraclePlatformSubsystemStatus,
    message: string
  ): void {
    const declaration = getOracleSubsystemDeclaration(
      this.composition.manifest,
      id
    );
    const subsystem = createSubsystem(
      id,
      declaration.required,
      status,
      message
    );
    this.updateState({
      subsystems: Object.freeze(
        this.state.subsystems.map((current) =>
          current.id === id ? subsystem : current
        )
      ),
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
      diagnostics: Object.freeze([
        ...this.state.diagnostics,
        createDiagnostic(code, level, message, phase, subsystemId),
      ]),
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

export function createInitialPlatformState(
  composition: OraclePlatformComposition
): MutablePlatformState {
  const now = new Date().toISOString();
  return {
    status: "idle",
    phase: "idle",
    startedAt: null,
    readyAt: null,
    stoppedAt: null,
    updatedAt: now,
    manifest: composition.manifest,
    manifestVerified: false,
    services: Object.freeze([]),
    applications: Object.freeze([]),
    gameIntegrations: Object.freeze([]),
    guidanceProviders: Object.freeze([]),
    companion: createInitialCompanionRuntimeState(),
    subsystems: Object.freeze(
      composition.manifest.subsystems.map(({ id, required }) =>
        createSubsystem(id, required, "pending", "Not started.")
      )
    ),
    diagnostics: Object.freeze([]),
    errors: Object.freeze([]),
  };
}

function createSubsystem(
  id: OraclePlatformSubsystemId,
  required: boolean,
  status: OraclePlatformSubsystemStatus,
  message: string
): OraclePlatformSubsystem {
  return Object.freeze({
    id,
    name: getSubsystemName(id),
    required,
    status,
    message,
    updatedAt: new Date().toISOString(),
  });
}

function createDiagnostic(
  code: string,
  level: OraclePlatformDiagnosticLevel,
  message: string,
  phase: OraclePlatformBootPhase,
  subsystemId: OraclePlatformSubsystemId | null
): OraclePlatformDiagnostic {
  return Object.freeze({
    code,
    level,
    message,
    phase,
    subsystemId,
    timestamp: new Date().toISOString(),
  });
}

function getSubsystemName(id: OraclePlatformSubsystemId): string {
  switch (id) {
    case "composition":
      return "Runtime Composition";
    case "services":
      return "Oracle Services";
    case "session-lifecycle":
      return "Authoritative Session Lifecycle";
    case "applications":
      return "Oracle Applications";
    case "game-integrations":
      return "Game Integrations";
    case "guidance":
      return "Guidance Providers";
    case "extensions":
      return "Oracle Extension Runtime";
    case "companion":
      return "Oracle Platform Companion Runtime";
  }
}

function cloneCompanion(
  companion: ReturnType<typeof createInitialCompanionRuntimeState>
) {
  return {
    ...companion,
    context: companion.context
      ? {
          ...companion.context,
          game: companion.context.game
            ? { ...companion.context.game }
            : null,
          activeWindow: companion.context.activeWindow
            ? { ...companion.context.activeWindow }
            : null,
          discoveries: companion.context.discoveries.map((item) => ({
            ...item,
          })),
        }
      : null,
    failure: companion.failure
      ? { ...companion.failure }
      : null,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
