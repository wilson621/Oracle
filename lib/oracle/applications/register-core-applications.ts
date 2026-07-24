import {
  OracleApplicationRegistry,
} from "./application-registry";
import type { OracleApplication } from "./application-types";

const CORE_ORACLE_APPLICATIONS: readonly OracleApplication[] = Object.freeze([
  {
    id: "ai-coach",
    name: "AI Coach",
    description:
      "Personalised missions, predictions and coaching based on how the Operator plays.",
    route: "/coach",
    requiredServices: ["operator", "sessions", "missions"],
    status: "available",
  },
  {
    id: "oracle-brain",
    name: "Oracle Brain",
    description:
      "Strategic intelligence, assessment and explanation for the Operator.",
    route: "/oracle",
    requiredServices: ["operator", "sessions"],
    status: "available",
  },
  {
    id: "loadouts",
    name: "Loadouts",
    description:
      "Game-aware loadout intelligence and equipment recommendations.",
    route: "/loadouts",
    requiredServices: ["loadouts"],
    status: "available",
  },
  {
    id: "reports",
    name: "Reports",
    description:
      "Structured intelligence reports generated from Oracle activity.",
    route: "/reports",
    requiredServices: ["reports"],
    status: "available",
  },
  {
    id: "sessions",
    name: "Session History",
    description:
      "Authoritative Session history, detail, export and lifecycle controls.",
    route: "/sessions",
    requiredServices: ["operator", "sessions"],
    status: "available",
  },
  {
    id: "career",
    name: "Career",
    description:
      "Long-term Operator progression and performance history.",
    route: "/career",
    requiredServices: ["progression"],
    status: "available",
  },
  {
    id: "companion",
    name: "Companion",
    description:
      "Context-aware in-game assistance through the Oracle Companion.",
    route: "/companion",
    requiredServices: ["companion"],
    status: "available",
  },
]);

export function registerCoreOracleApplications(
  registry: OracleApplicationRegistry
): void {
  for (const application of CORE_ORACLE_APPLICATIONS) {
    if (!registry.has(application.id)) registry.register(application);
  }
}

export function createCoreOracleApplicationRegistry():
  OracleApplicationRegistry {
  const registry = new OracleApplicationRegistry();
  registerCoreOracleApplications(registry);
  return registry;
}
