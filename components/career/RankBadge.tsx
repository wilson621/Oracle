type RankBadgeProps = {
  rank: string;
};

const colours: Record<string, string> = {
  Recruit: "from-slate-700 to-slate-600 border-slate-500",
  Bronze: "from-orange-700 to-amber-500 border-amber-400",
  Silver: "from-slate-400 to-slate-200 border-white",
  Gold: "from-yellow-700 to-yellow-400 border-yellow-300",
  Platinum: "from-teal-700 to-teal-400 border-teal-300",
  Diamond: "from-indigo-700 to-violet-500 border-violet-300",
  Elite: "from-red-700 to-red-500 border-red-400",
  Oracle: "from-teal-400 via-sky-300 to-white border-teal-200",
};

export default function RankBadge({ rank }: RankBadgeProps) {
  const colour =
    colours[rank] ??
    "from-slate-700 to-slate-500 border-slate-500";

  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br ${colour} px-8 py-6 text-center shadow-xl`}
    >
      <p className="text-xs font-bold tracking-[0.35em] text-white/70">
        COMBAT RANK
      </p>

      <h2 className="mt-3 text-5xl font-black text-white drop-shadow-lg">
        {rank}
      </h2>
    </div>
  );
}