import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { TrendingUp } from "lucide-react";

type PredictionCardProps = {
  skill: string;
  current: number;
  projected: number;
  sessions: number;
};

export default function PredictionCard({
  skill,
  current,
  projected,
  sessions,
}: PredictionCardProps) {
  return (
    <Card>
      <TrendingUp className="text-teal-300" size={32} />

      <h2 className="mt-5 text-3xl font-black">
        Predicted Improvement
      </h2>

      <p className="mt-3 text-slate-400">
        Oracle predicts your {skill.toLowerCase()} can improve from{" "}
        <span className="font-bold text-white">{current}</span> to{" "}
        <span className="font-bold text-teal-300">{projected}</span> within
        approximately {sessions} focused sessions.
      </p>

      <div className="mt-6">
  <ProgressBar value={projected} label={`${skill} Projection`} />
</div>

<div className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-400/5 p-4">

  <p className="text-xs font-bold tracking-[0.3em] text-teal-300">
    PREDICTION CONFIDENCE
  </p>

  <p className="mt-3 text-3xl font-black">
    84%
  </p>

  <p className="mt-2 text-slate-400">
    High confidence based on your analysed sessions.
  </p>

</div>
    </Card>
  );
}