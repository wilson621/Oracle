import Card from "@/components/ui/Card";
import { Brain } from "lucide-react";

type CoachHeroProps = {
  summary: string;
  sessionsAnalysed: number;
};

export default function CoachHero({
  summary,
  sessionsAnalysed,
}: CoachHeroProps) {
  return (
    <Card className="border-cyan-400/20 bg-cyan-400/5">
      <Brain className="text-cyan-300" size={42} />

      <h2 className="mt-6 text-3xl font-black text-white">
        Oracle has built your coaching profile.
      </h2>

      <p className="mt-4 max-w-3xl text-slate-300">
        {summary}
      </p>

      <p className="mt-4 text-sm text-slate-500">
        Based on your last {sessionsAnalysed} Oracle Sessions.
      </p>
    </Card>
  );
}