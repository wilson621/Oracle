export default function EvidenceBoundary({
  evidence,
  confidence,
  freshness,
  limitation,
}: Readonly<{
  evidence: string;
  confidence: string;
  freshness: string;
  limitation: string;
}>) {
  return (
    <section
      className="mt-6 grid gap-3 rounded-3xl border border-slate-800 bg-black/25 p-5 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Evidence and limitations"
    >
      {[
        ["Evidence", evidence],
        ["Confidence", confidence],
        ["Freshness", freshness],
        ["Limitation", limitation],
      ].map(([label, value]) => (
        <div key={label} className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
        </div>
      ))}
    </section>
  );
}
