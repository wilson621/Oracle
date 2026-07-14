export {
  cloneTargetCandidate,
  createTargetCandidates,
  type OracleDesktopTargetCandidate,
} from "./target-candidate.js";

export {
  cloneDesktopTargetScore,
  scoreDesktopTargetCandidate,
  type OracleDesktopTargetScore,
  type OracleDesktopTargetScoreContribution,
  type OracleDesktopTargetScoreRule,
} from "./target-score.js";

export {
  selectDesktopTarget,
  type OracleDesktopTargetSelectionResult,
  type OracleDesktopTargetSelectionStatus,
} from "./target-selector.js";