import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, CircleOff, ShieldCheck } from "lucide-react";

type CapabilityStatus = "inactive" | "unavailable" | "deferred";

const STATUS_PRESENTATION = {
  inactive: {
    label: "Implemented · inactive",
    icon: ShieldCheck,
    className: "border-blue-400/25 bg-blue-400/[0.07] text-blue-100",
  },
  unavailable: {
    label: "Unavailable in this environment",
    icon: CircleOff,
    className: "border-slate-600 bg-slate-900/70 text-slate-200",
  },
  deferred: {
    label: "Deferred · fail-closed",
    icon: AlertTriangle,
    className: "border-amber-400/25 bg-amber-400/[0.07] text-amber-100",
  },
} as const;

export default function CapabilityNotice({
  status,
  title,
  explanation,
  nextAction,
  href,
  linkLabel,
  children,
}: Readonly<{
  status: CapabilityStatus;
  title: string;
  explanation: string;
  nextAction: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}>) {
  const presentation = STATUS_PRESENTATION[status];
  const Icon = presentation.icon;

  return (
    <section
      className={`rounded-3xl border p-6 sm:p-8 ${presentation.className}`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-current/20 bg-black/20">
          <Icon aria-hidden="true" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.28em] opacity-75">
            {presentation.label}
          </p>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl leading-7 opacity-85">{explanation}</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] opacity-70">
              What happens next
            </p>
            <p className="mt-2 text-sm leading-6">{nextAction}</p>
          </div>
          {children}
          {href && linkLabel ? (
            <Link
              href={href}
              className="mt-6 inline-flex rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            >
              {linkLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
