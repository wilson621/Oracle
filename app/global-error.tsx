"use client";

export default function GlobalError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070A10] text-white">
        <main className="grid min-h-screen place-items-center px-6 py-12">
          <section className="w-full max-w-2xl rounded-3xl border border-red-400/20 bg-slate-950 p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-300">
              Oracle recovery
            </p>
            <h1 className="mt-4 text-4xl font-black">
              This view could not be completed
            </h1>
            <p className="mt-5 leading-7 text-slate-400">
              Oracle has not inferred or changed any product state from this
              failure. Retry with a fresh presentation request.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
