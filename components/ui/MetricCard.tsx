import type { ReactNode } from "react";
import Card from "./Card";

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  subtitle?: string;
};

export default function MetricCard({
  icon,
  label,
  value,
  subtitle,
}: MetricCardProps) {
  return (
    <Card className="transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]">

      <div className="text-cyan-300">
        {icon}
      </div>

      <p className="mt-5 text-sm text-slate-400">
        {label}
      </p>

      <h2 className="mt-2 text-3xl font-black text-white">
        {value}
      </h2>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500">
          {subtitle}
        </p>
      )}

    </Card>
  );
}