import type { OracleLifecycle } from "./lifecycle-types";

export const DEFAULT_ORACLE_LIFECYCLE: OracleLifecycle = {
  version: "1.0.0",

  steps: [
    {
      order: 1,
      stage: "initialise",
      title: "Initialise Oracle",
      description: "Prepare Oracle runtime.",
    },

    {
      order: 2,
      stage: "context",
      title: "Collect Context",
      description: "Build operator context.",
    },

    {
      order: 3,
      stage: "engine-execution",
      title: "Execute Engines",
      description: "Run registered Oracle engines.",
    },

    {
      order: 4,
      stage: "graph",
      title: "Build Intelligence Graph",
      description: "Merge engine intelligence.",
    },

    {
      order: 5,
      stage: "brain",
      title: "Oracle Brain",
      description: "Generate high-level conclusions.",
    },

    {
      order: 6,
      stage: "timeline",
      title: "Timeline",
      description: "Construct operator timeline.",
    },

    {
      order: 7,
      stage: "planner",
      title: "Planner",
      description: "Generate evidence-based priorities.",
    },

    {
      order: 8,
      stage: "operator-profile",
      title: "Operator Profile",
      description: "Update operator identity.",
    },

    {
      order: 9,
      stage: "explainability",
      title: "Explainability",
      description: "Explain Oracle conclusions.",
    },

    {
      order: 10,
      stage: "state",
      title: "State",
      description: "Build Intelligence State.",
    },

    {
      order: 11,
      stage: "mission",
      title: "Mission",
      description: "Generate mission intelligence.",
    },

    {
      order: 12,
      stage: "complete",
      title: "Complete",
      description: "Oracle cycle complete.",
    },
  ],
};