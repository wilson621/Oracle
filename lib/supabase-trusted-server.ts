import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getServerPublicRuntimeConfiguration,
} from "@/lib/oracle/runtime/server-runtime-configuration";

let trustedClient: SupabaseClient | null = null;

/**
 * Trusted database client for server-owned persistence boundaries only.
 *
 * The credential is read lazily, never exported, and must never be referenced
 * by a Client Component or a NEXT_PUBLIC_* environment variable.
 */
export function getTrustedSupabaseClient(): SupabaseClient {
  if (trustedClient) {
    return trustedClient;
  }

  const projectUrl = getServerPublicRuntimeConfiguration().supabaseUrl;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Trusted Supabase server configuration is unavailable."
    );
  }

  trustedClient = createClient(projectUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return trustedClient;
}
