import Card from "@/components/ui/Card";
import { AlertTriangle, Shield } from "lucide-react";

type FocusCardProps = {
  weakest: {
    label: string;
    value: number;
  };
  strongest: {
    label: string;
    value: number;
  };
};

export default function FocusCard({
  weakest,
  strongest,
}: FocusCardProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card>
        <AlertTriangle className="text-amber-300" />

        <p className="mt-5 text-sm text-slate-400">
          Priority Focus
        </p>

        <h3 className="mt-2 text-3xl font-black">
          {weakest.label}
        </h3>

        <p className="mt-2 text-slate-400">
          Current rating: {weakest.value}/100
        </p>
      </Card>

      <Card>
        <Shield className="text-cyan-300" />

        <p className="mt-5 text-sm text-slate-400">
          Current Strength
        </p>

        <h3 className="mt-2 text-3xl font-black">
          {strongest.label}
        </h3>

        <p className="mt-2 text-slate-400">
          Current rating: {strongest.value}/100
        </p>
      </Card>
    </div>
  );
}