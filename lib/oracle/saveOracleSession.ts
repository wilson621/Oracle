import { supabase } from "@/lib/supabase";
import type { OracleReport } from "@/types/oracle";

export async function saveOracleSession(prompt: string, report: OracleReport) {
  const { error } = await supabase.from("oracle_sessions").insert({
    game: "Call of Duty",
    session_type: "text",
    prompt,

    verdict: report.summary,
    diagnosis: report.diagnosis,
    strength: report.strength,
    correction: report.correction,

    grade: report.grade,
    win_chance: report.winChance,
    confidence: report.confidence,

    positioning: report.scores.positioning,
    aim: report.scores.aim,
    movement: report.scores.movement,
    decision_making: report.scores.decisionMaking,
    game_sense: report.scores.gameSense,
  });

  if (error) {
    console.error("Failed to save Oracle Session:", error);
    throw error;
  }
}