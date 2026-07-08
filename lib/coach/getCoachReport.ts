import { supabase } from "@/lib/supabase";
import { getCurrentOperator } from "@/lib/operator/getCurrentOperator";
import { generateMissionReport } from "@/lib/oracle/missions";
import { generatePlannerProfile } from "@/lib/oracle/planner";

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

function average(
  rows: OracleSessionMetricRow[],
  field: keyof OracleSessionMetricRow
) {
  if (rows.length === 0) return 0;

  return Math.round(
    rows.reduce((sum, row) => sum + (row[field] ?? 0), 0) / rows.length
  );
}

function plannerPriorityToSkillLabel(priority: string): string {
  switch (priority) {
    case "positioning":
      return "Positioning";
    case "aim":
      return "Aim";
    case "movement":
      return "Movement";
    case "decision":
      return "Decision Making";
    case "gamesense":
      return "Game Sense";
    default:
      return "Positioning";
  }
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

  const positioning = average(sessions, "positioning");
  const aim = average(sessions, "aim");
  const movement = average(sessions, "movement");
  const decisionMaking = average(sessions, "decision_making");
  const gameSense = average(sessions, "game_sense");

  const skills: Skill[] = [
    { label: "Positioning", value: positioning },
    { label: "Aim", value: aim },
    { label: "Movement", value: movement },
    { label: "Decision Making", value: decisionMaking },
    { label: "Game Sense", value: gameSense },
  ];

  const strongestSkill = [...skills].sort((a, b) => b.value - a.value)[0];

  const planner = generatePlannerProfile({
    positioning,
    aim,
    movement,
    decisionMaking,
    gameSense,
  });

  const plannedSkillLabel = plannerPriorityToSkillLabel(
    planner.recommendation.priority
  );

  const plannedSkill =
    skills.find((skill) => skill.label === plannedSkillLabel) ?? skills[0];

  const predictedGain = Math.max(4, Math.round((100 - plannedSkill.value) / 5));
  const projectedCombatRating = Math.min(100, plannedSkill.value + predictedGain);

  const missionReport = generateMissionReport({
    sessionsAnalysed: sessions.length,
    weakestSkill: plannedSkill.label,
    strongestSkill: strongestSkill.label,
    currentCombatRating: plannedSkill.value,
    projectedCombatRating,
    predictionConfidence:
      planner.recommendation.confidence === "high"
        ? 0.9
        : planner.recommendation.confidence === "medium"
          ? 0.7
          : 0.5,
    source: "brain",
  });

  return {
    operatorName: operator.callsign || "Operator",
    sessionsAnalysed: missionReport.sessionsAnalysed,
    strongestSkill,
    weakestSkill: plannedSkill,
    planner,
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