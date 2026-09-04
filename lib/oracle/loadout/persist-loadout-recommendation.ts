import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  OracleLoadoutRecommendation,
  OracleLoadoutRecommendationRow,
} from "./oracle-loadout-recommendation-report";

/**
 * Maps an OracleLoadoutRecommendation onto the
 * oracle_loadout_recommendations table's columns and returns the row as
 * Postgres actually stored it (via .select().single()) -- same pattern and
 * same reasoning as persist-match-coaching-report.ts: the UI reads real
 * database rows, not an echo of the camelCase input.
 */
export async function persistLoadoutRecommendation(
  supabase: SupabaseClient,
  recommendation: Omit<OracleLoadoutRecommendation, "status" | "rawError"> & {
    status: OracleLoadoutRecommendation["status"];
    rawError: string | null;
  }
): Promise<OracleLoadoutRecommendationRow> {
  const { data, error } = await supabase
    .from("oracle_loadout_recommendations")
    .insert({
      id: recommendation.id,
      operator_id: recommendation.operatorId,
      game: recommendation.game,
      requested_goal: recommendation.requestedGoal,
      generated_at: recommendation.generatedAt,
      status: recommendation.status,
      model: recommendation.model,
      personalization_level: recommendation.personalizationLevel,
      matches_considered: recommendation.matchesConsidered,
      loadout: recommendation.loadout ?? {},
      summary: recommendation.summary,
      sources: recommendation.sources,
      raw_error: recommendation.rawError,
    })
    .select()
    .single();
  if (error || !data) {
    throw new Error(
      `Failed to save the loadout recommendation: ${error?.message ?? "no row returned"}`
    );
  }
  return data as OracleLoadoutRecommendationRow;
}
