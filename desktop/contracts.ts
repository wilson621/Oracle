import type {
  OracleDesktopDisplayState,
  OracleDesktopHostState,
  OracleDesktopHostWindowDiscoveryState,
  OracleDesktopHostWindowDiscoveryStatus,
  OracleDesktopRectangle,
  OracleDesktopRuntimeState,
  OracleDesktopWindowMode,
} from "./host-state.js";

import type {
  OracleDesktopDiscoveredWindow,
  OracleDesktopWindowBounds,
  OracleDesktopWindowDiscoveryResult,
  OracleDesktopWindowDiscoveryStatus,
} from "./window-discovery.js";

import type {
  OracleDesktopAttachmentState,
  OracleDesktopAttachmentStatus,
  OracleDesktopAttachmentTarget,
} from "./overlay/attachment-state.js";

import type {
  OracleCompanionPresentationState,
} from "./companion/companion-presentation-state.js";
import type {
  OraclePlatformHealthSnapshot,
} from "../lib/oracle/platform/platform-health.js";
import type {
  CompanionGuidanceApplicationState,
} from "../lib/oracle/applications/companion/index.js";
import type {
  OracleCompanionGuidanceControl,
} from "./companion/companion-guidance-delivery-contract.js";
import type {
  OracleCompanionScreenObservationControl,
  OracleCompanionScreenObservationState,
} from "./companion/companion-screen-observation-contract.js";
import type {
  OracleMatchRecordingResult,
  OracleMatchRecordingState,
} from "./companion/match-recording-contract.js";
import type {
  OracleMatchVideoRecordingResult,
  OracleMatchVideoRecordingState,
} from "./companion/match-video-recording-contract.js";

export const DESKTOP_CHANNELS = {
  getHostState:
    "oracle-desktop:get-host-state",

  getCompanionPresentationState:
    "oracle-desktop:get-companion-presentation-state",

  getPlatformHealth:
    "oracle-desktop:get-platform-health",

  getCompanionGuidanceState:
    "oracle-desktop:get-companion-guidance-state",

  requestCompanionGuidance:
    "oracle-desktop:request-companion-guidance",

  getCompanionScreenObservationState:
    "oracle-desktop:get-companion-screen-observation-state",

  controlCompanionScreenObservation:
    "oracle-desktop:control-companion-screen-observation",

  getMatchRecordingState:
    "oracle-desktop:get-match-recording-state",

  startMatchRecording:
    "oracle-desktop:start-match-recording",

  stopMatchRecording:
    "oracle-desktop:stop-match-recording",

  matchRecordingStateChanged:
    "oracle-desktop:match-recording-state-changed",

  matchRecordingHotkeyStopped:
    "oracle-desktop:match-recording-hotkey-stopped",

  getMatchVideoRecordingState:
    "oracle-desktop:get-match-video-recording-state",

  startMatchVideoRecording:
    "oracle-desktop:start-match-video-recording",

  stopMatchVideoRecording:
    "oracle-desktop:stop-match-video-recording",

  matchVideoRecordingStateChanged:
    "oracle-desktop:match-video-recording-state-changed",

  readMatchVideoBytes:
    "oracle-desktop:read-match-video-bytes",

  deleteMatchVideoFile:
    "oracle-desktop:delete-match-video-file",

  getToggleWatchHotkey:
    "oracle-desktop:get-toggle-watch-hotkey",

  setToggleWatchHotkey:
    "oracle-desktop:set-toggle-watch-hotkey",

  toggleOverlayPreview:
    "oracle-desktop:toggle-overlay-preview",

  toggleAlwaysOnTop:
    "oracle-desktop:toggle-always-on-top",

  toggleClickThrough:
    "oracle-desktop:toggle-click-through",

  restoreInteraction:
    "oracle-desktop:restore-interaction",

  minimizeWindow:
    "oracle-desktop:minimize-window",

  toggleMaximizeWindow:
    "oracle-desktop:toggle-maximize-window",

  closeWindow:
    "oracle-desktop:close-window",

  hostStateChanged:
    "oracle-desktop:host-state-changed",

  companionPresentationStateChanged:
    "oracle-desktop:companion-presentation-state-changed",

  companionGuidanceStateChanged:
    "oracle-desktop:companion-guidance-state-changed",

  companionScreenObservationStateChanged:
    "oracle-desktop:companion-screen-observation-state-changed",

  notifyReportGenerationStatus:
    "oracle-desktop:notify-report-generation-status",

  getWatchIndicatorSettings:
    "oracle-desktop:get-watch-indicator-settings",

  setWatchIndicatorHidden:
    "oracle-desktop:set-watch-indicator-hidden",

  enterIndicatorPositioningMode:
    "oracle-desktop:enter-indicator-positioning-mode",

  exitIndicatorPositioningMode:
    "oracle-desktop:exit-indicator-positioning-mode",

  getIndicatorPositioningHotkey:
    "oracle-desktop:get-indicator-positioning-hotkey",

  setIndicatorPositioningHotkey:
    "oracle-desktop:set-indicator-positioning-hotkey",

  indicatorPositioningModeChanged:
    "oracle-desktop:indicator-positioning-mode-changed",
} as const;

