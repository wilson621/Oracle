import type { LucideIcon } from "lucide-react";
import StatusPill from "@/components/ui/StatusPill";

type DossierFieldTone = "default" | "success" | "warning" | "danger";

type DossierFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: DossierFieldTone;
  display?: "text" | "pill";
  emphasis?: "normal" | "strong";
  nowrap?: boolean;
};

function toneClasses(tone: DossierFieldTone) {
  switch (tone) {
    case "success":
      return "border-emerald-500/20 bg-emerald-500/5 text-emerald-300";
    case "warning":
      return "border-amber-500/20 bg-amber-500/5 text-amber-300";
    case "danger":
      return "border-rose-500/20 bg-rose-500/5 text-rose-300";
    default:
      return "border-teal-500/20 bg-teal-500/5 text-teal-300";
  }
}

export default function DossierField({
  icon: Icon,
  label,
  value,
  tone = "default",
  display = "text",
  emphasis = "normal",
  nowrap = false,
}: DossierFieldProps) {
  return (
    <div className="flex min-h-[132px] flex-col rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl border p-2 ${toneClasses(tone)}`}>
          <Icon size={18} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
      </div>

      <div className="mt-auto pt-5">
        {display === "pill" ? (
          <StatusPill label={String(value)} tone={tone} />
        ) : (
          <p
            className={
              emphasis === "strong"
                ? "whitespace-nowrap text-[1.7rem] font-black tracking-tight text-white"
                : `${
                    nowrap ? "whitespace-nowrap text-base" : "text-lg"
                  } font-black text-white`
            }
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}