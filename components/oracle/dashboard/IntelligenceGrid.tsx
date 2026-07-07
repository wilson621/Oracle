import type { OracleBrainReport } from "@/lib/oracle/oracle-brain-types";

import ConfidencePanel from "./ConfidencePanel";
import BehaviourPanel from "./BehaviourPanel";
import TrendPanel from "./TrendPanel";
import PredictionPanel from "./PredictionPanel";
import RiskPanel from "./RiskPanel";
import OracleAssessmentPanel from "./OracleAssessmentPanel";

import FadeIn from "@/components/ui/FadeIn";

type IntelligenceGridProps = {
  report: OracleBrainReport;
};

export default function IntelligenceGrid({
  report,
}: IntelligenceGridProps) {
  return (
    <div className="space-y-6">
      <FadeIn>
        <ConfidencePanel confidence={report.confidence} />
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid gap-6 xl:grid-cols-2">
          <BehaviourPanel behaviour={report.behaviour} />
          <TrendPanel trend={report.trend} />
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <PredictionPanel prediction={report.prediction} />
      </FadeIn>

      <FadeIn delay={0.3}>
        <RiskPanel report={report} />
      </FadeIn>

      <FadeIn delay={0.4}>
        <OracleAssessmentPanel
          assessment={report.assessment}
        />
      </FadeIn>
    </div>
  );
}