import type {
  OracleCompanionGuidance,
  OracleCompanionGuidanceConfidenceLevel,
  OracleCompanionGuidancePriority,
  OracleCompanionGuidanceSpoilerLevel,
} from "../../../companion/guidance";
import type {
  OracleCompanionGuidanceProviderFailure,
  OracleCompanionGuidanceServiceResult,
} from "../../services/companion-guidance";
import {
  ORACLE_COMPANION_GUIDANCE_APPLICATION_STATE,
  ORACLE_COMPANION_GUIDANCE_APPLICATION_STATE_VERSION,
  type CompanionGuidanceApplicationState,
  type CompanionGuidanceApplicationStatus,
  type CompanionGuidanceCardViewModel,
  type CompanionGuidanceDiagnosticViewModel,
  type CompanionGuidanceDisplayLabel,
} from "./companion-guidance-application-types";

const PRIORITY_LABELS:
  Readonly<Record<
    OracleCompanionGuidancePriority,
    string
  >> = Object.freeze({
    low: "Low priority",
    normal: "Normal priority",
    high: "High priority",
  });

const SPOILER_LABELS:
  Readonly<Record<
    OracleCompanionGuidanceSpoilerLevel,
    string
  >> = Object.freeze({
    none: "No spoilers",
    minor: "Minor spoilers",
    major: "Major spoilers",
    full: "Full spoilers",
  });

const CONFIDENCE_LABELS:
  Readonly<Record<
    OracleCompanionGuidanceConfidenceLevel,
    string
  >> = Object.freeze({
    low: "Low confidence",
    medium: "Medium confidence",
    high: "High confidence",
  });

/**
 * Projects an already validated Services result into an Applications-owned
 * view model. It does not discover or execute providers and intentionally
 * drops provider identities, execution metadata and internal error messages.
 */
export function createCompanionGuidanceApplicationState(
  result:
    OracleCompanionGuidanceServiceResult
): CompanionGuidanceApplicationState {
  const cards =
    result.guidance.map(
      createCardViewModel
    );
  const diagnostics =
    createOperatorDiagnostics(
      result.failures
    );
  const status =
    resolveStatus(
      cards.length,
      diagnostics.length
    );

  return createState({
    status,
    message:
      applicationMessage(status),
    cards,
    diagnostics,
  });
}

export function createCompanionGuidanceLoadingState():
  CompanionGuidanceApplicationState {
  return createState({
    status: "loading",
    message: "Preparing Companion guidance.",
    cards: [],
    diagnostics: [],
  });
}

export function createCompanionGuidanceUnavailableState():
  CompanionGuidanceApplicationState {
  return createState({
    status: "unavailable",
    message:
      "Companion guidance is currently unavailable.",
    cards: [],
    diagnostics: [
      {
        code: "guidance-unavailable",
        severity: "warning",
        title: "Guidance unavailable",
        message:
          "Guidance could not be prepared right now. Try again when Companion is ready.",
      },
    ],
  });
}

function createCardViewModel(
  guidance:
    OracleCompanionGuidance
): CompanionGuidanceCardViewModel {
  return {
    id: guidance.id,
    category:
      createOpenLabel(
        guidance.category
      ),
    type:
      createOpenLabel(
        guidance.type
      ),
    title: guidance.title,
    summary: guidance.summary,
    recommendation:
      guidance.recommendation,
    detailedExplanation:
      guidance.detailedExplanation,
    rationale: guidance.rationale,
    evidence:
      guidance.evidence.map(
        (evidence) => ({
          id: evidence.id,
          summary:
            evidence.summary,
          sourceIds: [
            ...evidence.sourceIds,
          ],
        })
      ),
    confidence: {
      score:
        guidance.confidence.score,
      level: {
        id:
          guidance.confidence.level,
        label:
          CONFIDENCE_LABELS[
            guidance.confidence.level
          ],
      },
      rationale:
        guidance.confidence.rationale,
    },
    priority: {
      id: guidance.priority,
      label:
        PRIORITY_LABELS[
          guidance.priority
        ],
    },
    sources:
      guidance.sources.map(
        (source) => ({
          id: source.id,
          type:
            createOpenLabel(
              source.type
            ),
          title: source.title,
          uri: source.uri,
          publisher:
            source.publisher,
          version: source.version,
          verifiedAt:
            source.verifiedAt,
        })
      ),
    spoiler: {
      id: guidance.spoilerLevel,
      label:
        SPOILER_LABELS[
          guidance.spoilerLevel
        ],
    },
    reassessmentTrigger:
      guidance.reassessmentTrigger,
    createdAt: guidance.createdAt,
    expiresAt: guidance.expiresAt,
  };
}

function createOperatorDiagnostics(
  failures:
    readonly OracleCompanionGuidanceProviderFailure[]
): CompanionGuidanceDiagnosticViewModel[] {
  const diagnostics:
    CompanionGuidanceDiagnosticViewModel[] = [];

  if (
    failures.some(
      (failure) =>
        failure.stage ===
        "execution"
    )
  ) {
    diagnostics.push({
      code:
        "guidance-source-unavailable",
      severity: "warning",
      title:
        "Some guidance is unavailable",
      message:
        "One or more guidance sources could not respond. Available guidance is still shown.",
    });
  }

  if (
    failures.some(
      (failure) =>
        failure.stage ===
        "output-validation"
    )
  ) {
    diagnostics.push({
      code:
        "guidance-content-omitted",
      severity: "warning",
      title:
        "Some guidance was omitted",
      message:
        "Some guidance could not be prepared safely and has not been displayed.",
    });
  }

  return diagnostics;
}

function resolveStatus(
  cardCount: number,
  diagnosticCount: number
): CompanionGuidanceApplicationStatus {
  if (cardCount > 0) {
    return diagnosticCount > 0
      ? "partial-success"
      : "ready";
  }

  return diagnosticCount > 0
    ? "unavailable"
    : "empty";
}

function applicationMessage(
  status:
    CompanionGuidanceApplicationStatus
): string {
  switch (status) {
    case "ready":
      return "Companion guidance is ready.";
    case "empty":
      return "No guidance is available for this context yet.";
    case "partial-success":
      return "Companion guidance is available, but some guidance could not be prepared.";
    case "unavailable":
      return "Companion guidance is currently unavailable.";
    case "loading":
      return "Preparing Companion guidance.";
  }
}

function createOpenLabel(
  id: string
): CompanionGuidanceDisplayLabel {
  const words = id
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const label = words.length > 0
    ? words.charAt(0).toUpperCase() +
      words.slice(1)
    : "Other";

  return {
    id,
    label,
  };
}

function createState(
  input: Readonly<{
    status:
      CompanionGuidanceApplicationStatus;
    message: string;
    cards:
      readonly CompanionGuidanceCardViewModel[];
    diagnostics:
      readonly CompanionGuidanceDiagnosticViewModel[];
  }>
): CompanionGuidanceApplicationState {
  return deepFreeze({
    contract: {
      name:
        ORACLE_COMPANION_GUIDANCE_APPLICATION_STATE,
      version:
        ORACLE_COMPANION_GUIDANCE_APPLICATION_STATE_VERSION,
    },
    status: input.status,
    message: input.message,
    cards: [...input.cards],
    diagnostics: [
      ...input.diagnostics,
    ],
  });
}

function deepFreeze<T>(
  value: T
): Readonly<T> {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (
    const child
    of Object.values(value)
  ) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}
