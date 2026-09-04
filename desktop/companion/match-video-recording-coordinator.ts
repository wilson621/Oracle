import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";
import type { OracleDesktopAttachmentTarget } from "../overlay/attachment-state.js";
import { OracleVideoRecorderWindowController } from "../video-recorder-window.js";
import { OracleElectronFullWindowCapture } from "./electron-full-window-capture.js";
import { loadClipRecordingSettings } from "./clip-recording-settings-store.js";
import {
  deletePersistedPendingClipRecording,
  loadPersistedPendingClipRecording,
  savePersistedPendingClipRecording,
} from "./pending-clip-recording-store.js";
import {
  createInitialOracleMatchVideoRecordingState,
  createOracleMatchVideoRecordingState,
  type OracleMatchVideoRecordingResult,
  type OracleMatchVideoRecordingState,
} from "./match-video-recording-contract.js";

// Hard ceiling on a single Full Match Analysis recording. This is the real
// cost-control mechanism (no ffmpeg-based trimming exists yet, deliberately
// deferred) -- long enough to cover essentially any Warzone match including
// a strong player's run deep into the closing circles, short enough to
// bound upload size and Gemini cost no matter what happens on screen.
const MAX_RECORDING_DURATION_MS = 45 * 60 * 1_000;

// Gemini's video understanding samples frames at ~1fps internally
// regardless of the source framerate, so capturing any faster than a
// handful of fps only inflates file size and upload time without improving
// analysis quality. A few fps of headroom above that internal sampling
// rate is kept so fast camera swings/killcam cuts aren't missed between
// Gemini's own sample points.
const STANDARD_TARGET_FRAME_RATE = 5;

// ~900kbps keeps a full 45-minute recording bounded to roughly
// (900_000 / 8) * 2_700 ~= 304MB in the worst case, while remaining ample
// for this low-framerate, largely-static-camera source material.
const STANDARD_VIDEO_BITS_PER_SECOND = 900_000;

// Used instead of the standard settings above when the Operator has opted
// into "record in high quality for Content Clips" (see
// clip-recording-settings-store.ts). Actual gameplay footage meant to be
// cut into a shareable clip needs to look smooth, not like the 5fps
// analysis-only capture -- 24fps is a real, visible jump in motion
// smoothness for gunfights/flicks over 5fps, without the file size (and
// downstream upload/processing) blowing up the way true 60fps would.
// Deliberately kept modest rather than maxed out: this same recording is
// still what Full Match Analysis uploads (via the existing multipart
// upload path, see coach-report-video/route.ts's MAX_VIDEO_BYTES), so the
// worst case here -- (3_000_000 / 8) * 2_700 ~= 1.01GB for a full 45-minute
// recording -- has to stay inside what that upload path can safely hold in
// memory. This is a real jump in local CPU/disk load during the match
// (~3.3x the file size of the standard capture for the same duration) --
// deliberately opt-in, never the default, for exactly that reason.
const CLIPS_TARGET_FRAME_RATE = 24;
const CLIPS_VIDEO_BITS_PER_SECOND = 3_000_000;

// Reuses OracleElectronFullWindowCapture's existing diffScore still-frame
// sampling, via its own private instance, purely to estimate when the
// actual match likely began, so that estimate can be passed to Gemini as a
// prompt hint. This never affects what gets uploaded or its cost; it is
// solely a report-quality nicety with a safe "no hint given" fallback.
const MOTION_SAMPLE_INTERVAL_MS = 3_000;
const MOTION_THRESHOLD = 0.08;
// ~3 consecutive elevated samples (~9s) before treating it as sustained
// gameplay motion rather than a single lobby/menu transition flicker.
const SUSTAINED_MOTION_SAMPLES = 3;
// Pulled back from the detected onset so the estimate doesn't clip the
// first couple of seconds of actual match footage.
const MATCH_START_LEAD_IN_MS = 5_000;

const ELAPSED_TICK_MS = 1_000;

type MotionSample = Readonly<{ elapsedMs: number; diffScore: number }>;

