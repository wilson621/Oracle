"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";

import {
  Achievement,
  getAchievements,
} from "@/lib/achievements/getAchievements";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    async function load() {
      setAchievements(await getAchievements());
    }

    load();
  }, []);

  return (
    <AppLayout>
      <PageHeader
        eyebrow="ACHIEVEMENTS"
        title="Oracle Achievements"
        description="Earn achievements by improving, analysing sessions and mastering your gameplay."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={
              achievement.unlocked
                ? "border-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.12)]"
                : ""
            }
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {achievement.title}
                </h2>

                <p className="mt-2 text-slate-400">
                  {achievement.description}
                </p>
              </div>

              <Badge>{achievement.rarity}</Badge>
            </div>

            <div className="mt-8">
              <ProgressBar
                value={achievement.progress}
                max={achievement.target}
                label={`${achievement.progress}/${achievement.target}`}
              />
            </div>

            <div className="mt-5 text-sm font-bold">
              {achievement.unlocked ? (
                <span className="text-cyan-300">Unlocked</span>
              ) : (
                <span className="text-slate-500">Locked</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}