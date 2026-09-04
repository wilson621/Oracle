import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-12 text-center">

      <div className="mx-auto w-fit text-teal-300">
        {icon}
      </div>

      <h2 className="mt-6 text-3xl font-bold">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-slate-400">
        {description}
      </p>

    </div>
  );
}