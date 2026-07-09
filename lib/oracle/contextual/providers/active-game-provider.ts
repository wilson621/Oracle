import type { OperatorIntentProvider } from "../intent-provider";

export const activeGameIntentProvider: OperatorIntentProvider = {
  id: "active-game-intent-provider",
  priority: 100,

  resolve(context) {
    if (!context.game.currentGame) {
      return null;
    }

    const confidence = 0.58;

    return {
      intent: "mission",
      confidence,
      confidenceLabel: "medium",
      reasoning: `Oracle inferred mission intent because the Operator is currently associated with ${context.game.currentGame}.`,
      source: activeGameIntentProvider.id,
    };
  },
};