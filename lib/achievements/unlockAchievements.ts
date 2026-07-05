import { supabase } from "@/lib/supabase";

export async function unlockAchievements() {
  const { data: sessions } = await supabase
    .from("oracle_sessions")
    .select("*");

  const totalSessions = sessions?.length ?? 0;

  const achievements: string[] = [];

  if (totalSessions >= 1) achievements.push("first-analysis");
  if (totalSessions >= 25) achievements.push("grinder");
  if (totalSessions >= 100) achievements.push("veteran");

  for (const achievement of achievements) {
    await supabase
      .from("operator_achievements")
      .upsert(
        {
          operator_id: "00000000-0000-0000-0000-000000000001",
          achievement_id: achievement,
        },
        {
          onConflict: "operator_id,achievement_id",
        }
      );
  }
}