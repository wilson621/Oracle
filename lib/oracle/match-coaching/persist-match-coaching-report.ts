import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  OracleMatchCoachingReport,
  OracleMatchCoachingReportRow,
} from "./oracle-match-coaching-report";

/**
 * Maps an OracleMatchCoachingReport onto the oracle_match_coaching_reports
 * table's columns -- the one place that persists a Full Match Analysis
 * report (see oracle-match-video-coaching-service.ts), so the mapping
 * can't silently drift between call sites.
 *
 * Returns the row as Postgres actually stored it (via .select().single()),
 * not just an echo of the camelCase input -- the desktop UI is written
 * against that snake_case row shape (see OracleMatchCoachingReportRow), the
 * same shape coach-report's GET history endpoint returns. Returning the
 * input object here previously meant the POST response for a freshly
 * generated report silently didn't match what the UI expected (e.g.
 * report.raw_error read undefined off a rawError field), so a real Gemini
 * failure surfaced only as the generic "could not be generated" fallback.
 */
export async function persistMatchCoachingReport(
  supabase: SupabaseClient,
  report: Omit<OracleMatchCoachingReport, "status" | "rawError"> & {
    status: OracleMatchCoachingReport["status"];
    rawError: string | null;
  }
): Promise<OracleMatchCoachingReportRow> {
  const { data, error } = await supabase
    .from("oracle_match_coaching_reports")
    .insert({
      id: report.id,
      operator_id: report.operatorId,
      game: report.game,
      client_session_id: report.clientSessionId,
      started_at: report.startedAt,
      ended_at: report.endedAt,
      generated_at: report.generatedAt,
      status: report.status,
      model: report.model,
      frame_count: report.frameCount,
      summary: report.summary,
      verdict: report.verdict,
      positioning: report.scores?.positioning ?? null,
      aim: report.scores?.aim ?? null,
      movement: report.scores?.movement ?? null,
      decision_making: report.scores?.decisionMaking ?? null,
      game_sense: report.scores?.gameSense ?? null,
      deaths: report.deaths,
      raw_error: report.rawError,
    })
    .select()
    .single();
  if (error || !data) {
    throw new Error(
      `Failed to save the coaching report: ${error?.message ?? "no row returned"}`
    );
  }
  return data as OracleMatchCoachingReportRow;
}
