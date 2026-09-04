type StatCardProps = {
  label: string;
  value: string | number;
};

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-4xl font-bold text-teal-300">{value}</p>
    </div>
  );
}