import { randomUUID } from "node:crypto";
import type {
  OracleDesktopAttachmentTarget,
} from "../overlay/attachment-state.js";
import {
  OracleElectronFullWindowCapture,
} from "./electron-full-window-capture.js";
import { selectReportFrames } from "../../lib/oracle/match-coaching/select-report-frames.js";
import {
  createInitialOracleMatchRecordingState,
  createOracleMatchRecordingState,
  type OracleMatchRecordingFrameSummary,
  type OracleMatchRecordingResult,
  type OracleMatchRecordingState,
} from "./match-recording-contract.js";

const CAPTURE_INTERVAL_MS = 2_500;
// Raw in-process buffer only -- what actually gets uploaded is reduced to a
// bounded ~50 frames by selectReportFrames() in stop() below, so this just
// needs to comfortably cover a long real match without dropping early
// frames. ~1500 frames covers well over an hour at the interval above, even
// accounting for capture sometimes running slower than the nominal interval
// under load (observed on a real match: ~77 frames in 5 minutes).
const MAX_BUFFERED_FRAMES = 1_500;

/**
 * Owns the local "Start Watching / Stop Watching" lifecycle for the new
 * Watch & Coach feature: a manual, session-scoped capture loop, independent
 * of OracleCompanionScreenObservationCoordinator (which stays exactly as it
 * was, gated to Minecraft's certified single-frame check).
 *
 * Frames only ever leave this process when stop() is called and the caller
 * explicitly forwards the result onward -- nothing here calls out on its
 * own.
 */
export class OracleMatchRecordingCoordinator {
  private state: OracleMatchRecordingState =
    createInitialOracleMatchRecordingState();
  private frames: OracleMatchRecordingFrameSummary[] = [];
  private timer: NodeJS.Timeout | null = null;
  private sessionId: string | null = null;
  private startedAt: string | null = null;
  private readonly listeners =
    new Set<(state: OracleMatchRecordingState) => void>();

  constructor(
    private readonly capture = new OracleElectronFullWindowCapture(),
    private readonly getTarget:
      () => OracleDesktopAttachmentTarget | null = () => null,
    private readonly now = () => new Date().toISOString()
  ) {}

  subscribe(
    listener: (state: OracleMatchRecordingState) => void
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): OracleMatchRecordingState {
    return this.state;
  }

  start(): OracleMatchRecordingState {
    if (this.state.status === "recording") {
      return this.state;
    }
    const target = this.getTarget();
    if (!target) {
      return this.publish({
        status: "unavailable",
        sessionId: null,
        startedAt: null,
        frameCount: 0,
        message: "Attach to Call of Duty before starting a watch session.",
        updatedAt: this.now(),
      });
    }

    this.capture.reset();
    this.frames = [];
    this.sessionId = randomUUID();
    this.startedAt = this.now();

    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      void this.captureOnce();
    }, CAPTURE_INTERVAL_MS);

    void this.captureOnce();

    return this.publish({
      status: "recording",
      sessionId: this.sessionId,
      startedAt: this.startedAt,
      frameCount: 0,
      message:
        "Watching. Let every killcam play out after a death -- Oracle needs to see it to explain what happened.",
      updatedAt: this.now(),
    });
  }

  /**
   * Stops the current watch session and hands back everything captured.
   * Returns null if nothing was recording.
   */
  stop(): OracleMatchRecordingResult | null {
    if (
      this.state.status !== "recording" ||
      !this.sessionId ||
      !this.startedAt
    ) {
      return null;
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // Reduce the full raw capture down to a bounded set before it ever
    // leaves this process -- an overview spread plus bursts around the
    // biggest visual jumps (likely deaths/killcams). This keeps the upload
    // small and predictable regardless of how long the match ran, instead
    // of shipping every raw frame and hoping it fits under some size limit
    // further down the pipeline.
    const rawFrameCount = this.frames.length;
    const reportFrames = selectReportFrames(this.frames).map(
      (frame): OracleMatchRecordingFrameSummary => ({
        capturedAt: frame.capturedAt,
        jpegBase64: frame.jpegBase64,
        diffScore: frame.diffScore,
      })
    );

    const result: OracleMatchRecordingResult = Object.freeze({
      sessionId: this.sessionId,
      startedAt: this.startedAt,
      stoppedAt: this.now(),
      frames: Object.freeze(reportFrames),
    });

    this.frames = [];
    this.sessionId = null;
    this.startedAt = null;

    this.publish({
      status: "stopped",
      sessionId: null,
      startedAt: null,
      frameCount: 0,
      message:
        rawFrameCount > 0
          ? `Watching stopped. ${rawFrameCount} frames captured -- generating your coaching report now.`
          : "Watching stopped. Nothing was captured, so no report can be generated.",
      updatedAt: this.now(),
    });

    return result;
  }

  private async captureOnce(): Promise<void> {
    if (this.state.status !== "recording") return;
    const target = this.getTarget();
    if (!target) return;
    try {
      const frame = await this.capture.captureFrame(target);
      if (!frame || this.state.status !== "recording") return;
      if (this.frames.length >= MAX_BUFFERED_FRAMES) {
        this.frames.shift();
      }
      this.frames.push({
        capturedAt: frame.capturedAt,
        jpegBase64: frame.jpegBase64,
        diffScore: frame.diffScore,
      });
      this.publish({
        ...this.state,
        frameCount: this.frames.length,
        updatedAt: this.now(),
      });
    } catch {
      // A single missed frame is not fatal -- keep watching.
    }
  }

  private publish(
    input: Omit<OracleMatchRecordingState, "contract">
  ): OracleMatchRecordingState {
    this.state = createOracleMatchRecordingState(input);
    for (const listener of this.listeners) listener(this.state);
    return this.state;
  }
}
