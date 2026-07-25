import "server-only";

import { createClient } from "@/lib/supabase-server";

export async function hasAuthenticatedConversationAuthority(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return !error && Boolean(data.user);
}
