import {
  createOracleGameIntegrationRegistry,
  evaluateGameIntegrations,
  type OracleGameDetectionInput,
  type OracleGameDetectionMatch,
  type OracleGameIntegrationRegistryContract,
} from "../../lib/oracle/game-integrations/index.js";
import type {
  OracleDesktopTargetCandidateInput,
} from "../targeting/index.js";
import {
  createOracleCompanionGameContext,
  type OracleCompanionGameContext,
} from "./companion-context.js";

export type OracleDesktopGameCandidateStatus =
  | "supported"
  | "unsupported"
  | "ambiguous"
  | "failed";

type OracleDesktopGameCandidateResultBase =
  Readonly<{
    candidate:
      OracleDesktopTargetCandidateInput;
  }>;

export type OracleDesktopSupportedGameCandidate =
  OracleDesktopGameCandidateResultBase &
    Readonly<{
      status: "supported";

      detection:
        OracleGameDetectionMatch;

      gameContext:
        OracleCompanionGameContext;
    }>;

export type OracleDesktopGameCandidateResult =
  | OracleDesktopSupportedGameCandidate
  | (
      OracleDesktopGameCandidateResultBase &
        Readonly<{
          status:
            Exclude<
              OracleDesktopGameCandidateStatus,
              "supported"
            >;

          detection: null;
          gameContext: null;
        }>
    );

/**
 * Resolves game information for desktop target candidates.
 *
 * This coordinator owns no attachment or Session lifecycle state. It consumes
 * plain discovered-window metadata, delegates all game-specific decisions to
 * registered Game Integrations and returns immutable serializable information.
 */
export class OracleDesktopGameIntegrationCoordinator {
  constructor(
    private readonly registry:
      OracleGameIntegrationRegistryContract =
        createOracleGameIntegrationRegistry()
  ) {}

  evaluateCandidates(
    candidates:
      readonly OracleDesktopTargetCandidateInput[]
  ): readonly OracleDesktopGameCandidateResult[] {
    return Object.freeze(
      candidates.map(
        (candidate) =>
          this.evaluateCandidate(
            candidate
          )
      )
    );
  }

  private evaluateCandidate(
    candidate:
      OracleDesktopTargetCandidateInput
  ): OracleDesktopGameCandidateResult {
    const immutableCandidate =
      cloneCandidateInput(
        candidate
      );

    const detectionInput =
      createDetectionInput(
        immutableCandidate
      );

    try {
      const outcome =
        evaluateGameIntegrations(
          this.registry,
          detectionInput
        );

      if (
        outcome.status ===
        "ambiguous"
      ) {
        return createUnresolvedResult(
          "ambiguous",
          immutableCandidate
        );
      }

      if (
        outcome.status ===
        "not-detected"
      ) {
        return createUnresolvedResult(
          outcome.failures.length > 0
            ? "failed"
            : "unsupported",
          immutableCandidate
        );
      }

      const integration =
        this.registry.getById(
          outcome.match
            .integrationId
        );

      if (!integration) {
        return createUnresolvedResult(
          "failed",
          immutableCandidate
        );
      }

      const context =
        integration.createContext(
          detectionInput
        );

      if (
        context.integrationId !==
          outcome.match
            .integrationId ||
        context.gameName !==
          outcome.match.gameName ||
        context.version !==
          outcome.match
            .integrationVersion
      ) {
        return createUnresolvedResult(
          "failed",
          immutableCandidate
        );
      }

      return Object.freeze({
        status: "supported",

        candidate:
          immutableCandidate,

        detection:
          cloneDetectionMatch(
            outcome.match
          ),

        gameContext:
          createOracleCompanionGameContext(
            context
          ),
      });
    } catch {
      return createUnresolvedResult(
        "failed",
        immutableCandidate
      );
    }
  }
}

function createDetectionInput(
  candidate:
    OracleDesktopTargetCandidateInput
): OracleGameDetectionInput {
  return Object.freeze({
    processId:
      candidate.discoveredWindow
        .processId,

    processName:
      candidate.discoveredWindow
        .processName ?? "",

    title:
      candidate.discoveredWindow
        .title,

    bounds:
      Object.freeze({
        ...candidate
          .discoveredWindow
          .bounds,
      }),

    isForeground:
      candidate.isForeground ??
      null,
  });
}

function createUnresolvedResult(
  status:
    Exclude<
      OracleDesktopGameCandidateStatus,
      "supported"
    >,
  candidate:
    OracleDesktopTargetCandidateInput
): OracleDesktopGameCandidateResult {
  return Object.freeze({
    status,
    candidate,
    detection: null,
    gameContext: null,
  });
}

function cloneCandidateInput(
  candidate:
    OracleDesktopTargetCandidateInput
): OracleDesktopTargetCandidateInput {
  const clone:
    OracleDesktopTargetCandidateInput = {
      discoveredWindow: {
        ...candidate
          .discoveredWindow,

        bounds: {
          ...candidate
            .discoveredWindow
            .bounds,
        },
      },

      display:
        candidate.display === null
          ? null
          : {
              ...candidate.display,

              bounds: {
                ...candidate
                  .display.bounds,
              },

              workArea: {
                ...candidate
                  .display.workArea,
              },
            },

      isForeground:
        candidate.isForeground,
    };

  return deepFreeze(clone);
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

function deepFreeze<T>(
  value: T
): T {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (
    const nestedValue
    of Object.values(value)
  ) {
    deepFreeze(nestedValue);
  }

  return Object.freeze(value);
}
