import type { OracleContext } from "@/lib/oracle/context";
import { MEMORY_SKILLS } from "@/lib/oracle/memory";
import type {
  BehaviourEvolutionPattern,
  BehaviourEvolutionDirection,
} from "./evolution-types";

function determineDirection(change: number): BehaviourEvolutionDirection {
  if (change >= 10) return "improving";
  if (change <= -10) return "declining";
  return "stable";
}

export function detectBehaviourEvolutionPatterns(
  context: OracleContext,
  confidence: number
): BehaviourEvolutionPattern[] {
  const sessions = context.session.recentSessions;

  if (sessions.length < 2) {
    return MEMORY_SKILLS.map((skill) => ({
      skill: skill.key,
      label: skill.label,
      direction: "insufficient_data",
      firstScore: 0,
      latestScore: 0,
      change: 0,
      confidence: 0.2,
    }));
  }

  const firstSession = sessions[0];
  const latestSession = sessions[sessions.length - 1];

  return MEMORY_SKILLS.map((skill) => {
    const firstScore = firstSession[skill.sessionField] ?? 0;
    const latestScore = latestSession[skill.sessionField] ?? 0;
    const change = latestScore - firstScore;

    return {
      skill: skill.key,
      label: skill.label,
      direction: determineDirection(change),
      firstScore,
      latestScore,
      change,
      confidence,
    };
  });
}

export function findStrongestImprovement(
  patterns: BehaviourEvolutionPattern[]
): BehaviourEvolutionPattern | null {
  const improvingPatterns = patterns.filter(
    (pattern) => pattern.direction === "improving"
  );

  if (improvingPatterns.length === 0) return null;

  return [...improvingPatterns].sort((a, b) => b.change - a.change)[0];
}

export function findSharpestDecline(
  patterns: BehaviourEvolutionPattern[]
): BehaviourEvolutionPattern | null {
  const decliningPatterns = patterns.filter(
    (pattern) => pattern.direction === "declining"
  );

  if (decliningPatterns.length === 0) return null;

  return [...decliningPatterns].sort((a, b) => a.change - b.change)[0];
}