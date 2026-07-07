import type { ReactNode } from "react";
import AnimatedNumber from "./AnimatedNumber";
import Card from "./Card";

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  subtitle?: string;
};

function isNumber(value: ReactNode): value is number {
  return typeof value === "number";
}

export default function MetricCard({
  icon,
  label,
  value,
  subtitle,
}: MetricCardProps) {
  return (
    <Card>
      <div className="text-cyan-300">{icon}</div>

      <p className="mt-5 text-sm text-slate-400">{label}</p>

      <h2 className="mt-2 text-3xl font-black text-white">
        {isNumber(value) ? <AnimatedNumber value={value} /> : value}
      </h2>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
      )}
    </Card>
  );
}