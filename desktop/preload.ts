import {
  contextBridge,
  ipcRenderer,
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
};

contextBridge.exposeInMainWorld(
  "oracleDesktop",
  oracleDesktopBridge
);