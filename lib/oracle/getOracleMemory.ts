import { supabase } from "@/lib/supabase";

type OracleSession = {
  diagnosis: string | null;
  correction: string | null;
  strength: string | null;
  positioning: number | null;
  aim: number | null;
  movement: number | null;
  decision_making: number | null;
  game_sense: number | null;
  created_at: string;
};

export async function getOracleMemory() {
  const { data, error } = await supabase
    .from("oracle_sessions")
    .select(
      "diagnosis, correction, strength, positioning, aim, movement, decision_making, game_sense, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  const sessions = (data || []) as OracleSession[];

  if (sessions.length === 0) {
    return null;
  }

  const average = (field: keyof OracleSession) => {
    const values = sessions
      .map((session) => session[field])
      .filter((value): value is number => typeof value === "number");

    if (values.length === 0) return 0;

    return Math.round(
      values.reduce((total, value) => total + value, 0) / values.length
    );
  };

  const skills = [
    { label: "Positioning", value: average("positioning") },
    { label: "Aim", value: average("aim") },
    { label: "Movement", value: average("movement") },
    { label: "Decision Making", value: average("decision_making") },
    { label: "Game Sense", value: average("game_sense") },
  ];

  const weakestSkill = [...skills].sort((a, b) => a.value - b.value)[0];
  const strongestSkill = [...skills].sort((a, b) => b.value - a.value)[0];

  const commonCorrections = sessions
    .map((session) => session.correction)
    .filter(Boolean)
    .slice(0, 3);

  const recentDiagnoses = sessions
    .map((session) => session.diagnosis)
    .filter(Boolean)
    .slice(0, 3);

  return {
    totalSessions: sessions.length,
    weakestSkill,
    strongestSkill,
    recentDiagnoses,
    commonCorrections,
  };
}