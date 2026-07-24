"use client";

import { useEffect, useState, type ReactNode } from "react";
import MissionBrief from "@/components/oracle/coach/MissionBrief";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import CombatRatingBadge from "@/components/operator/CombatRatingBadge";
import DossierField from "@/components/operator/DossierField";
import SkillBar from "@/components/operator/SkillBar";
import OperatorIntelligence from "@/components/operator/OperatorIntelligence";
import IntelligenceGrid from "@/components/oracle/dashboard/IntelligenceGrid";

import { getOperatorStats } from "@/lib/oracle/getOperatorStats";
import { generateOracleBrainReport } from "@/lib/oracle/oracle-brain";
import { generateOperatorProfile } from "@/lib/oracle/operator/operator-profile";
import {
  getCurrentOperator,
  type Operator,
} from "@/lib/operator/getCurrentOperator";
import { getOperatorStatus } from "@/lib/operator/getOperatorStatus";
import { isOperatorCommissioned } from "@/lib/operator/isOperatorCommissioned";

import {
  getRecentOperatorSessions,
  mapSessionRowsToTrendSessions,
  type OracleSessionRow,
} from "@/lib/oracle/repositories/session-repository";

import {
  User,
  Shield,
  Trophy,
  Target,
  TrendingUp,
  Activity,
  Clock,
  Gamepad2,
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

type OperationalMetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  signal: string;
  context: string;
  trend?: string;
};

function OperationalMetricCard({
  icon: Icon,
  label,
  value,
  signal,
  context,
  trend,
}: OperationalMetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 transition duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.03]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
          <Icon size={22} className="text-cyan-300" />
        </div>

        {trend ? (
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-emerald-300">
            {trend}
          </span>
        ) : null}
      </div>

      <p className="mt-7 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
        {label}
      </p>

      <h3 className="mt-3 text-4xl font-black tracking-tight text-white">
        {value}
      </h3>

      <p className="mt-4 text-sm font-bold leading-5 text-cyan-300">
        {signal}
      </p>

      <p className="mt-2 min-h-[44px] text-sm leading-6 text-slate-400">
        {context}
      </p>
    </div>
  );
}

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

function getStatusTone(
  status: string
): "default" | "success" | "warning" | "danger" {
  if (status === "HIGH MOMENTUM") return "success";
  if (status === "ACTIVE") return "success";
  if (status === "IN TRAINING") return "warning";
  if (status === "RECRUITING") return "default";

  return "default";
}

