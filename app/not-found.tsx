import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

export default function NotFound() {
  return (
    <AppLayout>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-teal-300">
        Route unavailable
      </p>
      <h1 className="mt-4 text-4xl font-black sm:text-5xl">
        Oracle cannot find that destination
      </h1>
      <p className="mt-5 max-w-2xl leading-7 text-slate-400">
        The route may have been consolidated into the canonical Beta journey.
        No capability is implied by a missing or retired address.
      </p>
      <Link
        href="/oracle"
        className="mt-8 inline-flex rounded-xl bg-teal-300 px-5 py-3 font-bold text-slate-950 hover:bg-teal-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200"
      >
        Return to Oracle
      </Link>
    </AppLayout>
  );
}
