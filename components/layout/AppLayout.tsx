import Sidebar from "@/components/navigation/Sidebar";

type AppLayoutProps = {
  children: React.ReactNode;
  compactNavigationOnSmallScreens?:
    boolean;
};

export default function AppLayout({
  children,
  compactNavigationOnSmallScreens = false,
}: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-[#070A10] text-white">
      <a
        href="#oracle-main-content"
        className="fixed left-4 top-4 z-[11000] -translate-y-24 rounded-xl bg-teal-300 px-4 py-3 font-bold text-slate-950 transition focus:translate-y-0"
      >
        Skip to main content
      </a>
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 gap-5 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <Sidebar
          compactOnSmallScreens={
            compactNavigationOnSmallScreens
          }
        />

        <section
          id="oracle-main-content"
          tabIndex={-1}
          className="min-w-0 rounded-3xl border border-slate-800 bg-slate-950/60 p-5 outline-none sm:p-8 lg:p-10"
        >
          {children}
        </section>
      </div>
    </main>
  );
}
