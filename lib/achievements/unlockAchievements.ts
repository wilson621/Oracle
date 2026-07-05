import { supabase } from "@/lib/supabase";
import { getCurrentOperator } from "@/lib/operator/getCurrentOperator";

export type UnlockedAchievement = {
  id: string;
  title: string;
  xp: number;
};

const achievementMeta: Record<string, UnlockedAchievement> = {
  "first-analysis": {
    id: "first-analysis",
    title: "First Analysis",
    xp: 250,
  },
  grinder: {
    id: "grinder",
    title: "Grinder",
    xp: 500,
  },
  veteran: {
    id: "veteran",
    title: "Veteran",
    xp: 1500,
  },
};

export async function unlockAchievements(): Promise<UnlockedAchievement[]> {
  const operator = await getCurrentOperator();

  const { data: sessions, error: sessionError } = await supabase
    .from("oracle_sessions")
    .select("*")
    .eq("operator_id", operator.id);

  if (sessionError) throw sessionError;

  const { data: existingUnlocks, error: unlockError } = await supabase
    .from("operator_achievements")
    .select("achievement_id")
    .eq("operator_id", operator.id);

  if (unlockError) throw unlockError;

  const alreadyUnlocked = new Set(
    (existingUnlocks ?? []).map((item) => item.achievement_id)
  );

  const totalSessions = sessions?.length ?? 0;

  const candidates: string[] = [];

  if (totalSessions >= 1) candidates.push("first-analysis");
  if (totalSessions >= 25) candidates.push("grinder");
  if (totalSessions >= 100) candidates.push("veteran");

  const newlyUnlocked = candidates.filter((id) => !alreadyUnlocked.has(id));

  for (const achievementId of newlyUnlocked) {
    await supabase.from("operator_achievements").insert({
      operator_id: operator.id,
      achievement_id: achievementId,
    });
  }

  return newlyUnlocked.map((id) => achievementMeta[id]);
}