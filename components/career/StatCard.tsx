import type { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  subtitle?: string;
};

export default function StatCard({
  icon,
  title,
  value,
  subtitle,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]">

      <div className="text-cyan-300">
        {icon}
      </div>

      <p className="mt-5 text-sm text-slate-400">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black text-white">
        {value}
      </h2>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400">
          {subtitle}
        </p>
      )}

    </div>
  );
}