/**
 * Owns the local lifecycle for the Gemini-video-based "Full Match Analysis"
 * feature: start/stop a real screen recording of the attached Call of Duty
 * window, via OracleVideoRecorderWindowController.
 *
 * The recorded file never leaves this process on its own; stop() only
 * returns its local path and metadata for the caller to upload and, per
 * the agreed retention policy, delete once a report is generated.
 */
export class OracleMatchVideoRecordingCoordinator {
  private state: OracleMatchVideoRecordingState =
    createInitialOracleMatchVideoRecordingState();
  private readonly listeners =
    new Set<(state: OracleMatchVideoRecordingState) => void>();

  private sessionId: string | null = null;
  private startedAt: string | null = null;
  private startedAtMs = 0;
  private outputPath: string | null = null;
  private mimeType = "video/webm";
  private hasAudio = false;
  private recordedForClips = false;
  private motionSamples: MotionSample[] = [];

  // Paths this coordinator has itself produced via stop() -- the only
  // paths readVideoFile()/deleteVideoFile() will ever act on. This keeps
  // the IPC surface those back (see overlay-window.ts) from becoming a
  // general "read/delete any file on disk" primitive reachable from the
  // Companion renderer: it can only ever touch a video this session's own
  // recording pipeline just wrote.
  private readonly knownVideoPaths = new Set<string>();

