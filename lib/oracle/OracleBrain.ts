export const OracleBrain = {
  greeting(operator = "Operator") {
    const hour = new Date().getHours();

    let timeGreeting = "Good evening";

    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 18) timeGreeting = "Good afternoon";

    return `${timeGreeting}, ${operator}.`;
  },

  analysisStarted() {
    return "Oracle link established.";
  },

  loadingSteps() {
    return [
      "Reviewing combat description...",
      "Analysing positioning...",
      "Analysing movement...",
      "Assessing decision making...",
      "Cross-referencing Oracle Memory...",
      "Updating behavioural profile...",
      "Generating tactical recommendations...",
      "Preparing coaching report...",
    ];
  },

  confidence(confidence: number) {
    if (confidence >= 90)
      return "Extremely high confidence.";

    if (confidence >= 75)
      return "High confidence.";

    if (confidence >= 60)
      return "Moderate confidence.";

    return "Confidence is still developing. More sessions will improve prediction accuracy.";
  },

  rankPromotion(rank: string) {
    return `Combat rating increased. New combat rank: ${rank}.`;
  },

  achievement(title: string) {
    return `Achievement unlocked: ${title}.`;
  },
};