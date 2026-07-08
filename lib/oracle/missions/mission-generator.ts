import type { MissionSource, OracleMission } from "./mission-types";

type MissionGeneratorInput = {
  weakestSkill: string;
  currentCombatRating: number;
  source?: MissionSource;
  confidence?: number;
};

const missionLibrary: Record<
  string,
  {
    codename: string;
    summary: string;
    objectives: string[];
  }
> = {
  Positioning: {
    codename: "Operation High Ground",
    summary:
      "Oracle has identified positioning as the greatest opportunity for immediate combat improvement.",
    objectives: [
      "Win 3 engagements from superior cover.",
      "Rotate before taking damage.",
      "Avoid unnecessary open-ground challenges.",
    ],
  },

  Movement: {
    codename: "Operation Ghost Step",
    summary:
      "Improve movement efficiency by reducing predictable routes and increasing survivability.",
    objectives: [
      "Win 3 fights after repositioning.",
      "Break line of sight before re-engaging.",
      "Avoid sprinting into contested areas.",
    ],
  },

  Aim: {
    codename: "Operation First Shot",
    summary:
      "Oracle recommends improving first-shot accuracy to increase engagement success.",
    objectives: [
      "Maintain crosshair discipline.",
      "Fire only after target confirmation.",
      "Reduce missed opening shots.",
    ],
  },

  "Decision Making": {
    codename: "Operation Last Bullet",
    summary:
      "Improve engagement decisions by recognising unfavourable fights earlier.",
    objectives: [
      "Disengage from one losing fight.",
      "Avoid unnecessary ego challenges.",
      "Prioritise survival over eliminations.",
    ],
  },

  "Game Sense": {
    codename: "Operation Overwatch",
    summary:
      "Increase battlefield awareness and anticipate enemy movement more effectively.",
    objectives: [
      "Predict one enemy rotation each match.",
      "Use information before committing.",
      "Avoid avoidable third-party engagements.",
    ],
  },
};

function createObjectives(objectives: string[]) {
  return objectives.map((label) => ({
    label,
  }));
}

export function generateMission({
  weakestSkill,
  currentCombatRating,
  source = "static",
  confidence = 0.5,
}: MissionGeneratorInput): OracleMission {
  const mission = missionLibrary[weakestSkill] ?? missionLibrary.Positioning;

  const estimatedCombatGain =
    currentCombatRating < 40 ? 4 : currentCombatRating < 70 ? 3 : 2;

  const difficulty =
    currentCombatRating < 40
      ? "Easy"
      : currentCombatRating < 70
        ? "Moderate"
        : "Hard";

  return {
    title: mission.codename,
    focusArea: weakestSkill,
    summary: mission.summary,
    estimatedCombatGain,
    difficulty,
    estimatedSessions: 3,
    rewardXp: estimatedCombatGain * 100,
    objectives: createObjectives(mission.objectives),
    source,
    confidence,
  };
}