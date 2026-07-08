import type { OracleMemoryProfile } from "./memory-types";

export function calculateMemoryStatus(
  sessionCount: number
): OracleMemoryProfile["status"] {
  if (sessionCount === 0) return "empty";
  if (sessionCount < 3) return "forming";
  if (sessionCount < 10) return "active";
  return "strong";
}