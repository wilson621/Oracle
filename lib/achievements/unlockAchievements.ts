export type UnlockedAchievement = {
  id: string;
  title: string;
  xp: number;
};

const achievementMeta: Record<string, UnlockedAchievement> = {
  "first-analysis": {
    id: "first-analysis",
    title: "First Analysis",
    xp: 250,
  },
  grinder: {
    id: "grinder",
    title: "Grinder",
    xp: 500,
  },
  veteran: {
    id: "veteran",
    title: "Veteran",
    xp: 1500,
  },
};

export async function unlockAchievements(): Promise<UnlockedAchievement[]> {
  void achievementMeta;
  throw new Error(
    "Achievement mutation requires the authoritative Progression Service; persisted producers remain inactive."
  );
}
