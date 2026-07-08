export function calculateMemoryConfidence(sessionCount: number): number {
  if (sessionCount === 0) return 0.2;
  if (sessionCount < 3) return 0.4;
  if (sessionCount < 10) return 0.65;
  return 0.85;
}