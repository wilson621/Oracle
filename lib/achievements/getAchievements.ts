import { supabase } from "@/lib/supabase";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
};

export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from("oracle_sessions")
    .select("*");

  if (error) throw error;

  const sessions = data ?? [];

  const totalSessions = sessions.length;

  const averageAim =
    totalSessions === 0
      ? 0
      : sessions.reduce((s, x) => s + (x.aim || 0), 0) / totalSessions;

  return [
    {
      id: "first-analysis",
      title: "First Analysis",
      description: "Complete your first Oracle Session.",
      unlocked: totalSessions >= 1,
      progress: totalSessions,
      target: 1,
      rarity: "Common",
    },
    {
      id: "veteran",
      title: "Veteran",
      description: "Complete 100 Oracle Sessions.",
      unlocked: totalSessions >= 100,
      progress: totalSessions,
      target: 100,
      rarity: "Legendary",
    },
    {
      id: "deadeye",
      title: "Deadeye",
      description: "Reach an average Aim score of 80.",
      unlocked: averageAim >= 80,
      progress: Math.round(averageAim),
      target: 80,
      rarity: "Epic",
    },
    {
      id: "grinder",
      title: "Grinder",
      description: "Complete 25 Oracle Sessions.",
      unlocked: totalSessions >= 25,
      progress: totalSessions,
      target: 25,
      rarity: "Rare",
    },
  ];
}