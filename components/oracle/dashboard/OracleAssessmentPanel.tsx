import BriefingSection from "@/components/ui/BriefingSection";
import type { OracleBrainAssessment } from "@/lib/oracle/oracle-brain-types";
import { FileText, ShieldCheck } from "lucide-react";

type OracleAssessmentPanelProps = {
  assessment: OracleBrainAssessment;
};

function formatOutlook(outlook: OracleBrainAssessment["outlook"]) {
  return outlook
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function OracleAssessmentPanel({
  assessment,
}: OracleAssessmentPanelProps) {
  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-black/50 p-6 shadow-xl shadow-cyan-500/10">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 shadow-lg shadow-cyan-500/10">
            <FileText className="text-cyan-300" size={24} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
              Oracle Assessment
            </p>

            <h3 className="mt-3 text-3xl font-black text-white">
              Classified Operator Briefing
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Oracle has completed its executive review of current operator
              intelligence.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-white/10 py-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Classification
          </p>

          <p className="mt-3 text-2xl font-black text-white">
            {assessment.operatorClassification}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Operational Outlook
          </p>

          <p className="mt-3 text-2xl font-black text-cyan-300">
            {formatOutlook(assessment.outlook)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Authority
          </p>

          <div className="mt-3 flex items-center gap-2">
            <ShieldCheck className="text-emerald-300" size={20} />

            <p className="text-2xl font-black text-emerald-300">
              Oracle Verified
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-6">
        <BriefingSection
          title="Current Assessment"
          content={assessment.currentAssessment}
        />

        <BriefingSection
          title="Primary Limitation"
          content={assessment.primaryLimitation}
        />

        <BriefingSection
          title="Training Priority"
          content={assessment.trainingPriority}
        />

        <BriefingSection
          title="Strategic Note"
          content={assessment.strategicNote}
        />
      </div>
    </section>
  );
}