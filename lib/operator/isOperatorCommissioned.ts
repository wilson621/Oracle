import type { Operator } from "./getCurrentOperator";

export function isOperatorCommissioned(operator: Operator | null): boolean {
  if (!operator) {
    return false;
  }

  const callsign = operator.callsign?.trim();

  return !!callsign && callsign !== "Operator";
}