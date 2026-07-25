import AppLayout from "@/components/layout/AppLayout";
import CapabilityNotice from "@/components/ui/CapabilityNotice";
import EvidenceBoundary from "@/components/ui/EvidenceBoundary";
import PageHeader from "@/components/ui/PageHeader";

export default function LoadoutsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="CAPABILITY DEFERRED"
        title="Loadout Intelligence"
        description="Personal equipment recommendations require verified Operator performance and current game evidence."
      />
      <CapabilityNotice
        status="deferred"
        title="Loadout recommendations are not available"
        explanation="The previous page depended on hard-coded weapon performance. That production mock path has been removed. Oracle has no approved active evidence feed for truthful personalised loadout decisions."
        nextAction="This surface can return only after governed first-party game evidence and current game data are admitted through an approved authoritative boundary. Until then it remains outside primary navigation."
        href="/oracle"
        linkLabel="Return to Oracle"
      />
      <EvidenceBoundary
        evidence="None admitted for current weapons or Operator performance."
        confidence="No recommendation or simulated probability is shown."
        freshness="No governed meta version or verification time."
        limitation="The primary game integration remains the first proving ground, but that does not authorise fabricated loadout advice."
      />
    </AppLayout>
  );
}
