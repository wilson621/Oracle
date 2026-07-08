export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}