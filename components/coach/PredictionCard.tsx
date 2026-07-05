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
      <TrendingUp className="text-cyan-300" size={32} />

      <h2 className="mt-5 text-2xl font-bold">
        Predicted Improvement
      </h2>

      <p className="mt-3 text-slate-400">
        Oracle predicts your {skill.toLowerCase()} can improve from{" "}
        <span className="font-bold text-white">{current}</span> to{" "}
        <span className="font-bold text-cyan-300">{projected}</span> within
        approximately {sessions} focused sessions.
      </p>

      <div className="mt-6">
        <ProgressBar value={projected} label={`${skill} Projection`} />
      </div>
    </Card>
  );
}