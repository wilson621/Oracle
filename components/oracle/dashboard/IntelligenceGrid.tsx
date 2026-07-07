import type { OracleBrainReport } from "@/lib/oracle/oracle-brain-types";

import ConfidencePanel from "./ConfidencePanel";
import BehaviourPanel from "./BehaviourPanel";
import TrendPanel from "./TrendPanel";
import PredictionPanel from "./PredictionPanel";

type IntelligenceGridProps = {
  report: OracleBrainReport;
};

export default function IntelligenceGrid({
  report,
}: IntelligenceGridProps) {
  return (
    <div className="space-y-6">
      <ConfidencePanel confidence={report.confidence} />

      <div className="grid gap-6 xl:grid-cols-2">
        <BehaviourPanel behaviour={report.behaviour} />
        <TrendPanel trend={report.trend} />
      </div>

      <PredictionPanel prediction={report.prediction} />
    </div>
  );
}