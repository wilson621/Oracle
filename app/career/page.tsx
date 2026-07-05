"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

import CareerHeader from "@/components/career/CareerHeader";
import RankBadge from "@/components/career/RankBadge";
import XPBar from "@/components/career/XPBar";
import StatCard from "@/components/career/StatCard";

import { getOperatorProgression } from "@/lib/progression/getOperatorProgression";

import {
  Star,
  Trophy,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

type Progression = {
  totalSessions: number;
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpNeededForNextLevel: number;
  levelProgress: number;
  combatScore: number;
  rank: string;
};

export default function CareerPage() {
  const [progress, setProgress] = useState<Progression | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getOperatorProgression();
      setProgress(data);
    }

    load();
  }, []);

  if (!progress) {
    return (
      <AppLayout>
        <CareerHeader level={1} />

        <p className="mt-8 text-slate-400">
          Complete Oracle Sessions to begin your career.
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>

      <CareerHeader
        level={progress.level}
      />

      <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-slate-400">
              Current Combat Rank
            </p>

            <div className="mt-4">
              <RankBadge rank={progress.rank} />
            </div>

          </div>

        </div>

        <div className="mt-10">

          <XPBar
            current={progress.xpIntoLevel}
            required={progress.xpNeededForNextLevel}
            progress={progress.levelProgress}
          />

        </div>

      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-4">

        <StatCard
          icon={<Star />}
          title="Lifetime XP"
          value={progress.totalXp.toLocaleString()}
        />

        <StatCard
          icon={<Trophy />}
          title="Sessions"
          value={progress.totalSessions}
        />

        <StatCard
          icon={<TrendingUp />}
          title="Combat Score"
          value={progress.combatScore}
        />

        <StatCard
          icon={<ChevronRight />}
          title="Next Level"
          value={`Level ${progress.level + 1}`}
        />

      </div>

    </AppLayout>
  );
}