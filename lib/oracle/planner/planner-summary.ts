import type { PlannerPriority } from "./planner-types";

export function plannerSummary(priority: PlannerPriority): string {
  switch (priority) {
    case "positioning":
      return "Positioning currently offers the greatest opportunity for combat improvement.";

    case "aim":
      return "Aim consistency is the highest priority for training.";

    case "movement":
      return "Movement efficiency should be prioritised before mechanical training.";

    case "decision":
      return "Decision making is limiting combat performance.";

    case "gamesense":
      return "Game sense provides the highest projected improvement.";

    default:
      return "Continue balanced operator development.";
  }
}