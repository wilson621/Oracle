import { supabase } from "@/lib/supabase";
import { getCurrentOperator } from "@/lib/operator/getCurrentOperator";

type Grade = "S" | "A" | "B" | "C" | "D";

function getGradeXp(grade: Grade | string) {
  switch (grade) {
    case "S":
      return 300;
    case "A":
      return 225;
    case "B":
      return 175;
    case "C":
      return 125;
    default:
      return 100;
  }
}

function calculateLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export async function awardXp(
  grade: string,
  confidence: number
) {
  const operator = await getCurrentOperator();

  const earnedXp =
    getGradeXp(grade) + Math.round(confidence * 2);

  const newXp = operator.xp + earnedXp;
  const newLevel = calculateLevel(newXp);

  const { error } = await supabase
    .from("operators")
    .update({
      xp: newXp,
      level: newLevel,
      total_sessions: operator.total_sessions + 1,
    })
    .eq("id", operator.id);

  if (error) throw error;

  return {
    earnedXp,
    newXp,
    newLevel,
    levelUp: newLevel > operator.level,
  };
}