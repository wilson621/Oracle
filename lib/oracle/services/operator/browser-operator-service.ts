import { createClient } from "@/lib/supabase-client";
import { SupabaseOperatorRepository } from "@/lib/oracle/repositories/operator-repository";
import { createOperatorService } from "./operator-service";

let browserOperatorService: ReturnType<typeof createOperatorService> | null =
  null;

export function getBrowserOperatorService() {
  if (!browserOperatorService) {
    browserOperatorService = createOperatorService(
      new SupabaseOperatorRepository(createClient())
    );
  }

  return browserOperatorService;
}
