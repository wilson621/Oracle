import { supabase } from "@/lib/supabase";

function getLevelFromXp(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

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
  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) {
    return null;
  }

  const totalSessions = data.length;

  const totalXp = data.reduce((sum, session) => {
    const gradeBonus =
      session.grade === "S"
        ? 300
        : session.grade === "A"
        ? 225
        : session.grade === "B"
        ? 175
        : session.grade === "C"
        ? 125
        : 100;

    const confidenceBonus = Math.round((session.confidence || 0) * 2);

    return sum + gradeBonus + confidenceBonus;
  }, 0);

  const level = getLevelFromXp(totalXp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const xpIntoLevel = totalXp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const levelProgress = Math.round((xpIntoLevel / xpNeededForNextLevel) * 100);

  const average = (field: string) =>
    Math.round(
      data.reduce((sum, row) => sum + (row[field] || 0), 0) / totalSessions
    );

  const combatScore = Math.round(
    (
      average("positioning") +
      average("aim") +
      average("movement") +
      average("decision_making") +
      average("game_sense")
    ) / 5
  );

  const rank = getRankFromScore(combatScore);

  return {
    totalSessions,
    totalXp,
    level,
    xpIntoLevel,
    xpNeededForNextLevel,
    levelProgress,
    combatScore,
    rank,
  };
}