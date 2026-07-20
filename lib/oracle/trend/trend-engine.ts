import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine } from "@/lib/oracle/engines";
import { buildEngineResult } from "@/lib/oracle/engines/build-engine-result";
import { mapSessionRowsToTrendSessions } from "@/lib/oracle/repositories/session-repository";
import { analyseTrends } from "./trend-analysis";
import type { TrendProfile, TrendSession } from "./trend-types";

export { analyseTrends } from "./trend-analysis";

function buildTrendInput(context: OracleContext): TrendSession[] {
  return mapSessionRowsToTrendSessions(context.session.recentSessions);
}

function calculateTrendConfidence(profile: TrendProfile): number {
  if (profile.sampleSize >= 8) {
    return 0.9;
  }

  if (profile.sampleSize >= 5) {
    return 0.8;
  }

  if (profile.sampleSize >= 2) {
    return 0.65;
  }

  return 0.35;
}

function getSignalDirection(
  profile: TrendProfile
): "positive" | "negative" | "neutral" {
  switch (profile.momentum) {
    case "strong_positive":
    case "positive":
      return "positive";

    case "strong_negative":
    case "negative":
      return "negative";

    case "neutral":
    case "unknown":
      return "neutral";
  }
}

function getSignalSeverity(
  profile: TrendProfile
): "low" | "medium" | "high" {
  switch (profile.momentum) {
    case "strong_positive":
    case "strong_negative":
      return "high";

    case "positive":
    case "negative":
      return "medium";

    case "neutral":
    case "unknown":
      return "low";
  }
}

export const trendEngine: OracleEngine<TrendProfile> = {
  metadata: {
    id: "trend-engine",
    name: "Trend Engine",
    version: "1.0.0",
    description:
      "Analyses recent Oracle Sessions to identify Operator performance trends and momentum.",
    priority: 26,
    capabilities: ["trend", "behaviour", "signal"],
    supportedGames: ["*"],
    dependencies: ["behaviour-engine"],
    producesSignals: true,
    producesDecisions: false,
  },

  async execute(context: OracleContext) {
    const input = buildTrendInput(context);
    const profile = analyseTrends(input);
    const confidence = calculateTrendConfidence(profile);

    const signals = [
      {
        id: "trend-profile-generated",
        category: "behaviour" as const,
        title: "Performance Trend Analysed",
        summary: profile.summary,
        severity: getSignalSeverity(profile),
        direction: getSignalDirection(profile),
        confidence,
        createdAt: new Date().toISOString(),
      },
    ];

    return buildEngineResult(trendEngine, {
      profile,
      graph: [
        {
          key: "trend",
          engineId: trendEngine.metadata.id,
          profile,
          generatedAt: new Date().toISOString(),
        },
      ],
      signals,
      diagnostics: {
        sampleSize: profile.sampleSize,
        performanceTrend: profile.performanceTrend,
        confidenceTrend: profile.confidenceTrend,
        consistencyTrend: profile.consistencyTrend,
        momentum: profile.momentum,
        momentumScore: profile.momentumScore,
        strongestImprovement: profile.strongestImprovement,
        sharpestDecline: profile.sharpestDecline,
        confidence,
      },
    });
  },
};
