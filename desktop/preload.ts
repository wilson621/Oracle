import {
  contextBridge,
  ipcRenderer,
  type IpcRendererEvent,
} from "electron";
import {
  DESKTOP_CHANNELS,
  type OracleDesktopBridge,
  type OracleDesktopHostState,
} from "./contracts.js";

const oracleDesktopBridge: OracleDesktopBridge = {
  getHostState: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.getHostState
    ) as Promise<OracleDesktopHostState>,

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
};

contextBridge.exposeInMainWorld(
  "oracleDesktop",
  oracleDesktopBridge
);