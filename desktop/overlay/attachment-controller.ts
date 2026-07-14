import {
  cloneAttachmentState,
  cloneAttachmentTarget,
  createDetachedAttachmentState,
  type OracleDesktopAttachmentState,
  type OracleDesktopAttachmentTarget,
} from "./attachment-state.js";
import {
  OracleDesktopWindowObserver,
} from "./window-observer.js";

export class OracleDesktopAttachmentController {
  private state:
    OracleDesktopAttachmentState =
      createDetachedAttachmentState();

  constructor(
    private readonly observer =
      new OracleDesktopWindowObserver()
  ) {}

  attach(
    target: OracleDesktopAttachmentTarget
  ): OracleDesktopAttachmentState {
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

    return this.getState();
  }

  async observe(): Promise<
    OracleDesktopAttachmentState
  > {
    const target =
      this.state.target;

    if (
      this.state.status !==
        "attached" ||
      !target
    ) {
      return this.getState();
    }

    try {
      const observation =
        await this.observer.observe(
          target.handle
        );

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

      this.state = {
        ...this.state,

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
    } catch (error) {
      this.state = {
        ...this.state,

        observationError:
          getErrorMessage(error),

        message:
          `Oracle Companion could not observe '${target.title}'.`,
      };
    }

    return this.getState();
  }

  detach(
    reason?: string
  ): OracleDesktopAttachmentState {
    const message =
      normaliseReason(reason) ??
      "Oracle Companion was detached from its desktop target.";

    this.state =
      createDetachedAttachmentState({
        detachedAt:
          new Date().toISOString(),

        message,
      });

    return this.getState();
  }

  getState(): OracleDesktopAttachmentState {
    return cloneAttachmentState(
      this.state
    );
  }

  reset(): OracleDesktopAttachmentState {
    this.state =
      createDetachedAttachmentState();

    return this.getState();
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
    `Attached target '${targetTitle}' was observed successfully.`
  );
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