export default function OperatorPage() {
  const router = useRouter();

  const [stats, setStats] = useState<OperatorStats | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [sessions, setSessions] = useState<OracleSessionRow[]>([]);

  useEffect(() => {
    async function loadOperatorData() {
      const operatorData = await getCurrentOperator();

      if (!isOperatorCommissioned(operatorData)) {
        router.replace("/onboarding");
        return;
      }

      const [statsData, recentSessions] = await Promise.all([
        getOperatorStats(),
        getRecentOperatorSessions(operatorData.id, 10),
      ]);

      setOperator(operatorData);
      setStats(statsData);
      setSessions(recentSessions);
    }

    loadOperatorData();
  }, [router]);

  const combatRating = stats?.combatRating ?? 0;
  const rank = getRank(combatRating);
  const trendSessions = mapSessionRowsToTrendSessions(sessions);

  const oracleBrainReport = generateOracleBrainReport({
    operatorId: operator?.id ?? "loading",
    callsign: operator?.callsign ?? "Operator",
    primaryGame: operator?.primary_game ?? "Call of Duty",
    combatRating: stats?.combatRating ?? 0,
    winChance: stats?.winRate ?? 0,
    level: operator?.level ?? null,
    xp: operator?.xp ?? null,
    totalSessions: stats?.totalSessions ?? operator?.total_sessions ?? 0,
    positioning: stats?.positioning ?? 0,
    aim: stats?.aim ?? 0,
    movement: stats?.movement ?? 0,
    decisionMaking: stats?.decisionMaking ?? 0,
    gameSense: stats?.gameSense ?? 0,
    trendSessions,
  });

  const operatorProfile = generateOperatorProfile({
    callsign: operator?.callsign ?? "Operator",
    positioning: stats?.positioning ?? 0,
    aim: stats?.aim ?? 0,
    movement: stats?.movement ?? 0,
    decisionMaking: stats?.decisionMaking ?? 0,
    gameSense: stats?.gameSense ?? 0,
  });

  const operatorStatus = getOperatorStatus(
    stats?.totalSessions ?? operator?.total_sessions ?? 0
  );

  const strongestImprovement =
    oracleBrainReport.trend.strongestImprovement?.skill ?? null;

  const operationalMetrics = [
    {
      label: "Combat Rating",
      value: stats ? combatRating : "Unranked",
      icon: Shield,
      signal:
        combatRating >= 70
          ? "Operational effectiveness is stable."
          : "Combat effectiveness requires reinforcement.",
      context: "Current combat profile based on Oracle Session intelligence.",
      trend: rank.toUpperCase(),
    },
    {
      label: "Oracle Sessions",
      value: stats?.totalSessions ?? 0,
      icon: Trophy,
      signal: "Intelligence sample expanding.",
      context: "Each session improves Oracle's behavioural and trend analysis.",
      trend:
        (stats?.totalSessions ?? operator?.total_sessions ?? 0) > 0
          ? "ACTIVE"
          : undefined,
    },
    {
      label: "Operational Success Rate",
      value: stats ? `${stats.winRate}%` : "--",
      icon: Target,
      signal:
        (stats?.winRate ?? 0) >= 50
          ? "Win conversion is above baseline."
          : "Win conversion remains a priority.",
      context: "Outcome conversion across tracked operational sessions.",
      trend: stats ? "TRACKED" : undefined,
    },
    {
      label: "Most Improved Discipline",
      value: strongestImprovement ?? "Pending",
      icon: TrendingUp,
      signal:
        strongestImprovement === null
          ? "Additional sessions required."
          : "Positive behavioural movement detected.",
      context: "Oracle will identify the strongest improving skill trend.",
      trend: strongestImprovement === null ? "PENDING" : "IMPROVING",
    },
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
        Oracle continuously analyses your combat behaviour, decision making and
        performance trends to produce actionable operational intelligence.
      </p>

      <div className="mt-10 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_35px_rgba(34,211,238,0.15)]">
              <User size={48} className="text-cyan-300" />
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.35em] text-slate-500">
                OPERATOR CALLSIGN
              </p>

              <h2 className="mt-2 text-4xl font-black text-white">
                <span className="text-2xl font-bold text-cyan-300/80">
                  Operator:
                </span>{" "}
                {operator?.callsign ?? "Loading"}
              </h2>

              <p className="mt-3 text-slate-400">
                Commissioned operators are tracked across every Oracle Session,
                intelligence report and performance assessment.
              </p>
            </div>
          </div>

          <CombatRatingBadge rank={rank} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <DossierField
            icon={Activity}
            label="Oracle Designation"
            value={operator?.designation ?? "PENDING"}
            emphasis="strong"
          />

          <DossierField
            icon={Clock}
            label="Intelligence Sample"
            value={`${oracleBrainReport.trend.sampleSize} Oracle Sessions`}
          />

          <DossierField
            icon={Shield}
            label="Operator Status"
            value={operatorStatus}
            tone={getStatusTone(operatorStatus)}
            display="pill"
          />

          <DossierField
            icon={Gamepad2}
            label="Primary Game"
            value={operator?.primary_game ?? "Call of Duty"}
          />
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-5 flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
            OPERATIONAL METRICS
          </p>

          <h2 className="text-2xl font-bold text-white">
            Current intelligence snapshot
          </h2>

          <p className="max-w-3xl text-sm leading-6 text-slate-400">
            Oracle converts raw performance data into operational intelligence,
            giving each Operator a clear read on current capability, trend
            direction and improvement priority.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {operationalMetrics.map((metric) => (
            <OperationalMetricCard
              key={metric.label}
              icon={metric.icon}
              label={metric.label}
              value={metric.value}
              signal={metric.signal}
              context={metric.context}
              trend={metric.trend}
            />
          ))}
        </div>
      </section>

      <div className="mt-10">
        <OperatorIntelligence profile={operatorProfile} />
      </div>

      <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
              OPERATOR CAPABILITY MATRIX
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              Core operational capability
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
              Oracle continuously evaluates capability across the five primary
              combat disciplines. These scores represent long-term operational
              proficiency rather than individual match performance.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4 text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
              Analysis Confidence
            </p>

            <div className="mt-2 text-4xl font-black text-cyan-300">
              {Math.round(oracleBrainReport.confidence * 100)}%
            </div>

            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">
              Based on {oracleBrainReport.trend.sampleSize} Oracle Sessions
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {skills.map((skill) => (
            <SkillBar
              key={skill.label}
              label={skill.label}
              value={skill.value}
            />
          ))}
        </div>
      </section>

      <div className="mt-10">
        <IntelligenceGrid report={oracleBrainReport} />
      </div>

      <div className="mt-10">
        <MissionBrief />
      </div>
    </AppLayout>
  );
}
