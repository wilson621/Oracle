import { app } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Defaults are deliberately distinct from ORACLE_DESKTOP_RECOVERY_SHORTCUT
// (CommandOrControl+Shift+O) in contracts.ts, and from each other, so none
// of the three ever collide.
export const DEFAULT_TOGGLE_WATCH_ACCELERATOR = "CommandOrControl+Shift+K";
export const DEFAULT_POSITIONING_MODE_ACCELERATOR =
  "CommandOrControl+Shift+P";

export type OracleHotkeySettings = Readonly<{
  toggleWatchAccelerator: string;
  positioningModeAccelerator: string;
}>;

/**
 * The Watch & Coach toggle hotkey (and now the watch-indicator positioning
 * hotkey) are the first user-editable settings this app has ever needed to
 * remember between launches, so this is a small, dependency-free JSON file
 * in Electron's own per-user data directory rather than pulling in a
 * settings library for a couple of strings. Both accelerators live in one
 * file and are always read/written together, so saving one never drops the
 * other.
 */
function settingsFilePath(): string {
  return join(app.getPath("userData"), "oracle-hotkey-settings.json");
}

export function loadHotkeySettings(): OracleHotkeySettings {
  try {
    const path = settingsFilePath();
    if (!existsSync(path)) {
      return defaultHotkeySettings();
    }
    const raw = JSON.parse(readFileSync(path, "utf-8")) as Partial<
      Record<string, unknown>
    >;
    return {
      toggleWatchAccelerator: normaliseAccelerator(
        raw.toggleWatchAccelerator,
        DEFAULT_TOGGLE_WATCH_ACCELERATOR
      ),
      positioningModeAccelerator: normaliseAccelerator(
        raw.positioningModeAccelerator,
        DEFAULT_POSITIONING_MODE_ACCELERATOR
      ),
    };
  } catch {
    // A missing or corrupt settings file just means "use the defaults" --
    // never block startup over a hotkey preference.
    return defaultHotkeySettings();
  }
}

export function saveHotkeySettings(settings: OracleHotkeySettings): void {
  writeFileSync(
    settingsFilePath(),
    JSON.stringify(settings, null, 2),
    "utf-8"
  );
}

function defaultHotkeySettings(): OracleHotkeySettings {
  return {
    toggleWatchAccelerator: DEFAULT_TOGGLE_WATCH_ACCELERATOR,
    positioningModeAccelerator: DEFAULT_POSITIONING_MODE_ACCELERATOR,
  };
}

function normaliseAccelerator(
  value: unknown,
  fallback: string
): string {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}
