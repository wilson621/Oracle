export type CompanionOverlayMode =
  | "hidden"
  | "passive"
  | "interactive"
  | "suspended";

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
  overlayMode: CompanionOverlayMode;
  gameState: CompanionGameState;
  activeWindow: CompanionWindowBounds | null;
  currentQuest: string | null;
  currentObjective: string | null;
  discoveries: CompanionDiscovery[];
  spoilerPreference: CompanionSpoilerPreference;
  capturedAt: string;
};