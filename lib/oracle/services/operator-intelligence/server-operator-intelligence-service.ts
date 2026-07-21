import "server-only";

import { SupabaseOperatorIntelligenceRepository } from "../../repositories/operator-intelligence-repository";
import { SupabaseOperatorRepository } from "../../repositories/operator-repository";
import { createOperatorService } from "../operator";
import { createOperatorIntelligenceService } from "./operator-intelligence-service";
import { createClient as createAuthenticatedServerClient } from "@/lib/supabase-server";
import { getTrustedSupabaseClient } from "@/lib/supabase-trusted-server";

/**
 * Creates a request-scoped authenticated service. This composition is inactive
 * until the approved Migration 009 trust functions have been deployed.
 */
export async function createServerOperatorIntelligenceService() {
  const authenticatedClient = await createAuthenticatedServerClient();
  const operatorService = createOperatorService(
    new SupabaseOperatorRepository(authenticatedClient)
  );
  const intelligenceRepository = new SupabaseOperatorIntelligenceRepository(
    getTrustedSupabaseClient()
  );

  return createOperatorIntelligenceService(
    operatorService,
    intelligenceRepository
  );
}
