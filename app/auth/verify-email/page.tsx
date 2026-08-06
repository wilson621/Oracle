import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#070A10] px-6 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-cyan-400/20 bg-slate-950/90 p-10 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan-300">
          Identity verification
        </p>
        <h1 className="mt-5 text-4xl font-black">Verify your email</h1>
        <p className="mt-5 leading-7 text-slate-300">
          Oracle sent a verification link to your email address. Your Account
          exists, but Operator commissioning and protected access remain
          unavailable until that link is confirmed.
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Verification preserves one permanent Operator identity while
          credentials and presentation can change over time.
        </p>
        <Link
          href="/auth"
          className="mt-8 inline-flex rounded-xl border border-cyan-300/30 px-5 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-300/10"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
