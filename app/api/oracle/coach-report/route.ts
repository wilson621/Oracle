import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// This endpoint used to also accept POST (submitting still-frame batches
// for the old Watch & Coach pipeline). That pipeline has been removed --
// Full Match Analysis (see coach-report-video/route.ts) is the only way to
// generate a report now. GET stays here as the shared report-history
// endpoint: it's pipeline-agnostic (oracle_match_coaching_reports holds
// rows from either pipeline), so both MatchVideoRecordingControl and any
// future Reports UI can keep reading from it.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "You need to be signed in to view coaching reports." },
      { status: 401 }
    );
  }

  const { data: binding, error: bindingError } = await supabase
    .from("operator_account_bindings")
    .select("operator_id")
    .eq("account_id", user.id)
    .single();
  if (bindingError || !binding) {
    return NextResponse.json({ reports: [] });
  }

  const { data, error } = await supabase
    .from("oracle_match_coaching_reports")
    .select("*")
    .eq("operator_id", binding.operator_id as string)
    .order("generated_at", { ascending: false })
    .limit(20);
  if (error) {
    return NextResponse.json(
      { error: "Could not load coaching reports." },
      { status: 500 }
    );
  }

  return NextResponse.json({ reports: data ?? [] });
}
