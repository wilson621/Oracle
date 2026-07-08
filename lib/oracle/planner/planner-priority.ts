import type { PlannerPriority } from "./planner-types";

export function determinePlannerPriority(
  positioning: number,
  aim: number,
  movement: number,
  decisionMaking: number,
  gameSense: number
): PlannerPriority {
  const scores: { key: PlannerPriority; value: number }[] = [
    { key: "positioning", value: positioning },
    { key: "aim", value: aim },
    { key: "movement", value: movement },
    { key: "decision", value: decisionMaking },
    { key: "gamesense", value: gameSense },
  ];

  scores.sort((a, b) => a.value - b.value);

  return scores[0].key;
}