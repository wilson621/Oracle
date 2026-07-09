import type { OperatorIntentProvider } from "../intent-provider";

export const recentSessionIntentProvider: OperatorIntentProvider = {
  id: "recent-session-intent-provider",
  priority: 200,

  resolve(context) {
    if (context.session.recentSessions.length < 5) {
      return null;
    }

    const confidence = 0.68;

    return {
      intent: "progression",
      confidence,
      confidenceLabel: "medium",
      reasoning:
        "Oracle inferred progression intent from the presence of multiple recent sessions.",
      source: recentSessionIntentProvider.id,
    };
  },
};