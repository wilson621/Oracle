import type {
  OracleDesktopHostState,
  OracleDesktopWindowMode,
} from "./host-state.js";

export const DESKTOP_CHANNELS = {
  getHostState: "oracle-desktop:get-host-state",
  toggleOverlayPreview: "oracle-desktop:toggle-overlay-preview",
  toggleAlwaysOnTop: "oracle-desktop:toggle-always-on-top",
  minimizeWindow: "oracle-desktop:minimize-window",
  toggleMaximizeWindow: "oracle-desktop:toggle-maximize-window",
  closeWindow: "oracle-desktop:close-window",
  hostStateChanged: "oracle-desktop:host-state-changed",
} as const;

export type {
  OracleDesktopHostState,
  OracleDesktopWindowMode,
};

export type OracleDesktopBridge = {
  getHostState: () => Promise<OracleDesktopHostState>;

  toggleOverlayPreview: () => Promise<OracleDesktopHostState>;

  toggleAlwaysOnTop: () => Promise<OracleDesktopHostState>;

  minimizeWindow: () => Promise<OracleDesktopHostState>;

  toggleMaximizeWindow: () => Promise<OracleDesktopHostState>;

  closeWindow: () => Promise<void>;

  onHostStateChanged: (
    listener: (state: OracleDesktopHostState) => void
  ) => () => void;
};