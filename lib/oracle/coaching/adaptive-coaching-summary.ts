import type { CoachingFocusArea } from "./adaptive-coaching-types";

export function buildAdaptiveCoachingSummary(
  focusAreas: CoachingFocusArea[]
): string {
  if (focusAreas.length === 0) {
    return "Oracle does not yet have sufficient intelligence to produce an adaptive coaching plan.";
  }

  return `Oracle recommends prioritising "${focusAreas[0].title}" as the highest-value training opportunity.`;
}