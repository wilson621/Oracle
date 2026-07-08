import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { AdaptiveCoachingProfile } from "./adaptive-coaching-types";

export function buildAdaptiveCoachingSignals(
  profile: AdaptiveCoachingProfile
): OracleSignal[] {
  return [
    {
      id: "adaptive-coaching-generated",
      category: "coach",
      title: "Adaptive Coaching Plan Generated",
      summary: profile.summary,
      severity: "medium",
      direction: "positive",
      confidence: profile.confidence,
      createdAt: new Date().toISOString(),
    },
  ];
}