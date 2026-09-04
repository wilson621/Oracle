import type { OracleReport } from "@/types/oracle";
import OracleStats from "./OracleStats";
import ScoreBar from "@/components/ScoreBar";
import OracleCard from "@/components/OracleCard";

type OracleReportProps = {
  report: OracleReport;
};

export default function OracleReport({ report }: OracleReportProps) {
  return (
    <div className="mx-auto mt-6 grid max-w-3xl gap-4">
      <OracleCard title="Oracle Summary">
        <p className="text-2xl font-bold leading-9 text-white">
          {report.summary}
        </p>
      </OracleCard>

      <OracleStats
        winChance={report.winChance}
        confidence={report.confidence}
      />

      <OracleCard title="Overall Grade">
        <p className="text-6xl font-black text-teal-300">
          {report.grade}
        </p>
      </OracleCard>

      <OracleCard title="Skill Breakdown">
        <div className="space-y-5">
          <ScoreBar label="Positioning" score={report.scores.positioning} />
          <ScoreBar label="Aim" score={report.scores.aim} />
          <ScoreBar label="Movement" score={report.scores.movement} />
          <ScoreBar
            label="Decision Making"
            score={report.scores.decisionMaking}
          />
          <ScoreBar label="Game Sense" score={report.scores.gameSense} />
        </div>
      </OracleCard>

      <OracleCard title="⚠ Oracle's Diagnosis">
        <p className="text-slate-300">{report.diagnosis}</p>
      </OracleCard>

      <OracleCard title="✅ Strength Detected">
        <p className="text-slate-300">{report.strength}</p>
      </OracleCard>

      <OracleCard title="🎯 Immediate Correction">
        <p className="text-slate-300">{report.correction}</p>
      </OracleCard>

      <OracleCard title="🏋 Next Training Session">
        <p className="text-slate-300">{report.training}</p>
      </OracleCard>
    </div>
  );
}