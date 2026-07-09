import type { OracleSessionRow } from "@/lib/oracle/repositories/session-repository";

export function averageSessionScore(
  sessions: OracleSessionRow[],
  field:
    | "positioning"
    | "aim"
    | "movement"
    | "decision_making"
    | "game_sense"
): number {
  const scores = sessions
    .map((session) => session[field] ?? 0)
    .filter((score) => score > 0);

  if (scores.length === 0) return 0;

  return Math.round(
    scores.reduce((total, score) => total + score, 0) / scores.length
  );
}