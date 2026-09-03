import Link from "next/link";
import {
  Fingerprint,
  KeyRound,
  MonitorCheck,
  ShieldCheck,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import ToggleWatchHotkeySettings from "@/components/settings/ToggleWatchHotkeySettings";

const settings = [
  {
    href: "/profile",
    icon: Fingerprint,
    title: "Identity",
    description:
      "Display Name, Callsign and change-token controls for your permanent Operator.",
  },
  {
    href: "/account/security",
    icon: KeyRound,
    title: "Account security",
    description:
      "Password, Passkey, Magic Link and trusted-session controls with recent authentication.",
  },
] as const;

export default function SettingsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="OPERATOR CONTROL"
        title="Settings & Trust"
        description="Your permanent identity, credential security, privacy boundaries and honest runtime status in one place."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {settings.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="rounded-3xl border border-slate-800 bg-black/25 p-6 transition hover:border-cyan-300/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            <Icon aria-hidden="true" className="text-cyan-300" size={28} />
            <h2 className="mt-5 text-2xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-slate-400">{description}</p>
          </Link>
        ))}
      </div>

      <ToggleWatchHotkeySettings />

      <section className="mt-6 rounded-3xl border border-slate-800 bg-black/25 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <ShieldCheck
            aria-hidden="true"
            className="shrink-0 text-cyan-300"
            size={28}
          />
          <div>
            <h2 className="text-2xl font-black">Privacy and authority</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>
                Companion screen observation frames are transient, local and
                never uploaded. Watch &amp; Coach is separate and manual: it
                only captures while you press Start Watching, and uploads a
                bounded, curated set of frames from that session solely to
                generate your coaching report.
              </li>
              <li>Observation is off by default and requires visible consent.</li>
              <li>Models and renderers cannot mutate Oracle truth.</li>
              <li>Runtime persistence and persisted producers remain disabled.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-amber-400/20 bg-amber-400/[0.06] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <MonitorCheck
            aria-hidden="true"
            className="shrink-0 text-amber-300"
            size={28}
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200">
              Compatibility status
            </p>
            <h2 className="mt-3 text-2xl font-black">
              The primary game integration remains the first proving ground
            </h2>
            <p className="mt-3 leading-7 text-slate-300">
              Minecraft is a bounded reference profile only. Its certificate
              remains provisionally certified, live observation remains
              disabled and Oracle makes no operational-support claim.
            </p>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
