import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadoutIntelligenceCard from "@/components/loadouts/LoadoutIntelligenceCard";
import { generateLoadoutIntelligenceReport } from "@/lib/oracle/loadouts/loadout-engine";

export default function LoadoutsPage() {
  const report = generateLoadoutIntelligenceReport();

  return (
    <AppLayout>
      <PageHeader
        eyebrow="WEAPON INTELLIGENCE"
        title="Oracle Weapon Intelligence"
        description="Personalised weapon recommendations based on Operator performance, not public meta alone."
      />

      <div className="grid gap-6">
        <LoadoutIntelligenceCard report={report} />
      </div>
    </AppLayout>
  );
}