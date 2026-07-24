import { OperatorCommissioningPolicyUnavailableError } from "@/lib/oracle/services/operator";

export async function completeOperatorCommissioning(
  callsign: string
) {
  void callsign;
  throw new OperatorCommissioningPolicyUnavailableError();
}
