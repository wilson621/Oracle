"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import CombatRatingBadge from "@/components/operator/CombatRatingBadge";
import SkillBar from "@/components/operator/SkillBar";
import { getOperatorStats } from "@/lib/oracle/getOperatorStats";
import {
  User,
  Shield,
  Trophy,
  Target,
  TrendingUp,
  Crosshair,
  Activity,
  Clock,
} from "lucide-react";

type OperatorStats = {
  totalSessions: number;
  winRate: number;
  combatRating: number;
  positioning: number;
  aim: number;
  movement: number;
  decisionMaking: number;
  gameSense: number;
};

function getRank(score: number) {
  if (score >= 90) return "Oracle";
  if (score >= 80) return "Elite";
  if (score >= 70) return "Diamond";
  if (score >= 60) return "Platinum";
  if (score >= 50) return "Gold";
  if (score >= 40) return "Silver";
  if (score >= 30) return "Bronze";
  return "Recruit";
}

export default function OperatorPage() {
  const [stats, setStats] = useState<OperatorStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const data = await getOperatorStats();
      setStats(data);
    }

    loadStats();
  }, []);

  const combatRating = stats?.combatRating ?? 0;
  const rank = getRank(combatRating);

  const statCards = [
    { title: "Combat Rating", value: stats ? combatRating : "Unranked", icon: Shield },
    { title: "Oracle Sessions", value: stats?.totalSessions ?? 0, icon: Trophy },
    { title: "Win Rate", value: stats ? `${stats.winRate}%` : "--", icon: Target },
    { title: "Most Improved", value: "--", icon: TrendingUp },
  ];

  const skills = [
    { label: "Positioning", value: stats?.positioning ?? 0 },
    { label: "Aim", value: stats?.aim ?? 0 },
    { label: "Movement", value: stats?.movement ?? 0 },
    { label: "Decision Making", value: stats?.decisionMaking ?? 0 },
    { label: "Game Sense", value: stats?.gameSense ?? 0 },
  ];

  return (
    <AppLayout>
      <p className="text-sm font-semibold tracking-[0.35em] text-cyan-300">
        OPERATOR DOSSIER
      </p>

      <h1 className="mt-3 text-4xl font-bold">Operator Profile</h1>

      <p className="mt-4 max-w-3xl text-slate-400">
        Your Operator profile is built from every Oracle Session you complete.
      </p>

      <div className="mt-10 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_35px_rgba(34,211,238,0.15)]">
              <User size={48} className="text-cyan-300" />
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.35em] text-slate-500">
                CALLSIGN
              </p>

              <h2 className="mt-2 text-4xl font-black text-white">
                UNASSIGNED
              </h2>

              <p className="mt-3 text-slate-400">
                Complete Oracle Sessions to begin building your combat profile.
              </p>
            </div>
          </div>

          <CombatRatingBadge rank={rank} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <Activity className="text-cyan-300" />
            <p className="mt-4 text-sm text-slate-400">Operator ID</p>
            <p className="mt-1 font-bold">PM-000001</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <Clock className="text-cyan-300" />
            <p className="mt-4 text-sm text-slate-400">Last Oracle Session</p>
            <p className="mt-1 font-bold">
              {stats ? "Recently" : "Never"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <Shield className="text-cyan-300" />
            <p className="mt-4 text-sm text-slate-400">Primary Game</p>
            <p className="mt-1 font-bold">Call of Duty</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-3xl border border-slate-800 bg-slate-950 p-6"
            >
              <Icon className="text-cyan-300" />
              <p className="mt-6 text-sm text-slate-400">{stat.title}</p>
              <h3 className="mt-2 text-3xl font-bold">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <div className="flex items-center gap-3">
          <Crosshair className="text-cyan-300" />
          <h2 className="text-2xl font-bold">Lifetime Skill Ratings</h2>
        </div>

        <div className="mt-8 space-y-6">
          {skills.map((skill) => (
            <SkillBar
              key={skill.label}
              label={skill.label}
              value={skill.value}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}