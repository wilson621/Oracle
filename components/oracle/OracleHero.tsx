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

      <h2 className="text-5xl font-bold tracking-tight">
        Tell Oracle what happened.
      </h2>

      <p className="mt-4 max-w-2xl text-slate-400">
        Describe the fight. Oracle will break down what cost you the engagement
        and what to do differently next time.
      </p>
    </div>
  );
}