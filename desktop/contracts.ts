export const DESKTOP_CHANNELS = {
  getHostState: "oracle-desktop:get-host-state",
  toggleOverlayPreview: "oracle-desktop:toggle-overlay-preview",
  minimizeWindow: "oracle-desktop:minimize-window",
  toggleMaximizeWindow: "oracle-desktop:toggle-maximize-window",
  closeWindow: "oracle-desktop:close-window",
  hostStateChanged: "oracle-desktop:host-state-changed",
} as const;

export type OracleDesktopWindowMode =
  | "development"
  | "overlay-preview";

export type OracleDesktopHostState = {
  ready: boolean;
  windowVisible: boolean;
  windowFocused: boolean;
  windowMaximized: boolean;
  windowMode: OracleDesktopWindowMode;
  transparent: boolean;
  developmentMode: boolean;
};

export type OracleDesktopBridge = {
  getHostState: () => Promise<OracleDesktopHostState>;

  toggleOverlayPreview: () => Promise<OracleDesktopHostState>;

  minimizeWindow: () => Promise<OracleDesktopHostState>;

  toggleMaximizeWindow: () => Promise<OracleDesktopHostState>;

  closeWindow: () => Promise<void>;

  onHostStateChanged: (
    listener: (state: OracleDesktopHostState) => void
  ) => () => void;
};