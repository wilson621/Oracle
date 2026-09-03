"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  OracleMatchVideoRecordingResult,
  OracleMatchVideoRecordingState,
} from "@/desktop/contracts";
import type { CoachingReport } from "./report-types";
import ReportView from "./ReportView";
import styles from "./match-recording.module.css";

const IDLE_STATE: OracleMatchVideoRecordingState = {
  contract: {
    name: "oracle.companion-match-video-recording-state",
    version: 1,
  },
  status: "idle",
  sessionId: null,
  startedAt: null,
  elapsedMs: 0,
  message: "Not recording.",
  updatedAt: new Date(0).toISOString(),
};

/**
 * "Full Match Analysis": records the whole match as video + audio and sends
 * it to Gemini for a deep, evidence-grounded report -- real mm:ss
 * timestamps and audio cues like footsteps/gunfire, not just a handful of
 * screenshots.
 */
export default function MatchVideoRecordingControl() {
  const [bridgeAvailable, setBridgeAvailable] = useState(false);
  const [state, setState] =
    useState<OracleMatchVideoRecordingState>(IDLE_STATE);
  const [uploading, setUploading] = useState(false);
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
      .getMatchVideoRecordingState()
      .then((value) => {
        if (!active) return;
        setState(value);
        setBridgeAvailable(true);
      })
      .catch(() => undefined);
    const unsubscribe = bridge.onMatchVideoRecordingStateChanged((value) => {
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
    const next = await window.oracleDesktop?.startMatchVideoRecording();
    if (next && next.status === "unavailable") {
      setActiveError(next.message);
    }
  }

  async function handleStop() {
    const result = await window.oracleDesktop?.stopMatchVideoRecording();
    if (!result) return;
    void submitForAnalysis(result);
  }

  async function submitForAnalysis(
    result: OracleMatchVideoRecordingResult
  ): Promise<void> {
    setUploading(true);
    setActiveError(null);
    // Lets the small always-on-top watch indicator (a separate window the
    // main process owns) reflect what's happening -- it has no way to know
    // about this fetch on its own.
    void window.oracleDesktop?.notifyReportGenerationStatus("generating");
    try {
      if (result.sizeBytes === 0) {
        throw new Error(
          "Nothing was captured during this recording, so no report can be generated."
        );
      }

      const bytes = await window.oracleDesktop?.readMatchVideoBytes(
        result.videoPath
      );
      if (!bytes) {
        throw new Error("Could not read the recorded video file.");
      }

      // Copy out exactly the bytes this view covers as a plain ArrayBuffer
      // -- Blob's typings want that specifically, and a typed array arriving
      // fresh over IPC can be typed as backed by the more general
      // ArrayBufferLike (which also covers SharedArrayBuffer).
      const videoData = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      ) as ArrayBuffer;

      const form = new FormData();
      form.append(
        "video",
        new Blob([videoData], { type: result.mimeType || "video/webm" }),
        "match.webm"
      );
      form.append("clientSessionId", result.sessionId);
      form.append("game", "Call of Duty");
      form.append("startedAt", result.startedAt);
      form.append("endedAt", result.stoppedAt);
      form.append("durationMs", String(result.durationMs));
      if (result.matchStartOffsetMs !== null) {
        form.append(
          "matchStartOffsetMs",
          String(result.matchStartOffsetMs)
        );
      }

      const response = await fetch("/api/oracle/coach-report-video", {
        method: "POST",
        body: form,
      });
      const body = await response.json();
      if (!response.ok) {
        setActiveError(
          body.error ?? "The Full Match Analysis report could not be generated."
        );
        void window.oracleDesktop?.notifyReportGenerationStatus("failed");
        return;
      }

      const report = body.report as CoachingReport;
      if (report.status === "failed") {
        setActiveError(
          report.raw_error ??
            "The Full Match Analysis report could not be generated."
        );
        void window.oracleDesktop?.notifyReportGenerationStatus("failed");
        return;
      }

      setActiveReport(report);
      void window.oracleDesktop?.notifyReportGenerationStatus("ready");
      loadHistory();
      // The report now lives on Oracle -- the local recording has served
      // its purpose, so it's removed rather than left taking up disk space.
      void window.oracleDesktop
        ?.deleteMatchVideoFile(result.videoPath)
        .catch(() => undefined);
    } catch (error) {
      setActiveError(
        error instanceof Error
          ? error.message
          : "The Full Match Analysis report could not be generated."
      );
      void window.oracleDesktop?.notifyReportGenerationStatus("failed");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    const bridge = window.oracleDesktop;
    if (!bridge) {
      return;
    }
    // A start triggered by the global hotkey already reaches this
    // component through onMatchVideoRecordingStateChanged above (same as a
    // button-driven start). A hotkey-triggered stop has no invoke() caller
    // to hand its finished recording back to, so it's pushed here instead
    // -- submit it for analysis exactly like a manual Stop press.
    const unsubscribe = bridge.onMatchVideoRecordingHotkeyStopped((result) => {
      void submitForAnalysis(result);
    });
    return unsubscribe;
    // submitForAnalysis is a stable-in-practice function declaration (not
    // recreated meaningfully across renders); subscribing once on mount is
    // the intent here, same as the state-subscription effect above it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!bridgeAvailable) {
    return null;
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>Full Match Analysis</h2>
      <p className={styles.muted}>
        Records the whole match as video with audio and sends it to Gemini
        for a deep report -- real timestamps and audio cues like footsteps
        and gunfire, not just a handful of screenshots. Uploading and
        processing takes a few minutes for a full match.
      </p>

      <p className={styles.message}>{state.message}</p>

      {state.status !== "recording" ? (
        <button
          type="button"
          className={styles.startButton}
          onClick={handleStart}
        >
          Start Full Match Analysis
        </button>
      ) : (
        <button
          type="button"
          className={styles.stopButton}
          onClick={handleStop}
        >
          Stop Recording ({formatElapsed(state.elapsedMs)})
        </button>
      )}

      {state.status === "recording" && (
        <p className={styles.reminder}>
          Important: let every killcam play out after a death instead of
          skipping it -- Oracle needs to see and hear it to explain what
          happened.
        </p>
      )}

      {uploading && (
        <p className={styles.muted}>
          Uploading and analysing the full recording -- often several
          minutes for a full match.
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

function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
