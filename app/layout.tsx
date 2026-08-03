import type { Metadata } from "next";
import { connection } from "next/server";
import {
  getServerPublicRuntimeConfiguration,
  ORACLE_RUNTIME_SUPABASE_ANON_KEY_META,
  ORACLE_RUNTIME_SUPABASE_URL_META,
} from "@/lib/oracle/services/runtime-configuration";
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
