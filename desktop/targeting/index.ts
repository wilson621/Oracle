export {
  cloneDesktopTargetEvidence,
  createDesktopTargetEvidence,
  type OracleDesktopTargetEvidence,
  type OracleDesktopTargetEvidenceInput,
} from "./target-evidence.js";

export {
  cloneTargetCandidate,
  createTargetCandidate,
  createTargetCandidates,
  type OracleDesktopTargetCandidate,
  type OracleDesktopTargetCandidateInput,
} from "./target-candidate.js";

export {
  cloneDesktopTargetScore,
  scoreDesktopTargetCandidate,
  type OracleDesktopTargetScore,
  type OracleDesktopTargetScoreContribution,
  type OracleDesktopTargetScoreRule,
} from "./target-score.js";

export {
  cloneDesktopTargetDecision,
  createDesktopTargetDecision,
  type OracleDesktopTargetConfidence,
  type OracleDesktopTargetDecision,
  type OracleDesktopTargetDecisionInput,
  type OracleDesktopTargetEvidenceBreadth,
} from "./target-decision.js";

export {
  getSelectedDiscoveredWindow,
  selectDesktopTarget,
  type OracleDesktopTargetSelectionResult,
  type OracleDesktopTargetSelectionStatus,
} from "./target-selector.js";