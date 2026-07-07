type BriefingSectionProps = {
  title: string;
  content: string;
};

export default function BriefingSection({
  title,
  content,
}: BriefingSectionProps) {
  return (
    <div className="border-t border-white/10 pt-5">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
        {title}
      </p>

      <p className="mt-3 text-sm leading-7 text-slate-300">
        {content}
      </p>
    </div>
  );
}