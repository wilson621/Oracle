import { createCompanionGameConnector } from "../create-game-connector";

const now = new Date().toISOString();

export const mockGameConnector = createCompanionGameConnector({
  manifest: {
    schemaVersion: "1.0",
    type: "game_connector",

    id: "oracle.game.mock-adventure",
    gameId: "mock-adventure",
    name: "Mock Adventure",
    description:
      "Reference connector used to validate the Oracle Companion SDK and runtime.",

    version: "1.0.0",

    author: {
      name: "Oracle",
      url: null,
    },

    trustLevel: "oracle_verified",

    permissions: [
      "game_detection",
      "window_detection",
      "overlay",
      "knowledge",
      "quests",
      "collectibles",
    ],

    provides: [
      "game.mock-adventure.detection",
      "game.mock-adventure.quests",
      "game.mock-adventure.collectibles",
    ],

    requires: [],

    conflictsWith: [],

    compatibility: {
      status: "supported",

      supportedDisplayModes: [
        "windowed",
        "borderless",
      ],

      minimumOracleVersion: "1.0.0",
      minimumCompanionVersion: "1.0.0",

      supportedPlatforms: ["windows"],
      supportedGameVersions: ["1.0.0"],

      restrictions: [
        "Reference connector only.",
        "Does not inspect a real game process.",
      ],

      reviewedAt: now,
    },

    homepage: null,
    repository: null,
    licence: "Proprietary",

    createdAt: now,
    updatedAt: now,
  },

  async detect() {
    return {
      detected: true,

      game: {
        id: "mock-adventure",
        name: "Mock Adventure",
        version: "1.0.0",
      },

      process: {
        processName: "mock-adventure.exe",
        processId: null,
        executablePath: null,
      },

      window: {
        title: "Mock Adventure",

        bounds: {
          x: 100,
          y: 100,
          width: 1280,
          height: 720,
        },

        displayMode: "borderless",
        isFocused: true,
        isMinimised: false,
      },

      confidence: 1,
      detectedAt: new Date().toISOString(),
    };
  },

  async observe(context) {
    return {
      context: {
        ...context,
        currentQuest: "The Hidden Observatory",
        currentObjective: "Locate the sealed chamber",
      },

      discoveries: [
        {
          id: "mock-discovery-001",
          type: "collectible",
          title: "Ancient Star Fragment",
          summary:
            "A hidden collectible appears to be nearby.",
          confidence: 0.95,
          location: "Observatory Lower Hall",
          source: "mock-reference-connector",
          spoilerLevel: "minimal",
          detectedAt: new Date().toISOString(),
        },
      ],

      confidence: 0.95,
      observedAt: new Date().toISOString(),
    };
  },
});