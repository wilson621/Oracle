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
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[260px_1fr]">
        <Sidebar
          compactOnSmallScreens={
            compactNavigationOnSmallScreens
          }
        />

        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
