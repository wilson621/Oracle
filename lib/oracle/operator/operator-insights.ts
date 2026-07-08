import type { OperatorProfile } from "./operator-profile-types";

export function generateOperatorInsight(profile: OperatorProfile): string {
  const primaryWeakness = profile.weaknesses[0] ?? "overall consistency";
  const primaryStrength = profile.strengths[0] ?? "adaptive performance";

  return `Oracle identifies ${primaryStrength} as the Operator's strongest current discipline. ${primaryWeakness} remains the highest-impact improvement area.`;
}

export function generateOperatorRecommendation(
  profile: OperatorProfile
): string {
  const primaryWeakness = profile.weaknesses[0] ?? "overall consistency";

  return `Prioritise ${primaryWeakness} during the next operational cycle. Oracle will reassess behavioural movement after additional Oracle Sessions.`;
}