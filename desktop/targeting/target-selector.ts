import type {
  OracleDesktopDiscoveredWindow,
} from "../window-discovery.js";
import {
  cloneTargetCandidate,
  createTargetCandidates,
  type OracleDesktopTargetCandidate,
} from "./target-candidate.js";

export type OracleDesktopTargetSelectionStatus =
  | "selected"
  | "no-candidate";

export type OracleDesktopTargetSelectionResult =
  | {
      status: "selected";

      target:
        OracleDesktopTargetCandidate;
    }
  | {
      status: "no-candidate";

      target: null;
    };

/**
 * Selects the most suitable attachment candidate using the
 * existing deterministic policy.
 *
 * Selection order:
 * 1. First visible, non-minimised candidate.
 * 2. First non-minimised candidate.
 * 3. First available candidate.
 * 4. No candidate.
 */
export function selectDesktopTarget(
  windows:
    readonly OracleDesktopDiscoveredWindow[]
): OracleDesktopTargetSelectionResult {
  const candidates =
    createTargetCandidates(
      windows
    );

  const target =
    findFirstSuitableCandidate(
      candidates
    );

  if (!target) {
    return {
      status: "no-candidate",
      target: null,
    };
  }

  return {
    status: "selected",

    target:
      cloneTargetCandidate(
        target
      ),
  };
}

function findFirstSuitableCandidate(
  candidates:
    readonly OracleDesktopTargetCandidate[]
): OracleDesktopTargetCandidate | null {
  return (
    candidates.find(
      (candidate) =>
        candidate.visible &&
        !candidate.minimized
    ) ??
    candidates.find(
      (candidate) =>
        !candidate.minimized
    ) ??
    candidates[0] ??
    null
  );
}