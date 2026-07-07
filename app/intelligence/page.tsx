"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import IntelligenceGrid from "@/components/oracle/dashboard/IntelligenceGrid";
import { generateOracleBrainReport } from "@/lib/oracle/oracle-brain";
import { getOperatorStats } from "@/lib/oracle/getOperatorStats";
import {
  getCurrentOperator,
  type Operator,
} from "@/lib/operator/getCurrentOperator";
import {
  getRecentOperatorSessions,
  mapSessionRowsToTrendSessions,
  type OracleSessionRow,
} from "@/lib/oracle/repositories/session-repository";
import type { OracleBrainReport } from "@/lib/oracle/oracle-brain-types";
import { Brain } from "lucide-react";

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

export default function IntelligencePage() {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [stats, setStats] = useState<OperatorStats | null>(null);
  const [sessions, setSessions] = useState<OracleSessionRow[]>([]);

  useEffect(() => {
    async function loadIntelligence() {
      const operatorData = await getCurrentOperator();

      const [statsData, recentSessions] = await Promise.all([
        getOperatorStats(),
        getRecentOperatorSessions(operatorData.id, 10),
      ]);

      setOperator(operatorData);
      setStats(statsData);
      setSessions(recentSessions);
    }

    loadIntelligence();
  }, []);

  const trendSessions = mapSessionRowsToTrendSessions(sessions);

  const oracleBrainReport: OracleBrainReport = generateOracleBrainReport({
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

  return (
    <AppLayout>
      <p className="text-sm font-semibold tracking-[0.35em] text-cyan-300">
        ORACLE INTELLIGENCE
      </p>

      <h1 className="mt-3 text-4xl font-bold">Intelligence Command Centre</h1>

      <p className="mt-4 max-w-3xl text-slate-400">
        Oracle analyses behaviour, trend momentum and future prediction signals
        to build your live Operator intelligence profile.
      </p>

      <div className="mt-10 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
            <Brain className="text-cyan-300" size={34} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              AI Status
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              OracleBrain Online
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Operator: {operator?.callsign ?? "Operator"} · Sample:{" "}
              {oracleBrainReport.trend.sampleSize} sessions
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <IntelligenceGrid report={oracleBrainReport} />
      </div>
    </AppLayout>
  );
}