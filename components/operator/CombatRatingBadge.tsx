type CombatRank =
  | "Recruit"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Elite"
  | "Oracle";

const styles: Record<
  CombatRank,
  {
    bg: string;
    border: string;
    text: string;
  }
> = {
  Recruit: {
    bg: "bg-slate-800",
    border: "border-slate-600",
    text: "text-slate-200",
  },
  Bronze: {
    bg: "bg-amber-900/30",
    border: "border-amber-600",
    text: "text-amber-300",
  },
  Silver: {
    bg: "bg-slate-700",
    border: "border-slate-300",
    text: "text-slate-100",
  },
  Gold: {
    bg: "bg-yellow-900/30",
    border: "border-yellow-500",
    text: "text-yellow-300",
  },
  Platinum: {
    bg: "bg-teal-900/30",
    border: "border-teal-400",
    text: "text-teal-300",
  },
  Diamond: {
    bg: "bg-blue-900/30",
    border: "border-blue-400",
    text: "text-blue-300",
  },
  Elite: {
    bg: "bg-purple-900/30",
    border: "border-purple-400",
    text: "text-purple-300",
  },
  Oracle: {
    bg: "bg-teal-400/10",
    border: "border-teal-300",
    text: "text-teal-300",
  },
};

export default function CombatRatingBadge({
  rank,
}: {
  rank: CombatRank;
}) {
  const style = styles[rank];

  return (
    <div
      className={`rounded-2xl border px-5 py-3 text-center ${style.bg} ${style.border}`}
    >
      <p className="text-xs tracking-[0.3em] text-slate-400">
        COMBAT RATING
      </p>

      <h2 className={`mt-2 text-3xl font-black ${style.text}`}>
        {rank}
      </h2>
    </div>
  );
}