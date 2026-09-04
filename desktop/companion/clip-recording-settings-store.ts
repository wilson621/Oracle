import { app } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The sticky "record in high quality for Content Clips" preference,
 * checked before each Full Match Analysis recording starts. Off by
 * default -- most matches don't produce anything worth clipping, and the
 * higher-quality capture costs real local CPU/disk during the match, so an
 * Operator opts in deliberately rather than paying that cost every time.
 * "Sticky" means whatever they last chose stays chosen, rather than
 * resetting to off every session -- see match-video-recording-coordinator.ts
 * for where this is actually read.
 *
 * Same small dependency-free JSON-file-in-userData approach as
 * hotkey-settings-store.ts, for the same reason: one boolean doesn't
 * justify a settings library.
 */
export type OracleClipRecordingSettings = Readonly<{
  highQualityForClips: boolean;
}>;

function settingsFilePath(): string {
  return join(
    app.getPath("userData"),
    "oracle-clip-recording-settings.json"
  );
}

export function loadClipRecordingSettings(): OracleClipRecordingSettings {
  try {
    const path = settingsFilePath();
    if (!existsSync(path)) {
      return defaultClipRecordingSettings();
    }
    const raw = JSON.parse(readFileSync(path, "utf-8")) as Partial<
      Record<string, unknown>
    >;
    return {
      highQualityForClips: raw.highQualityForClips === true,
    };
  } catch {
    // A missing or corrupt settings file just means "use the default" --
    // never block a recording from starting over this preference.
    return defaultClipRecordingSettings();
  }
}

export function saveClipRecordingSettings(
  settings: OracleClipRecordingSettings
): void {
  writeFileSync(
    settingsFilePath(),
    JSON.stringify(settings, null, 2),
    "utf-8"
  );
}

function defaultClipRecordingSettings(): OracleClipRecordingSettings {
  return { highQualityForClips: false };
}
