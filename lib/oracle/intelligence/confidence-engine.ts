type ConfidenceInput = {
  sessionsAnalysed: number;
  sampleSize: number;
  consistency: number;
  trendStability: number;
};

export function calculateOracleConfidence({
  sessionsAnalysed,
  sampleSize,
  consistency,
  trendStability,
}: ConfidenceInput): number {
  const sessionScore = Math.min(sessionsAnalysed * 2, 30);
  const sampleScore = Math.min(sampleSize / 20, 30);
  const consistencyScore = Math.min(consistency, 20);
  const stabilityScore = Math.min(trendStability, 20);

  return Math.round(
    sessionScore +
      sampleScore +
      consistencyScore +
      stabilityScore
  );
}