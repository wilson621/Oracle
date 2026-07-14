import type {
  OracleDesktopDiscoveredWindow,
} from "../window-discovery.js";
import type {
  OracleDesktopWindowObservation,
} from "./window-observer.js";

export type OracleDesktopAttachmentStatus =
  | "detached"
  | "attached";

/**
 * Reuses the existing discovery contract as the stable
 * target identity and latest-known metadata snapshot.
 *
 * This remains plain serialisable data.
 */
export type OracleDesktopAttachmentTarget =
  OracleDesktopDiscoveredWindow;

export type OracleDesktopAttachmentState = {
  status: OracleDesktopAttachmentStatus;

  target:
    OracleDesktopAttachmentTarget | null;

  observation:
    OracleDesktopWindowObservation | null;

  observationError: string | null;

  attachedAt: string | null;
  detachedAt: string | null;

  message: string;
};

export function createDetachedAttachmentState(
  options: {
    detachedAt?: string | null;
    message?: string;
  } = {}
): OracleDesktopAttachmentState {
  return {
    status: "detached",

    target: null,

    observation: null,
    observationError: null,

    attachedAt: null,

    detachedAt:
      options.detachedAt ?? null,

    message:
      options.message ??
      "Oracle Companion is not attached to a desktop window.",
  };
}

export function cloneAttachmentState(
  state: OracleDesktopAttachmentState
): OracleDesktopAttachmentState {
  return {
    ...state,

    target: state.target
      ? cloneAttachmentTarget(
          state.target
        )
      : null,

    observation:
      state.observation
        ? cloneWindowObservation(
            state.observation
          )
        : null,
  };
}

export function cloneAttachmentTarget(
  target: OracleDesktopAttachmentTarget
): OracleDesktopAttachmentTarget {
  return {
    ...target,

    bounds: {
      ...target.bounds,
    },
  };
}

function cloneWindowObservation(
  observation:
    OracleDesktopWindowObservation
): OracleDesktopWindowObservation {
  return {
    ...observation,

    bounds: observation.bounds
      ? {
          ...observation.bounds,
        }
      : null,
  };
}