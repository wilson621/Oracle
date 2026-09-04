type BadgeProps = {
  children: React.ReactNode;
};

export default function Badge({
  children,
}: BadgeProps) {
  return (
    <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-bold tracking-wide text-teal-300">
      {children}
    </span>
  );
}