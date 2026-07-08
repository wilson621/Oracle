import { supabase } from "@/lib/supabase";
import { getCurrentOperator } from "@/lib/operator/getCurrentOperator";
import { generateMissionReport } from "@/lib/oracle/missions";

type Skill = {
  label: string;
  value: number;
};

type OracleSessionMetricRow = {
  positioning: number | null;
  aim: number | null;
  movement: number | null;
  decision_making: number | null;
  game_sense: number | null;
};

function average(rows: OracleSessionMetricRow[], field: keyof OracleSessionMetricRow) {
  if (rows.length === 0) return 0;

  return Math.round(
    rows.reduce((sum, row) => sum + (row[field] ?? 0), 0) / rows.length
  );
}

export async function getCoachReport() {
  const operator = await getCurrentOperator();

  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("positioning, aim, movement, decision_making, game_sense")
    .eq("operator_id", operator.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  const sessions = (data ?? []) as OracleSessionMetricRow[];

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

  const missionReport = generateMissionReport({
    sessionsAnalysed: sessions.length,
    weakestSkill: weakestSkill.label,
    strongestSkill: strongestSkill.label,
    currentCombatRating: weakestSkill.value,
    projectedCombatRating,
    predictionConfidence: 0.77,
  });

  return {
    operatorName: operator.callsign || "Operator",
    sessionsAnalysed: missionReport.sessionsAnalysed,
    strongestSkill,
    weakestSkill,
    dailyMission: {
      title: missionReport.mission.title,
      description: missionReport.mission.summary,
      rewardXp: missionReport.mission.rewardXp,
    },
    prediction: {
      current: missionReport.readiness.currentCombatRating,
      projected: missionReport.readiness.projectedCombatRating,
      skill: missionReport.readiness.focus,
      sessions: missionReport.readiness.estimatedSessions,
    },
    readiness: missionReport.readiness,
    mission: missionReport.mission,
    summary: missionReport.summary,
  };
}