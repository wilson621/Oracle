import AppLayout from "@/components/layout/AppLayout";
import CapabilityNotice from "@/components/ui/CapabilityNotice";
import EvidenceBoundary from "@/components/ui/EvidenceBoundary";
import PageHeader from "@/components/ui/PageHeader";

export default function IntelligencePage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="WHAT ORACLE KNOWS"
        title="Operator Intelligence"
        description="Governed strengths, weaknesses and recurring patterns—purpose-scoped, evidence-linked and honest about uncertainty."
      />
      <CapabilityNotice
        status="inactive"
        title="Oracle has no active Understanding Snapshot"
        explanation="Governed Operator Understanding is implemented with stable identities, replay suppression, contradiction, dispute, expiry, supersession and deletion controls. Persisted accumulation and consumption remain disabled, so no current claim can be presented."
        nextAction="Verified Session Evidence must first produce governed observations. Oracle can then accumulate recurring patterns and project a fresh, purpose-scoped Understanding Snapshot without creating an independent memory record."
        href="/reports"
        linkLabel="See how evidence becomes analysis"
      />
      <EvidenceBoundary
        evidence="No admitted Understanding claim is available."
        confidence="Unknown—not replaced with a default score."
        freshness="No active Snapshot or as-of time."
        limitation="Legacy AI Memory and Player DNA calculations have been retired from the product journey."
      />
    </AppLayout>
  );
}
