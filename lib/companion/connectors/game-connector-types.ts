import type {
  CompanionContext,
  CompanionDiscovery,
  CompanionGame,
  CompanionWindowBounds,
} from "../companion-types";
import type { CompanionGameConnectorManifest } from "./game-connector-manifest";

export type CompanionGameCompatibilityStatus =
  | "supported"
  | "limited"
  | "unsupported"
  | "unknown";

export type CompanionDisplayMode =
  | "windowed"
  | "borderless"
  | "exclusive_fullscreen"
  | "unknown";

export type CompanionGameProcess = {
  processName: string;
  processId: number | null;
  executablePath: string | null;
};

export type CompanionGameWindow = {
  title: string;
  bounds: CompanionWindowBounds;
  displayMode: CompanionDisplayMode;
  isFocused: boolean;
  isMinimised: boolean;
};

export type CompanionConnectorCompatibility = {
  status: CompanionGameCompatibilityStatus;
  supportedDisplayModes: CompanionDisplayMode[];
  supportsScreenObservation: boolean;
  supportsOverlay: boolean;
  restrictions: string[];
  reviewedAt: string | null;
};

export type CompanionConnectorDetection = {
  detected: boolean;
  game: CompanionGame | null;
  process: CompanionGameProcess | null;
  window: CompanionGameWindow | null;
  confidence: number;
  detectedAt: string;
};

export type CompanionConnectorObservation = {
  context: Partial<CompanionContext>;
  discoveries: CompanionDiscovery[];
  confidence: number;
  observedAt: string;
};

export type CompanionGameConnector = {
  manifest: CompanionGameConnectorManifest;

  id: string;
  gameId: string;
  name: string;
  version: string;

  compatibility: CompanionConnectorCompatibility;

  detect(): Promise<CompanionConnectorDetection>;

  observe(
    context: CompanionContext
  ): Promise<CompanionConnectorObservation>;

  supportsGame(game: CompanionGame): boolean;
};