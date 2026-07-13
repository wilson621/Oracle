import type {
  OracleExtensionAuthor,
  OracleExtensionCompatibility,
  OracleExtensionManifest,
  OracleExtensionPermission,
  OracleExtensionTrustLevel,
} from "../extensions/extension-types";

import type {
  CompanionDisplayMode,
  CompanionGameCompatibilityStatus,
} from "./game-connector-types";

export type CompanionConnectorTrustLevel =
  OracleExtensionTrustLevel;

export type CompanionConnectorPermission = Extract<
  OracleExtensionPermission,
  | "game_detection"
  | "window_detection"
  | "screen_observation"
  | "ocr"
  | "overlay"
  | "knowledge"
  | "quests"
  | "collectibles"
  | "navigation"
  | "local_storage"
  | "network_access"
>;

export type CompanionConnectorAuthor =
  OracleExtensionAuthor;

export type CompanionConnectorCompatibilityManifest =
  OracleExtensionCompatibility & {
    status: CompanionGameCompatibilityStatus;
    supportedDisplayModes: CompanionDisplayMode[];
    minimumCompanionVersion: string;
    supportedGameVersions: string[];
  };

export type CompanionGameConnectorManifest = Omit<
  OracleExtensionManifest,
  "type" | "permissions" | "compatibility"
> & {
  type: "game_connector";

  gameId: string;

  permissions: CompanionConnectorPermission[];

  compatibility: CompanionConnectorCompatibilityManifest;
};