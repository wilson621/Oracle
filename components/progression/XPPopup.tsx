"use client";

type XPPopupProps = {
  earnedXp: number;
  levelUp: boolean;
  level: number;
  onClose: () => void;
};

export default function XPPopup({
  earnedXp,
  levelUp,
  level,
  onClose,
}: XPPopupProps) {
  return (
    <div className="fixed right-8 top-36 z-50 w-96 rounded-3xl border border-teal-400/40 bg-slate-950 p-6 shadow-[0_0_28px_rgba(64,174,174,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.35em] text-teal-300">
            XP GAINED
          </p>

          <h2 className="mt-4 text-4xl font-black text-white">
            +{earnedXp} XP
          </h2>

          {levelUp && (
            <p className="mt-3 text-lg font-bold text-teal-300">
              LEVEL UP! Level {level}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-400 hover:border-teal-400 hover:text-teal-300"
        >
          ×
        </button>
      </div>
    </div>
  );
}