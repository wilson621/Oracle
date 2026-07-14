import type {
  OracleDesktopDiscoveredWindow,
} from "../window-discovery.js";
import {
  createTargetCandidates,
  type OracleDesktopTargetCandidate,
  type OracleDesktopTargetCandidateInput,
} from "./target-candidate.js";
import {
  createDesktopTargetDecision,
  type OracleDesktopTargetDecision,
} from "./target-decision.js";
import {
  scoreDesktopTargetCandidate,
  type OracleDesktopTargetScore,
} from "./target-score.js";

export type OracleDesktopTargetSelectionStatus =
  OracleDesktopTargetDecision["status"];

export type OracleDesktopTargetSelectionResult =
  OracleDesktopTargetDecision;

type ScoredTargetCandidate = {
  candidate:
    OracleDesktopTargetCandidate;

  score:
    OracleDesktopTargetScore;

  discoveryIndex: number;
};

/**
 * Owns the complete deterministic desktop-target decision:
 *
 * 1. Construct candidates.
 * 2. Apply existing eligibility rules.
 * 3. Apply existing scoring rules.
 * 4. Preserve discovery order for tied scores.
 * 5. Describe the winner and strongest alternative.
 *
 * Decision explanation does not influence selection.
 */
export function selectDesktopTarget(
  inputs:
    readonly OracleDesktopTargetCandidateInput[]
): OracleDesktopTargetSelectionResult {
  const candidates =
    createTargetCandidates(
      inputs
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

  const rankedCandidates =
    rankScoredCandidates(
      scoredCandidates
    );

  const selected =
    rankedCandidates[0] ??
    null;

  const runnerUp =
    rankedCandidates[1] ??
    null;

  return createDesktopTargetDecision({
    selectedCandidate:
      selected?.candidate ??
      null,

    selectedScore:
      selected?.score ??
      null,

    runnerUpScore:
      runnerUp?.score ??
      null,
  });
}

export function getSelectedDiscoveredWindow(
  decision:
    OracleDesktopTargetDecision
): OracleDesktopDiscoveredWindow | null {
  if (
    decision.status !==
    "selected"
  ) {
    return null;
  }

  const window =
    decision
      .selectedCandidate
      .discoveredWindow;

  return {
    ...window,

    bounds: {
      ...window.bounds,
    },
  };
}

function isEligibleTargetCandidate(
  candidate:
    OracleDesktopTargetCandidate
): boolean {
  const window =
    candidate.discoveredWindow;

  return (
    window.visible &&
    !window.minimized &&
    hasValidBounds(
      window
    )
  );
}

function hasValidBounds(
  window:
    OracleDesktopDiscoveredWindow
): boolean {
  const { bounds } =
    window;

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

function rankScoredCandidates(
  candidates:
    readonly ScoredTargetCandidate[]
): ScoredTargetCandidate[] {
  return [...candidates].sort(
    (left, right) => {
      const scoreDifference =
        right.score.total -
        left.score.total;

      if (
        scoreDifference !== 0
      ) {
        return scoreDifference;
      }

      /*
       * Equal scores preserve the original discovery order.
       */
      return (
        left.discoveryIndex -
        right.discoveryIndex
      );
    }
  );
}