import { getBrowserOperatorService } from "@/lib/oracle/services/operator";

export async function getOperatorProfile() {
  return getBrowserOperatorService().getCurrentOperator();
}
