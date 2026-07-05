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
  Trophy,
  Medal,
  Target,
} from "lucide-react";

const navItems = [
  {
    section: "ANALYSIS",
    items: [
      { label: "Oracle", href: "/oracle", icon: Brain },
      { label: "Session History", href: "/sessions", icon: ScrollText },
      { label: "AI Coach", href: "/coach", icon: Target },
      { label: "AI Memory", href: "/memory", icon: DatabaseZap },
      { label: "Intelligence", href: "/intelligence", icon: Brain },
      { label: "Oracle DNA", href: "/dna", icon: Dna },
    ],
  },
  {
    section: "OPERATOR",
    items: [
      { label: "Operator", href: "/operator", icon: User },
      { label: "Career", href: "/career", icon: Trophy },
      { label: "Achievements", href: "/achievements", icon: Medal },
      { label: "Loadouts", href: "/loadouts", icon: Crosshair },
      { label: "Combat Progress", href: "/progress", icon: TrendingUp },
    ],
  },
  {
    section: "SYSTEM",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
      <p className="text-xs font-bold tracking-[0.35em] text-cyan-300">
        PROJECT META
      </p>

      <div className="mt-10 space-y-8">
        {navItems.map((section) => (
          <div key={section.section}>
            <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-slate-500">
              {section.section}
            </p>

            <nav className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      active
                        ? "bg-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)]"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}