import {
  cloneTargetCandidate,
  type OracleDesktopTargetCandidate,
} from "./target-candidate.js";
import {
  cloneDesktopTargetScore,
  type OracleDesktopTargetScore,
  type OracleDesktopTargetScoreContribution,
} from "./target-score.js";

export type OracleDesktopTargetEvidenceBreadth =
  | "none"
  | "limited"
  | "moderate"
  | "broad";

export type OracleDesktopTargetConfidence =
  | "none"
  | "low"
  | "moderate"
  | "high";

export type OracleDesktopTargetDecision =
  | {
      status: "selected";

      selectedCandidate:
        OracleDesktopTargetCandidate;

      selectedScore:
        OracleDesktopTargetScore;

      runnerUpScore:
        OracleDesktopTargetScore | null;

      scoreMargin: number | null;

      evidenceBreadth:
        OracleDesktopTargetEvidenceBreadth;

      confidence:
        OracleDesktopTargetConfidence;

      explanation: string;
    }
  | {
      status: "no_candidate";

      selectedCandidate: null;
      selectedScore: null;
      runnerUpScore: null;
      scoreMargin: null;

      evidenceBreadth: "none";
      confidence: "none";

      explanation: string;
    };

export type OracleDesktopTargetDecisionInput = {
  selectedCandidate:
    OracleDesktopTargetCandidate | null;

  selectedScore:
    OracleDesktopTargetScore | null;

  runnerUpScore:
    OracleDesktopTargetScore | null;
};

export function createDesktopTargetDecision(
  input: OracleDesktopTargetDecisionInput
): OracleDesktopTargetDecision {
  if (
    !input.selectedCandidate ||
    !input.selectedScore
  ) {
    return createNoCandidateDecision();
  }

  const selectedCandidate =
    cloneTargetCandidate(
      input.selectedCandidate
    );

  const selectedScore =
    cloneDesktopTargetScore(
      input.selectedScore
    );

  const runnerUpScore =
    input.runnerUpScore
      ? cloneDesktopTargetScore(
          input.runnerUpScore
        )
      : null;

  const scoreMargin =
    runnerUpScore
      ? selectedScore.total -
        runnerUpScore.total
      : null;

  const meaningfulContributions =
    getMeaningfulPositiveContributions(
      selectedScore.contributions
    );

  const evidenceBreadth =
    classifyEvidenceBreadth(
      meaningfulContributions.length
    );

  const confidence =
    classifyConfidence({
      selectedScore:
        selectedScore.total,

      runnerUpScore:
        runnerUpScore?.total ??
        null,

      scoreMargin,
      evidenceBreadth,
    });

  return {
    status: "selected",

    selectedCandidate,
    selectedScore,
    runnerUpScore,
    scoreMargin,

    evidenceBreadth,
    confidence,

    explanation:
      createSelectedExplanation({
        meaningfulContributions,
        selectedScore:
          selectedScore.total,

        runnerUpScore:
          runnerUpScore?.total ??
          null,

        scoreMargin,
        evidenceBreadth,
        confidence,
      }),
  };
}

export function cloneDesktopTargetDecision(
  decision:
    OracleDesktopTargetDecision
): OracleDesktopTargetDecision {
  if (
    decision.status ===
    "no_candidate"
  ) {
    return {
      status: "no_candidate",

      selectedCandidate: null,
      selectedScore: null,
      runnerUpScore: null,
      scoreMargin: null,

      evidenceBreadth: "none",
      confidence: "none",

      explanation:
        decision.explanation,
    };
  }

  return {
    status: "selected",

    selectedCandidate:
      cloneTargetCandidate(
        decision.selectedCandidate
      ),

    selectedScore:
      cloneDesktopTargetScore(
        decision.selectedScore
      ),

    runnerUpScore:
      decision.runnerUpScore
        ? cloneDesktopTargetScore(
            decision.runnerUpScore
          )
        : null,

    scoreMargin:
      decision.scoreMargin,

    evidenceBreadth:
      decision.evidenceBreadth,

    confidence:
      decision.confidence,

    explanation:
      decision.explanation,
  };
}

function createNoCandidateDecision(): OracleDesktopTargetDecision {
  return {
    status: "no_candidate",

    selectedCandidate: null,
    selectedScore: null,
    runnerUpScore: null,
    scoreMargin: null,

    evidenceBreadth: "none",
    confidence: "none",

    explanation:
      "No eligible desktop target candidate was available.",
  };
}

