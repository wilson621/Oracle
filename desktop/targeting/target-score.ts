import type {
  OracleDesktopTargetCandidate,
} from "./target-candidate.js";

const SUBSTANTIAL_WINDOW_MINIMUM_WIDTH =
  640;

const SUBSTANTIAL_WINDOW_MINIMUM_HEIGHT =
  480;

/**
 * Coverage is measured against the matched display area.
 *
 * The range deliberately excludes tiny utility windows while
 * avoiding a special reward for maximised or fullscreen windows.
 */
const MEANINGFUL_DISPLAY_COVERAGE_MINIMUM =
  0.2;

const MEANINGFUL_DISPLAY_COVERAGE_MAXIMUM =
  0.9;

/**
 * A deliberately broad range representing common desktop
 * application shapes.
 *
 * This is weak evidence only and does not imply game identity.
 */
const CONVENTIONAL_ASPECT_RATIO_MINIMUM =
  1.2;

const CONVENTIONAL_ASPECT_RATIO_MAXIMUM =
  2.5;

export type OracleDesktopTargetScoreRule =
  | "descriptive-title"
  | "known-process"
  | "substantial-window"
  | "meaningful-display-coverage"
  | "conventional-aspect-ratio";

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
 * All contributions remain weak desktop evidence. They must not
 * be interpreted as proof that a candidate is a game or the
 * Operator's intended application.
 */
export function scoreDesktopTargetCandidate(
  candidate:
    OracleDesktopTargetCandidate
): OracleDesktopTargetScore {
  const contributions =
    collectScoreContributions(
      candidate
    );

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

function collectScoreContributions(
  candidate:
    OracleDesktopTargetCandidate
): OracleDesktopTargetScoreContribution[] {
  const contributions:
    OracleDesktopTargetScoreContribution[] =
      [];

  appendContribution(
    contributions,
    evaluateTitleEvidence(
      candidate
    )
  );

  appendContribution(
    contributions,
    evaluateProcessEvidence(
      candidate
    )
  );

  appendContribution(
    contributions,
    evaluateWindowSizeEvidence(
      candidate
    )
  );

  appendContribution(
    contributions,
    evaluateDisplayCoverageEvidence(
      candidate
    )
  );

  appendContribution(
    contributions,
    evaluateAspectRatioEvidence(
      candidate
    )
  );

  return contributions;
}

function evaluateTitleEvidence(
  candidate:
    OracleDesktopTargetCandidate
): OracleDesktopTargetScoreContribution | null {
  const title =
    candidate.discoveredWindow
      .title
      .trim();

  if (title.length < 3) {
    return null;
  }

  return {
    rule: "descriptive-title",

    value: 1,

    explanation:
      "The window has a non-trivial title.",
  };
}

function evaluateProcessEvidence(
  candidate:
    OracleDesktopTargetCandidate
): OracleDesktopTargetScoreContribution | null {
  const processName =
    candidate.discoveredWindow
      .processName
      ?.trim() ??
    "";

  if (processName.length === 0) {
    return null;
  }

  return {
    rule: "known-process",

    value: 1,

    explanation:
      "The owning process was identified.",
  };
}

function evaluateWindowSizeEvidence(
  candidate:
    OracleDesktopTargetCandidate
): OracleDesktopTargetScoreContribution | null {
  const bounds =
    candidate.discoveredWindow
      .bounds;

  if (
    bounds.width <
      SUBSTANTIAL_WINDOW_MINIMUM_WIDTH ||
    bounds.height <
      SUBSTANTIAL_WINDOW_MINIMUM_HEIGHT
  ) {
    return null;
  }

  return {
    rule: "substantial-window",

    value: 1,

    explanation:
      "The window has substantial usable desktop bounds.",
  };
}

function evaluateDisplayCoverageEvidence(
  candidate:
    OracleDesktopTargetCandidate
): OracleDesktopTargetScoreContribution | null {
  const displayCoverage =
    candidate.evidence
      .displayCoverage;

  if (
    displayCoverage === null ||
    !Number.isFinite(
      displayCoverage
    ) ||
    displayCoverage <
      MEANINGFUL_DISPLAY_COVERAGE_MINIMUM ||
    displayCoverage >
      MEANINGFUL_DISPLAY_COVERAGE_MAXIMUM
  ) {
    return null;
  }

  return {
    rule:
      "meaningful-display-coverage",

    value: 1,

    explanation:
      "The window occupies a meaningful portion of its matched display.",
  };
}

function evaluateAspectRatioEvidence(
  candidate:
    OracleDesktopTargetCandidate
): OracleDesktopTargetScoreContribution | null {
  const aspectRatio =
    candidate.evidence
      .aspectRatio;

  if (
    !Number.isFinite(
      aspectRatio
    ) ||
    aspectRatio <
      CONVENTIONAL_ASPECT_RATIO_MINIMUM ||
    aspectRatio >
      CONVENTIONAL_ASPECT_RATIO_MAXIMUM
  ) {
    return null;
  }

  return {
    rule:
      "conventional-aspect-ratio",

    value: 1,

    explanation:
      "The window uses a conventional desktop application aspect ratio.",
  };
}

function appendContribution(
  contributions:
    OracleDesktopTargetScoreContribution[],
  contribution:
    OracleDesktopTargetScoreContribution | null
): void {
  if (!contribution) {
    return;
  }

  contributions.push(
    contribution
  );
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