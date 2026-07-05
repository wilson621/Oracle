import { supabase } from "@/lib/supabase";
import { getCurrentOperator } from "@/lib/operator/getCurrentOperator";

function getXpForLevel(level: number) {
  return Math.pow(level - 1, 2) * 100;
}

function getRankFromScore(score: number) {
  if (score >= 90) return "Oracle";
  if (score >= 80) return "Elite";
  if (score >= 70) return "Diamond";
  if (score >= 60) return "Platinum";
  if (score >= 50) return "Gold";
  if (score >= 40) return "Silver";
  if (score >= 30) return "Bronze";
  return "Recruit";
}

export async function getOperatorProgression() {
  const operator = await getCurrentOperator();

  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("*")
    .eq("operator_id", operator.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const sessions = data ?? [];
  const totalSessions = operator.total_sessions ?? sessions.length;

  const currentLevelXp = getXpForLevel(operator.level);
  const nextLevelXp = getXpForLevel(operator.level + 1);
  const xpIntoLevel = operator.xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;

  const levelProgress =
    xpNeededForNextLevel > 0
      ? Math.round((xpIntoLevel / xpNeededForNextLevel) * 100)
      : 0;

  const average = (field: string) => {
    if (sessions.length === 0) return 0;

    return Math.round(
      sessions.reduce((sum, row) => sum + (row[field] || 0), 0) /
        sessions.length
    );
  };

  const combatScore = Math.round(
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
    totalXp: operator.xp,
    level: operator.level,
    xpIntoLevel,
    xpNeededForNextLevel,
    levelProgress,
    combatScore,
    rank: getRankFromScore(combatScore),
  };
}