import { BrowserWindow, screen } from "electron";
import type {
  OracleReportGenerationStatus,
  OracleWatchIndicatorSettings,
} from "./contracts.js";
import type { OracleMatchRecordingState } from "./companion/match-recording-contract.js";
import {
  loadIndicatorSettings,
  saveIndicatorSettings,
} from "./companion/indicator-settings-store.js";

const INDICATOR_WIDTH = 176;
const INDICATOR_HEIGHT = 40;
const POSITIONING_WIDTH = 220;
const POSITIONING_HEIGHT = 64;
const DEFAULT_MARGIN = 18;

// How long a "ready"/"failed" flash stays up before the indicator fades
// itself back out of the way -- long enough to notice, short enough that it
// never lingers on screen like a persistent HUD element.
const RESULT_FLASH_MS = 4_000;

type IndicatorVisualState =
  | "hidden"
  | "watching"
  | "generating"
  | "ready"
  | "failed"
  | "positioning";

/**
 * Owns a second, tiny always-on-top Electron window that does nothing but
 * show whether Oracle is currently watching a match / generating a report /
 * just finished one -- deliberately separate from the full Companion window
 * (CompanionHostWindowController) so it can stay a small corner indicator
 * instead of the full application surface. It is display-only: it never
 * calls back into the main process, so it needs no preload script or IPC of
 * its own -- the main process simply re-renders it (via a fresh data: URL)
 * whenever match-recording status or report-generation status changes.
 *
 * Click-through and non-focusable by default so it can never intercept a
 * mouseclick or keypress during a match; positioning mode is the one
 * deliberate exception, entered only from the Settings UI.
 */
export class WatchIndicatorWindowController {
  private window: BrowserWindow | null = null;
  private settings: OracleWatchIndicatorSettings = loadIndicatorSettings();
  private recordingStatus: OracleMatchRecordingState["status"] = "idle";
  private reportStatus: OracleReportGenerationStatus = "idle";
  private positioning = false;
  private fadeTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly onPositioningModeChanged?: (
      positioning: boolean
    ) => void
  ) {}

  create(): void {
    if (this.window && !this.window.isDestroyed()) {
      return;
    }

    const workArea = screen.getPrimaryDisplay().workArea;
    const position =
      this.settings.position ??
      {
        x: workArea.x + DEFAULT_MARGIN,
        y: workArea.y + DEFAULT_MARGIN,
      };

    const window = new BrowserWindow({
      width: INDICATOR_WIDTH,
      height: INDICATOR_HEIGHT,
      x: position.x,
      y: position.y,
      frame: false,
      transparent: true,
      backgroundColor: "#00000000",
      hasShadow: false,
      show: false,
      skipTaskbar: true,
      resizable: false,
      movable: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      focusable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
      },
    });

    // "screen-saver" is the highest always-on-top level Electron exposes and
    // is the level overlay-style apps (Discord, OBS) use to draw above a
    // borderless/windowed-fullscreen game -- it still cannot draw above true
    // Windows exclusive fullscreen, which is why customers are told to run
    // Warzone in borderless/windowed fullscreen.
    window.setAlwaysOnTop(true, "screen-saver");
    window.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });
    window.setIgnoreMouseEvents(true, { forward: true });

    window.on("closed", () => {
      if (this.window === window) {
        this.window = null;
      }
    });

    this.window = window;
    this.render();
  }

  destroy(): void {
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    const window = this.window;
    this.window = null;
    if (window && !window.isDestroyed()) {
      window.close();
    }
  }

  /**
   * Fed by CompanionHostWindowController.subscribeMatchRecordingStatus() --
   * every match-recording status transition (idle/recording/stopped/etc.),
   * not the per-frame frameCount ticks, so the indicator only redraws a
   * handful of times per match instead of every ~2.5s while watching.
   */
  setMatchRecordingStatus(
    status: OracleMatchRecordingState["status"]
  ): void {
    if (status === this.recordingStatus) {
      return;
    }
    this.recordingStatus = status;
    if (status === "recording") {
      // A fresh watch session should never be masked by a leftover
      // "ready"/"failed" flash from the previous one.
      this.clearFadeTimer();
      this.reportStatus = "idle";
    }
    this.render();
  }

  setReportGenerationStatus(
    status: OracleReportGenerationStatus
  ): void {
    this.clearFadeTimer();
    this.reportStatus = status;
    this.render();

    if (status === "ready" || status === "failed") {
      this.fadeTimer = setTimeout(() => {
        this.fadeTimer = null;
        this.reportStatus = "idle";
        this.render();
      }, RESULT_FLASH_MS);
    }
  }

  getSettings(): OracleWatchIndicatorSettings {
    return this.settings;
  }

  setHidden(hidden: boolean): OracleWatchIndicatorSettings {
    this.settings = { ...this.settings, hidden };
    saveIndicatorSettings(this.settings);
    this.render();
    return this.settings;
  }

  isPositioning(): boolean {
    return this.positioning;
  }

  /**
   * Entry point for the global positioning-mode hotkey -- lets the Operator
   * pull up the indicator to drag it without alt-tabbing to Settings, even
   * from inside a match. Same toggle shape as the watch hotkey: press once
   * to enter, press again to drop it and save the new spot.
   */
  togglePositioningMode(): void {
    if (this.positioning) {
      this.exitPositioningMode();
    } else {
      this.enterPositioningMode();
    }
  }

  enterPositioningMode(): void {
    const window = this.window;
    if (!window || window.isDestroyed()) {
      return;
    }
    this.positioning = true;
    window.setFocusable(true);
    window.setIgnoreMouseEvents(false);
    this.render();
    window.showInactive();
    this.onPositioningModeChanged?.(true);
  }

  exitPositioningMode(): void {
    const window = this.window;
    if (!window || window.isDestroyed()) {
      this.positioning = false;
      this.onPositioningModeChanged?.(false);
      return;
    }
    this.positioning = false;
    const [x, y] = window.getPosition();
    this.settings = { ...this.settings, position: { x, y } };
    saveIndicatorSettings(this.settings);
    window.setIgnoreMouseEvents(true, { forward: true });
    window.setFocusable(false);
    this.render();
    this.onPositioningModeChanged?.(false);
  }

  private currentVisualState(): IndicatorVisualState {
    if (this.positioning) return "positioning";
    if (this.reportStatus === "generating") return "generating";
    if (this.reportStatus === "ready") return "ready";
    if (this.reportStatus === "failed") return "failed";
    if (this.recordingStatus === "recording") return "watching";
    return "hidden";
  }

  private clearFadeTimer(): void {
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  private render(): void {
    const window = this.window;
    if (!window || window.isDestroyed()) {
      return;
    }

    const visualState = this.currentVisualState();
    const shouldShow =
      visualState === "positioning" ||
      (!this.settings.hidden && visualState !== "hidden");

    if (!shouldShow) {
      if (window.isVisible()) {
        window.hide();
      }
      return;
    }

    const size =
      visualState === "positioning"
        ? { width: POSITIONING_WIDTH, height: POSITIONING_HEIGHT }
        : { width: INDICATOR_WIDTH, height: INDICATOR_HEIGHT };
    window.setSize(size.width, size.height);

    void window
      .loadURL(buildIndicatorDataUrl(visualState))
      .then(() => {
        if (!window.isDestroyed()) {
          window.showInactive();
        }
      })
      .catch(() => undefined);
  }
}

