import { supabase } from "@/lib/supabase";

export async function getOperatorProfile() {
  const { data, error } = await supabase
    .from("operators")
    .select("*")
    .limit(1)
    .single();

  if (error) throw error;

  return data;
}