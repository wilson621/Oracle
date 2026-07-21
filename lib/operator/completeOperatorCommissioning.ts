import { getBrowserOperatorService } from "@/lib/oracle/services/operator";

export async function completeOperatorCommissioning(
  callsign: string
) {
  return getBrowserOperatorService().completeCurrentOperatorCommissioning(
    callsign
  );
}
