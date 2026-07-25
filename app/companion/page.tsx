import CompanionGuidanceLive from "@/components/companion/guidance/CompanionGuidanceLive";
import AppLayout from "@/components/layout/AppLayout";
import {
  COMPANION_PAGE_INITIAL_STATE,
} from "./companion-page-state";

export default function CompanionPage() {
  return (
    <AppLayout
      compactNavigationOnSmallScreens
    >
      <CompanionGuidanceLive
        initialState={COMPANION_PAGE_INITIAL_STATE}
      />
    </AppLayout>
  );
}
