import type {
  OracleIntelligenceGraph,
  OracleIntelligenceGraphEntry,
  OracleIntelligenceGraphKey,
} from "@/lib/oracle/graph";

import type { OracleBrainGraphFinding } from "./brain-graph-types";

type ProfileWithConfidence = {
  confidence?: number;
};

type MemoryLikeProfile = ProfileWithConfidence & {
  status?: string;
  sessionCount?: number;
  behaviouralPatterns?: string[];
};

type EvolutionLikeProfile = ProfileWithConfidence & {
  sessionCount?: number;
  strongestImprovement?: {
    label?: string;
    change?: number;
  } | null;
  sharpestDecline?: {
    label?: string;
    change?: number;
  } | null;
};

type CoachingLikeProfile = ProfileWithConfidence & {
  priority?: string;
  summary?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getProfileConfidence(profile: unknown): number {
  if (!isObject(profile)) return 0.35;

  const maybeProfile = profile as ProfileWithConfidence;

  return typeof maybeProfile.confidence === "number"
    ? maybeProfile.confidence
    : 0.35;
}

function findEntry(
  graph: OracleIntelligenceGraph,
  key: OracleIntelligenceGraphKey
): OracleIntelligenceGraphEntry | null {
  return graph.entries.find((entry) => entry.key === key) ?? null;
}

function buildMemoryFinding(
  entry: OracleIntelligenceGraphEntry
): OracleBrainGraphFinding | null {
  const profile = entry.profile as MemoryLikeProfile;

  const patterns = Array.isArray(profile.behaviouralPatterns)
    ? profile.behaviouralPatterns
    : [];

  return {
    source: "memory",
    title: "Memory Intelligence Available",
    summary:
      patterns[0] ??
      `Oracle Memory is ${profile.status ?? "forming"} with ${
        profile.sessionCount ?? 0
      } sessions available.`,
    confidence: getProfileConfidence(profile),
  };
}

function buildEvolutionFinding(
  entry: OracleIntelligenceGraphEntry
): OracleBrainGraphFinding | null {
  const profile = entry.profile as EvolutionLikeProfile;

  if (profile.sharpestDecline) {
    return {
      source: "evolution",
      title: "Behaviour Decline Detected",
      summary: `${profile.sharpestDecline.label ?? "A skill"} has declined by ${Math.abs(
        profile.sharpestDecline.change ?? 0
      )} points across recent sessions.`,
      confidence: getProfileConfidence(profile),
    };
  }

  if (profile.strongestImprovement) {
    return {
      source: "evolution",
      title: "Behaviour Improvement Detected",
      summary: `${
        profile.strongestImprovement.label ?? "A skill"
      } has improved by ${profile.strongestImprovement.change ?? 0} points across recent sessions.`,
      confidence: getProfileConfidence(profile),
    };
  }

  return {
    source: "evolution",
    title: "Behaviour Evolution Stable",
    summary: `Oracle analysed behaviour evolution across ${
      profile.sessionCount ?? 0
    } recent sessions.`,
    confidence: getProfileConfidence(profile),
  };
}

function buildCoachingFinding(
  entry: OracleIntelligenceGraphEntry
): OracleBrainGraphFinding | null {
  const profile = entry.profile as CoachingLikeProfile;

  return {
    source: "coaching",
    title: "Adaptive Coaching Plan Available",
    summary:
      profile.summary ??
      `Adaptive Coaching priority is currently ${profile.priority ?? "forming"}.`,
    confidence: getProfileConfidence(profile),
  };
}

export function buildOracleBrainGraphFindings(
  graph: OracleIntelligenceGraph
): OracleBrainGraphFinding[] {
  const findings: OracleBrainGraphFinding[] = [];

  const memoryEntry = findEntry(graph, "memory");
  const evolutionEntry = findEntry(graph, "evolution");
  const coachingEntry = findEntry(graph, "coaching");

  if (memoryEntry) {
    const finding = buildMemoryFinding(memoryEntry);
    if (finding) findings.push(finding);
  }

  if (evolutionEntry) {
    const finding = buildEvolutionFinding(evolutionEntry);
    if (finding) findings.push(finding);
  }

  if (coachingEntry) {
    const finding = buildCoachingFinding(coachingEntry);
    if (finding) findings.push(finding);
  }

  return findings;
}