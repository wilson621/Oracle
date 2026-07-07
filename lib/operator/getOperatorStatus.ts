export type OperatorStatus =
  | "RECRUITING"
  | "IN TRAINING"
  | "ACTIVE"
  | "HIGH MOMENTUM";

export function getOperatorStatus(
  totalSessions: number
): OperatorStatus {
  if (totalSessions === 0) {
    return "RECRUITING";
  }

  if (totalSessions < 5) {
    return "IN TRAINING";
  }

  if (totalSessions < 15) {
    return "ACTIVE";
  }

  return "HIGH MOMENTUM";
}