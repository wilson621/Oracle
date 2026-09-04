import Image from "next/image";

type OracleHeroProps = {
  isAnalysing: boolean;
};

export default function OracleHero({ isAnalysing }: OracleHeroProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <Image
        src="/images/oracle-eye.png"
        alt="Oracle Eye"
        width={500}
        height={250}
        priority
        className={`mb-8 h-auto transition-all duration-700 ${
          isAnalysing
            ? "scale-105 drop-shadow-[0_0_35px_rgba(34,211,238,0.9)]"
            : "drop-shadow-[0_0_20px_rgba(34,211,238,0.45)]"
        }`}
      />

      <p className="text-xs font-bold uppercase tracking-[0.35em] text-teal-300">
        YOUR EVIDENCE-LED GUIDE
      </p>
      <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
        Know what matters next.
      </h1>

      <p className="mt-4 max-w-2xl text-slate-400">
        Oracle explains governed knowledge from your Sessions, Reports,
        Understanding and development plan. It shows its evidence and tells
        you when the required sources are not active.
      </p>
    </div>
  );
}
