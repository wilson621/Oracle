import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-white/10
        bg-white/[0.03]
        p-6
        shadow-lg
        shadow-teal-500/5
        transition-all
        duration-300
        hover:border-teal-500/25
        hover:shadow-teal-500/15
        ${className}
      `}
    >
      {children}
    </div>
  );
}