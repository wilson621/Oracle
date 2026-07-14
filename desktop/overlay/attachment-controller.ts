import {
  cloneAttachmentState,
  cloneAttachmentTarget,
  createDetachedAttachmentState,
  type OracleDesktopAttachmentState,
  type OracleDesktopAttachmentTarget,
} from "./attachment-state.js";

export class OracleDesktopAttachmentController {
  private state: OracleDesktopAttachmentState =
    createDetachedAttachmentState();

  attach(
    target: OracleDesktopAttachmentTarget
  ): OracleDesktopAttachmentState {
    const attachedAt =
      new Date().toISOString();

    this.state = {
      status: "attached",

      target:
        cloneAttachmentTarget(target),

      attachedAt,
      detachedAt: null,

      message:
        `Oracle Companion is attached to '${target.title}'.`,
    };

    return this.getState();
  }

  detach(
    reason?: string
  ): OracleDesktopAttachmentState {
    const message =
      normaliseReason(reason) ??
      "Oracle Companion was detached from its desktop target.";

    this.state = createDetachedAttachmentState({
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