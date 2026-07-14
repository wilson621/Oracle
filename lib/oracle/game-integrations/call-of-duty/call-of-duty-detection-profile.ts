import type {
  ExecutableGameDetectionProfile,
} from "../detection/executable-game-detection-types";

/**
 * Current verified Steam Call of Duty HQ process profile.
 *
 * `cod.exe` identifies the shared active Call of Duty HQ process.
 * It does not, by itself, identify which Call of Duty experience
 * is currently active.
 *
 * `bootstrapper.exe` is launcher evidence only and must never
 * qualify as an active game target.
 */
export const CALL_OF_DUTY_DETECTION_PROFILE =
  Object.freeze({
    executableNames: [
      "cod.exe",
    ],

    processAliases: [
      "cod",
    ],

    titlePatterns: [
      {
        id:
          "warzone-title",

        kind:
          "contains",

        value:
          "Warzone",

        explanation:
          "The window title contains 'Warzone'.",
      },

      {
        id:
          "call-of-duty-title",

        kind:
          "contains",

        value:
          "Call of Duty",

        explanation:
          "The window title contains 'Call of Duty'.",
      },
    ],

    launcherProcessNames: [
      "bootstrapper.exe",
    ],
  } satisfies ExecutableGameDetectionProfile);