/**
 * IPC channels between OracleVideoRecorderWindowController (main process)
 * and the hidden recorder renderer it owns. Deliberately separate from
 * DESKTOP_CHANNELS in contracts.ts -- those cross the boundary between the
 * main process and the visible Companion window/Settings UI; these never
 * leave the main process's own private plumbing, so the Companion UI has no
 * way to reach the recorder window even indirectly.
 */
export const VIDEO_RECORDER_CHANNELS = {
  /** main -> renderer: begin capture with the given constraints. */
  begin: "oracle-video-recorder:begin",

  /** main -> renderer: stop capture and flush. */
  end: "oracle-video-recorder:end",

  /** renderer -> main: capture actually started (or failed to). */
  started: "oracle-video-recorder:started",
  startFailed: "oracle-video-recorder:start-failed",

  /** renderer -> main: one MediaRecorder chunk, in arrival order. */
  chunk: "oracle-video-recorder:chunk",

  /** renderer -> main: recording fully stopped, all chunks flushed. */
  stopped: "oracle-video-recorder:stopped",

  /** renderer -> main: something went wrong mid-recording. */
  error: "oracle-video-recorder:error",
} as const;

/**
 * Constraints main hands the renderer when asking it to begin -- video is
 * intentionally low framerate (Gemini samples video at ~1fps internally
 * regardless of source framerate, so anything higher than a handful of fps
 * only inflates upload size without improving analysis) and bounded bitrate
 * (keeps a full-length match file a predictable size).
 */
export type VideoRecorderBeginConstraints = Readonly<{
  targetFrameRate: number;
  videoBitsPerSecond: number;
}>;

export type VideoRecorderStartedPayload = Readonly<{
  mimeType: string;
  hasAudio: boolean;
}>;

export type VideoRecorderStoppedPayload = Readonly<{
  mimeType: string | null;
  hasAudio: boolean;
}>;
