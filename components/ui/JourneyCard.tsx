import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export default function JourneyCard({
  href,
  icon: Icon,
  eyebrow,
  title,
  description,
  status,
}: Readonly<{
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  status: string;
}>) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-800 bg-black/25 p-6 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
          <Icon aria-hidden="true" size={22} />
        </div>
        <ArrowRight
          aria-hidden="true"
          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300"
          size={20}
        />
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-black text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
      <p className="mt-5 text-xs font-semibold text-slate-400">{status}</p>
    </Link>
  );
}
