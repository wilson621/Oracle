import type { CompanionEvent } from "./companion-events";
import {
  createInitialCompanionRuntimeState,
  type CompanionRuntimeFailure,
  type CompanionRuntimeState,
  type CompanionRuntimeStatus,
} from "./companion-state";
import type {
  CompanionContext,
  CompanionOverlayMode,
  CompanionOverlayWindowLifecycle,
  CompanionOverlayWindowState,
  CompanionPresentationMode,
  CompanionWindowBounds,
} from "./companion-types";

export type CompanionRuntimeStartOptions = {
  platformAuthorized: boolean;
  prerequisitesReady: boolean;
  waitingReason?: string;
};

export type CompanionOverlayWindowInteractionUpdate = {
  transparent?: boolean;
  borderless?: boolean;
  alwaysOnTop?: boolean;
  clickThrough?: boolean;
  focused?: boolean;
};

export type CompanionOverlayWindowAttachment = {
  targetWindowId: string;
  monitorId: string;
  bounds: CompanionWindowBounds;
};

const ALLOWED_TRANSITIONS: Record<
  CompanionRuntimeStatus,
  CompanionRuntimeStatus[]
> = {
  created: [
    "initialising",
    "waiting-for-platform",
    "stopping",
    "stopped",
    "failed",
  ],
  initialising: [
    "waiting-for-platform",
    "ready",
    "stopping",
    "failed",
  ],
  "waiting-for-platform": [
    "initialising",
    "stopping",
    "stopped",
    "failed",
  ],
  ready: [
    "running",
    "suspended",
    "stopping",
    "failed",
  ],
  running: [
    "suspended",
    "stopping",
    "failed",
  ],
  suspended: [
    "ready",
    "running",
    "stopping",
    "failed",
  ],
  stopping: [
    "stopped",
    "failed",
  ],
  stopped: [
    "initialising",
    "waiting-for-platform",
    "failed",
  ],
  failed: [
    "initialising",
    "waiting-for-platform",
    "stopping",
    "stopped",
  ],
};

export class CompanionRuntime {
  private state: CompanionRuntimeState;

  private readonly events: CompanionEvent[] = [];

  constructor() {
    this.state = createInitialCompanionRuntimeState();
  }

  getState(): CompanionRuntimeState {
    return cloneCompanionRuntimeState(this.state);
  }

  getContext(): CompanionContext | null {
    return cloneCompanionContext(this.state.context);
  }

  getEvents(): CompanionEvent[] {
    return [...this.events];
  }

  start(options: CompanionRuntimeStartOptions): CompanionRuntimeState {
    if (
      this.state.status === "ready" ||
      this.state.status === "running" ||
      this.state.status === "suspended"
    ) {
      return this.getState();
    }

    if (this.state.status === "stopping") {
      return this.fail(
        "companion.start.invalid-state",
        "Companion Runtime cannot start while it is stopping."
      );
    }

    if (!options.platformAuthorized || !options.prerequisitesReady) {
      this.transition("waiting-for-platform", {
        failure: null,
        stoppedAt: null,
      });

      return this.getState();
    }

    this.transition("initialising", {
      startedAt: new Date().toISOString(),
      readyAt: null,
      stoppedAt: null,
      failure: null,
    });

    try {
      this.validateInitialisation();

      this.transition("ready", {
        readyAt: new Date().toISOString(),
      });
    } catch (error) {
      return this.fail(
        "companion.initialisation.failed",
        getErrorMessage(error)
      );
    }

    return this.getState();
  }

  run(): CompanionRuntimeState {
    if (this.state.status === "running") {
      return this.getState();
    }

    if (
      this.state.status !== "ready" &&
      this.state.status !== "suspended"
    ) {
      return this.fail(
        "companion.run.invalid-state",
        `Companion Runtime cannot run from status '${this.state.status}'.`
      );
    }

    this.transition("running");

    return this.getState();
  }

  suspend(): CompanionRuntimeState {
    if (this.state.status === "suspended") {
      return this.getState();
    }

    if (
      this.state.status !== "ready" &&
      this.state.status !== "running"
    ) {
      return this.fail(
        "companion.suspend.invalid-state",
        `Companion Runtime cannot suspend from status '${this.state.status}'.`
      );
    }

    this.transition("suspended");

    this.setPresentationMode("hidden");
    this.updateOverlayWindow({
      focused: false,
      clickThrough: true,
    });

    return this.getState();
  }

  resume(): CompanionRuntimeState {
    if (this.state.status !== "suspended") {
      return this.fail(
        "companion.resume.invalid-state",
        `Companion Runtime cannot resume from status '${this.state.status}'.`
      );
    }

    this.transition("running");

    return this.getState();
  }

  pause(): CompanionRuntimeState {
    return this.suspend();
  }

  stop(): CompanionRuntimeState {
    if (this.state.status === "stopped") {
      return this.getState();
    }

    if (this.state.status === "created") {
      this.transition("stopped", {
        stoppedAt: new Date().toISOString(),
        readyAt: null,
        presentationMode: "hidden",
        overlayMode: "hidden",
        overlayWindow: createStoppedOverlayWindowState(
          this.state.overlayWindow
        ),
      });

      return this.getState();
    }

    if (this.state.status !== "stopping") {
      this.transition("stopping");
    }

    this.transition("stopped", {
      stoppedAt: new Date().toISOString(),
      readyAt: null,
      presentationMode: "hidden",
      overlayMode: "hidden",
      overlayWindow: createStoppedOverlayWindowState(
        this.state.overlayWindow
      ),
    });

    return this.getState();
  }

