import { supabase } from "@/lib/supabase";

export async function getOperatorStats() {
  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  if (!data || data.length === 0) {
    return null;
  }

  const totalSessions = data.length;

  const average = (field: string) =>
    Math.round(
      data.reduce((sum, row) => sum + (row[field] || 0), 0) /
        totalSessions
    );

  const winRate = Math.round(
    data.reduce((sum, row) => sum + row.win_chance, 0) /
      totalSessions
  );

  const combatRating = Math.round(
    (
      average("positioning") +
      average("aim") +
      average("movement") +
      average("decision_making") +
      average("game_sense")
    ) / 5
  );

  return {
    totalSessions,
    winRate,
    combatRating,

    positioning: average("positioning"),
    aim: average("aim"),
    movement: average("movement"),
    decisionMaking: average("decision_making"),
    gameSense: average("game_sense"),
  };
}