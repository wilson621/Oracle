import type {
  OracleDesktopTargetCandidate,
} from "./target-candidate.js";

const SUBSTANTIAL_WINDOW_MINIMUM_WIDTH =
  640;

const SUBSTANTIAL_WINDOW_MINIMUM_HEIGHT =
  480;

export type OracleDesktopTargetScoreRule =
  | "descriptive-title"
  | "known-process"
  | "substantial-window";

export type OracleDesktopTargetScoreContribution = {
  rule:
    OracleDesktopTargetScoreRule;

  value: number;

  explanation: string;
};

export type OracleDesktopTargetScore = {
  total: number;

  contributions:
    OracleDesktopTargetScoreContribution[];
};

/**
 * Scores one candidate that has already passed the selector's
 * eligibility rules.
 *
 * Commit 10C deliberately preserves the existing score rules
 * and values. The newly available evidence is not scored yet.
 */
export function scoreDesktopTargetCandidate(
  candidate:
    OracleDesktopTargetCandidate
): OracleDesktopTargetScore {
  const contributions:
    OracleDesktopTargetScoreContribution[] =
      [];

  const window =
    candidate.discoveredWindow;

  const title =
    window.title.trim();

  if (title.length >= 3) {
    contributions.push({
      rule: "descriptive-title",

      value: 1,

      explanation:
        "The window has a non-trivial title.",
    });
  }

  const processName =
    window.processName?.trim() ??
    "";

  if (processName.length > 0) {
    contributions.push({
      rule: "known-process",

      value: 1,

      explanation:
        "The owning process was identified.",
    });
  }

  if (
    window.bounds.width >=
      SUBSTANTIAL_WINDOW_MINIMUM_WIDTH &&
    window.bounds.height >=
      SUBSTANTIAL_WINDOW_MINIMUM_HEIGHT
  ) {
    contributions.push({
      rule: "substantial-window",

      value: 1,

      explanation:
        "The window has substantial usable desktop bounds.",
    });
  }

  return {
    total:
      contributions.reduce(
        (sum, contribution) =>
          sum +
          contribution.value,
        0
      ),

    contributions:
      contributions.map(
        cloneScoreContribution
      ),
  };
}

export function cloneDesktopTargetScore(
  score:
    OracleDesktopTargetScore
): OracleDesktopTargetScore {
  return {
    total: score.total,

    contributions:
      score.contributions.map(
        cloneScoreContribution
      ),
  };
}

function cloneScoreContribution(
  contribution:
    OracleDesktopTargetScoreContribution
): OracleDesktopTargetScoreContribution {
  return {
    rule:
      contribution.rule,

    value:
      contribution.value,

    explanation:
      contribution.explanation,
  };
}