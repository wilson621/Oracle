export function calculateEvolutionConfidence(sessionCount: number): number {
  if (sessionCount < 2) return 0.2;
  if (sessionCount < 4) return 0.45;
  if (sessionCount < 8) return 0.65;
  return 0.85;
}