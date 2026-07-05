"use client";

type AchievementPopupProps = {
  open: boolean;
  title: string;
  xp: number;
};

export default function AchievementPopup({
  open,
  title,
  xp,
}: AchievementPopupProps) {
  if (!open) return null;

  return (
    <div className="fixed right-8 top-8 z-50 w-96 animate-[slideIn_.5s_ease] rounded-3xl border border-cyan-400/30 bg-slate-950 p-6 shadow-[0_0_35px_rgba(34,211,238,.25)]">

      <p className="text-xs font-bold tracking-[0.35em] text-cyan-300">
        ACHIEVEMENT UNLOCKED
      </p>

      <h2 className="mt-4 text-3xl font-bold">
        🏆 {title}
      </h2>

      <p className="mt-3 text-lg text-cyan-300">
        +{xp} XP
      </p>

    </div>
  );
}