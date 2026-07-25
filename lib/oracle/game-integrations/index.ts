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
export type {
  OracleGameIntegrationRegistryContract,
} from "./game-integration-registry";

export {
  evaluateGameIntegrations,
} from "./game-integration-evaluator";

export {
  createOracleGameIntegrationRegistry,
} from "./oracle-game-integration-registry";

export * from "./compatibility";

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

export {
  MINECRAFT_JAVA_CERTIFIED_GAME_VERSION,
  MINECRAFT_JAVA_CERTIFIED_LOCALE,
  MINECRAFT_JAVA_CERTIFIED_UI_SCALE,
  MINECRAFT_JAVA_COMPATIBILITY_CERTIFICATE,
  MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_ID,
  MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_MANIFEST,
  MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_VERSION,
  MINECRAFT_JAVA_INTEGRATION_ID,
  MINECRAFT_JAVA_INTEGRATION_VERSION,
  MinecraftJavaIntegration,
  createMinecraftJavaDiamondGuidanceProvider,
} from "./minecraft-java";
