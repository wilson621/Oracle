import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { Search, ScrollText } from "lucide-react";

export default function SessionsPage() {
  return (
    <AppLayout>
      <div>
        <p className="text-sm font-semibold tracking-[0.35em] text-cyan-300">
          SESSION HISTORY
        </p>

        <h1 className="mt-3 text-4xl font-bold">Session History</h1>

        <p className="mt-4 max-w-2xl text-slate-400">
          Review every Oracle Session, track your decisions, and watch your
          improvement over time.
        </p>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-slate-500">
          <Search size={18} />
          <input
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            placeholder="Search Oracle Sessions..."
          />
        </div>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            <ScrollText size={32} />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-white">
            No Oracle Sessions yet.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Every great player starts somewhere. Complete your first Oracle
            Session to begin tracking your improvement.
          </p>

          <Link
            href="/oracle"
            className="mt-8 inline-flex rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 hover:bg-cyan-300"
          >
            Analyse My First Fight
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}