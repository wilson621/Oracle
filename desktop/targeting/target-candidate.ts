import type {
  OracleDesktopDiscoveredWindow,
} from "../window-discovery.js";

/**
 * A desktop target candidate is an existing discovered-window
 * snapshot. Targeting deliberately reuses the discovery contract
 * rather than creating a second window identity model.
 */
export type OracleDesktopTargetCandidate =
  OracleDesktopDiscoveredWindow;

export function createTargetCandidates(
  windows:
    readonly OracleDesktopDiscoveredWindow[]
): OracleDesktopTargetCandidate[] {
  return windows.map(
    cloneTargetCandidate
  );
}

export function cloneTargetCandidate(
  candidate:
    OracleDesktopTargetCandidate
): OracleDesktopTargetCandidate {
  return {
    ...candidate,

    bounds: {
      ...candidate.bounds,
    },
  };
}