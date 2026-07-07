import { supabase } from "@/lib/supabase";

export async function completeOperatorCommissioning(
  operatorId: string,
  callsign: string
) {
  const { data, error } = await supabase
    .rpc("generate_operator_designation");

  if (error) {
    throw error;
  }

  const designation = data as string;

  const { data: updatedOperator, error: updateError } = await supabase
    .from("operators")
    .update({
      callsign: callsign.trim(),
      designation,
    })
    .eq("id", operatorId)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  return updatedOperator;
}