function getMeaningfulPositiveContributions(
  contributions:
    readonly OracleDesktopTargetScoreContribution[]
): OracleDesktopTargetScoreContribution[] {
  return contributions
    .filter(
      (contribution) =>
        Number.isFinite(
          contribution.value
        ) &&
        contribution.value > 0
    )
    .map(
      cloneContribution
    );
}

function classifyEvidenceBreadth(
  meaningfulContributionCount: number
): OracleDesktopTargetEvidenceBreadth {
  if (
    meaningfulContributionCount <= 0
  ) {
    return "none";
  }

  if (
    meaningfulContributionCount === 1
  ) {
    return "limited";
  }

  if (
    meaningfulContributionCount <= 3
  ) {
    return "moderate";
  }

  return "broad";
}

function classifyConfidence(input: {
  selectedScore: number;
  runnerUpScore: number | null;
  scoreMargin: number | null;
  evidenceBreadth:
    OracleDesktopTargetEvidenceBreadth;
}): OracleDesktopTargetConfidence {
  if (
    input.selectedScore <= 0 ||
    input.evidenceBreadth ===
      "none"
  ) {
    return "low";
  }

  /*
   * A single eligible candidate provides no comparative
   * separation evidence. It therefore cannot produce high
   * confidence.
   */
  if (
    input.runnerUpScore === null ||
    input.scoreMargin === null
  ) {
    return input.evidenceBreadth ===
      "broad"
      ? "moderate"
      : "low";
  }

  /*
   * Tied scores are resolved by stable discovery order,
   * not by stronger evidence.
   */
  if (input.scoreMargin <= 0) {
    return "low";
  }

  /*
   * Sparse evidence remains low confidence even when it
   * happens to create a large numerical margin.
   */
  if (
    input.evidenceBreadth ===
      "limited"
  ) {
    return "low";
  }

  if (
    input.evidenceBreadth ===
      "broad" &&
    input.scoreMargin >= 2
  ) {
    return "high";
  }

  if (
    (
      input.evidenceBreadth ===
        "moderate" ||
      input.evidenceBreadth ===
        "broad"
    ) &&
    input.scoreMargin >= 1
  ) {
    return "moderate";
  }

  return "low";
}

function createSelectedExplanation(input: {
  meaningfulContributions:
    readonly OracleDesktopTargetScoreContribution[];

  selectedScore: number;
  runnerUpScore: number | null;
  scoreMargin: number | null;

  evidenceBreadth:
    OracleDesktopTargetEvidenceBreadth;

  confidence:
    OracleDesktopTargetConfidence;
}): string {
  const contributionExplanation =
    createContributionExplanation(
      input.meaningfulContributions
    );

  const comparisonExplanation =
    createComparisonExplanation({
      selectedScore:
        input.selectedScore,

      runnerUpScore:
        input.runnerUpScore,

      scoreMargin:
        input.scoreMargin,
    });

  const confidenceExplanation =
    `Evidence breadth was ${input.evidenceBreadth}, resulting in ${input.confidence} confidence.`;

  return [
    contributionExplanation,
    comparisonExplanation,
    confidenceExplanation,
  ]
    .filter(
      (part) =>
        part.length > 0
    )
    .join(" ");
}

function createContributionExplanation(
  contributions:
    readonly OracleDesktopTargetScoreContribution[]
): string {
  if (
    contributions.length === 0
  ) {
    return (
      "The selected candidate had no meaningful positive scoring contributions."
    );
  }

  const explanations =
    contributions.map(
      (contribution) =>
        normaliseExplanation(
          contribution.explanation
        )
    );

  if (
    explanations.length === 1
  ) {
    return (
      `The selected candidate was supported by this scoring contribution: ${explanations[0]}.`
    );
  }

  return (
    `The selected candidate was supported by these scoring contributions: ${explanations.join("; ")}.`
  );
}

function createComparisonExplanation(input: {
  selectedScore: number;
  runnerUpScore: number | null;
  scoreMargin: number | null;
}): string {
  if (
    input.runnerUpScore === null ||
    input.scoreMargin === null
  ) {
    return (
      `It was the only eligible candidate and received a score of ${input.selectedScore}.`
    );
  }

  if (input.scoreMargin === 0) {
    return (
      `It tied with the runner-up at ${input.selectedScore} points and was selected through stable discovery order.`
    );
  }

  return (
    `It scored ${input.selectedScore}, compared with ${input.runnerUpScore} for the runner-up, producing a margin of ${input.scoreMargin}.`
  );
}

function normaliseExplanation(
  explanation: string
): string {
  const normalised =
    explanation.trim();

  if (
    normalised.endsWith(".")
  ) {
    return normalised.slice(
      0,
      -1
    );
  }

  return normalised;
}

function cloneContribution(
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