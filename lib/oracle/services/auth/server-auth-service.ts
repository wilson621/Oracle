import "server-only";

import { createClient } from "@/lib/supabase-server";

export async function exchangeAuthCode(code: string) {
  const client = await createClient();
  return client.auth.exchangeCodeForSession(code);
}
