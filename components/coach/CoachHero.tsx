import Card from "@/components/ui/Card";
import { Brain } from "lucide-react";
import { OracleBrain } from "@/lib/oracle/OracleBrain";

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

      <h2 className="mt-6 text-4xl font-black text-white">
  {OracleBrain.greeting()}
</h2>

      <p className="mt-4 max-w-3xl text-slate-300">
        {summary}
      </p>

      <p className="mt-6 text-xs font-bold tracking-[0.3em] text-cyan-300">
  ORACLE AI COACH
</p>

<p className="mt-2 text-sm text-slate-400">
        Based on your last {sessionsAnalysed} Oracle Sessions.
      </p>
    </Card>
  );
}