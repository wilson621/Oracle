import type {
  OracleDesktopDiscoveredWindow,
} from "../window-discovery.js";
import {
  cloneTargetCandidate,
  createTargetCandidates,
  type OracleDesktopTargetCandidate,
} from "./target-candidate.js";
import {
  cloneDesktopTargetScore,
  scoreDesktopTargetCandidate,
  type OracleDesktopTargetScore,
} from "./target-score.js";

export type OracleDesktopTargetSelectionStatus =
  | "selected"
  | "no-candidate";

export type OracleDesktopTargetSelectionResult =
  | {
      status: "selected";

      target:
        OracleDesktopTargetCandidate;

      score:
        OracleDesktopTargetScore;
    }
  | {
      status: "no-candidate";

      target: null;
      score: null;
    };

type ScoredTargetCandidate = {
  candidate:
    OracleDesktopTargetCandidate;

  score:
    OracleDesktopTargetScore;

  discoveryIndex: number;
};

/**
 * Selects a desktop attachment candidate through two distinct stages:
 *
 * 1. Remove candidates that are not currently eligible.
 * 2. Score eligible candidates and select the highest score.
 *
 * Equal scores preserve the original discovery order.
 *
 * Oracle's own Electron window is excluded by the host controller
 * before candidates reach this pure targeting function.
 */
export function selectDesktopTarget(
  windows:
    readonly OracleDesktopDiscoveredWindow[]
): OracleDesktopTargetSelectionResult {
  const candidates =
    createTargetCandidates(
      windows
    );

  const scoredCandidates =
    candidates
      .map(
        (
          candidate,
          discoveryIndex
        ): ScoredTargetCandidate | null => {
          if (
            !isEligibleTargetCandidate(
              candidate
            )
          ) {
            return null;
          }

          return {
            candidate,

            score:
              scoreDesktopTargetCandidate(
                candidate
              ),

            discoveryIndex,
          };
        }
      )
      .filter(
        (
          candidate
        ): candidate is ScoredTargetCandidate =>
          candidate !== null
      );

  const selected =
    selectHighestScoringCandidate(
      scoredCandidates
    );

  if (!selected) {
    return {
      status: "no-candidate",

      target: null,
      score: null,
    };
  }

  return {
    status: "selected",

    target:
      cloneTargetCandidate(
        selected.candidate
      ),

    score:
      cloneDesktopTargetScore(
        selected.score
      ),
  };
}

function isEligibleTargetCandidate(
  candidate:
    OracleDesktopTargetCandidate
): boolean {
  return (
    candidate.visible &&
    !candidate.minimized &&
    hasValidBounds(
      candidate
    )
  );
}

function hasValidBounds(
  candidate:
    OracleDesktopTargetCandidate
): boolean {
  const { bounds } =
    candidate;

  return (
    Number.isFinite(bounds.x) &&
    Number.isFinite(bounds.y) &&
    Number.isFinite(
      bounds.width
    ) &&
    Number.isFinite(
      bounds.height
    ) &&
    bounds.width > 0 &&
    bounds.height > 0
  );
}

function selectHighestScoringCandidate(
  candidates:
    readonly ScoredTargetCandidate[]
): ScoredTargetCandidate | null {
  let selected:
    ScoredTargetCandidate | null =
      null;

  for (const candidate of candidates) {
    if (!selected) {
      selected = candidate;
      continue;
    }

    if (
      candidate.score.total >
      selected.score.total
    ) {
      selected = candidate;
      continue;
    }

    /*
     * Equal scores deliberately retain the candidate encountered
     * first in the original discovery order.
     */
    if (
      candidate.score.total ===
        selected.score.total &&
      candidate.discoveryIndex <
        selected.discoveryIndex
    ) {
      selected = candidate;
    }
  }

  return selected;
}