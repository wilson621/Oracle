import CompanionGuidanceLive from "@/components/companion/guidance/CompanionGuidanceLive";
import MatchRecordingControl from "@/components/companion/matchrecording/MatchRecordingControl";
import MatchVideoRecordingControl from "@/components/companion/matchrecording/MatchVideoRecordingControl";
import AppLayout from "@/components/layout/AppLayout";
import {
  COMPANION_PAGE_INITIAL_STATE,
} from "./companion-page-state";
import EvidenceBoundary from "@/components/ui/EvidenceBoundary";

export default function CompanionPage() {
  return (
    <AppLayout
      compactNavigationOnSmallScreens
    >
      <CompanionGuidanceLive
        initialState={COMPANION_PAGE_INITIAL_STATE}
      />
      <MatchRecordingControl />
      <MatchVideoRecordingControl />
      <EvidenceBoundary
        evidence="Only validated, current Guidance Requests from approved Game Integrations."
        confidence="Each Guidance card carries its own governed confidence."
        freshness="Detach, Context change and stale async results invalidate delivery."
        limitation="The primary game integration remains the first proving ground. The second reference profile remains provisional and observation disabled."
      />
    </AppLayout>
  );
}
