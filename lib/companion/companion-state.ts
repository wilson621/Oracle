import type {
  CompanionContext,
  CompanionOverlayMode,
} from "./companion-types";

export type CompanionRuntimeState = {
  status: CompanionRuntimeStatus;
  overlayMode: CompanionOverlayMode;
  context: CompanionContext | null;
  startedAt: string;
  updatedAt: string;
};

export type CompanionRuntimeStatus =
  | "starting"
  | "ready"
  | "running"
  | "paused"
  | "stopped"
  | "error";

export function createInitialCompanionRuntimeState(): CompanionRuntimeState {
  const now = new Date().toISOString();

  return {
    status: "starting",
    overlayMode: "hidden",
    context: null,
    startedAt: now,
    updatedAt: now,
  };
}