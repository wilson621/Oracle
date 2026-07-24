import {
  contextBridge,
  ipcRenderer,
  type IpcRendererEvent,
} from "electron";
import {
  DESKTOP_CHANNELS,
  type OracleCompanionPresentationState,
  type OracleDesktopBridge,
  type OracleDesktopHostState,
  type OraclePlatformHealthSnapshot,
} from "./contracts.js";
import {
  isOracleCompanionPresentationState,
} from "./companion/companion-presentation-state.js";
import {
  isOraclePlatformHealthSnapshot,
} from "../lib/oracle/platform/platform-health.js";

const oracleDesktopBridge: OracleDesktopBridge = {
  getHostState: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.getHostState
    ) as Promise<OracleDesktopHostState>,

  getCompanionPresentationState:
    async () => {
      const value: unknown =
        await ipcRenderer.invoke(
          DESKTOP_CHANNELS
            .getCompanionPresentationState
        );

      return requireCompanionPresentationState(
        value
      );
    },

  getPlatformHealth: async () => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.getPlatformHealth
    );
    if (!isOraclePlatformHealthSnapshot(value)) {
      throw new Error(
        "Oracle desktop host returned an invalid Platform health snapshot."
      );
    }
    return value as OraclePlatformHealthSnapshot;
  },

  toggleOverlayPreview: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.toggleOverlayPreview
    ) as Promise<OracleDesktopHostState>,

  toggleAlwaysOnTop: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.toggleAlwaysOnTop
    ) as Promise<OracleDesktopHostState>,

  toggleClickThrough: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.toggleClickThrough
    ) as Promise<OracleDesktopHostState>,

  restoreInteraction: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.restoreInteraction
    ) as Promise<OracleDesktopHostState>,

  minimizeWindow: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.minimizeWindow
    ) as Promise<OracleDesktopHostState>,

  toggleMaximizeWindow: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.toggleMaximizeWindow
    ) as Promise<OracleDesktopHostState>,

  closeWindow: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.closeWindow
    ) as Promise<void>,

  onHostStateChanged: (listener) => {
    const handler = (
      _event: IpcRendererEvent,
      state: OracleDesktopHostState
    ) => {
      listener(state);
    };

    ipcRenderer.on(
      DESKTOP_CHANNELS.hostStateChanged,
      handler
    );

    return () => {
      ipcRenderer.removeListener(
        DESKTOP_CHANNELS.hostStateChanged,
        handler
      );
    };
  },

  onCompanionPresentationStateChanged:
    (listener) => {
      let subscribed = true;

      const handler = (
        _event: IpcRendererEvent,
        value: unknown
      ) => {
        if (
          !subscribed ||
          !isOracleCompanionPresentationState(
            value
          )
        ) {
          return;
        }

        listener(value);
      };

      ipcRenderer.on(
        DESKTOP_CHANNELS
          .companionPresentationStateChanged,
        handler
      );

      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;

        ipcRenderer.removeListener(
          DESKTOP_CHANNELS
            .companionPresentationStateChanged,
          handler
        );
      };
    },
};

function requireCompanionPresentationState(
  value: unknown
): OracleCompanionPresentationState {
  if (
    !isOracleCompanionPresentationState(
      value
    )
  ) {
    throw new Error(
      "Oracle desktop host returned an invalid Companion presentation state."
    );
  }

  return value;
}

contextBridge.exposeInMainWorld(
  "oracleDesktop",
  oracleDesktopBridge
);
