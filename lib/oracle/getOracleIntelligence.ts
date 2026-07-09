import { supabase } from "@/lib/supabase";

type OracleSessionRow = {
  positioning: number | null;
  aim: number | null;
  movement: number | null;
  decision_making: number | null;
  game_sense: number | null;
  correction: string | null;
};

type NumericOracleSessionField =
  | "positioning"
  | "aim"
  | "movement"
  | "decision_making"
  | "game_sense";

export async function getOracleIntelligence() {
  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) return null;

  const sessions = data as OracleSessionRow[];

  const average = (field: NumericOracleSessionField) =>
    Math.round(
      sessions.reduce((sum, row) => sum + (row[field] ?? 0), 0) /
        sessions.length
    );

  const averages = {
    positioning: average("positioning"),
    aim: average("aim"),
    movement: average("movement"),
    decisionMaking: average("decision_making"),
    gameSense: average("game_sense"),
  };

  const skills = [
    { name: "Positioning", value: averages.positioning },
    { name: "Aim", value: averages.aim },
    { name: "Movement", value: averages.movement },
    { name: "Decision Making", value: averages.decisionMaking },
    { name: "Game Sense", value: averages.gameSense },
  ];

  const strongestSkill = [...skills].sort((a, b) => b.value - a.value)[0];
  const weakestSkill = [...skills].sort((a, b) => a.value - b.value)[0];

  const corrections: Record<string, number> = {};

  sessions.forEach((session) => {
    if (!session.correction) return;

    corrections[session.correction] =
      (corrections[session.correction] || 0) + 1;
  });

  const mostCommonCorrection =
    Object.entries(corrections).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "Keep improving.";

  let prediction = "Bronze";

  const rating =
    averages.positioning +
    averages.aim +
    averages.movement +
    averages.decisionMaking +
    averages.gameSense;

  if (rating > 450) prediction = "Oracle";
  else if (rating > 420) prediction = "Elite";
  else if (rating > 390) prediction = "Diamond";
  else if (rating > 350) prediction = "Platinum";
  else if (rating > 300) prediction = "Gold";
  else if (rating > 250) prediction = "Silver";

  return {
    totalSessions: sessions.length,
    strongestSkill,
    weakestSkill,
    averages,
    prediction,
    recommendation: mostCommonCorrection,
    intelligenceSummary: `Oracle has analysed ${sessions.length} engagements and believes your biggest opportunity is improving ${weakestSkill.name.toLowerCase()} while continuing to develop ${strongestSkill.name.toLowerCase()}.`,
  };
}