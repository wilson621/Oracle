import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateMatchCoachingReport } from "@/lib/oracle/match-coaching/oracle-match-coaching-service";
import type { SelectableFrame } from "@/lib/oracle/match-coaching/select-report-frames";

export const maxDuration = 300;

type RequestFrame = {
  capturedAt: string;
  jpegBase64: string;
  diffScore: number;
};

type RequestBody = {
  clientSessionId: string;
  game?: string;
  startedAt: string;
  endedAt: string;
  frames: RequestFrame[];
};

const MAX_ACCEPTED_FRAMES = 400;

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: "Coaching report request must be valid JSON." },
      { status: 400 }
    );
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      {
        error:
          "Coaching report request requires clientSessionId, startedAt, endedAt and a non-empty frames array.",
      },
      { status: 400 }
    );
  }

  if (body.frames.length > MAX_ACCEPTED_FRAMES) {
    return NextResponse.json(
      { error: `A single watch session cannot submit more than ${MAX_ACCEPTED_FRAMES} frames.` },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "You need to be signed in to generate a coaching report." },
      { status: 401 }
    );
  }

  const { data: binding, error: bindingError } = await supabase
    .from("operator_account_bindings")
    .select("operator_id")
    .eq("account_id", user.id)
    .single();
  if (bindingError || !binding) {
    return NextResponse.json(
      { error: "No Operator profile is bound to this account yet." },
      { status: 409 }
    );
  }

  const frames: SelectableFrame[] = body.frames.map((frame) => ({
    capturedAt: frame.capturedAt,
    jpegBase64: frame.jpegBase64,
    diffScore: frame.diffScore,
  }));

  try {
    const report = await generateMatchCoachingReport({
      supabase,
      operatorId: binding.operator_id as string,
      clientSessionId: body.clientSessionId,
      game: body.game ?? "Call of Duty",
      startedAt: body.startedAt,
      endedAt: body.endedAt,
      frames,
    });
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Coaching report generation failed.",
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

function isValidBody(value: unknown): value is RequestBody {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.clientSessionId === "string" &&
    !!record.clientSessionId &&
    typeof record.startedAt === "string" &&
    typeof record.endedAt === "string" &&
    Array.isArray(record.frames) &&
    record.frames.length > 0 &&
    record.frames.every(
      (frame) =>
        typeof frame === "object" &&
        frame !== null &&
        typeof (frame as RequestFrame).capturedAt === "string" &&
        typeof (frame as RequestFrame).jpegBase64 === "string" &&
        typeof (frame as RequestFrame).diffScore === "number"
    )
  );
}
