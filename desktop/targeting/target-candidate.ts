import type {
  OracleDesktopDisplayState,
} from "../host-state.js";
import type {
  OracleDesktopDiscoveredWindow,
} from "../window-discovery.js";
import {
  cloneDesktopTargetEvidence,
  createDesktopTargetEvidence,
  type OracleDesktopTargetEvidence,
} from "./target-evidence.js";

export type OracleDesktopTargetCandidate = {
  discoveredWindow:
    OracleDesktopDiscoveredWindow;

  evidence:
    OracleDesktopTargetEvidence;
};

export type OracleDesktopTargetCandidateInput = {
  discoveredWindow:
    OracleDesktopDiscoveredWindow;

  display:
    OracleDesktopDisplayState | null;

  isForeground?:
    boolean | null;
};

export function createTargetCandidate(
  input:
    OracleDesktopTargetCandidateInput
): OracleDesktopTargetCandidate {
  const discoveredWindow =
    cloneDiscoveredWindow(
      input.discoveredWindow
    );

  return {
    discoveredWindow,

    evidence:
      createDesktopTargetEvidence({
        bounds:
          discoveredWindow.bounds,

        display:
          input.display,

        isForeground:
          input.isForeground ??
          null,
      }),
  };
}

export function createTargetCandidates(
  inputs:
    readonly OracleDesktopTargetCandidateInput[]
): OracleDesktopTargetCandidate[] {
  return inputs.map(
    createTargetCandidate
  );
}

export function cloneTargetCandidate(
  candidate:
    OracleDesktopTargetCandidate
): OracleDesktopTargetCandidate {
  return {
    discoveredWindow:
      cloneDiscoveredWindow(
        candidate.discoveredWindow
      ),

    evidence:
      cloneDesktopTargetEvidence(
        candidate.evidence
      ),
  };
}

function cloneDiscoveredWindow(
  window:
    OracleDesktopDiscoveredWindow
): OracleDesktopDiscoveredWindow {
  return {
    ...window,

    bounds: {
      ...window.bounds,
    },
  };
}