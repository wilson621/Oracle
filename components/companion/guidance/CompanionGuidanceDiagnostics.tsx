import {
  CircleAlert,
} from "lucide-react";
import type {
  CompanionGuidanceDiagnosticViewModel,
} from "@/lib/oracle/applications/companion";
import styles from "./companion-guidance.module.css";

type CompanionGuidanceDiagnosticsProps =
  Readonly<{
    diagnostics:
      readonly CompanionGuidanceDiagnosticViewModel[];
  }>;

export default function CompanionGuidanceDiagnostics({
  diagnostics,
}: CompanionGuidanceDiagnosticsProps) {
  if (diagnostics.length === 0) {
    return null;
  }

  return (
    <section
      className={styles.diagnostics}
      aria-label="Companion guidance status"
      role="status"
      aria-live="polite"
    >
      {diagnostics.map((diagnostic) => (
        <article
          key={diagnostic.code}
          className={styles.diagnostic}
        >
          <CircleAlert
            size={18}
            aria-hidden="true"
          />
          <div>
            <h2>{diagnostic.title}</h2>
            <p>{diagnostic.message}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
