import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-10 flex items-start justify-between gap-6">

      <div>

        <p className="text-sm font-bold tracking-[0.35em] text-cyan-300">
          {eyebrow}
        </p>

        <h1 className="mt-3 text-5xl font-black text-white">
          {title}
        </h1>

        {description && (
          <p className="mt-4 max-w-3xl text-slate-400">
            {description}
          </p>
        )}

      </div>

      {children}

    </div>
  );
}