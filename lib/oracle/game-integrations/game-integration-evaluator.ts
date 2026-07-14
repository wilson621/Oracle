import type {
  OracleGameDetectionInput,
} from "./game-detection-input";

import type {
  OracleGameDetectionResult,
} from "./game-detection";

import {
  OracleGameIntegrationRegistry,
} from "./game-integration-registry";

export function evaluateGameIntegrations(
  registry: OracleGameIntegrationRegistry,
  input: OracleGameDetectionInput
): OracleGameDetectionResult[] {
  return registry
    .getAll()
    .map((integration) =>
      integration.detect(input)
    );
}