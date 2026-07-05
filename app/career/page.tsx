"use client";

import { useEffect, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";

import CareerHeader from "@/components/career/CareerHeader";
import RankBadge from "@/components/career/RankBadge";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import MetricCard from "@/components/ui/MetricCard";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";

import { getOperatorProgression } from "@/lib/progression/getOperatorProgression";

import {
  Shield,
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
      setProgress(await getOperatorProgression());
    }

    load();
  }, []);

  return (
    <AppLayout>
      {!progress ? (
        <EmptyState
          icon={<Shield size={42} />}
          title="No Career Yet"
          description="Complete your first Oracle Session to begin your Operator Career."
        />
      ) : (
        <>
          <PageHeader
            eyebrow="OPERATOR CAREER"
            title={`Level ${progress.level}`}
            description="Track your long-term progression as an Oracle Operator."
          />

          <Card className="border-cyan-400/20 bg-cyan-400/5">

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

              <ProgressBar
                value={progress.levelProgress}
                label={`${progress.xpIntoLevel} / ${progress.xpNeededForNextLevel} XP`}
                showPercentage
              />

            </div>

          </Card>

          <div className="mt-8 grid gap-5 md:grid-cols-4">

            <MetricCard
              icon={<Star />}
              label="Lifetime XP"
              value={progress.totalXp.toLocaleString()}
            />

            <MetricCard
              icon={<Trophy />}
              label="Sessions"
              value={progress.totalSessions}
            />

            <MetricCard
              icon={<TrendingUp />}
              label="Combat Score"
              value={progress.combatScore}
            />

            <MetricCard
              icon={<ChevronRight />}
              label="Next Level"
              value={`Level ${progress.level + 1}`}
            />

          </div>

        </>
      )}
    </AppLayout>
  );
}