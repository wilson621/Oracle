"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  OracleMatchRecordingResult,
  OracleMatchRecordingState,
} from "@/desktop/contracts";
import type { CoachingReport } from "./report-types";
import ReportView from "./ReportView";
import styles from "./match-recording.module.css";

const IDLE_STATE: OracleMatchRecordingState = {
  contract: {
    name: "oracle.companion-match-recording-state",
    version: 1,
  },
  status: "idle",
  sessionId: null,
  startedAt: null,
  frameCount: 0,
  message: "Not watching.",
  updatedAt: new Date(0).toISOString(),
};

export default function MatchRecordingControl() {
  const [bridgeAvailable, setBridgeAvailable] = useState(false);
  const [state, setState] =
    useState<OracleMatchRecordingState>(IDLE_STATE);
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] =
    useState<CoachingReport | null>(null);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [history, setHistory] = useState<CoachingReport[]>([]);

  const loadHistory = useCallback(() => {
    void fetch("/api/oracle/coach-report")
      .then((response) => response.json())
      .then((body: { reports?: CoachingReport[] }) => {
        setHistory(body.reports ?? []);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const bridge = window.oracleDesktop;
    if (!bridge) {
      return;
    }
    let active = true;
    void bridge
      .getMatchRecordingState()
      .then((value) => {
        if (!active) return;
        setState(value);
        setBridgeAvailable(true);
      })
      .catch(() => undefined);
    const unsubscribe = bridge.onMatchRecordingStateChanged((value) => {
      if (active) setState(value);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function handleStart() {
    setActiveReport(null);
    setActiveError(null);
    await window.oracleDesktop?.startMatchRecording();
  }

  async function handleStop() {
    const result = await window.oracleDesktop?.stopMatchRecording();
    if (!result) return;
    void submitForCoaching(result);
  }

  async function submitForCoaching(result: OracleMatchRecordingResult) {
    setGenerating(true);
    setActiveError(null);
    // Lets the small always-on-top watch indicator (a separate window the
    // main process owns) reflect what's happening -- it has no way to know
    // about this fetch on its own. Best-effort: the indicator is a nicety,
    // not something worth failing report generation over.
    void window.oracleDesktop?.notifyReportGenerationStatus("generating");
    try {
      const response = await fetch("/api/oracle/coach-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientSessionId: result.sessionId,
          game: "Call of Duty",
          startedAt: result.startedAt,
          endedAt: result.stoppedAt,
          frames: result.frames,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setActiveError(body.error ?? "The coaching report could not be generated.");
        void window.oracleDesktop?.notifyReportGenerationStatus("failed");
        return;
      }
      const report = body.report as CoachingReport;
      if (report.status === "failed") {
        setActiveError(
          report.raw_error ?? "The coaching report could not be generated."
        );
        void window.oracleDesktop?.notifyReportGenerationStatus("failed");
      } else {
        setActiveReport(report);
        void window.oracleDesktop?.notifyReportGenerationStatus("ready");
      }
      loadHistory();
    } catch (error) {
      setActiveError(
        error instanceof Error
          ? error.message
          : "The coaching report could not be generated."
      );
      void window.oracleDesktop?.notifyReportGenerationStatus("failed");
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    const bridge = window.oracleDesktop;
    if (!bridge) {
      return;
    }
    // A start triggered by the global hotkey already reaches this
    // component through onMatchRecordingStateChanged above (same as a
    // button-driven start). A hotkey-triggered stop has no invoke() caller
    // to hand its captured frames back to, so the frames are pushed here
    // instead -- submit it for coaching exactly like a manual Stop press.
    const unsubscribe = bridge.onMatchRecordingHotkeyStopped((result) => {
      void submitForCoaching(result);
    });
    return unsubscribe;
    // submitForCoaching is a stable-in-practice function declaration (not
    // recreated meaningfully across renders); subscribing once on mount is
    // the intent here, same as the state-subscription effect above it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!bridgeAvailable) {
    return (
      <section className={styles.card}>
        <h2 className={styles.heading}>Watch &amp; Coach</h2>
        <p className={styles.muted}>
          This requires the Oracle desktop app (not just the browser
          version) so it can watch your Call of Duty window locally.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>Watch &amp; Coach</h2>
      <p className={styles.message}>{state.message}</p>

      <p className={styles.muted}>
        Run Call of Duty in Borderless or Windowed Fullscreen (Options &gt;
        Graphics &gt; Display Mode) -- not Exclusive Fullscreen -- so the
        watch indicator and hotkey display correctly over the game.
      </p>

      {state.status !== "recording" ? (
        <button
          type="button"
          className={styles.startButton}
          onClick={handleStart}
        >
          Start Watching
        </button>
      ) : (
        <button
          type="button"
          className={styles.stopButton}
          onClick={handleStop}
        >
          Stop Watching ({state.frameCount} frames)
        </button>
      )}

      {state.status === "recording" && (
        <p className={styles.reminder}>
          Important: let every killcam play out after a death instead of
          skipping it -- Oracle needs to see it to explain what happened.
        </p>
      )}

      {generating && (
        <p className={styles.muted}>
          Generating your coaching report -- this usually takes a minute or
          two.
        </p>
      )}

      {activeError && (
        <p className={styles.error}>Report failed: {activeError}</p>
      )}

      {activeReport && <ReportView report={activeReport} />}

      {history.length > 0 && (
        <div className={styles.history}>
          <h3 className={styles.subheading}>Past reports</h3>
          <ul className={styles.historyList}>
            {history.map((report) => (
              <li key={report.id}>
                <button
                  type="button"
                  className={styles.historyItem}
                  onClick={() => {
                    setActiveReport(report);
                    setActiveError(null);
                  }}
                >
                  {new Date(report.generated_at).toLocaleString()} --{" "}
                  {report.status === "complete"
                    ? report.verdict ?? "Complete"
                    : "Failed"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
