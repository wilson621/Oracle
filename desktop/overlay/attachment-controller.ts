import {
  cloneAttachmentState,
  cloneAttachmentTarget,
  createDetachedAttachmentState,
  type OracleDesktopAttachmentState,
  type OracleDesktopAttachmentTarget,
} from "./attachment-state.js";
import {
  OracleDesktopWindowObserver,
  type OracleDesktopWindowObservation,
} from "./window-observer.js";

const DEFAULT_TRACKING_INTERVAL_MS = 250;

export type OracleDesktopAttachmentStateListener = (
  state: OracleDesktopAttachmentState
) => void;

export type OracleDesktopAttachmentControllerOptions = {
  observer?: OracleDesktopWindowObserver;

  trackingIntervalMs?: number;

  onStateChanged?:
    OracleDesktopAttachmentStateListener;
};

export class OracleDesktopAttachmentController {
  private state:
    OracleDesktopAttachmentState =
      createDetachedAttachmentState();

  private readonly observer:
    OracleDesktopWindowObserver;

  private readonly trackingIntervalMs:
    number;

  private readonly onStateChanged:
    | OracleDesktopAttachmentStateListener
    | undefined;

  private trackingRunId = 0;

  private trackingTimer:
    | NodeJS.Timeout
    | null = null;

  constructor(
    options:
      OracleDesktopAttachmentControllerOptions = {}
  ) {
    this.observer =
      options.observer ??
      new OracleDesktopWindowObserver();

    this.trackingIntervalMs =
      normaliseTrackingInterval(
        options.trackingIntervalMs
      );

    this.onStateChanged =
      options.onStateChanged;
  }

  attach(
    target: OracleDesktopAttachmentTarget
  ): OracleDesktopAttachmentState {
    this.stopTracking();

    const attachedAt =
      new Date().toISOString();

    this.state = {
      status: "attached",

      target:
        cloneAttachmentTarget(
          target
        ),

      observation: null,
      observationError: null,

      attachedAt,
      detachedAt: null,

      message:
        `Oracle Companion is attached to '${target.title}'.`,
    };

    this.emitStateChanged();
    this.startTracking();

    return this.getState();
  }

  async observe(): Promise<
    OracleDesktopAttachmentState
  > {
    const runId =
      this.trackingRunId;

    await this.observeCurrentTarget(
      runId
    );

    return this.getState();
  }

  detach(
    reason?: string
  ): OracleDesktopAttachmentState {
    this.stopTracking();

    const message =
      normaliseReason(reason) ??
      "Oracle Companion was detached from its desktop target.";

    this.state =
      createDetachedAttachmentState({
        detachedAt:
          new Date().toISOString(),

        message,
      });

    this.emitStateChanged();

    return this.getState();
  }

  getState(): OracleDesktopAttachmentState {
    return cloneAttachmentState(
      this.state
    );
  }

  reset(): OracleDesktopAttachmentState {
    this.stopTracking();

    this.state =
      createDetachedAttachmentState();

    this.emitStateChanged();

    return this.getState();
  }

  private startTracking(): void {
    if (
      this.state.status !==
        "attached" ||
      !this.state.target
    ) {
      return;
    }

    const runId =
      this.trackingRunId;

    void this.runTrackingIteration(
      runId
    );
  }

  private stopTracking(): void {
    this.trackingRunId += 1;

    if (this.trackingTimer) {
      clearTimeout(
        this.trackingTimer
      );

      this.trackingTimer = null;
    }
  }

  private async runTrackingIteration(
    runId: number
  ): Promise<void> {
    if (
      !this.isTrackingRunActive(
        runId
      )
    ) {
      return;
    }

    await this.observeCurrentTarget(
      runId
    );

    if (
      !this.isTrackingRunActive(
        runId
      )
    ) {
      return;
    }

    this.trackingTimer =
      setTimeout(
        () => {
          this.trackingTimer =
            null;

          void this.runTrackingIteration(
            runId
          );
        },
        this.trackingIntervalMs
      );
  }

  private async observeCurrentTarget(
    runId: number
  ): Promise<void> {
    const target =
      this.state.target;

    if (
      !this.isTrackingRunActive(
        runId
      ) ||
      !target
    ) {
      return;
    }

    const targetHandle =
      target.handle;

    try {
      const observation =
        await this.observer.observe(
          targetHandle
        );

      if (
        !this.canApplyObservation(
          runId,
          targetHandle
        )
      ) {
        return;
      }

      this.applyObservation(
        target,
        observation
      );
    } catch (error) {
      if (
        !this.canApplyObservation(
          runId,
          targetHandle
        )
      ) {
        return;
      }

      this.applyObservationError(
        target,
        error
      );
    }
  }

