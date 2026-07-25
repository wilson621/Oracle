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
} as const;

export const ORACLE_DESKTOP_RECOVERY_SHORTCUT =
  "CommandOrControl+Shift+O";

export type {
  OracleCompanionPresentationState,
  OraclePlatformHealthSnapshot,
  CompanionGuidanceApplicationState,
  OracleCompanionGuidanceControl,
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
};
