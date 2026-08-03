import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getServerPublicRuntimeConfiguration,
} from "@/lib/oracle/runtime/server-runtime-configuration";

export async function createClient() {
  const cookieStore = await cookies();
  const runtime = getServerPublicRuntimeConfiguration();

  return createServerClient(
    runtime.supabaseUrl,
    runtime.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
