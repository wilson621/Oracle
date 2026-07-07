import { supabase } from "@/lib/supabase";
import type { TrendSession } from "@/lib/oracle/trend/trend-types";

export type OracleSessionRow = {
  id?: string;
  operator_id: string;
  created_at: string;

  game: string | null;
  session_type: string | null;
  prompt: string | null;

  verdict: string | null;
  diagnosis: string | null;
  strength: string | null;
  correction: string | null;

  grade: string | null;
  win_chance: number | null;
  confidence: number | null;

  positioning: number | null;
  aim: number | null;
  movement: number | null;
  decision_making: number | null;
  game_sense: number | null;
};

export async function getOperatorSessions(
  operatorId: string
): Promise<OracleSessionRow[]> {
  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []) as OracleSessionRow[];
}

export async function getRecentOperatorSessions(
  operatorId: string,
  limit = 10
): Promise<OracleSessionRow[]> {
  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return ((data ?? []) as OracleSessionRow[]).reverse();
}

export async function getLatestOperatorSession(
  operatorId: string
): Promise<OracleSessionRow | null> {
  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data as OracleSessionRow | null;
}

export function mapSessionRowsToTrendSessions(
  sessions: OracleSessionRow[]
): TrendSession[] {
  return sessions.map((session) => ({
    createdAt: session.created_at,
    combatRating: calculateCombatRatingFromSession(session),
    winChance: session.win_chance ?? 0,
    confidence: session.confidence ?? 0,
    positioning: session.positioning ?? 0,
    aim: session.aim ?? 0,
    movement: session.movement ?? 0,
    decisionMaking: session.decision_making ?? 0,
    gameSense: session.game_sense ?? 0,
  }));
}

export function calculateCombatRatingFromSession(
  session: OracleSessionRow
): number {
  const scores = [
    session.positioning ?? 0,
    session.aim ?? 0,
    session.movement ?? 0,
    session.decision_making ?? 0,
    session.game_sense ?? 0,
  ];

  return Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );
}