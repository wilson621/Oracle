import { createBrowserClient } from "@supabase/ssr";
import {
  getBrowserPublicRuntimeConfiguration,
} from "@/lib/oracle/runtime/browser-runtime-configuration";

export function createClient() {
  const runtime = getBrowserPublicRuntimeConfiguration();
  return createBrowserClient(
    runtime.supabaseUrl,
    runtime.supabaseAnonKey,
    {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        experimental: {
          passkey: true,
        },
      },
    }
  );
}
