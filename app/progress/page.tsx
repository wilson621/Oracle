import AppLayout from "@/components/layout/AppLayout";
import CapabilityNotice from "@/components/ui/CapabilityNotice";
import EvidenceBoundary from "@/components/ui/EvidenceBoundary";
import PageHeader from "@/components/ui/PageHeader";

export default function ProgressPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="VERIFIED DEVELOPMENT"
        title="Progress"
        description="XP, Achievements and long-term development reflect demonstrated improvement—not arbitrary engagement."
      />
      <CapabilityNotice
        status="inactive"
        title="No progression ledger is active"
        explanation="The Progression Service is the sole authority for deterministic, exactly-once XP and Achievement accounting. Runtime persistence and persisted consumers remain disabled, so Oracle cannot present earned awards or a progress total."
        nextAction="Verified completed Session Evidence may satisfy an authoritative Mission. Only the Progression Service can then account for XP or Achievements exactly once."
        href="/coach"
        linkLabel="Understand the development path"
      />
      <EvidenceBoundary
        evidence="No verified progression event has been admitted."
        confidence="Certain: no client-side or AI award is accepted."
        freshness="No active ledger projection."
        limitation="Career and Achievements are consolidated here; fabricated totals and browser-owned mutation are retired."
      />
    </AppLayout>
  );
}
