export const DESKTOP_CHANNELS = {
  getHostState: "oracle-desktop:get-host-state",
} as const;

export type OracleDesktopHostState = {
  ready: boolean;
  windowVisible: boolean;
  windowFocused: boolean;
  developmentMode: boolean;
};

export type OracleDesktopBridge = {
  getHostState: () => Promise<OracleDesktopHostState>;
};