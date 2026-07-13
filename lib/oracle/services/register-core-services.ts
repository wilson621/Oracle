import { registerOracleService } from "./service-registry";

let registered = false;

export function registerCoreOracleServices(): void {
  if (registered) {
    return;
  }

  registerOracleService({
    id: "operator",
    name: "Operator",
    description:
      "Provides the current Operator identity and profile.",
    requiredCapabilities: [],
    status: "available",
  });

  registerOracleService({
    id: "sessions",
    name: "Sessions",
    description:
      "Provides analysed Oracle Session history.",
    requiredCapabilities: [],
    status: "available",
  });

  registerOracleService({
    id: "missions",
    name: "Missions",
    description:
      "Provides generated Oracle missions and readiness intelligence.",
    requiredCapabilities: [],
    status: "available",
  });

  registerOracleService({
    id: "memory",
    name: "Memory",
    description:
      "Provides persistent understanding of the Operator.",
    requiredCapabilities: [],
    status: "available",
  });

  registerOracleService({
    id: "progression",
    name: "Progression",
    description:
      "Provides long-term Operator progression intelligence.",
    requiredCapabilities: [],
    status: "available",
  });

  registerOracleService({
    id: "reports",
    name: "Reports",
    description:
      "Provides structured Oracle intelligence reports.",
    requiredCapabilities: [],
    status: "available",
  });

  registerOracleService({
    id: "ai-coach",
    name: "AI Coach",
    description:
      "Provides personalised coaching through Oracle intelligence.",
    requiredCapabilities: [],
    status: "available",
  });

  registerOracleService({
    id: "oracle-brain",
    name: "Oracle Brain",
    description:
      "Provides assessment, reasoning and strategic intelligence.",
    requiredCapabilities: [],
    status: "available",
  });

  registerOracleService({
    id: "loadouts",
    name: "Loadouts",
    description:
      "Provides game-aware equipment and loadout intelligence.",
    requiredCapabilities: [],
    status: "available",
  });

  registerOracleService({
    id: "companion",
    name: "Companion",
    description:
      "Provides context-aware in-game assistance.",
    requiredCapabilities: [],
    status: "available",
  });

  registered = true;
}