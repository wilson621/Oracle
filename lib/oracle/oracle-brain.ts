import { buildOracleIntelligence } from "./intelligence/oracle-intelligence";
import type {
  OracleBrainInput,
  OracleBrainReport,
} from "./oracle-brain-types";

export function generateOracleBrainReport(
  input: OracleBrainInput
): OracleBrainReport {
  const level = input.level ?? 1;
  const xp = input.xp ?? 0;
  const totalSessions = input.totalSessions ?? 0;
  const combatRating = input.combatRating ?? 0;

  const { behaviour, trend, prediction } = buildOracleIntelligence(input);

  const confidence = calculateConfidence(
    totalSessions,
    combatRating,
    behaviour.overallBehaviourConfidence,
    trend.sampleSize,
    prediction.confidence
  );

  const summary = buildSummary({
    totalSessions,
    behaviourPlaystyle: behaviour.playstyle,
    confidence,
    trendSummary: trend.summary,
    predictionSummary: prediction.summary,
  });

  return {
    operatorId: input.operatorId,
    summary,
    confidence,
    behaviour,
    trend,
    prediction,
    signals: [
      {
        label: "Operator Level",
        value: String(level),
        confidence: 0.95,
      },
      {
        label: "XP Progression",
        value: `${xp} XP`,
        confidence: 0.9,
      },
      {
        label: "Session Data",
        value: `${totalSessions} sessions recorded`,
        confidence: totalSessions > 0 ? 0.85 : 0.4,
      },
      {
        label: "Combat Rating",
        value: combatRating > 0 ? String(combatRating) : "Unrated",
        confidence: combatRating > 0 ? 0.8 : 0.35,
      },
      {
        label: "Behaviour Profile",
        value: behaviour.playstyle,
        confidence: behaviour.overallBehaviourConfidence,
      },
      {
        label: "Consistency",
        value: `${behaviour.consistency.score}%`,
        confidence: behaviour.consistency.confidence,
      },
      {
        label: "Performance Trend",
        value: formatLabel(trend.performanceTrend),
        confidence: trend.sampleSize >= 2 ? 0.82 : 0.35,
      },
      {
        label: "Momentum",
        value: formatLabel(trend.momentum),
        confidence: trend.sampleSize >= 2 ? 0.82 : 0.35,
      },
      {
        label: "Projected Combat Rating",
        value: String(prediction.projectedCombatRating),
        confidence: prediction.confidence,
      },
      {
        label: "Plateau Risk",
        value: formatLabel(prediction.plateauRisk),
        confidence: prediction.confidence,
      },
    ],
    recommendations: buildRecommendations(
      totalSessions,
      combatRating,
      behaviour,
      trend,
      prediction
    ),
    nextFocus: buildNextFocus(totalSessions, behaviour, trend, prediction),
  };
}

function buildSummary(input: {
  totalSessions: number;
  behaviourPlaystyle: string;
  confidence: number;
  trendSummary: string;
  predictionSummary: string;
}): string {
  if (input.totalSessions === 0) {
    return "Analysis indicates insufficient session history. Oracle requires more data to generate precise coaching intelligence.";
  }

  return `Analysis indicates a ${input.behaviourPlaystyle.toLowerCase()} operator profile with ${Math.round(
    input.confidence * 100
  )}% intelligence confidence. ${input.trendSummary} ${input.predictionSummary}`;
}

function calculateConfidence(
  totalSessions: number,
  combatRating: number,
  behaviourConfidence: number,
  trendSampleSize: number,
  predictionConfidence: number
): number {
  let confidence = 0.35;

  if (totalSessions >= 1) confidence += 0.1;
  if (totalSessions >= 5) confidence += 0.1;
  if (combatRating > 0) confidence += 0.1;
  if (trendSampleSize >= 2) confidence += 0.08;
  if (trendSampleSize >= 5) confidence += 0.08;

  confidence =
    confidence * 0.4 +
    behaviourConfidence * 0.3 +
    predictionConfidence * 0.3;

  return Math.min(confidence, 0.95);
}

function buildRecommendations(
  totalSessions: number,
  combatRating: number,
  behaviour: OracleBrainReport["behaviour"],
  trend: OracleBrainReport["trend"],
  prediction: OracleBrainReport["prediction"]
) {
  if (totalSessions === 0) {
    return [
      {
        title: "Start Session Tracking",
        reason:
          "OracleBrain needs match history before it can detect behaviour patterns, performance trends and future predictions.",
        priority: "high" as const,
      },
      {
        title: "Establish Baseline Rating",
        reason:
          "A baseline allows Oracle to compare future improvement against current ability.",
        priority: "medium" as const,
      },
    ];
  }

  if (prediction.plateauRisk === "high") {
    return [
      {
        title: "Break Performance Plateau",
        reason:
          "Prediction Engine indicates a high risk of near-term plateau unless training focus changes.",
        priority: "high" as const,
      },
      {
        title: "Increase Session Variety",
        reason:
          "Varied review inputs will help Oracle detect stronger improvement patterns.",
        priority: "medium" as const,
      },
    ];
  }

  if (trend.sharpestDecline) {
    return [
      {
        title: `Reverse ${trend.sharpestDecline.skill} Decline`,
        reason:
          "Trend Engine detected this as the clearest negative movement across recent sessions.",
        priority: "high" as const,
      },
      {
        title: "Stabilise Performance Momentum",
        reason:
          "Improving short-term consistency will increase Oracle prediction quality.",
        priority: "medium" as const,
      },
    ];
  }

  const primaryWeakness = behaviour.weaknesses[0];

  if (primaryWeakness) {
    return [
      {
        title: `Stabilise ${primaryWeakness}`,
        reason:
          "Behaviour Engine detected this as the clearest current weakness in the operator profile.",
        priority: "high" as const,
      },
      {
        title: "Review Recent Performance",
        reason:
          "Repeated review cycles allow Oracle to detect strengths, weaknesses and behavioural drift.",
        priority: "medium" as const,
      },
    ];
  }

  return [
    {
      title:
        combatRating > 0 ? "Protect Strong Patterns" : "Generate Combat Rating",
      reason:
        combatRating > 0
          ? "Known performance indicators should be preserved while weaker areas are improved."
          : "A combat rating improves OracleBrain confidence and recommendation quality.",
      priority: "high" as const,
    },
    {
      title: "Increase Prediction Sample Size",
      reason:
        "More analysed sessions will improve OracleBrain confidence and future prediction quality.",
      priority: "medium" as const,
    },
  ];
}

function buildNextFocus(
  totalSessions: number,
  behaviour: OracleBrainReport["behaviour"],
  trend: OracleBrainReport["trend"],
  prediction: OracleBrainReport["prediction"]
): string {
  if (totalSessions === 0) {
    return "Complete your first analysed session.";
  }

  if (prediction.weakestFutureSkill) {
    return `Protect ${prediction.weakestFutureSkill.skill} from further decline.`;
  }

  if (trend.sharpestDecline) {
    return `Focus next session on recovering ${trend.sharpestDecline.skill}.`;
  }

  if (behaviour.weaknesses.length > 0) {
    return `Focus next session on improving ${behaviour.weaknesses[0]}.`;
  }

  if (prediction.strongestFutureSkill) {
    return `Push momentum in ${prediction.strongestFutureSkill.skill}.`;
  }

  if (trend.strongestImprovement) {
    return `Protect current momentum in ${trend.strongestImprovement.skill}.`;
  }

  if (behaviour.strengths.length > 0) {
    return `Protect your strongest pattern: ${behaviour.strengths[0]}.`;
  }

  return "Build consistency through repeated session reviews.";
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}