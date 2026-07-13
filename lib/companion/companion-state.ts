import {
  createInitialCompanionOverlayWindowState,
  type CompanionContext,
  type CompanionOverlayMode,
  type CompanionOverlayWindowState,
  type CompanionPresentationMode,
} from "./companion-types";

export type CompanionRuntimeStatus =
  | "created"
  | "initialising"
  | "waiting-for-platform"
  | "ready"
  | "running"
  | "suspended"
  | "stopping"
  | "stopped"
  | "failed";

export type CompanionRuntimeFailure = {
  code: string;
  message: string;
  occurredAt: string;
};

export type CompanionRuntimeState = {
  status: CompanionRuntimeStatus;

  /**
   * Authoritative Companion presentation state.
   */
  presentationMode: CompanionPresentationMode;

  /**
   * Backward-compatible presentation field.
   *
   * New code should consume presentationMode.
   */
  overlayMode: CompanionOverlayMode;

  /**
   * Native desktop-overlay window state.
   *
   * This is deliberately separate from presentationMode.
   */
  overlayWindow: CompanionOverlayWindowState;

  context: CompanionContext | null;

  createdAt: string;
  startedAt: string | null;
  readyAt: string | null;
  stoppedAt: string | null;
  updatedAt: string;

  failure: CompanionRuntimeFailure | null;
};

export function createInitialCompanionRuntimeState(): CompanionRuntimeState {
  const now = new Date().toISOString();

  return {
    status: "created",

    presentationMode: "hidden",
    overlayMode: "hidden",
    overlayWindow: createInitialCompanionOverlayWindowState(now),

    context: null,

    createdAt: now,
    startedAt: null,
    readyAt: null,
    stoppedAt: null,
    updatedAt: now,

    failure: null,
  };
}