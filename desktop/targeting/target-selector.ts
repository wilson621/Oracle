import type {
  OracleDesktopDiscoveredWindow,
} from "../window-discovery.js";
import {
  cloneTargetCandidate,
  createTargetCandidates,
  type OracleDesktopTargetCandidate,
  type OracleDesktopTargetCandidateInput,
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
        OracleDesktopDiscoveredWindow;

      candidate:
        OracleDesktopTargetCandidate;

      score:
        OracleDesktopTargetScore;
    }
  | {
      status: "no-candidate";

      target: null;
      candidate: null;
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
 * Eligibility, score ordering and stable tie-breaking remain
 * unchanged in Commit 10C.
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

  const selected =
    selectHighestScoringCandidate(
      scoredCandidates
    );

  if (!selected) {
    return {
      status:
        "no-candidate",

      target: null,
      candidate: null,
      score: null,
    };
  }

  const candidate =
    cloneTargetCandidate(
      selected.candidate
    );

  return {
    status: "selected",

    target: {
      ...candidate
        .discoveredWindow,

      bounds: {
        ...candidate
          .discoveredWindow
          .bounds,
      },
    },

    candidate,

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
     * Equal scores deliberately preserve original discovery order.
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