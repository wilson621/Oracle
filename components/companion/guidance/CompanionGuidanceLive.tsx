"use client";

import { useEffect, useState } from "react";
import type {
  CompanionGuidanceApplicationState,
} from "@/lib/oracle/applications/companion";
import type {
  OracleCompanionGuidanceControl,
} from "@/desktop/contracts";
import CompanionGuidanceDashboard from "./CompanionGuidanceDashboard";
import styles from "./companion-guidance.module.css";

const DEFAULT_CONTROL: OracleCompanionGuidanceControl = {
  category: null,
  maximumSpoilerLevel: "none",
};

export default function CompanionGuidanceLive({
  initialState,
}: Readonly<{
  initialState: CompanionGuidanceApplicationState;
}>) {
  const [state, setState] = useState(initialState);
  const [control, setControl] =
    useState<OracleCompanionGuidanceControl>(DEFAULT_CONTROL);

  useEffect(() => {
    const bridge = window.oracleDesktop;
    if (!bridge) return;
    let active = true;
    void bridge.getCompanionGuidanceState().then((value) => {
      if (active) setState(value);
    }).catch(() => undefined);
    const unsubscribe = bridge.onCompanionGuidanceStateChanged((value) => {
      if (active) setState(value);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function requestGuidance() {
    const bridge = window.oracleDesktop;
    if (!bridge) return;
    try {
      setState(await bridge.requestCompanionGuidance(control));
    } catch {
      // The subscribed renderer-safe state remains the source of presentation.
    }
  }

  return (
    <>
      <section className={styles.controls} aria-label="Guidance controls">
        <label>
          Category
          <select
            value={control.category ?? ""}
            onChange={(event) =>
              setControl({
                ...control,
                category: event.target.value || null,
              })
            }
          >
            <option value="">All approved categories</option>
            <option value="preparation">Preparation</option>
            <option value="operator-development">Operator development</option>
            <option value="performance">Performance</option>
          </select>
        </label>
        <label>
          Maximum spoiler level
          <select
            value={control.maximumSpoilerLevel}
            onChange={(event) =>
              setControl({
                ...control,
                maximumSpoilerLevel:
                  event.target.value as
                    OracleCompanionGuidanceControl["maximumSpoilerLevel"],
              })
            }
          >
            <option value="none">No spoilers</option>
            <option value="minor">Minor</option>
            <option value="major">Major</option>
            <option value="full">Full</option>
          </select>
        </label>
        <button type="button" onClick={requestGuidance}>
          Refresh guidance
        </button>
      </section>
      <CompanionGuidanceDashboard state={state} />
    </>
  );
}
