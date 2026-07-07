import { supabase } from "@/lib/supabase";
import { getCurrentOperator } from "@/lib/operator/getCurrentOperator";

type Skill = {
  label: string;
  value: number;
};

function average(rows: any[], field: string) {
  if (rows.length === 0) return 0;

  return Math.round(
    rows.reduce((sum, row) => sum + (row[field] || 0), 0) / rows.length
  );
}

export async function getCoachReport() {
  const operator = await getCurrentOperator();

  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("*")
    .eq("operator_id", operator.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  const sessions = data ?? [];

  if (sessions.length === 0) {
    return null;
  }

  const skills: Skill[] = [
    { label: "Positioning", value: average(sessions, "positioning") },
    { label: "Aim", value: average(sessions, "aim") },
    { label: "Movement", value: average(sessions, "movement") },
    { label: "Decision Making", value: average(sessions, "decision_making") },
    { label: "Game Sense", value: average(sessions, "game_sense") },
  ];

  const strongestSkill = [...skills].sort((a, b) => b.value - a.value)[0];
  const weakestSkill = [...skills].sort((a, b) => a.value - b.value)[0];

  const commonCorrection =
    sessions.find((session) => session.correction)?.correction ||
    "Focus on cleaner engagements and smarter positioning.";

  const mission =
    weakestSkill.label === "Movement"
      ? "Complete 5 fights where you rotate before taking damage."
      : weakestSkill.label === "Positioning"
      ? "Complete 5 fights where you move to stronger cover before engaging."
      : weakestSkill.label === "Aim"
      ? "Complete 5 fights where you centre your crosshair before shooting."
      : weakestSkill.label === "Decision Making"
      ? "Complete 5 fights where you disengage instead of forcing a bad challenge."
      : "Complete 5 fights where you predict the enemy route before pushing.";

  const predictedGain = Math.max(4, Math.round((100 - weakestSkill.value) / 5));

  return {
    operatorName: operator.callsign || "Operator",
    sessionsAnalysed: sessions.length,
    strongestSkill,
    weakestSkill,
    commonCorrection,
    dailyMission: {
      title: `${weakestSkill.label} Focus`,
      description: mission,
      rewardXp: 450,
    },
    prediction: {
      current: weakestSkill.value,
      projected: Math.min(100, weakestSkill.value + predictedGain),
      skill: weakestSkill.label,
      sessions: 10,
    },
    summary: `Operator...

I have analysed your last ${sessions.length} combat sessions.

Your strongest discipline is ${strongestSkill.label.toLowerCase()}.

Your greatest opportunity for improvement is ${weakestSkill.label.toLowerCase()}.

Repeated behavioural analysis indicates:

"${commonCorrection}"

My recommendation is to focus exclusively on ${weakestSkill.label.toLowerCase()} over your next ten sessions.

Analysis confidence is increasing with every session completed.`,
  };
}