import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ensureOperatorBinding } from "@/lib/oracle/operator/ensure-operator-binding";
import { askOracleAboutReport } from "@/lib/oracle/report-chat/oracle-report-chat-service";
import {
  MAX_QUESTION_LENGTH,
  type OracleReportChatMessageRow,
} from "@/lib/oracle/report-chat/oracle-report-chat-types";
import type { OracleMatchCoachingReportRow } from "@/lib/oracle/match-coaching/oracle-match-coaching-report";

// Text-only Gemini calls with a small prompt -- nowhere near the video
// routes' need for an extended duration.
export const maxDuration = 60;

// How many prior messages to hand back to the UI when a report's chat
// thread is reopened. Generous relative to
// MAX_HISTORY_MESSAGES_FOR_PROMPT (which bounds what's actually sent to
// Gemini) since this is just display, not prompt cost.
const MAX_HISTORY_MESSAGES_RETURNED = 100;

async function authorizeReportAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  reportId: string
): Promise<
  | Readonly<{ ok: true; operatorId: string; report: OracleMatchCoachingReportRow }>
  | Readonly<{ ok: false; status: number; error: string }>
> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      ok: false,
      status: 401,
      error: "You need to be signed in to use Oracle chat.",
    };
  }

  let operatorId: string;
  try {
    operatorId = await ensureOperatorBinding(supabase, user);
  } catch (error) {
    return {
      ok: false,
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Could not set up an Operator profile for this account.",
    };
  }

  const { data: report, error: reportError } = await supabase
    .from("oracle_match_coaching_reports")
    .select("*")
    .eq("id", reportId)
    .eq("operator_id", operatorId)
    .maybeSingle();
  if (reportError || !report) {
    return { ok: false, status: 404, error: "That report could not be found." };
  }

  return {
    ok: true,
    operatorId,
    report: report as OracleMatchCoachingReportRow,
  };
}

export async function GET(request: Request) {
  const reportId = new URL(request.url).searchParams.get("reportId");
  if (!reportId) {
    return NextResponse.json(
      { error: "A reportId query parameter is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const authorized = await authorizeReportAccess(supabase, reportId);
  if (!authorized.ok) {
    return NextResponse.json(
      { error: authorized.error },
      { status: authorized.status }
    );
  }

  const { data, error } = await supabase
    .from("oracle_report_chat_messages")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true })
    .limit(MAX_HISTORY_MESSAGES_RETURNED);
  if (error) {
    return NextResponse.json(
      { error: "Could not load this report's chat history." },
      { status: 500 }
    );
  }

  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Oracle chat request must be valid JSON." },
      { status: 400 }
    );
  }

  if (
    typeof input !== "object" ||
    input === null ||
    !("reportId" in input) ||
    typeof input.reportId !== "string" ||
    !input.reportId.trim() ||
    !("question" in input) ||
    typeof input.question !== "string" ||
    !input.question.trim() ||
    input.question.length > MAX_QUESTION_LENGTH
  ) {
    return NextResponse.json(
      { error: "Oracle chat request requires a reportId and a question." },
      { status: 400 }
    );
  }
  const { reportId, question } = input as {
    reportId: string;
    question: string;
  };

  const supabase = await createClient();
  const authorized = await authorizeReportAccess(supabase, reportId);
  if (!authorized.ok) {
    return NextResponse.json(
      { error: authorized.error },
      { status: authorized.status }
    );
  }
  const { operatorId, report } = authorized;

  const { data: priorMessages, error: historyError } = await supabase
    .from("oracle_report_chat_messages")
    .select("role,content")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true })
    .limit(MAX_HISTORY_MESSAGES_RETURNED);
  if (historyError) {
    return NextResponse.json(
      { error: "Could not load this report's chat history." },
      { status: 500 }
    );
  }

  // Saved before calling Gemini -- the Operator's own question is never
  // lost even if the call below fails.
  const { data: questionRow, error: questionInsertError } = await supabase
    .from("oracle_report_chat_messages")
    .insert({
      report_id: reportId,
      operator_id: operatorId,
      role: "operator",
      content: question,
    })
    .select()
    .single();
  if (questionInsertError || !questionRow) {
    return NextResponse.json(
      { error: "Could not save your question." },
      { status: 500 }
    );
  }

  const result = await askOracleAboutReport(supabase, {
    operatorId,
    report,
    history: (priorMessages ?? []) as Pick<
      OracleReportChatMessageRow,
      "role" | "content"
    >[],
    question,
  });

  const { data: answerRow, error: answerInsertError } = await supabase
    .from("oracle_report_chat_messages")
    .insert({
      report_id: reportId,
      operator_id: operatorId,
      role: "oracle",
      content: result.answer,
    })
    .select()
    .single();
  if (answerInsertError || !answerRow) {
    return NextResponse.json(
      { error: "Oracle answered, but the reply could not be saved." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    question: questionRow as OracleReportChatMessageRow,
    answer: answerRow as OracleReportChatMessageRow,
    failed: result.status === "failed",
  });
}
