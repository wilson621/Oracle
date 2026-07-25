import AppLayout from "@/components/layout/AppLayout";
import CapabilityNotice from "@/components/ui/CapabilityNotice";
import EvidenceBoundary from "@/components/ui/EvidenceBoundary";
import PageHeader from "@/components/ui/PageHeader";

export default function ReportsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="DETERMINISTIC ANALYSIS"
        title="Session Reports"
        description="Evidence-bound explanations of what happened, why it mattered and what deserves attention next."
      />
      <CapabilityNotice
        status="inactive"
        title="No authoritative report can be generated"
        explanation="The Session Report Service is implemented and owns report generation. It requires admitted Evidence from a completed authoritative Session. No persisted Session consumer is active, so Oracle will not manufacture an analysis."
        nextAction="After a completed Session is admitted through the approved Game Integration boundary, deterministic engines will produce the factual report. Optional model enrichment may improve presentation but can never become factual authority."
        href="/sessions"
        linkLabel="Review Session authority"
      />
      <EvidenceBoundary
        evidence="Required source: verified completed Session Evidence."
        confidence="No score is shown because no admissible report exists."
        freshness="No report timestamp exists."
        limitation="Prompt-only analysis and fabricated reports are permanently retired."
      />
    </AppLayout>
  );
}
