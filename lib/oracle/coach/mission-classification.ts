export type MissionClassification =
  | "routine"
  | "priority"
  | "critical"
  | "high_risk"
  | "elite";

export function getMissionClassificationLabel(
  classification: MissionClassification
) {
  switch (classification) {
    case "routine":
      return "Routine";

    case "priority":
      return "Priority";

    case "critical":
      return "Critical";

    case "high_risk":
      return "High Risk";

    case "elite":
      return "Elite";
  }
}

export function getMissionClassificationColour(
  classification: MissionClassification
) {
  switch (classification) {
    case "routine":
      return "text-cyan-300";

    case "priority":
      return "text-sky-300";

    case "critical":
      return "text-amber-300";

    case "high_risk":
      return "text-orange-300";

    case "elite":
      return "text-violet-300";
  }
}

export function classifyMission(
  combatRating: number
): MissionClassification {
  if (combatRating >= 85) return "elite";
  if (combatRating >= 70) return "high_risk";
  if (combatRating >= 50) return "critical";
  if (combatRating >= 30) return "priority";
  return "routine";
}