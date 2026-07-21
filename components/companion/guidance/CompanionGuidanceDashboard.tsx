import {
  BookOpenText,
  ShieldCheck,
} from "lucide-react";
import type {
  CompanionGuidanceApplicationState,
} from "@/lib/oracle/applications/companion";
import CompanionGuidanceCard from "./CompanionGuidanceCard";
import CompanionGuidanceDiagnostics from "./CompanionGuidanceDiagnostics";
import CompanionGuidanceStatePanel from "./CompanionGuidanceStatePanel";
import styles from "./companion-guidance.module.css";

type CompanionGuidanceDashboardProps =
  Readonly<{
    state:
      CompanionGuidanceApplicationState;
  }>;

export default function CompanionGuidanceDashboard({
  state,
}: CompanionGuidanceDashboardProps) {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>
          <span
            className={styles.signal}
            aria-hidden="true"
          />
          Companion intelligence
        </div>

        <div className={styles.headerLayout}>
          <div>
            <h1 className={styles.title}>
              Your second screen
            </h1>
            <p className={styles.introduction}>
              Calm, contextual coaching that
              helps you understand what to
              practise and why.
            </p>
          </div>

          <div
            className={styles.trustStatement}
            aria-label="External Companion protection"
          >
            <ShieldCheck
              size={18}
              aria-hidden="true"
            />
            <span>
              External. Advisory.
              Operator controlled.
            </span>
          </div>
        </div>
      </header>

      <CompanionGuidanceDiagnostics
        diagnostics={state.diagnostics}
      />

      <GuidanceStateContent
        state={state}
      />
    </div>
  );
}

function GuidanceStateContent({
  state,
}: CompanionGuidanceDashboardProps) {
  switch (state.status) {
    case "loading":
      return (
        <CompanionGuidanceStatePanel
          status="loading"
          message={state.message}
        />
      );

    case "empty":
      return (
        <CompanionGuidanceStatePanel
          status="empty"
          message={state.message}
        />
      );

    case "unavailable":
      return (
        <CompanionGuidanceStatePanel
          status="unavailable"
          message={state.message}
        />
      );

    case "ready":
      return (
        <GuidanceCollection
          state={state}
        />
      );

    case "partial-success":
      return (
        <GuidanceCollection
          state={state}
        />
      );
  }
}

function GuidanceCollection({
  state,
}: CompanionGuidanceDashboardProps) {
  return (
    <section
      className={styles.guidanceSection}
      aria-labelledby="companion-guidance-heading"
    >
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>
            Current guidance
          </p>
          <h2
            id="companion-guidance-heading"
            className={styles.sectionTitle}
          >
            Recommended next steps
          </h2>
        </div>

        <div
          className={styles.guidanceCount}
          aria-label={`${state.cards.length} guidance ${state.cards.length === 1 ? "card" : "cards"}`}
        >
          <BookOpenText
            size={16}
            aria-hidden="true"
          />
          {state.cards.length}
        </div>
      </div>

      <p
        className={styles.stateMessage}
        role="status"
      >
        {state.message}
      </p>

      <div className={styles.cardGrid}>
        {state.cards.map(
          (card, index) => (
            <CompanionGuidanceCard
              key={card.id}
              card={card}
              headingId={`companion-guidance-card-${index + 1}`}
            />
          )
        )}
      </div>
    </section>
  );
}