  private durationCapTimer: NodeJS.Timeout | null = null;
  private elapsedTimer: NodeJS.Timeout | null = null;
  private motionTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly recorder = new OracleVideoRecorderWindowController(),
    private readonly motionCapture = new OracleElectronFullWindowCapture(),
    private readonly getTarget:
      () => OracleDesktopAttachmentTarget | null = () => null,
    private readonly now = () => Date.now()
  ) {}

  subscribe(
    listener: (state: OracleMatchVideoRecordingState) => void
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): OracleMatchVideoRecordingState {
    return this.state;
  }

  /**
   * Starts a new recording session. Resolves once capture has genuinely
   * begun (or throws if it couldn't) -- callers should surface a failure to
   * the Operator rather than silently sitting in "recording" state.
   */
  async start(): Promise<OracleMatchVideoRecordingState> {
    if (this.state.status === "recording") {
      return this.state;
    }
    const target = this.getTarget();
    if (!target) {
      return this.publish({
        status: "unavailable",
        sessionId: null,
        startedAt: null,
        elapsedMs: 0,
        message:
          "Attach to Call of Duty before starting Full Match Analysis.",
        updatedAt: this.isoNow(),
      });
    }

    const sessionId = randomUUID();
    const startedAt = this.isoNow();
    const startedAtMs = this.now();
    const outputPath = join(
      app.getPath("userData"),
      "oracle-match-videos",
      `${sessionId}.webm`
    );

    this.motionCapture.reset();
    this.motionSamples = [];

    const highQualityForClips =
      loadClipRecordingSettings().highQualityForClips;

    try {
      const began = await this.recorder.beginCapture(target, outputPath, {
        targetFrameRate: highQualityForClips
          ? CLIPS_TARGET_FRAME_RATE
          : STANDARD_TARGET_FRAME_RATE,
        videoBitsPerSecond: highQualityForClips
          ? CLIPS_VIDEO_BITS_PER_SECOND
          : STANDARD_VIDEO_BITS_PER_SECOND,
      });
      this.mimeType = began.mimeType;
      this.hasAudio = began.hasAudio;
      this.recordedForClips = highQualityForClips;
    } catch (error) {
      return this.publish({
        status: "unavailable",
        sessionId: null,
        startedAt: null,
        elapsedMs: 0,
        message:
          error instanceof Error
            ? `Couldn't start Full Match Analysis: ${error.message}`
            : "Couldn't start Full Match Analysis.",
        updatedAt: this.isoNow(),
      });
    }

    this.sessionId = sessionId;
    this.startedAt = startedAt;
    this.startedAtMs = startedAtMs;
    this.outputPath = outputPath;

    this.clearTimers();
    this.durationCapTimer = setTimeout(() => {
      void this.stop();
    }, MAX_RECORDING_DURATION_MS);
    this.elapsedTimer = setInterval(() => {
      if (this.state.status !== "recording") return;
      this.publish({
        ...this.state,
        elapsedMs: this.now() - this.startedAtMs,
        updatedAt: this.isoNow(),
      });
    }, ELAPSED_TICK_MS);
    this.motionTimer = setInterval(() => {
      void this.sampleMotionOnce();
    }, MOTION_SAMPLE_INTERVAL_MS);
    void this.sampleMotionOnce();

    return this.publish({
      status: "recording",
      sessionId,
      startedAt,
      elapsedMs: 0,
      message:
        "Recording the full match for Gemini analysis. Let every killcam play out after a death.",
      updatedAt: this.isoNow(),
    });
  }

  /**
   * Stops the current recording and hands back its local file plus a
   * best-effort match-start estimate. Returns null if nothing was
   * recording -- also safe to call from the hard duration-cap timer.
   */
  async stop(): Promise<OracleMatchVideoRecordingResult | null> {
    if (
      this.state.status !== "recording" ||
      !this.sessionId ||
      !this.startedAt ||
      !this.outputPath
    ) {
      return null;
    }

    const sessionId = this.sessionId;
    const startedAt = this.startedAt;
    const startedAtMs = this.startedAtMs;
    const outputPath = this.outputPath;
    const mimeType = this.mimeType;
    const hasAudio = this.hasAudio;
    const recordedForClips = this.recordedForClips;

    this.clearTimers();

    const ended = await this.recorder.endCapture();
    const stoppedAt = this.isoNow();
    const durationMs = Math.max(0, this.now() - startedAtMs);
    const matchStartOffsetMs = this.estimateMatchStartOffsetMs();
    this.knownVideoPaths.add(outputPath);

    this.sessionId = null;
    this.startedAt = null;
    this.outputPath = null;
    this.motionSamples = [];

    const result: OracleMatchVideoRecordingResult = Object.freeze({
      sessionId,
      startedAt,
      stoppedAt,
      videoPath: outputPath,
      mimeType,
      hasAudio,
      sizeBytes: ended?.sizeBytes ?? 0,
      durationMs,
      matchStartOffsetMs,
      recordedForClips,
    });

    if (recordedForClips) {
      // Persisted immediately, before the caller has even uploaded this
      // for a Full Match Analysis report -- Content Clips generation is a
      // fully separate pipeline (its own upload, its own Gemini call), not
      // dependent on that report succeeding, so there's no reason to wait.
      // This is also what lets a pending recording survive an app restart
      // (see pending-clip-recording-store.ts) -- without it, restarting
      // Oracle between finishing a match and running Generate Clips would
      // strand this video with no way for the app to find it again.
      savePersistedPendingClipRecording(result);
    }

    this.publish({
      status: "stopped",
      sessionId: null,
      startedAt: null,
      elapsedMs: 0,
      message:
        result.sizeBytes > 0
          ? "Recording stopped. Uploading for your coaching report now."
          : "Recording stopped, but nothing was captured -- no report can be generated.",
      updatedAt: this.isoNow(),
    });

    return result;
  }

  /** Hard teardown -- used on app quit. */
  destroy(): void {
    this.clearTimers();
    this.recorder.destroy();
  }

  /**
   * Reads back a video this coordinator's own stop() produced, for the
   * Companion renderer to upload -- see MatchVideoRecordingControl.tsx.
   * Throws for any path this coordinator didn't itself produce.
   */
  async readVideoFile(path: string): Promise<Buffer> {
    if (!this.knownVideoPaths.has(path)) {
      throw new Error(
        "That video is not from a recording this session produced."
      );
    }
    return readFile(path);
  }

  /**
   * Deletes a video this coordinator's own stop() produced, once the
   * Operator no longer needs the local copy -- per the agreed retention
   * policy, called once a report has been generated from it (the report
   * itself lives on Oracle, so the footage doesn't need to stick around
   * locally afterwards). Throws for any path this coordinator didn't
   * itself produce.
   */
  async deleteVideoFile(path: string): Promise<void> {
    if (!this.knownVideoPaths.has(path)) {
      throw new Error(
        "That video is not from a recording this session produced."
      );
    }
    await rm(path, { force: true });
    this.knownVideoPaths.delete(path);
  }

  /**
   * Returns the pending Content-Clips recording persisted by stop() (if
   * any) that's still awaiting a Generate Clips/Discard decision --
   * restores it after an app restart wiped this coordinator's own
   * in-memory knownVideoPaths (and the Companion renderer's React state
   * along with it). Re-authorizes the path for readVideoFile/deleteVideoFile
   * as a side effect, exactly as if this session's own stop() had just
   * produced it. Called once by the Companion renderer on mount.
   */
  getPendingClipRecording(): OracleMatchVideoRecordingResult | null {
    const pending = loadPersistedPendingClipRecording();
    if (!pending) return null;
    if (!existsSync(pending.videoPath)) {
      // The video is gone (deleted outside the app, or a stale leftover
      // from before this existed) -- nothing to recover, and no point
      // holding onto a reference to a file that isn't there.
      deletePersistedPendingClipRecording();
      return null;
    }
    this.knownVideoPaths.add(pending.videoPath);
    return pending;
  }

  /**
   * Clears the persisted pending Content-Clips recording once the Operator
   * has decided its fate -- called by the Companion renderer alongside
   * deleteVideoFile, both when clips are generated and when the recording
   * is discarded.
   */
  clearPendingClipRecording(): void {
    deletePersistedPendingClipRecording();
  }

  private async sampleMotionOnce(): Promise<void> {
    if (this.state.status !== "recording") return;
    const target = this.getTarget();
    if (!target) return;
    try {
      const frame = await this.motionCapture.captureFrame(target);
      if (!frame || this.state.status !== "recording") return;
      this.motionSamples.push({
        elapsedMs: this.now() - this.startedAtMs,
        diffScore: frame.diffScore,
      });
    } catch {
      // A missed motion sample only ever costs us the quality nicety of a
      // match-start estimate -- never fatal to the recording itself.
    }
  }

  /**
   * Finds the first run of SUSTAINED_MOTION_SAMPLES consecutive samples
   * that all exceed MOTION_THRESHOLD -- a cheap proxy for "gameplay started
   * happening" versus the relatively static lobby/loadout/deploy screens
   * beforehand -- and returns a timestamp a little before that onset.
   * Returns null (meaning: no hint, analyse the whole video) whenever no
   * such run is found, which is always a safe fallback.
   */
  private estimateMatchStartOffsetMs(): number | null {
    const samples = this.motionSamples;
    for (let i = 0; i + SUSTAINED_MOTION_SAMPLES <= samples.length; i++) {
      let sustained = true;
      for (let j = 0; j < SUSTAINED_MOTION_SAMPLES; j++) {
        if (samples[i + j].diffScore < MOTION_THRESHOLD) {
          sustained = false;
          break;
        }
      }
      if (sustained) {
        return Math.max(0, samples[i].elapsedMs - MATCH_START_LEAD_IN_MS);
      }
    }
    return null;
  }

  private clearTimers(): void {
    if (this.durationCapTimer) {
      clearTimeout(this.durationCapTimer);
      this.durationCapTimer = null;
    }
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }
    if (this.motionTimer) {
      clearInterval(this.motionTimer);
      this.motionTimer = null;
    }
  }

  private isoNow(): string {
    return new Date(this.now()).toISOString();
  }

  private publish(
    input: Omit<OracleMatchVideoRecordingState, "contract">
  ): OracleMatchVideoRecordingState {
    this.state = createOracleMatchVideoRecordingState(input);
    for (const listener of this.listeners) listener(this.state);
    return this.state;
  }
}
