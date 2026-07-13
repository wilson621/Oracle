import { registerOracleApplication } from "./application-registry";

let registered = false;

export function registerCoreOracleApplications(): void {
  if (registered) {
    return;
  }

  registerOracleApplication({
    id: "ai-coach",
    name: "AI Coach",
    description:
      "Personalised missions, predictions and coaching based on how the Operator plays.",
    route: "/coach",
    requiredServices: [
      "operator",
      "sessions",
      "missions",
    ],
    status: "available",
  });

  registerOracleApplication({
    id: "oracle-brain",
    name: "Oracle Brain",
    description:
      "Strategic intelligence, assessment and explanation for the Operator.",
    route: "/oracle",
    requiredServices: [
      "operator",
      "sessions",
    ],
    status: "available",
  });

  registerOracleApplication({
    id: "loadouts",
    name: "Loadouts",
    description:
      "Game-aware loadout intelligence and equipment recommendations.",
    route: "/loadouts",
    requiredServices: ["loadouts"],
    status: "available",
  });

  registerOracleApplication({
    id: "reports",
    name: "Reports",
    description:
      "Structured intelligence reports generated from Oracle activity.",
    route: "/reports",
    requiredServices: ["reports"],
    status: "available",
  });

  registerOracleApplication({
    id: "career",
    name: "Career",
    description:
      "Long-term Operator progression and performance history.",
    route: "/career",
    requiredServices: ["progression"],
    status: "available",
  });

  registerOracleApplication({
    id: "companion",
    name: "Companion",
    description:
      "Context-aware in-game assistance through the Oracle Companion.",
    route: "/companion",
    requiredServices: ["companion"],
    status: "available",
  });

  registered = true;
}