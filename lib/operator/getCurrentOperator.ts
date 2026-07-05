import { supabase } from "@/lib/supabase";

export type Operator = {
  id: string;
  email: string | null;
  callsign: string | null;
  primary_game: string | null;
  combat_rating: string | null;
  created_at: string;
};

export async function getCurrentOperator(): Promise<Operator> {
  const { data: existing, error: fetchError } = await supabase
    .from("operators")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    return existing as Operator;
  }

  const { data: created, error: createError } = await supabase
    .from("operators")
    .insert({
      email: "local@oracle.dev",
      callsign: "Operator",
      primary_game: "Call of Duty",
      combat_rating: "0",
    })
    .select("*")
    .single();

  if (createError) throw createError;

  return created as Operator;
}