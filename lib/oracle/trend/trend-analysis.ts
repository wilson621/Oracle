import type {
  SkillTrend,
  TrendDirection,
  TrendMomentum,
  TrendProfile,
  TrendSession,
} from "./trend-types";

export function analyseTrends(sessions: TrendSession[]): TrendProfile {
  const orderedSessions = [...sessions].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const sampleSize = orderedSessions.length;

  if (sampleSize < 2) {
    return {
      sampleSize,
      performanceTrend: "unknown",
      confidenceTrend: "unknown",
      consistencyTrend: "unknown",
      momentum: "unknown",
      momentumScore: 0,
      strongestImprovement: null,
      sharpestDecline: null,
      skillTrends: [],
      summary:
        "Analysis requires at least two Oracle sessions before trend intelligence can be generated.",
    };
  }

  const firstSession = orderedSessions[0];
  const latestSession = orderedSessions[orderedSessions.length - 1];

  const skillTrends = buildSkillTrends(firstSession, latestSession);
  const strongestImprovement = getStrongestImprovement(skillTrends);
  const sharpestDecline = getSharpestDecline(skillTrends);

  const performanceChange =
    latestSession.combatRating - firstSession.combatRating;

  const confidenceChange =
    latestSession.confidence - firstSession.confidence;

  const consistencyChange =
    calculateSessionConsistency(latestSession) -
    calculateSessionConsistency(firstSession);

  const momentumScore = calculateMomentumScore({
    performanceChange,
    confidenceChange,
    consistencyChange,
    skillTrends,
  });

  const momentum = classifyMomentum(momentumScore);

  return {
    sampleSize,
    performanceTrend: classifyDirection(performanceChange),
    confidenceTrend: classifyDirection(confidenceChange),
    consistencyTrend: classifyDirection(consistencyChange),
    momentum,
    momentumScore,
    strongestImprovement,
    sharpestDecline,
    skillTrends,
    summary: buildTrendSummary({
      sampleSize,
      performanceChange,
      momentum,
      strongestImprovement,
      sharpestDecline,
    }),
  };
}

function buildSkillTrends(
  firstSession: TrendSession,
  latestSession: TrendSession
): SkillTrend[] {
  return [
    buildSkillTrend(
      "Positioning",
      firstSession.positioning,
      latestSession.positioning
    ),
    buildSkillTrend("Aim", firstSession.aim, latestSession.aim),
    buildSkillTrend(
      "Movement",
      firstSession.movement,
      latestSession.movement
    ),
    buildSkillTrend(
      "Decision Making",
      firstSession.decisionMaking,
      latestSession.decisionMaking
    ),
    buildSkillTrend(
      "Game Sense",
      firstSession.gameSense,
      latestSession.gameSense
    ),
  ];
}

function buildSkillTrend(
  skill: string,
  firstValue: number,
  latestValue: number
): SkillTrend {
  const change = latestValue - firstValue;

  return {
    skill,
    firstValue,
    latestValue,
    change,
    direction: classifyDirection(change),
  };
}

function classifyDirection(change: number): TrendDirection {
  if (change >= 5) return "improving";
  if (change <= -5) return "declining";
  return "stable";
}

function getStrongestImprovement(
  skillTrends: SkillTrend[]
): SkillTrend | null {
  const improving = skillTrends
    .filter((trend) => trend.change > 0)
    .sort((a, b) => b.change - a.change);

  return improving[0] ?? null;
}

function getSharpestDecline(
  skillTrends: SkillTrend[]
): SkillTrend | null {
  const declining = skillTrends
    .filter((trend) => trend.change < 0)
    .sort((a, b) => a.change - b.change);

  return declining[0] ?? null;
}

function calculateSessionConsistency(session: TrendSession): number {
  const values = [
    session.positioning,
    session.aim,
    session.movement,
    session.decisionMaking,
    session.gameSense,
  ];

  const max = Math.max(...values);
  const min = Math.min(...values);

  return Math.max(0, 100 - (max - min));
}

function calculateMomentumScore(input: {
  performanceChange: number;
  confidenceChange: number;
  consistencyChange: number;
  skillTrends: SkillTrend[];
}): number {
  const skillChangeAverage =
    input.skillTrends.reduce((sum, trend) => sum + trend.change, 0) /
    input.skillTrends.length;

  return Math.round(
    input.performanceChange * 0.4 +
      input.confidenceChange * 0.2 +
      input.consistencyChange * 0.2 +
      skillChangeAverage * 0.2
  );
}

function classifyMomentum(momentumScore: number): TrendMomentum {
  if (momentumScore >= 12) return "strong_positive";
  if (momentumScore >= 5) return "positive";
  if (momentumScore <= -12) return "strong_negative";
  if (momentumScore <= -5) return "negative";
  return "neutral";
}

function buildTrendSummary(input: {
  sampleSize: number;
  performanceChange: number;
  momentum: TrendMomentum;
  strongestImprovement: SkillTrend | null;
  sharpestDecline: SkillTrend | null;
}): string {
  if (input.momentum === "strong_positive") {
    return `Analysis indicates strong positive operator momentum across ${input.sampleSize} sessions.`;
  }

  if (input.momentum === "positive") {
    return `Analysis indicates positive operator momentum across ${input.sampleSize} sessions.`;
  }

  if (input.momentum === "strong_negative") {
    return `Analysis indicates significant negative performance drift across ${input.sampleSize} sessions.`;
  }

  if (input.momentum === "negative") {
    return `Analysis indicates negative operator momentum across ${input.sampleSize} sessions.`;
  }

  if (input.strongestImprovement && input.sharpestDecline) {
    return `Analysis indicates stable overall momentum, with improvement in ${input.strongestImprovement.skill} and decline in ${input.sharpestDecline.skill}.`;
  }

  if (input.strongestImprovement) {
    return `Analysis indicates stable momentum with strongest improvement in ${input.strongestImprovement.skill}.`;
  }

  if (input.sharpestDecline) {
    return `Analysis indicates stable momentum with the clearest decline in ${input.sharpestDecline.skill}.`;
  }

  if (input.performanceChange > 0) {
    return `Analysis indicates slight improvement across ${input.sampleSize} sessions.`;
  }

  if (input.performanceChange < 0) {
    return `Analysis indicates slight decline across ${input.sampleSize} sessions.`;
  }

  return `Analysis indicates stable performance across ${input.sampleSize} sessions.`;
}