import { supabase } from "@/lib/supabase";
import { getCurrentOperator } from "@/lib/operator/getCurrentOperator";
import { generateCoachReport } from "@/lib/oracle/coach/coach-engine";

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

  const predictedGain = Math.max(4, Math.round((100 - weakestSkill.value) / 5));
  const projectedCombatRating = Math.min(100, weakestSkill.value + predictedGain);

  const coachReport = generateCoachReport({
    sessionsAnalysed: sessions.length,
    weakestSkill: weakestSkill.label,
    strongestSkill: strongestSkill.label,
    currentCombatRating: weakestSkill.value,
    projectedCombatRating,
    predictionConfidence: 0.77,
  });

  return {
    operatorName: operator.callsign || "Operator",
    sessionsAnalysed: coachReport.sessionsAnalysed,
    strongestSkill,
    weakestSkill,
    dailyMission: {
      title: coachReport.mission.title,
      description: coachReport.mission.summary,
      rewardXp: coachReport.mission.rewardXp,
    },
    prediction: {
      current: coachReport.readiness.currentCombatRating,
      projected: coachReport.readiness.projectedCombatRating,
      skill: coachReport.readiness.focus,
      sessions: coachReport.readiness.estimatedSessions,
    },
    readiness: coachReport.readiness,
    mission: coachReport.mission,
    summary: coachReport.summary,
  };
}