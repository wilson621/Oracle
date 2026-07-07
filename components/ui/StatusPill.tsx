type StatusPillTone =
  | "success"
  | "warning"
  | "danger"
  | "default";

type StatusPillProps = {
  label: string;
  tone?: StatusPillTone;
};

function getToneClasses(tone: StatusPillTone) {
  switch (tone) {
    case "success":
      return {
        dot: "bg-emerald-400",
        pill: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      };

    case "warning":
      return {
        dot: "bg-amber-400",
        pill: "border-amber-500/20 bg-amber-500/10 text-amber-300",
      };

    case "danger":
      return {
        dot: "bg-rose-400",
        pill: "border-rose-500/20 bg-rose-500/10 text-rose-300",
      };

    default:
      return {
        dot: "bg-cyan-400",
        pill: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
      };
  }
}

export default function StatusPill({
  label,
  tone = "default",
}: StatusPillProps) {
  const colours = getToneClasses(tone);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold uppercase tracking-[0.15em] ${colours.pill}`}
    >
      <div
        className={`h-2.5 w-2.5 rounded-full ${colours.dot}`}
      />

      {label}
    </div>
  );
}