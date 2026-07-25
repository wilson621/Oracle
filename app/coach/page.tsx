import AppLayout from "@/components/layout/AppLayout";
import CapabilityNotice from "@/components/ui/CapabilityNotice";
import EvidenceBoundary from "@/components/ui/EvidenceBoundary";
import PageHeader from "@/components/ui/PageHeader";

export default function CoachPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="WHAT TO DO NEXT"
        title="Coach & Plan"
        description="One evidence-bound development focus, translated into deterministic Missions and an understandable plan."
      />
      <CapabilityNotice
        status="inactive"
        title="A coaching focus needs verified evidence"
        explanation="AI Coach owns coaching focus and presentation, Mission Engine owns deterministic generation, Mission Service owns lifecycle, and Planner owns prioritisation. Their persisted consumers are inactive, so Oracle will not invent a Mission, reward or prediction."
        nextAction="A completed verified Session and factual Session Report will establish the recommendation. Oracle can then present a correlational coaching focus and deterministic Mission without treating AI output as evidence."
        href="/sessions"
        linkLabel="Start with Session Evidence"
      />
      <EvidenceBoundary
        evidence="Required sources: completed Session, factual Report and governed Understanding."
        confidence="Not calculated without admitted evidence."
        freshness="No active coaching or planning projection."
        limitation="Coaching effectiveness remains correlational; no client or model can award progression."
      />
    </AppLayout>
  );
}
