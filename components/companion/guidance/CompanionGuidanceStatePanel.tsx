import {
  BookOpen,
  LoaderCircle,
  RadioTower,
} from "lucide-react";
import type {
  CompanionGuidanceApplicationStatus,
} from "@/lib/oracle/applications/companion";
import styles from "./companion-guidance.module.css";

type PresentableState = Extract<
  CompanionGuidanceApplicationStatus,
  "loading" | "empty" | "unavailable"
>;

type CompanionGuidanceStatePanelProps =
  Readonly<{
    status: PresentableState;
    message: string;
  }>;

const CONTENT: Readonly<
  Record<
    PresentableState,
    Readonly<{
      eyebrow: string;
      title: string;
      detail: string;
    }>
  >
> = Object.freeze({
  loading: {
    eyebrow: "Preparing guidance",
    title: "Building your briefing",
    detail:
      "Companion is preparing the latest application state. Your game remains untouched.",
  },
  empty: {
    eyebrow: "No current guidance",
    title: "Nothing needs your attention",
    detail:
      "Companion will remain quiet until relevant, supportable guidance is available.",
  },
  unavailable: {
    eyebrow: "Guidance offline",
    title: "Companion is not connected yet",
    detail:
      "No authoritative guidance state is available. Companion will never invent recommendations to fill this space.",
  },
});

export default function CompanionGuidanceStatePanel({
  status,
  message,
}: CompanionGuidanceStatePanelProps) {
  const content = CONTENT[status];
  const Icon = status === "loading"
    ? LoaderCircle
    : status === "empty"
      ? BookOpen
      : RadioTower;

  return (
    <section
      className={styles.statePanel}
      data-state={status}
      role="status"
      aria-live="polite"
      aria-busy={
        status === "loading"
      }
    >
      <div className={styles.stateIcon}>
        <Icon
          size={26}
          aria-hidden="true"
        />
      </div>
      <p className={styles.stateEyebrow}>
        {content.eyebrow}
      </p>
      <h2 className={styles.stateTitle}>
        {content.title}
      </h2>
      <p className={styles.stateMessage}>
        {message}
      </p>
      <p className={styles.stateDetail}>
        {content.detail}
      </p>
    </section>
  );
}
