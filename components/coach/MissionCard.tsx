import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Target } from "lucide-react";

type MissionCardProps = {
  title: string;
  description: string;
  rewardXp: number;
};

export default function MissionCard({
  title,
  description,
  rewardXp,
}: MissionCardProps) {
  return (
    <Card className="border-teal-400/30">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Target className="text-teal-300" size={32} />

          <p className="mt-5 text-sm font-bold tracking-[0.3em] text-teal-300">
            TODAY&apos;S MISSION
          </p>

          <h2 className="mt-3 text-3xl font-black">{title}</h2>

          <p className="mt-4 text-slate-300">{description}</p>
        </div>

        <Badge>+{rewardXp} XP</Badge>
      </div>
    </Card>
  );
}