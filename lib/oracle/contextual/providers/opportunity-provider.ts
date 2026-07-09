import type { OperatorIntentProvider } from "../intent-provider";

export const opportunityIntentProvider: OperatorIntentProvider = {
  id: "opportunity-intent-provider",
  priority: 300,

  resolve(context) {
    if (context.contextual.opportunities.length === 0) {
      return null;
    }

    const confidence = 0.74;

    return {
      intent: "exploration",
      confidence,
      confidenceLabel: "medium",
      reasoning:
        "Oracle inferred exploration intent because contextual opportunities are available.",
      source: opportunityIntentProvider.id,
    };
  },
};