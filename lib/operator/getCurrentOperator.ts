import { getBrowserOperatorService } from "@/lib/oracle/services/operator";

export type { Operator } from "@/lib/oracle/services/operator";

export async function getCurrentOperator() {
  return getBrowserOperatorService().getCurrentOperator();
}
