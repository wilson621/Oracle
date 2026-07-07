import { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export default function Panel({
  children,
  className = "",
}: PanelProps) {
  return (
    <section
      className={`
        rounded-3xl
        border
        border-white/10
        bg-white/[0.03]
        p-6
        shadow-lg
        shadow-cyan-500/10
        ${className}
      `}
    >
      {children}
    </section>
  );
}