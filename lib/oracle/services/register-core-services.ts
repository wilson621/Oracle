import {
  OracleServiceRegistry,
} from "./service-registry";
import type { OracleService } from "./service-types";

const CORE_ORACLE_SERVICES: readonly OracleService[] = Object.freeze([
  {
    id: "conversation",
    name: "Conversation",
    description:
      "Orchestrates transient grounded explanation without owning Oracle truth.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "operator",
    name: "Operator",
    description: "Provides the current Operator identity and profile.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "sessions",
    name: "Sessions",
    description:
      "Owns the authoritative durable Oracle Session lifecycle and history.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "missions",
    name: "Missions",
    description: "Provides generated Oracle missions and readiness intelligence.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "memory",
    name: "Memory",
    description: "Provides persistent understanding of the Operator.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "operator-understanding",
    name: "Operator Understanding",
    description:
      "Builds governed purpose-scoped Understanding projections; persisted accumulation remains inactive.",
    requiredCapabilities: [],
    status: "disabled",
  },
  {
    id: "progression",
    name: "Progression",
    description: "Provides long-term Operator progression intelligence.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "planner",
    name: "Planner",
    description:
      "Owns evidence-bound development priorities and scheduling projections.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "reports",
    name: "Reports",
    description: "Provides structured Oracle intelligence reports.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "ai-coach",
    name: "AI Coach",
    description: "Provides personalised coaching through Oracle intelligence.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "oracle-brain",
    name: "Oracle Brain",
    description: "Provides assessment, reasoning and strategic intelligence.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "loadouts",
    name: "Loadouts",
    description: "Provides game-aware equipment and loadout intelligence.",
    requiredCapabilities: [],
    status: "available",
  },
  {
    id: "companion",
    name: "Companion",
    description: "Provides context-aware in-game assistance.",
    requiredCapabilities: [],
    status: "available",
  },
]);

export function registerCoreOracleServices(
  registry: OracleServiceRegistry
): void {
  for (const service of CORE_ORACLE_SERVICES) {
    if (!registry.has(service.id)) registry.register(service);
  }
}

export function createCoreOracleServiceRegistry(): OracleServiceRegistry {
  const registry = new OracleServiceRegistry();
  registerCoreOracleServices(registry);
  return registry;
}
