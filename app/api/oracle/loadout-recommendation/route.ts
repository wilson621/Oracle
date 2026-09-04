import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateLoadoutRecommendation } from "@/lib/oracle/loadout/oracle-loadout-recommendation-service";
import { ensureOperatorBinding } from "@/lib/oracle/operator/ensure-operator-binding";

// Loadout generation is a single (retried) Gemini call with Google Search
// grounding, not a video upload/processing pipeline -- much faster than
// Full Match Analysis, but grounding tool calls can still take a while
// longer than a plain text generation, so this stays generous rather than
// risking a premature timeout on a slow search.
export const maxDuration = 120;

const MAX_GOAL_LENGTH = 300;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "You need to be signed in to generate a loadout recommendation." },
      { status: 401 }
    );
  }

  let operatorId: string;
  try {
    operatorId = await ensureOperatorBinding(supabase, user);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not set up an Operator profile for this account.",
      },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Expected a JSON body with a requestedGoal field." },
      { status: 400 }
    );
  }

  const requestedGoal =
    body && typeof body === "object" && "requestedGoal" in body
      ? (body as { requestedGoal: unknown }).requestedGoal
      : undefined;
  if (typeof requestedGoal !== "string" || requestedGoal.trim().length === 0) {
    return NextResponse.json(
      { error: "Tell Oracle what kind of build you want, e.g. \"no recoil build\"." },
      { status: 400 }
    );
  }
  if (requestedGoal.length > MAX_GOAL_LENGTH) {
    return NextResponse.json(
      { error: `Keep the request under ${MAX_GOAL_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const game =
    body && typeof body === "object" && "game" in body
      ? (body as { game: unknown }).game
      : undefined;

  try {
    const recommendation = await generateLoadoutRecommendation({
      supabase,
      operatorId,
      game: typeof game === "string" && game ? game : "Call of Duty: Warzone",
      requestedGoal: requestedGoal.trim(),
    });
    return NextResponse.json({ recommendation });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Loadout recommendation generation failed.",
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "You need to be signed in to view loadout recommendations." },
      { status: 401 }
    );
  }

  const { data: binding, error: bindingError } = await supabase
    .from("operator_account_bindings")
    .select("operator_id")
    .eq("account_id", user.id)
    .single();
  if (bindingError || !binding) {
    return NextResponse.json({ recommendations: [] });
  }

  const { data, error } = await supabase
    .from("oracle_loadout_recommendations")
    .select("*")
    .eq("operator_id", binding.operator_id as string)
    .order("generated_at", { ascending: false })
    .limit(20);
  if (error) {
    return NextResponse.json(
      { error: "Could not load loadout recommendations." },
      { status: 500 }
    );
  }

  return NextResponse.json({ recommendations: data ?? [] });
}
