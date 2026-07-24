import "server-only";

import { SupabaseOperatorRepository } from "@/lib/oracle/repositories/operator-repository";
import { createClient } from "@/lib/supabase-server";
import { getTrustedSupabaseClient } from "@/lib/supabase-trusted-server";
import { createOperatorService } from "./operator-service";

export async function createServerOperatorService() {
  const authorityClient = await createClient();
  return createOperatorService(
    new SupabaseOperatorRepository(
      getTrustedSupabaseClient(),
      authorityClient
    )
  );
}
