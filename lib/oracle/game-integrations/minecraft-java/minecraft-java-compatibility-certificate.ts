import {
  ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE,
  ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE_VERSION,
  createOracleGameIntegrationCompatibilityCertificate,
} from "../compatibility";

export const MINECRAFT_JAVA_CERTIFIED_GAME_VERSION = "26.1.1";
export const MINECRAFT_JAVA_CERTIFIED_LOCALE = "en-US";
export const MINECRAFT_JAVA_CERTIFIED_UI_SCALE = 3;

export const MINECRAFT_JAVA_COMPATIBILITY_CERTIFICATE =
  createOracleGameIntegrationCompatibilityCertificate({
    contract: {
      name: ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE,
      version: ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE_VERSION,
    },
    certificateId: "minecraft-java-26.1.1-windows-en-us-single-player",
    integrationId: "minecraft-java",
    integrationVersion: "1.0.0",
    state: "certified",
    profile: {
      gameId: "minecraft",
      edition: "java",
      gameVersion: MINECRAFT_JAVA_CERTIFIED_GAME_VERSION,
      operatingSystem: "win32",
      executableNames: ["javaw.exe"],
      locales: [MINECRAFT_JAVA_CERTIFIED_LOCALE],
      displayModes: ["windowed", "borderless-windowed"],
      minimumWindowBounds: {
        width: 1280,
        height: 720,
      },
      uiScales: [MINECRAFT_JAVA_CERTIFIED_UI_SCALE],
      playerModes: ["single-player"],
      observationMethod: "attached-window-local-pixels",
    },
    capabilities: [
      "detection",
      "context",
      "observation",
      "guidance",
      "transient-progress",
    ],
    verifiedCapabilities: [
      "detection",
      "context",
      "observation",
      "guidance",
      "transient-progress",
    ],
    uncertainCapabilities: [],
    policySources: [
      {
        url: "https://www.minecraft.net/en-us/eula",
        reviewedAt: "2026-07-25T00:00:00.000Z",
      },
      {
        url: "https://www.minecraft.net/en-us/usage-guidelines",
        reviewedAt: "2026-07-25T00:00:00.000Z",
      },
      {
        url: "https://www.minecraft.net/en-us/article/minecraft-java-edition-26-1-1",
        reviewedAt: "2026-07-25T00:00:00.000Z",
      },
    ],
    issuedAt: "2026-07-25T00:00:00.000Z",
    expiresAt: "2026-10-23T00:00:00.000Z",
    stateReason:
      "Bounded local certification for the approved Windows, Java 26.1.1, en-US, UI scale 3, single-player profile.",
  });
