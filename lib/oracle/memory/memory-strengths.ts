import type { OracleContext } from "@/lib/oracle/context";
import type { OracleMemoryPattern } from "./memory-types";
import { MEMORY_SKILLS } from "./memory-skills";
import { calculateAverage } from "./memory-utils";

export function detectRecurringStrengths(
  context: OracleContext
): OracleMemoryPattern[] {
  const sessions = context.session.recentSessions;

  return MEMORY_SKILLS.map((skill) => {
    const scores = sessions
      .map((session) => session[skill.sessionField] ?? 0)
      .filter((score) => score > 0);

    const strongScores = scores.filter((score) => score >= 75);

    return {
      skill: skill.key,
      label: skill.label,
      occurrences: strongScores.length,
      averageScore: calculateAverage(scores),
      confidence: scores.length >= 3 ? 0.7 : 0.4,
    };
  })
    .filter((pattern) => pattern.occurrences >= 2)
    .sort((a, b) => b.occurrences - a.occurrences);
}