import { app } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { OracleWatchIndicatorSettings } from "../contracts.js";

const DEFAULT_INDICATOR_SETTINGS: OracleWatchIndicatorSettings = {
  hidden: false,
  position: null,
};

function settingsFilePath(): string {
  return join(
    app.getPath("userData"),
    "oracle-watch-indicator-settings.json"
  );
}

export function loadIndicatorSettings(): OracleWatchIndicatorSettings {
  try {
    const path = settingsFilePath();
    if (!existsSync(path)) {
      return DEFAULT_INDICATOR_SETTINGS;
    }
    const raw = JSON.parse(readFileSync(path, "utf-8")) as Partial<
      Record<string, unknown>
    >;
    return {
      hidden: typeof raw.hidden === "boolean" ? raw.hidden : false,
      position: isValidPosition(raw.position) ? raw.position : null,
    };
  } catch {
    return DEFAULT_INDICATOR_SETTINGS;
  }
}

export function saveIndicatorSettings(
  settings: OracleWatchIndicatorSettings
): void {
  writeFileSync(
    settingsFilePath(),
    JSON.stringify(settings, null, 2),
    "utf-8"
  );
}

function isValidPosition(
  value: unknown
): value is Readonly<{ x: number; y: number }> {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.x === "number" &&
    Number.isFinite(record.x) &&
    typeof record.y === "number" &&
    Number.isFinite(record.y)
  );
}
