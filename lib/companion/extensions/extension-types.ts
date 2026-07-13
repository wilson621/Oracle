import type {
  OracleCapabilityId,
  OracleCapabilityRequirement,
} from "../capabilities/capability-types";
export type OracleExtensionType =
  | "game_connector"
  | "knowledge_pack"
  | "vision_pack"
  | "overlay_widget"
  | "ai_module"
  | "theme"
  | "language_pack";

export type OracleExtensionTrustLevel =
  | "oracle_verified"
  | "official_developer"
  | "verified_community"
  | "community"
  | "local_development";

export type OracleExtensionPermission =
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
  | "vision_processing"
  | "ai_processing"
  | "notifications"
  | "operator_profile";

export type OracleExtensionAuthor = {
  name: string;
  url: string | null;
};

export type OracleExtensionCompatibility = {
  minimumOracleVersion: string;
  supportedPlatforms: OracleExtensionPlatform[];
  restrictions: string[];
  reviewedAt: string | null;
};

export type OracleExtensionPlatform =
  | "windows"
  | "macos"
  | "linux"
  | "web";

export type OracleExtensionManifest = {
  schemaVersion: "1.0";

  id: string;
  type: OracleExtensionType;

  name: string;
  description: string;
  version: string;

  author: OracleExtensionAuthor;
  trustLevel: OracleExtensionTrustLevel;

    permissions: OracleExtensionPermission[];

  provides: OracleCapabilityId[];
  requires: OracleCapabilityRequirement[];
  conflictsWith: OracleCapabilityId[];

  compatibility: OracleExtensionCompatibility;

  homepage: string | null;
  repository: string | null;
  licence: string | null;

  createdAt: string;
  updatedAt: string;
};