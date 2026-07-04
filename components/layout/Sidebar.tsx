import Link from "next/link";

const navItems = [
  { label: "Oracle", href: "/oracle" },
  { label: "Reports", href: "/reports" },
  { label: "Loadouts", href: "/loadouts" },
  { label: "Progress", href: "/progress" },
  { label: "Profile", href: "/profile" },
];

export default function Sidebar() {
  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
      <p className="text-xs font-bold tracking-[0.35em] text-cyan-300">
        PROJECT META
      </p>

      <nav className="mt-10 space-y-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}