export const ORACLE_DESKTOP_RECOVERY_SHORTCUT =
  "CommandOrControl+Shift+O";

/**
 * State of a global hotkey (currently used for both "toggle Watch & Coach"
 * and "toggle indicator positioning mode"): the accelerator string
 * currently configured, and whether it's actually bound at the OS level
 * right now (registration can fail if another running application already
 * grabbed the same combination -- that's surfaced here rather than failing
 * silently, so the Settings UI can tell the Operator to pick another one).
 */
export type OracleDesktopToggleWatchHotkeyState = Readonly<{
  accelerator: string;
  registered: boolean;
}>;

/**
 * Lifecycle of the coaching report that follows a stopped Watch & Coach
 * session, as observed from the Companion renderer (fetch in flight /
 * succeeded / failed). Pushed to the main process so the small always-on-top
 * watch indicator can reflect it without needing its own knowledge of the
 * coach-report API -- the indicator only ever reacts to this plus match
 * recording status.
 */
export type OracleReportGenerationStatus =
  | "idle"
  | "generating"
  | "ready"
  | "failed";

/**
 * Operator-configurable presentation of the small always-on-top "Watch &
 * Coach" status indicator: whether it should ever draw at all (some
 * Operators want zero on-screen presence and to rely on the hotkey plus a
 * Windows notification instead) and, once repositioned via positioning
 * mode, the on-screen point it was dropped at.
 */
export type OracleWatchIndicatorSettings = Readonly<{
  hidden: boolean;
  position: Readonly<{ x: number; y: number }> | null;
}>;

export type {
  OracleCompanionPresentationState,
  OraclePlatformHealthSnapshot,
  CompanionGuidanceApplicationState,
  OracleCompanionGuidanceControl,
  OracleCompanionScreenObservationControl,
  OracleCompanionScreenObservationState,
  OracleMatchRecordingResult,
  OracleMatchRecordingState,
  OracleMatchVideoRecordingResult,
  OracleMatchVideoRecordingState,
  OracleDesktopAttachmentState,
  OracleDesktopAttachmentStatus,
  OracleDesktopAttachmentTarget,
  OracleDesktopDiscoveredWindow,
  OracleDesktopDisplayState,
  OracleDesktopHostState,
  OracleDesktopHostWindowDiscoveryState,
  OracleDesktopHostWindowDiscoveryStatus,
  OracleDesktopRectangle,
  OracleDesktopRuntimeState,
  OracleDesktopWindowBounds,
  OracleDesktopWindowDiscoveryResult,
  OracleDesktopWindowDiscoveryStatus,
  OracleDesktopWindowMode,
};

