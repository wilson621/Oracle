import { createClient } from "@/lib/supabase-client";

// All browser persistence uses the SSR-aware client so authenticated Operator
// scope and RLS apply consistently to legacy repository adapters as they are
// migrated behind Services.
export const supabase = createClient();
