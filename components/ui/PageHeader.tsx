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
    <header className="mb-8 flex flex-col items-start justify-between gap-6 sm:mb-10 sm:flex-row">

      <div>

        <p className="text-sm font-bold tracking-[0.35em] text-teal-300">
          {eyebrow}
        </p>

        <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
          {title}
        </h1>

        {description && (
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
            {description}
          </p>
        )}

      </div>

      {children}

    </header>
  );
}