function buildIndicatorDataUrl(state: IndicatorVisualState): string {
  return `data:text/html;charset=utf-8,${encodeURIComponent(
    renderIndicatorHtml(state)
  )}`;
}

function renderIndicatorHtml(state: IndicatorVisualState): string {
  const { dotClass, label } = describeState(state);
  const dragRegion = state === "positioning";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body {
    margin: 0;
    padding: 0;
    background: transparent;
    overflow: hidden;
    font-family: -apple-system, "Segoe UI", sans-serif;
  }
  .shell {
    display: flex;
    align-items: center;
    gap: 9px;
    height: 100%;
    box-sizing: border-box;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(9, 11, 16, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.08);
    ${dragRegion ? "-webkit-app-region: drag; border: 1px dashed rgba(103, 232, 249, 0.65);" : ""}
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex: none;
  }
  .dot.watching {
    background: #f87171;
    box-shadow: 0 0 0 rgba(248, 113, 113, 0.6);
    animation: pulse 1.4s ease-in-out infinite;
  }
  .dot.generating {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(251, 191, 36, 0.35);
    border-top-color: #fbbf24;
    background: transparent;
    animation: spin 0.85s linear infinite;
  }
  .dot.ready {
    background: #34d399;
    box-shadow: 0 0 8px rgba(52, 211, 153, 0.7);
  }
  .dot.failed {
    background: #f87171;
  }
  .dot.positioning {
    background: #67e8f9;
  }
  label {
    color: rgba(241, 245, 249, 0.92);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.55); }
    50% { box-shadow: 0 0 0 5px rgba(248, 113, 113, 0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
</head>
<body>
  <div class="shell">
    <span class="dot ${dotClass}"></span>
    <label>${label}</label>
  </div>
</body>
</html>`;
}

function describeState(state: IndicatorVisualState): {
  dotClass: string;
  label: string;
} {
  switch (state) {
    case "watching":
      return { dotClass: "watching", label: "Watching" };
    case "generating":
      return { dotClass: "generating", label: "Generating report…" };
    case "ready":
      return { dotClass: "ready", label: "Report ready" };
    case "failed":
      return { dotClass: "failed", label: "Report failed" };
    case "positioning":
      return { dotClass: "positioning", label: "Drag me, then hit Done" };
    case "hidden":
    default:
      return { dotClass: "", label: "" };
  }
}
