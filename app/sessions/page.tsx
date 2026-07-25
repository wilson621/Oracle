import AppLayout from "@/components/layout/AppLayout";
import CapabilityNotice from "@/components/ui/CapabilityNotice";
import EvidenceBoundary from "@/components/ui/EvidenceBoundary";
import PageHeader from "@/components/ui/PageHeader";

export default function SessionsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="AUTHORITATIVE EVIDENCE"
        title="Sessions"
        description="The Session Service is the sole owner of Oracle's historical record of player activity."
      />
      <CapabilityNotice
        status="inactive"
        title="Session history is not active yet"
        explanation="The authoritative Session lifecycle is implemented and certified, but runtime persistence and persisted producers remain disabled. Oracle therefore has no durable Session history to present in this environment."
        nextAction="When separately activated, the Desktop Companion will correlate live Context to the Session Service without taking lifecycle ownership. Completed Sessions will then become the governed evidence source for Reports, Intelligence, Coaching and Progress."
        href="/companion"
        linkLabel="Check Companion readiness"
      />
      <EvidenceBoundary
        evidence="No durable Session Evidence is admitted in this environment."
        confidence="Certain: persistence and producers are explicitly disabled."
        freshness="Runtime status verified by manifest 1.6.0."
        limitation="An empty list would imply active collection; Oracle instead reports the inactive lifecycle honestly."
      />
    </AppLayout>
  );
}
