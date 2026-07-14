import type {
  OracleGameContext,
} from "../game-context";
import type {
  OracleGameDetectionInput,
} from "../game-detection-input";
import type {
  OracleGameDetectionResult,
} from "../game-detection";
import type {
  OracleGameIntegration,
} from "../game-integration";
import {
  matchExecutableGame,
} from "../detection/executable-game-matcher";
import type {
  ExecutableGameMatchResult,
} from "../detection/executable-game-detection-types";
import {
  CALL_OF_DUTY_DETECTION_PROFILE,
} from "./call-of-duty-detection-profile";

const CALL_OF_DUTY_INTEGRATION_ID =
  "call-of-duty";

const CALL_OF_DUTY_GAME_NAME =
  "Call of Duty";

const CALL_OF_DUTY_INTEGRATION_VERSION =
  "1.0.0";

const WARZONE_TITLE_PATTERN_ID =
  "warzone-title";

type CallOfDutyDetectedExperience =
  | "warzone"
  | null;

type CallOfDutyGameContextState = {
  /**
   * Warzone is the initial experience supported by Oracle.
   *
   * This describes compatibility, not necessarily what was
   * conclusively detected from the current window.
   */
  supportedExperience:
    "warzone";

  supportedExperienceName:
    "Warzone";

  detectedExperience:
    CallOfDutyDetectedExperience

  detectionScope:
    | "integration-family"
    | "experience";

  activeGameProcessMatched:
    boolean;

  launcherMatched:
    boolean;

  matchedExecutableName:
    string | null;

  matchedProcessAlias:
    string | null;

  matchedTitlePatternId:
    string | null;

  processId: number;
  processName: string;
  windowTitle: string;
  isForeground: boolean | null;

  matchReasons: string[];
};

export class CallOfDutyIntegration
  implements OracleGameIntegration {
  readonly id =
    CALL_OF_DUTY_INTEGRATION_ID;

  readonly gameName =
    CALL_OF_DUTY_GAME_NAME;

  readonly version =
    CALL_OF_DUTY_INTEGRATION_VERSION;

  detect(
    input:
      OracleGameDetectionInput
  ): OracleGameDetectionResult {
    const match =
      this.match(input);

    if (!match.matched) {
      return {
        detected: false,
      };
    }

    return {
      detected: true,

      integrationId:
        this.id,

      explanation:
        createDetectionExplanation(
          match
        ),
    };
  }

  createContext(
    input:
      OracleGameDetectionInput
  ): OracleGameContext {
    const match =
      this.match(input);

    if (!match.matched) {
      throw new Error(
        "Call of Duty context cannot be created because the supplied observation did not match an active Call of Duty game process."
      );
    }

    const detectedExperience =
      resolveDetectedExperience(
        match
      );

    const state:
      CallOfDutyGameContextState = {
        supportedExperience:
          "warzone",

        supportedExperienceName:
          "Warzone",

        detectedExperience,

        detectionScope:
          detectedExperience ===
          "warzone"
            ? "experience"
            : "integration-family",

        activeGameProcessMatched:
          match
            .activeGameProcessMatched,

        launcherMatched:
          match.launcherMatched,

        matchedExecutableName:
          match
            .matchedExecutableName,

        matchedProcessAlias:
          match
            .matchedProcessAlias,

        matchedTitlePatternId:
          match
            .matchedTitlePatternId,

        processId:
          input.processId,

        processName:
          input.processName,

        windowTitle:
          input.title,

        isForeground:
          input.isForeground,

        matchReasons:
          match.reasons.map(
            (reason) =>
              reason.explanation
          ),
      };

    return {
      integrationId:
        this.id,

      gameName:
        this.gameName,

      version:
        this.version,

      state,
    };
  }

  private match(
    input:
      OracleGameDetectionInput
  ): ExecutableGameMatchResult {
    return matchExecutableGame({
      observation:
        input,

      profile:
        CALL_OF_DUTY_DETECTION_PROFILE,
    });
  }
}

function resolveDetectedExperience(
  match:
    ExecutableGameMatchResult
): CallOfDutyDetectedExperience {
  return (
    match.matchedTitlePatternId ===
    WARZONE_TITLE_PATTERN_ID
  )
    ? "warzone"
    : null;
}

function createDetectionExplanation(
  match:
    ExecutableGameMatchResult
): string {
  const activeReasons =
    match.reasons
      .filter(
        (reason) =>
          reason.type !==
          "launcher"
      )
      .map(
        (reason) =>
          reason.explanation
      );

  if (
    activeReasons.length === 0
  ) {
    return (
      "An active Call of Duty game process was detected."
    );
  }

  return (
    `An active Call of Duty game process was detected. ${activeReasons.join(" ")}`
  );
}