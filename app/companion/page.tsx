import CompanionGuidanceDashboard from "@/components/companion/guidance/CompanionGuidanceDashboard";
import AppLayout from "@/components/layout/AppLayout";
import {
  COMPANION_PAGE_INITIAL_STATE,
} from "./companion-page-state";

export default function CompanionPage() {
  return (
    <AppLayout
      compactNavigationOnSmallScreens
    >
      <CompanionGuidanceDashboard
        state={
          COMPANION_PAGE_INITIAL_STATE
        }
      />
    </AppLayout>
  );
}
