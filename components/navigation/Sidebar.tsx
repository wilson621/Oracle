"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  ScrollText,
  TrendingUp,
  Settings,
  Target,
  RadioTower,
  FileText,
} from "lucide-react";

const navItems = [
  {
    section: "YOUR ORACLE JOURNEY",
    items: [
      { label: "Oracle", href: "/oracle", icon: Brain },
      { label: "Companion", href: "/companion", icon: RadioTower },
      { label: "Sessions", href: "/sessions", icon: ScrollText },
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Intelligence", href: "/intelligence", icon: Brain },
      { label: "Coach & Plan", href: "/coach", icon: Target },
      { label: "Progress", href: "/progress", icon: TrendingUp },
    ],
  },
  {
    section: "CONTROL",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

type SidebarProps = Readonly<{
  compactOnSmallScreens?: boolean;
}>;

export default function Sidebar({
  compactOnSmallScreens = false,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`rounded-3xl border border-slate-800 bg-slate-950/80 ${
        compactOnSmallScreens
          ? "min-w-0 overflow-hidden p-4 lg:overflow-visible lg:p-6"
          : "p-6"
      }`}
    >
      <p className="text-xs font-bold tracking-[0.35em] text-cyan-300">
        ORACLE
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Evidence-led player intelligence
      </p>

      <div
        className={
          compactOnSmallScreens
            ? "mt-5 flex min-w-0 max-w-full flex-wrap gap-3 lg:mt-10 lg:block lg:space-y-8"
            : "mt-10 space-y-8"
        }
      >
        {navItems.map((section) => (
          <div
            key={section.section}
            className={
              compactOnSmallScreens
                ? "min-w-0"
                : undefined
            }
          >
            <p
              className={`mb-3 text-[10px] font-bold tracking-[0.3em] text-slate-500 ${
                compactOnSmallScreens
                  ? "sr-only lg:not-sr-only"
                  : ""
              }`}
            >
              {section.section}
            </p>

            <nav
              className={
                compactOnSmallScreens
                  ? "flex flex-wrap gap-2 lg:block lg:space-y-2"
                  : "space-y-2"
              }
              aria-label={section.section}
            >
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href === "/settings" &&
                    (pathname === "/profile" ||
                      pathname.startsWith("/account/")));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      active
                        ? "bg-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)]"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                    aria-current={active ? "page" : undefined}
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
