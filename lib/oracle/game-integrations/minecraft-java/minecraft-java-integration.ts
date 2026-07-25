import type { OracleGameContext } from "../game-context";
import type { OracleGameDetectionInput } from "../game-detection-input";
import type { OracleGameDetectionResult } from "../game-detection";
import type { OracleGameIntegration } from "../game-integration";
import {
  MINECRAFT_JAVA_CERTIFIED_GAME_VERSION,
} from "./minecraft-java-compatibility-certificate";

export const MINECRAFT_JAVA_INTEGRATION_ID = "minecraft-java";
export const MINECRAFT_JAVA_INTEGRATION_VERSION = "1.0.0";

const EXACT_SINGLE_PLAYER_TITLE =
  new RegExp(
    `^Minecraft ${escapeRegularExpression(MINECRAFT_JAVA_CERTIFIED_GAME_VERSION)} - Singleplayer$`,
    "u"
  );

export class MinecraftJavaIntegration implements OracleGameIntegration {
  readonly id = MINECRAFT_JAVA_INTEGRATION_ID;
  readonly gameName = "Minecraft: Java Edition";
  readonly version = MINECRAFT_JAVA_INTEGRATION_VERSION;

  detect(input: OracleGameDetectionInput): OracleGameDetectionResult {
    if (!matchesCertifiedProcess(input)) {
      return Object.freeze({ detected: false });
    }
    return Object.freeze({
      detected: true,
      match: Object.freeze({
        integrationId: this.id,
        gameName: this.gameName,
        integrationVersion: this.version,
        explanation:
          `The attached javaw.exe window exactly identifies Minecraft ${MINECRAFT_JAVA_CERTIFIED_GAME_VERSION} single-player.`,
      }),
    });
  }

  createContext(input: OracleGameDetectionInput): OracleGameContext {
    if (!matchesCertifiedProcess(input)) {
      throw new Error(
        "Minecraft Java context requires the exact certified version and single-player window."
      );
    }
    return Object.freeze({
      integrationId: this.id,
      gameName: this.gameName,
      version: this.version,
      state: Object.freeze({
        edition: "java",
        supportedGameVersion: MINECRAFT_JAVA_CERTIFIED_GAME_VERSION,
        detectedGameVersion: MINECRAFT_JAVA_CERTIFIED_GAME_VERSION,
        playerMode: "single-player",
        processName: input.processName,
        processId: input.processId,
        windowTitle: input.title,
        windowBounds: Object.freeze({ ...input.bounds }),
        certificationScope:
          "windows-26.1.1-en-US-ui-scale-3-single-player",
      }),
    });
  }
}

function matchesCertifiedProcess(input: OracleGameDetectionInput): boolean {
  return (
    input.processName.trim().toLowerCase() === "javaw.exe" &&
    EXACT_SINGLE_PLAYER_TITLE.test(input.title.trim())
  );
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