export type OracleDesktopBridge = {
  getHostState: () =>
    Promise<OracleDesktopHostState>;

  getCompanionPresentationState: () =>
    Promise<OracleCompanionPresentationState>;

  getPlatformHealth: () =>
    Promise<OraclePlatformHealthSnapshot>;

  getCompanionGuidanceState: () =>
    Promise<CompanionGuidanceApplicationState>;

  requestCompanionGuidance: (
    control: OracleCompanionGuidanceControl
  ) => Promise<CompanionGuidanceApplicationState>;

  getCompanionScreenObservationState: () =>
    Promise<OracleCompanionScreenObservationState>;

  controlCompanionScreenObservation: (
    control: OracleCompanionScreenObservationControl
  ) => Promise<OracleCompanionScreenObservationState>;

  getMatchRecordingState: () =>
    Promise<OracleMatchRecordingState>;

  startMatchRecording: () =>
    Promise<OracleMatchRecordingState>;

  stopMatchRecording: () =>
    Promise<OracleMatchRecordingResult | null>;

  onMatchRecordingStateChanged: (
    listener: (
      state: OracleMatchRecordingState
    ) => void
  ) => () => void;

  /**
   * Fires once, carrying the captured frames, whenever the global toggle
   * hotkey stops a watch session -- the button-driven stop already gets its
   * result as the return value of stopMatchRecording(), but a hotkey press
   * has no such caller to return to, so the result is pushed here instead
   * so the report can still be submitted automatically.
   */
  onMatchRecordingHotkeyStopped: (
    listener: (
      result: OracleMatchRecordingResult
    ) => void
  ) => () => void;

  /**
   * The Full Match Analysis pipeline: a real screen+audio recording of the
   * attached window (OracleMatchVideoRecordingCoordinator), additive to and
   * entirely independent of the still-frame Watch & Coach flow above --
   * separate state, separate hidden capture window, separate report path.
   */
  getMatchVideoRecordingState: () =>
    Promise<OracleMatchVideoRecordingState>;

  startMatchVideoRecording: () =>
    Promise<OracleMatchVideoRecordingState>;

  stopMatchVideoRecording: () =>
    Promise<OracleMatchVideoRecordingResult | null>;

  onMatchVideoRecordingStateChanged: (
    listener: (
      state: OracleMatchVideoRecordingState
    ) => void
  ) => () => void;

  /**
   * Reads back a video this same session's stopMatchVideoRecording() just
   * produced (main rejects any other path -- see
   * OracleMatchVideoRecordingCoordinator.readVideoFile), so the Companion
   * renderer can attach it to a normal same-origin fetch() upload without
   * ever needing filesystem access itself.
   */
  readMatchVideoBytes: (
    videoPath: string
  ) => Promise<Uint8Array>;

  /**
   * Deletes a video this same session's stopMatchVideoRecording() produced,
   * once the Operator no longer needs the local copy (same path
   * restriction as readMatchVideoBytes above).
   */
  deleteMatchVideoFile: (
    videoPath: string
  ) => Promise<void>;

  getToggleWatchHotkey: () =>
    Promise<OracleDesktopToggleWatchHotkeyState>;

  setToggleWatchHotkey: (
    accelerator: string
  ) => Promise<OracleDesktopToggleWatchHotkeyState>;

  toggleOverlayPreview: () =>
    Promise<OracleDesktopHostState>;

  toggleAlwaysOnTop: () =>
    Promise<OracleDesktopHostState>;

  toggleClickThrough: () =>
    Promise<OracleDesktopHostState>;

  restoreInteraction: () =>
    Promise<OracleDesktopHostState>;

  minimizeWindow: () =>
    Promise<OracleDesktopHostState>;

  toggleMaximizeWindow: () =>
    Promise<OracleDesktopHostState>;

  closeWindow: () =>
    Promise<void>;

  onHostStateChanged: (
    listener: (
      state: OracleDesktopHostState
    ) => void
  ) => () => void;

  onCompanionPresentationStateChanged: (
    listener: (
      state:
        OracleCompanionPresentationState
    ) => void
  ) => () => void;

  onCompanionGuidanceStateChanged: (
    listener: (
      state: CompanionGuidanceApplicationState
    ) => void
  ) => () => void;

  onCompanionScreenObservationStateChanged: (
    listener: (
      state: OracleCompanionScreenObservationState
    ) => void
  ) => () => void;

  /**
   * Tells the main process what the coach-report request for the last
   * stopped Watch & Coach session is doing, so the small watch indicator
   * (a separate always-on-top window the Companion renderer has no direct
   * handle to) can reflect it -- an amber "generating" state, then a brief
   * green "ready" flash or a red "failed" one before it fades.
   */
  notifyReportGenerationStatus: (
    status: OracleReportGenerationStatus
  ) => Promise<void>;

  getWatchIndicatorSettings: () =>
    Promise<OracleWatchIndicatorSettings>;

  setWatchIndicatorHidden: (
    hidden: boolean
  ) => Promise<OracleWatchIndicatorSettings>;

  /**
   * Temporarily makes the indicator draggable (and interactive) so the
   * Operator can drop it wherever suits their HUD; exitIndicatorPositioningMode
   * saves wherever it was left and returns it to click-through.
   */
  enterIndicatorPositioningMode: () => Promise<void>;

  exitIndicatorPositioningMode: () => Promise<void>;

  getIndicatorPositioningHotkey: () =>
    Promise<OracleDesktopToggleWatchHotkeyState>;

  setIndicatorPositioningHotkey: (
    accelerator: string
  ) => Promise<OracleDesktopToggleWatchHotkeyState>;

  /**
   * Fires whenever positioning mode is entered or exited by any trigger --
   * the Settings button or the global hotkey -- so a Settings page left
   * open stays in sync even if positioning mode was toggled from in-game.
   */
  onIndicatorPositioningModeChanged: (
    listener: (positioning: boolean) => void
  ) => () => void;
};
