export type CompanionPresentationMode =
  | "hidden"
  | "compact"
  | "expanded"
  | "interactive";

/**
 * Backward-compatible presentation mode used by earlier Companion code.
 *
 * New code should use CompanionPresentationMode.
 */
export type CompanionOverlayMode =
  | "hidden"
  | "passive"
  | "interactive"
  | "suspended";

export type CompanionOverlayWindowLifecycle =
  | "idle"
  | "searching"
  | "attaching"
  | "attached"
  | "detached";

export type CompanionOverlayWindowState = {
  lifecycle: CompanionOverlayWindowLifecycle;

  transparent: boolean;
  borderless: boolean;
  alwaysOnTop: boolean;
  clickThrough: boolean;
  focused: boolean;

  targetWindowId: string | null;
  monitorId: string | null;
  bounds: CompanionWindowBounds | null;

  updatedAt: string;
};

export type CompanionGameState =
  | "unknown"
  | "launching"
  | "running"
  | "paused"
  | "closed";

export type CompanionDiscoveryType =
  | "collectible"
  | "secret"
  | "quest_item"
  | "optional_objective"
  | "lore"
  | "puzzle"
  | "achievement";

export type CompanionSpoilerPreference =
  | "none"
  | "minimal"
  | "contextual"
  | "full";

export type CompanionDiscovery = {
  id: string;
  type: CompanionDiscoveryType;
  title: string;
  summary: string;
  confidence: number;
  location: string | null;
  source: string;
  spoilerLevel: CompanionSpoilerPreference;
  detectedAt: string;
};

export type CompanionGame = {
  id: string;
  name: string;
  version: string | null;
};

export type CompanionWindowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CompanionContext = {
  operatorId: string;
  game: CompanionGame | null;

  /**
   * Legacy compatibility field.
   *
   * The authoritative presentation value is stored by CompanionRuntime as
   * presentationMode.
   */
  overlayMode: CompanionOverlayMode;

  gameState: CompanionGameState;
  activeWindow: CompanionWindowBounds | null;
  currentQuest: string | null;
  currentObjective: string | null;
  discoveries: CompanionDiscovery[];
  spoilerPreference: CompanionSpoilerPreference;
  capturedAt: string;
};

export function createInitialCompanionOverlayWindowState(
  now = new Date().toISOString()
): CompanionOverlayWindowState {
  return {
    lifecycle: "idle",

    transparent: true,
    borderless: true,
    alwaysOnTop: true,
    clickThrough: true,
    focused: false,

    targetWindowId: null,
    monitorId: null,
    bounds: null,

    updatedAt: now,
  };
}