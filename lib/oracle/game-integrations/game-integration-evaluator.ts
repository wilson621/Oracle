import type {
  OracleGameDetectionInput,
} from "./game-detection-input";

import type {
  OracleGameDetectionFailure,
  OracleGameDetectionMatch,
  OracleGameDetectionOutcome,
} from "./game-detection";
import type {
  OracleGameIntegration,
} from "./game-integration";

import type {
  OracleGameIntegrationRegistryContract,
} from "./game-integration-registry";

export function evaluateGameIntegrations(
  registry: OracleGameIntegrationRegistryContract,
  input: OracleGameDetectionInput
): OracleGameDetectionOutcome {
  const matches:
    OracleGameDetectionMatch[] =
      [];

  const failures:
    OracleGameDetectionFailure[] =
      [];

  for (
    const integration
    of registry.getAll()
  ) {
    try {
      const result =
        integration.detect(
          input
        );

      if (!result.detected) {
        continue;
      }

      assertMatchOwnership(
        integration,
        result.match
      );

      matches.push(
        cloneDetectionMatch(
          result.match
        )
      );
    } catch (error) {
      failures.push(
        Object.freeze({
          integrationId:
            integration.id,

          gameName:
            integration.gameName,

          integrationVersion:
            integration.version,

          explanation:
            getErrorMessage(
              error
            ),
        })
      );
    }
  }

  const immutableMatches =
    Object.freeze(matches);

  const immutableFailures =
    Object.freeze(failures);

  if (
    immutableMatches.length ===
    0
  ) {
    return Object.freeze({
      status:
        "not-detected",

      matches:
        immutableMatches as readonly [],

      failures:
        immutableFailures,
    });
  }

  if (
    immutableMatches.length ===
    1
  ) {
    const match =
      immutableMatches[0];

    return Object.freeze({
      status: "detected",

      match,

      matches:
        immutableMatches as readonly [
          OracleGameDetectionMatch,
        ],

      failures:
        immutableFailures,
    });
  }

  return Object.freeze({
    status: "ambiguous",

    matches:
      immutableMatches,

    failures:
      immutableFailures,
  });
}

function assertMatchOwnership(
  integration:
    OracleGameIntegration,
  match:
    OracleGameDetectionMatch
): void {
  if (
    match.integrationId !==
      integration.id ||
    match.gameName !==
      integration.gameName ||
    match.integrationVersion !==
      integration.version
  ) {
    throw new Error(
      `Game integration '${integration.id}' returned detection identity that does not match its registration metadata.`
    );
  }
}

function cloneDetectionMatch(
  match:
    OracleGameDetectionMatch
): OracleGameDetectionMatch {
  return Object.freeze({
    integrationId:
      match.integrationId,

    gameName:
      match.gameName,

    integrationVersion:
      match.integrationVersion,

    explanation:
      match.explanation,
  });
}

function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