  private applyObservation(
    target: OracleDesktopAttachmentTarget,
    observation:
      OracleDesktopWindowObservation
  ): void {
    const previousState =
      this.state;

    const updatedTarget =
      observation.exists &&
      observation.bounds
        ? {
            ...cloneAttachmentTarget(
              target
            ),

            bounds: {
              ...observation.bounds,
            },
          }
        : cloneAttachmentTarget(
            target
          );

    const nextState:
      OracleDesktopAttachmentState = {
        ...previousState,

        target:
          updatedTarget,

        observation,
        observationError: null,

        message:
          createObservationMessage(
            target.title,
            observation.exists,
            observation.visible,
            observation.minimized
          ),
      };

    this.state = nextState;

    if (
      hasMeaningfulStateChange(
        previousState,
        nextState
      )
    ) {
      this.emitStateChanged();
    }
  }

  private applyObservationError(
    target: OracleDesktopAttachmentTarget,
    error: unknown
  ): void {
    const previousState =
      this.state;

    const nextState:
      OracleDesktopAttachmentState = {
        ...previousState,

        observationError:
          getErrorMessage(error),

        message:
          `Oracle Companion could not observe '${target.title}'.`,
      };

    this.state = nextState;

    if (
      hasMeaningfulStateChange(
        previousState,
        nextState
      )
    ) {
      this.emitStateChanged();
    }
  }

  private canApplyObservation(
    runId: number,
    targetHandle: string
  ): boolean {
    return (
      this.isTrackingRunActive(
        runId
      ) &&
      this.state.target?.handle ===
        targetHandle
    );
  }

  private isTrackingRunActive(
    runId: number
  ): boolean {
    return (
      runId ===
        this.trackingRunId &&
      this.state.status ===
        "attached" &&
      this.state.target !== null
    );
  }

  private emitStateChanged(): void {
    this.onStateChanged?.(
      this.getState()
    );
  }
}

function createObservationMessage(
  targetTitle: string,
  exists: boolean,
  visible: boolean,
  minimized: boolean
): string {
  if (!exists) {
    return (
      `Attached target '${targetTitle}' is no longer available.`
    );
  }

  if (minimized) {
    return (
      `Attached target '${targetTitle}' is minimised.`
    );
  }

  if (!visible) {
    return (
      `Attached target '${targetTitle}' is not currently visible.`
    );
  }

  return (
    `Attached target '${targetTitle}' is being tracked.`
  );
}

function hasMeaningfulStateChange(
  previous:
    OracleDesktopAttachmentState,
  next:
    OracleDesktopAttachmentState
): boolean {
  if (
    previous.status !==
      next.status ||
    previous.target?.id !==
      next.target?.id ||
    previous.observationError !==
      next.observationError ||
    previous.message !==
      next.message
  ) {
    return true;
  }

  if (
    !areBoundsEqual(
      previous.target?.bounds ??
        null,
      next.target?.bounds ??
        null
    )
  ) {
    return true;
  }

  return !areObservationsEquivalent(
    previous.observation,
    next.observation
  );
}

function areObservationsEquivalent(
  left:
    OracleDesktopWindowObservation | null,
  right:
    OracleDesktopWindowObservation | null
): boolean {
  if (
    left === null ||
    right === null
  ) {
    return left === right;
  }

  return (
    left.handle === right.handle &&
    left.exists === right.exists &&
    left.visible === right.visible &&
    left.minimized ===
      right.minimized &&
    areBoundsEqual(
      left.bounds,
      right.bounds
    )
  );
}

function areBoundsEqual(
  left:
    OracleDesktopWindowObservation["bounds"],
  right:
    OracleDesktopWindowObservation["bounds"]
): boolean {
  if (
    left === null ||
    right === null
  ) {
    return left === right;
  }

  return (
    left.x === right.x &&
    left.y === right.y &&
    left.width === right.width &&
    left.height === right.height
  );
}

function normaliseTrackingInterval(
  interval:
    number | undefined
): number {
  if (
    typeof interval !== "number" ||
    !Number.isFinite(interval) ||
    interval < 100
  ) {
    return DEFAULT_TRACKING_INTERVAL_MS;
  }

  return Math.round(interval);
}

function normaliseReason(
  reason: string | undefined
): string | null {
  if (typeof reason !== "string") {
    return null;
  }

  const normalised =
    reason.trim();

  return normalised.length > 0
    ? normalised
    : null;
}

function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}