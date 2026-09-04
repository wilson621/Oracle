import { app } from "electron";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  isOracleMatchVideoRecordingResult,
  type OracleMatchVideoRecordingResult,
} from "./match-video-recording-contract.js";

/**
 * Persists the one recording (if any) that was captured in high quality
 * for Content Clips and is still awaiting a Generate Clips/Discard
 * decision from the Operator -- so that decision survives an app restart
 * (an update, a crash, or just closing Oracle) between finishing a match
 * and getting round to Content Clips.
 *
 * Without this, the video file itself was never lost -- OracleMatchVideo-
 * RecordingCoordinator only deletes it once Generate Clips or Discard
 * actually runs -- but the app had no way to find it again after a
 * restart, since knownVideoPaths (the read/delete authorization list on
 * that coordinator, see readVideoFile/deleteVideoFile) lives only in
 * memory, and the Companion renderer's own pendingClipRecording React
 * state is wiped by the same restart. This file is the missing durable
 * pointer back to that video.
 *
 * At most one pending recording is tracked at a time, matching the
 * existing UI, which only ever shows one Content Clips panel -- starting a
 * new recording discards whatever was pending, same as before this
 * existed (see handleStart in MatchVideoRecordingControl.tsx).
 *
 * Same small dependency-free JSON-file-in-userData approach as
 * clip-recording-settings-store.ts, for the same reason.
 */

function pendingClipRecordingFilePath(): string {
  return join(
    app.getPath("userData"),
    "oracle-pending-clip-recording.json"
  );
}

export function loadPersistedPendingClipRecording():
  OracleMatchVideoRecordingResult | null {
  try {
    const path = pendingClipRecordingFilePath();
    if (!existsSync(path)) {
      return null;
    }
    const parsed: unknown = JSON.parse(readFileSync(path, "utf-8"));
    return isOracleMatchVideoRecordingResult(parsed) ? parsed : null;
  } catch {
    // A missing or corrupt file just means "nothing pending" -- never block
    // startup, or a fresh recording, over this.
    return null;
  }
}

export function savePersistedPendingClipRecording(
  result: OracleMatchVideoRecordingResult
): void {
  writeFileSync(
    pendingClipRecordingFilePath(),
    JSON.stringify(result, null, 2),
    "utf-8"
  );
}

export function deletePersistedPendingClipRecording(): void {
  try {
    unlinkSync(pendingClipRecordingFilePath());
  } catch {
    // Already gone -- fine, that's the desired end state either way.
  }
}
