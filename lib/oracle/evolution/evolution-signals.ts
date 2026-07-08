import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type {
  BehaviourEvolutionPattern,
  BehaviourEvolutionProfile,
} from "./evolution-types";

export function buildBehaviourEvolutionSignals(input: {
  profile: BehaviourEvolutionProfile;
}): OracleSignal[] {
  const signals: OracleSignal[] = [
    {
      id: "behaviour-evolution-profile-generated",
      category: "behaviour",
      title: "Behaviour Evolution Profile Generated",
      summary: `Oracle analysed behaviour evolution across ${input.profile.sessionCount} recent sessions.`,
      severity: input.profile.sessionCount >= 2 ? "medium" : "low",
      direction: input.profile.sessionCount >= 2 ? "positive" : "neutral",
      confidence: input.profile.confidence,
      createdAt: new Date().toISOString(),
    },
  ];

  if (input.profile.strongestImprovement) {
    signals.push(
      buildImprovementSignal(input.profile.strongestImprovement)
    );
  }

  if (input.profile.sharpestDecline) {
    signals.push(buildDeclineSignal(input.profile.sharpestDecline));
  }

  return signals;
}

function buildImprovementSignal(
  pattern: BehaviourEvolutionPattern
): OracleSignal {
  return {
    id: `behaviour-improving-${pattern.skill}`,
    category: "behaviour",
    title: "Behaviour Improving",
    summary: `${pattern.label} has improved by ${pattern.change} points across recent sessions.`,
    severity: "medium",
    direction: "positive",
    confidence: pattern.confidence,
    createdAt: new Date().toISOString(),
  };
}

function buildDeclineSignal(pattern: BehaviourEvolutionPattern): OracleSignal {
  return {
    id: `behaviour-declining-${pattern.skill}`,
    category: "behaviour",
    title: "Behaviour Declining",
    summary: `${pattern.label} has declined by ${Math.abs(
      pattern.change
    )} points across recent sessions.`,
    severity: "high",
    direction: "negative",
    confidence: pattern.confidence,
    createdAt: new Date().toISOString(),
  };
}