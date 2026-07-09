export function calculateOperatorProfileConfidence(sessionCount: number): number {
  if (sessionCount === 0) return 0.25;
  if (sessionCount < 3) return 0.45;
  if (sessionCount < 10) return 0.7;
  return 0.88;
}