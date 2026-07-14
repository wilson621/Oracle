export type {
  OracleGameContext,
} from "./game-context";

export type {
  OracleGameDetectionInput,
} from "./game-detection-input";

export type {
  OracleGameDetectionResult,
} from "./game-detection";

export type {
  OracleGameIntegration,
} from "./game-integration";

export {
  OracleGameIntegrationRegistry,
} from "./game-integration-registry";

export {
  evaluateGameIntegrations,
} from "./game-integration-evaluator";

export type {
  ExecutableGameDetectionProfile,
  ExecutableGameMatcherInput,
  ExecutableGameMatchReason,
  ExecutableGameMatchReasonType,
  ExecutableGameMatchResult,
  ExecutableGameTitlePattern,
  ExecutableGameTitlePatternKind,
} from "./detection/executable-game-detection-types";

export {
  matchExecutableGame,
} from "./detection/executable-game-matcher";

export {
  CALL_OF_DUTY_DETECTION_PROFILE,
} from "./call-of-duty/call-of-duty-detection-profile";

export {
  CallOfDutyIntegration,
  type OracleCallOfDutyContextState,
  type OracleCallOfDutyDetectedExperience,
} from "./call-of-duty/call-of-duty-integration";