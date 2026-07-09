import type { OperatorIntentProvider } from "../intent-provider";

export const explicitContextIntentProvider: OperatorIntentProvider = {
  id: "explicit-context-intent-provider",
  priority: 400,

  resolve(context) {
    if (context.contextual.intent === "unknown") {
      return null;
    }

    const confidence = 0.9;

    return {
      intent: context.contextual.intent,
      confidence,
      confidenceLabel: "high",
      reasoning: `Operator intent was already present in Oracle Context as "${context.contextual.intent}".`,
      source: explicitContextIntentProvider.id,
    };
  },
};