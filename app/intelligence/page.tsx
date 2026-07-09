"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import OracleBrainCard from "@/components/oracle/dashboard/OracleBrainCard";
import OracleDecisionCard from "@/components/oracle/dashboard/OracleDecisionCard";
import OracleExplainabilityCard from "@/components/oracle/dashboard/OracleExplainabilityCard";
import OraclePlannerCard from "@/components/oracle/dashboard/OraclePlannerCard";
import OracleSignalFeed from "@/components/oracle/dashboard/OracleSignalFeed";
import OracleTimelineCard from "@/components/oracle/dashboard/OracleTimelineCard";
import { buildOracleContext } from "@/lib/oracle/context";
import { runIntelligencePipeline } from "@/lib/oracle/pipeline/intelligence-pipeline";
import { getOperatorStats } from "@/lib/oracle/getOperatorStats";
import {
  getCurrentOperator,
  type Operator,
} from "@/lib/operator/getCurrentOperator";
import type { OracleIntelligenceState } from "@/lib/oracle/state";
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
  const [state, setState] = useState<OracleIntelligenceState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadIntelligence() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const operatorData = await getCurrentOperator();
        const statsData = await getOperatorStats();

        const context = await buildOracleContext({
          operatorId: operatorData.id,
          callsign: operatorData.callsign ?? "Operator",
          sessionsAnalysed:
            statsData?.totalSessions ?? operatorData.total_sessions ?? 0,
          currentGame: operatorData.primary_game ?? "Call of Duty",
          patchVersion: null,
        });

        const result = await runIntelligencePipeline(context);

        setOperator(operatorData);
        setStats(statsData);
        setState(result.state);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Oracle failed to build intelligence state."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadIntelligence();
  }, []);

  const primaryDecision = state?.decisionProfile.primaryDecision ?? null;
  const strongestExplanation = state?.explanations[0] ?? null;

  return (
    <AppLayout>
      <p className="text-sm font-semibold tracking-[0.35em] text-cyan-300">
        ORACLE INTELLIGENCE
      </p>

      <h1 className="mt-3 text-4xl font-bold">
        Intelligence Command Centre
      </h1>

      <p className="mt-4 max-w-3xl text-slate-400">
        Oracle now consumes the complete Intelligence State: runtime context,
        intelligence bus output, brain findings, planner recommendations,
        timeline events, explanations, signals and decisions.
      </p>

      {loadError ? (
        <div className="mt-10 rounded-3xl border border-red-400/30 bg-red-500/10 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-300">
            Oracle Error
          </p>

          <h2 className="mt-3 text-2xl font-black text-white">
            Intelligence state failed to load
          </h2>

          <p className="mt-3 text-sm text-red-100">
            {loadError}
          </p>
        </div>
      ) : null}

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
              {isLoading
                ? "Oracle Initialising"
                : "Oracle Intelligence Online"}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Operator:{" "}
              {state?.metadata.callsign ??
                operator?.callsign ??
                "Operator"}
              {" · "}
              Sample: {stats?.totalSessions ?? 0} sessions
              {" · "}
              Version: {state?.metadata.version ?? "1.0.0"}
            </p>
          </div>
        </div>
      </div>

      <OracleDecisionCard
        decision={primaryDecision}
        isLoading={isLoading}
      />

      <div className="mt-10 grid gap-6 xl:grid-cols-3">
        <OracleBrainCard
          brain={state?.brain ?? null}
        />

        <OraclePlannerCard
          planner={state?.planner ?? null}
        />

        <OracleTimelineCard
          timeline={state?.timeline ?? null}
          signalCount={state?.signals.length ?? 0}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <OracleExplainabilityCard
          explanation={strongestExplanation}
        />

        <OracleSignalFeed
          signals={state?.signals ?? []}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
}