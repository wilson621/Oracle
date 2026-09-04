import type { Metadata } from "next";
import { connection } from "next/server";
import {
  getServerPublicRuntimeConfiguration,
  ORACLE_RUNTIME_SUPABASE_ANON_KEY_META,
  ORACLE_RUNTIME_SUPABASE_URL_META,
} from "@/lib/oracle/services/runtime-configuration";
// Self-hosted variable fonts (Fontsource) rather than next/font/google:
// next/font/google fetches font files from Google at build time, which
// this environment's network policy blocks. Fontsource ships the actual
// woff2 files as npm packages, so the build never depends on reaching
// Google at all -- on any machine. These register 'Inter Variable' and
// 'JetBrains Mono Variable', wired to --font-geist-sans / --font-geist-mono
// in app/globals.css, which every component already reads via Tailwind's
// font-sans / font-mono utilities. No component changes needed.
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Oracle",
    template: "%s | Oracle",
  },
  description: "Your intelligence system for competitive gaming.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const runtime = getServerPublicRuntimeConfiguration();

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta
          name={ORACLE_RUNTIME_SUPABASE_URL_META}
          content={runtime.supabaseUrl}
        />
        <meta
          name={ORACLE_RUNTIME_SUPABASE_ANON_KEY_META}
          content={runtime.supabaseAnonKey}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
