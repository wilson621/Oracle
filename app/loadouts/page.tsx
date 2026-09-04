import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadoutIntelligenceControl from "@/components/loadouts/LoadoutIntelligenceControl";

export default function LoadoutsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="LOADOUT INTELLIGENCE"
        title="Your build, not the meta build"
        description="Tell Oracle what you're after and it searches for real, current weapon data and tailors it to how you actually play -- built from your Full Match Analysis reports, not a generic tier list."
      />
      <LoadoutIntelligenceControl />
    </AppLayout>
  );
}