  setPresentationMode(mode: CompanionPresentationMode): void {
    this.updateState({
      presentationMode: mode,
      overlayMode: mapPresentationModeToLegacyOverlayMode(mode),
    });
  }

  /**
   * Backward-compatible presentation setter.
   *
   * New code should use setPresentationMode().
   */
  setOverlayMode(mode: CompanionOverlayMode): void {
    this.setPresentationMode(
      mapLegacyOverlayModeToPresentationMode(mode)
    );
  }

  setOverlayWindowLifecycle(
    lifecycle: CompanionOverlayWindowLifecycle
  ): void {
    this.updateOverlayWindow({
      lifecycle,
    });
  }

  setOverlayWindowInteraction(
    update: CompanionOverlayWindowInteractionUpdate
  ): void {
    this.updateOverlayWindow(update);
  }

  attachOverlayWindow(
    attachment: CompanionOverlayWindowAttachment
  ): void {
    this.updateOverlayWindow({
      lifecycle: "attached",
      targetWindowId: attachment.targetWindowId,
      monitorId: attachment.monitorId,
      bounds: {
        ...attachment.bounds,
      },
    });
  }

  detachOverlayWindow(): void {
    this.updateOverlayWindow({
      lifecycle: "detached",
      targetWindowId: null,
      monitorId: null,
      bounds: null,
      focused: false,
      clickThrough: true,
    });
  }

  setContext(context: CompanionContext): void {
    this.updateState({
      context: cloneCompanionContext(context),
    });
  }

  publish(event: CompanionEvent): void {
    this.events.push(event);
  }

  clearEvents(): void {
    this.events.length = 0;
  }

  private validateInitialisation(): void {
    if (this.state.startedAt === null) {
      throw new Error(
        "Companion Runtime initialisation requires a start timestamp."
      );
    }
  }

  private transition(
    status: CompanionRuntimeStatus,
    update: Partial<CompanionRuntimeState> = {}
  ): void {
    const currentStatus = this.state.status;

    if (currentStatus === status) {
      this.updateState(update);
      return;
    }

    const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(status)) {
      throw new Error(
        `Invalid Companion Runtime transition: '${currentStatus}' to '${status}'.`
      );
    }

    this.updateState({
      ...update,
      status,
    });
  }

  private fail(
    code: string,
    message: string
  ): CompanionRuntimeState {
    const failure: CompanionRuntimeFailure = {
      code,
      message,
      occurredAt: new Date().toISOString(),
    };

    if (this.state.status === "failed") {
      this.updateState({
        failure,
      });

      return this.getState();
    }

    const allowedTransitions =
      ALLOWED_TRANSITIONS[this.state.status];

    if (allowedTransitions.includes("failed")) {
      this.transition("failed", {
        failure,
      });
    } else {
      this.updateState({
        status: "failed",
        failure,
      });
    }

    return this.getState();
  }

  private updateOverlayWindow(
    update: Partial<CompanionOverlayWindowState>
  ): void {
    this.updateState({
      overlayWindow: {
        ...this.state.overlayWindow,
        ...update,
        bounds:
          update.bounds === undefined
            ? cloneWindowBounds(this.state.overlayWindow.bounds)
            : cloneWindowBounds(update.bounds),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  private updateState(
    update: Partial<CompanionRuntimeState>
  ): void {
    this.state = {
      ...this.state,
      ...update,
      updatedAt: new Date().toISOString(),
    };
  }
}

function cloneCompanionRuntimeState(
  state: CompanionRuntimeState
): CompanionRuntimeState {
  return {
    ...state,
    context: cloneCompanionContext(state.context),
    overlayWindow: {
      ...state.overlayWindow,
      bounds: cloneWindowBounds(state.overlayWindow.bounds),
    },
    failure: state.failure
      ? {
          ...state.failure,
        }
      : null,
  };
}

function cloneCompanionContext(
  context: CompanionContext | null
): CompanionContext | null {
  if (!context) {
    return null;
  }

  return {
    ...context,
    game: context.game
      ? {
          ...context.game,
        }
      : null,
    activeWindow: cloneWindowBounds(context.activeWindow),
    discoveries: context.discoveries.map((discovery) => ({
      ...discovery,
    })),
  };
}

function cloneWindowBounds(
  bounds: CompanionWindowBounds | null
): CompanionWindowBounds | null {
  return bounds
    ? {
        ...bounds,
      }
    : null;
}

function createStoppedOverlayWindowState(
  state: CompanionOverlayWindowState
): CompanionOverlayWindowState {
  return {
    ...state,
    lifecycle: "idle",
    clickThrough: true,
    focused: false,
    targetWindowId: null,
    monitorId: null,
    bounds: null,
    updatedAt: new Date().toISOString(),
  };
}

function mapLegacyOverlayModeToPresentationMode(
  mode: CompanionOverlayMode
): CompanionPresentationMode {
  switch (mode) {
    case "hidden":
    case "suspended":
      return "hidden";

    case "passive":
      return "compact";

    case "interactive":
      return "interactive";
  }
}

function mapPresentationModeToLegacyOverlayMode(
  mode: CompanionPresentationMode
): CompanionOverlayMode {
  switch (mode) {
    case "hidden":
      return "hidden";

    case "compact":
    case "expanded":
      return "passive";

    case "interactive":
      return "interactive";
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : String(error);
}