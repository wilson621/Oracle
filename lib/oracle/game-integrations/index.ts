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
  CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_ID,
  CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_MANIFEST,
  CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_VERSION,
  CallOfDutyIntegration,
  createCallOfDutyCuratedGuidanceProvider,
} from "./call-of-duty";

export type {
  CallOfDutyCuratedGuidanceProviderDependencies,
} from "./call-of-duty";
