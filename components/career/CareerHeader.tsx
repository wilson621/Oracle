type CareerHeaderProps = {
  level: number;
};

export default function CareerHeader({
  level,
}: CareerHeaderProps) {
  return (
    <>
      <p className="text-sm font-bold tracking-[0.35em] text-teal-300">
        OPERATOR CAREER
      </p>

      <h1 className="mt-3 text-6xl font-black text-white">
        Level {level}
      </h1>
    </>
  );
}