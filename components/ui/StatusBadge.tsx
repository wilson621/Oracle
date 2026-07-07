type BadgeVariant =
  | "cyan"
  | "green"
  | "amber"
  | "red"
  | "slate";

type StatusBadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
};

const styles: Record<BadgeVariant, string> = {
  cyan:
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",

  green:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",

  amber:
    "border-amber-500/30 bg-amber-500/10 text-amber-300",

  red:
    "border-rose-500/30 bg-rose-500/10 text-rose-300",

  slate:
    "border-white/10 bg-white/[0.04] text-slate-300",
};

export default function StatusBadge({
  children,
  variant = "cyan",
}: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-4
        py-2
        text-sm
        font-semibold
        transition-all
        duration-300
        ${styles[variant]}
      `}
    >
      {children}
    </span>
  );
}