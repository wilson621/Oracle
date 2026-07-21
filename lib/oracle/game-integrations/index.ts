export type {
  OracleGameContext,
} from "./game-context";

export type {
  OracleGameDetectionInput,
} from "./game-detection-input";

export type {
  OracleGameAmbiguousOutcome,
  OracleGameDetectedOutcome,
  OracleGameDetectionFailure,
  OracleGameDetectionMatch,
  OracleGameDetectionOutcome,
  OracleGameDetectionResult,
  OracleGameNotDetectedOutcome,
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

export {
  createOracleGameIntegrationRegistry,
} from "./oracle-game-integration-registry";

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
} from "./call-of-duty/call-of-duty-integration";
