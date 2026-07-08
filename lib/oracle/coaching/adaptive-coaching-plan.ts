import type {
  CoachingFocusArea,
  CoachingPriority,
} from "./adaptive-coaching-types";

export function buildAdaptiveCoachingPlan(
  priority: CoachingPriority
): CoachingFocusArea[] {
  switch (priority) {
    case "critical":
      return [
        {
          title: "Primary Skill Recovery",
          reason:
            "A recurring weakness has been detected across recent sessions.",
          expectedImprovement: 15,
        },
        {
          title: "Focused Review",
          reason:
            "Review the last Oracle Sessions before beginning new training.",
          expectedImprovement: 5,
        },
      ];

    case "high":
      return [
        {
          title: "Focused Skill Practice",
          reason:
            "Oracle recommends concentrating on the highest-value recurring weakness.",
          expectedImprovement: 10,
        },
      ];

    case "medium":
      return [
        {
          title: "Maintain Momentum",
          reason:
            "Continue structured practice while monitoring behavioural changes.",
          expectedImprovement: 5,
        },
      ];

    default:
      return [
        {
          title: "General Practice",
          reason:
            "Insufficient historical data exists for adaptive coaching.",
          expectedImprovement: 2,
        },
      ];
  }
}