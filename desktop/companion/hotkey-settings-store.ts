import { app } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Default is deliberately distinct from ORACLE_DESKTOP_RECOVERY_SHORTCUT
// (CommandOrControl+Shift+O) in contracts.ts, so the two never collide.
export const DEFAULT_TOGGLE_WATCH_ACCELERATOR = "CommandOrControl+Shift+K";

export type OracleHotkeySettings = Readonly<{
  toggleWatchAccelerator: string;
}>;

/**
 * The Watch & Coach toggle hotkey is the first user-editable setting this
 * app has ever needed to remember between launches, so this is a small,
 * dependency-free JSON file in Electron's own per-user data directory
 * rather than pulling in a settings library for one string.
 */
function settingsFilePath(): string {
  return join(app.getPath("userData"), "oracle-hotkey-settings.json");
}

export function loadHotkeySettings(): OracleHotkeySettings {
  try {
    const path = settingsFilePath();
    if (!existsSync(path)) {
      return { toggleWatchAccelerator: DEFAULT_TOGGLE_WATCH_ACCELERATOR };
    }
    const raw = JSON.parse(readFileSync(path, "utf-8")) as Partial<
      Record<string, unknown>
    >;
    const accelerator = raw.toggleWatchAccelerator;
    return {
      toggleWatchAccelerator:
        typeof accelerator === "string" && accelerator.trim().length > 0
          ? accelerator
          : DEFAULT_TOGGLE_WATCH_ACCELERATOR,
    };
  } catch {
    // A missing or corrupt settings file just means "use the default" --
    // never block startup over a hotkey preference.
    return { toggleWatchAccelerator: DEFAULT_TOGGLE_WATCH_ACCELERATOR };
  }
}

export function saveHotkeySettings(settings: OracleHotkeySettings): void {
  writeFileSync(
    settingsFilePath(),
    JSON.stringify(settings, null, 2),
    "utf-8"
  );
}
