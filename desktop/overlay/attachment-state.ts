import type {
  OracleDesktopDiscoveredWindow,
} from "../window-discovery.js";

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

  target: OracleDesktopAttachmentTarget | null;

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