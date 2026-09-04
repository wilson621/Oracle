type OracleCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function OracleCard({ title, children }: OracleCardProps) {
  return (
    <div className="rounded-3xl border border-teal-400/20 bg-teal-400/10 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-xl font-bold text-teal-300">{title}</h3>
      {children}
    </div>
  );
}