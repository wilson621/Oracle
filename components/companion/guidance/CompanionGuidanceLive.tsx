"use client";

import { useEffect, useState } from "react";
import type {
  CompanionGuidanceApplicationState,
} from "@/lib/oracle/applications/companion";
import type {
  OracleCompanionGuidanceControl,
  OracleCompanionScreenObservationControl,
  OracleCompanionScreenObservationState,
} from "@/desktop/contracts";
import CompanionGuidanceDashboard from "./CompanionGuidanceDashboard";
import styles from "./companion-guidance.module.css";

const DEFAULT_CONTROL: OracleCompanionGuidanceControl = {
  category: null,
  maximumSpoilerLevel: "none",
};

const OBSERVATION_PROFILE:
  Omit<OracleCompanionScreenObservationControl, "action"> = {
    locale: "en-US",
    uiScale: 3,
    displayMode: "windowed",
    playerMode: "single-player",
  };

export default function CompanionGuidanceLive({
  initialState,
}: Readonly<{
  initialState: CompanionGuidanceApplicationState;
}>) {
  const [state, setState] = useState(initialState);
  const [control, setControl] =
    useState<OracleCompanionGuidanceControl>(DEFAULT_CONTROL);
  const [observation, setObservation] =
    useState<OracleCompanionScreenObservationState | null>(null);
  const [observationDisplayMode, setObservationDisplayMode] =
    useState<OracleCompanionScreenObservationControl["displayMode"]>(
      "windowed"
    );

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
    void bridge.getCompanionScreenObservationState()
      .then((value) => {
        if (active) setObservation(value);
      })
      .catch(() => undefined);
    const unsubscribeObservation =
      bridge.onCompanionScreenObservationStateChanged((value) => {
        if (active) setObservation(value);
      });
    return () => {
      active = false;
      unsubscribe();
      unsubscribeObservation();
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

  async function controlObservation(
    action: OracleCompanionScreenObservationControl["action"]
  ) {
    const bridge = window.oracleDesktop;
    if (!bridge) return;
    try {
      setObservation(
        await bridge.controlCompanionScreenObservation({
          ...OBSERVATION_PROFILE,
          displayMode: observationDisplayMode,
          action,
        })
      );
    } catch {
      // The validated subscription remains the renderer source of truth.
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
            <option value="discovery">Discovery</option>
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
      <section className={styles.controls} aria-label="Local screen observation">
        <div aria-live="polite">
          <strong>
            {observation?.indicator === "observation-on"
              ? "Observation on"
              : observation?.indicator === "observation-paused"
                ? "Observation paused"
                : "Observation off"}
          </strong>
          <p>
            {observation?.message ??
              "Local observation state is not available in this browser."}
          </p>
        </div>
        <label>
          Certified display mode
          <select
            value={observationDisplayMode}
            onChange={(event) =>
              setObservationDisplayMode(
                event.target.value as
                  OracleCompanionScreenObservationControl["displayMode"]
              )
            }
          >
            <option value="windowed">Windowed</option>
            <option value="borderless-windowed">Borderless windowed</option>
          </select>
        </label>
        <button type="button" onClick={() => void controlObservation("enable")}>
          Enable and observe once
        </button>
        <button type="button" onClick={() => void controlObservation("observe")}>
          Observe again
        </button>
        <button type="button" onClick={() => void controlObservation("pause")}>
          Pause
        </button>
        <button type="button" onClick={() => void controlObservation("revoke")}>
          Revoke consent
        </button>
      </section>
      <CompanionGuidanceDashboard state={state} />
    </>
  );
}
