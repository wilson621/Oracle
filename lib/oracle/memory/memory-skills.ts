import type { OracleMemorySkill } from "./memory-types";

export const MEMORY_SKILLS: {
  key: OracleMemorySkill;
  label: string;
  sessionField:
    | "positioning"
    | "aim"
    | "movement"
    | "decision_making"
    | "game_sense";
}[] = [
  { key: "positioning", label: "Positioning", sessionField: "positioning" },
  { key: "aim", label: "Aim", sessionField: "aim" },
  { key: "movement", label: "Movement", sessionField: "movement" },
  {
    key: "decisionMaking",
    label: "Decision Making",
    sessionField: "decision_making",
  },
  { key: "gameSense", label: "Game Sense", sessionField: "game_sense" },
];