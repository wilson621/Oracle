import { supabase } from "@/lib/supabase";

type OracleSessionRow = {
  positioning: number | null;
  aim: number | null;
  movement: number | null;
  decision_making: number | null;
  game_sense: number | null;
  win_chance: number | null;
};

export async function getOracleDNA() {
  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw error;

  if (!data || data.length === 0) {
    return null;
  }

  const sessions = data as OracleSessionRow[];

  const average = (field: keyof OracleSessionRow) =>
    Math.round(
      sessions.reduce((sum, row) => sum + (row[field] ?? 0), 0) /
        sessions.length
    );

  const positioning = average("positioning");
  const aim = average("aim");
  const movement = average("movement");
  const decisionMaking = average("decision_making");
  const gameSense = average("game_sense");
  const winChance = average("win_chance");

  const aggression = Math.round((movement + aim) / 2);
  const confidence = Math.round((winChance + aim) / 2);
  const discipline = Math.round((positioning + decisionMaking) / 2);
  const awareness = Math.round((positioning + gameSense) / 2);
  const adaptability = Math.round(
    (movement + decisionMaking + gameSense) / 3
  );
  const mechanicalSkill = Math.round((aim + movement) / 2);
  const decisionSpeed = Math.round((movement + decisionMaking) / 2);
  const pressureHandling = Math.round((decisionMaking + winChance) / 2);

  const traits = [
    { label: "Aggression", value: aggression },
    { label: "Confidence", value: confidence },
    { label: "Discipline", value: discipline },
    { label: "Awareness", value: awareness },
    { label: "Adaptability", value: adaptability },
    { label: "Mechanical Skill", value: mechanicalSkill },
    { label: "Decision Speed", value: decisionSpeed },
    { label: "Pressure Handling", value: pressureHandling },
  ];

  const strongestTrait = [...traits].sort((a, b) => b.value - a.value)[0];
  const weakestTrait = [...traits].sort((a, b) => a.value - b.value)[0];

  let playstyle = "Balanced Operator";

  if (aggression >= 70 && discipline < 50) {
    playstyle = "Aggressive Instinct Player";
  } else if (awareness >= 70 && decisionMaking >= 65) {
    playstyle = "Tactical Controller";
  } else if (mechanicalSkill >= 70 && gameSense < 55) {
    playstyle = "Mechanical Duelist";
  } else if (adaptability >= 70) {
    playstyle = "Adaptive Rotator";
  }

  const assessment = `Oracle identifies you as a ${playstyle}. Your strongest trait is ${strongestTrait.label.toLowerCase()}, while your biggest development area is ${weakestTrait.label.toLowerCase()}.`;

  return {
    sessionsAnalysed: sessions.length,
    playstyle,
    strongestTrait,
    weakestTrait,
    traits,
    assessment,
  };
}