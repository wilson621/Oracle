import type { CoachingPriority } from "./adaptive-coaching-types";

export function calculateCoachingPriority(
  confidence: number
): CoachingPriority {
  if (confidence >= 0.8) return "critical";
  if (confidence >= 0.6) return "high";
  if (confidence >= 0.4) return "medium";
  return "low";
}