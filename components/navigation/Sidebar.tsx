"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, RadioTower, Crosshair } from "lucide-react";

// Sessions, Reports, Intelligence, Coach & Plan and Progress are deliberately
// left out of navigation (not deleted -- 2026-09-04): their pages are
// leftover scaffolding from an earlier, much larger design that was never
// actually built, and currently show dense "implemented and certified but
// inactive" placeholder text that reads like a broken feature rather than
// an honest "coming soon". Add each one back in here once it's either
// genuinely built or replaced with real placeholder copy.
//
// The "Oracle" tab itself was retired the same way (2026-09-04): it was the
// app's landing page, but its generic chat was a non-functional duplicate of
// "Ask Oracle about this report" (a real, working per-report chat -- see
// components/companion/matchrecording/ReportChat.tsx), and 3 of its 4
// "journey" links pointed at the hidden pages described above. Companion is
// now the landing page instead (see app/page.tsx and
// ORACLE_AUTH_ROUTES.authenticatedHome).
const navItems = [
  {
    section: "YOUR ORACLE JOURNEY",
    items: [
      { label: "Companion", href: "/companion", icon: RadioTower },
      { label: "Loadouts", href: "/loadouts", icon: Crosshair },
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
      <p className="text-xs font-bold tracking-[0.35em] text-teal-300">
        ORACLE
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-400">
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
              className={`mb-3 text-[10px] font-bold tracking-[0.3em] text-slate-400 ${
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
                        ? "bg-teal-400 text-slate-950 shadow-[0_0_16px_rgba(64,174,174,0.2)]"
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
