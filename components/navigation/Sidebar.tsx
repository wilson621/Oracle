"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  ScrollText,
  User,
  Crosshair,
  TrendingUp,
  Settings,
  DatabaseZap,
  Dna,
} from "lucide-react";

const navItems = [
  { label: "Oracle", href: "/oracle", icon: Brain },
  { label: "Session History", href: "/sessions", icon: ScrollText },
  { label: "AI Memory", href: "/memory", icon: DatabaseZap },
  { label: "Intelligence", href: "/intelligence", icon: Brain },
  { label: "Oracle DNA", href: "/dna", icon: Dna },
  { label: "Operator", href: "/operator", icon: User },
  { label: "Loadouts", href: "/loadouts", icon: Crosshair },
  { label: "Combat Progress", href: "/progress", icon: TrendingUp },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
      <p className="text-xs font-bold tracking-[0.35em] text-cyan-300">
        PROJECT META
      </p>

      <nav className="mt-10 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-cyan-400 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.25)]"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}