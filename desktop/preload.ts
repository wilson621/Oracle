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
  type CompanionGuidanceApplicationState,
  type OracleCompanionScreenObservationState,
} from "./contracts.js";
import {
  isOracleCompanionPresentationState,
} from "./companion/companion-presentation-state.js";
import {
  isOraclePlatformHealthSnapshot,
} from "../lib/oracle/platform/platform-health.js";
import {
  isCompanionGuidanceApplicationState,
} from "../lib/oracle/applications/companion/index.js";
import {
  isOracleCompanionScreenObservationState,
} from "./companion/companion-screen-observation-contract.js";
import {
  ORACLE_DESKTOP_RELEASE_CHANNELS,
  isOracleDesktopReleaseState,
  type OracleDesktopReleaseBridge,
} from "./release/desktop-release-contract.js";

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

  getCompanionGuidanceState: async () => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.getCompanionGuidanceState
    );
    return requireCompanionGuidanceState(value);
  },

  requestCompanionGuidance: async (control) => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.requestCompanionGuidance,
      control
    );
    return requireCompanionGuidanceState(value);
  },

  getCompanionScreenObservationState: async () => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.getCompanionScreenObservationState
    );
    return requireCompanionScreenObservationState(value);
  },

  controlCompanionScreenObservation: async (control) => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.controlCompanionScreenObservation,
      control
    );
    return requireCompanionScreenObservationState(value);
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

  onCompanionGuidanceStateChanged:
    (listener) => {
      let subscribed = true;
      const handler = (
        _event: IpcRendererEvent,
        value: unknown
      ) => {
        if (!subscribed) return;
        if (isCompanionGuidanceApplicationState(value)) {
          listener(value);
        }
      };
      ipcRenderer.on(
        DESKTOP_CHANNELS.companionGuidanceStateChanged,
        handler
      );
      return () => {
        subscribed = false;
        ipcRenderer.removeListener(
          DESKTOP_CHANNELS.companionGuidanceStateChanged,
          handler
        );
      };
    },

  onCompanionScreenObservationStateChanged:
    (listener) => {
      let subscribed = true;
      const handler = (
        _event: IpcRendererEvent,
        value: unknown
      ) => {
        if (
          subscribed &&
          isOracleCompanionScreenObservationState(value)
        ) {
          listener(value);
        }
      };
      ipcRenderer.on(
        DESKTOP_CHANNELS.companionScreenObservationStateChanged,
        handler
      );
      return () => {
        subscribed = false;
        ipcRenderer.removeListener(
          DESKTOP_CHANNELS.companionScreenObservationStateChanged,
          handler
        );
      };
  },
};

const oracleDesktopReleaseBridge:
  OracleDesktopReleaseBridge = {
    getState: async () => {
      return requireDesktopReleaseState(
        await ipcRenderer.invoke(
          ORACLE_DESKTOP_RELEASE_CHANNELS
            .getState
        )
      );
    },
    checkForUpdates: async () => {
      return requireDesktopReleaseState(
        await ipcRenderer.invoke(
          ORACLE_DESKTOP_RELEASE_CHANNELS
            .check
        )
      );
    },
    onStateChanged: (listener) => {
      let subscribed = true;
      const handler = (
        _event: IpcRendererEvent,
        value: unknown
      ) => {
        if (
          subscribed &&
          isOracleDesktopReleaseState(value)
        ) {
          listener(value);
        }
      };
      ipcRenderer.on(
        ORACLE_DESKTOP_RELEASE_CHANNELS
          .stateChanged,
        handler
      );
      return () => {
        subscribed = false;
        ipcRenderer.removeListener(
          ORACLE_DESKTOP_RELEASE_CHANNELS
            .stateChanged,
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

function requireCompanionGuidanceState(
  value: unknown
): CompanionGuidanceApplicationState {
  if (!isCompanionGuidanceApplicationState(value)) {
    throw new Error(
      "Oracle desktop host returned invalid Companion Guidance state."
    );
  }
  return value;
}

function requireCompanionScreenObservationState(
  value: unknown
): OracleCompanionScreenObservationState {
  if (!isOracleCompanionScreenObservationState(value)) {
    throw new Error(
      "Oracle desktop host returned invalid screen observation state."
    );
  }
  return value;
}

function requireDesktopReleaseState(
  value: unknown
) {
  if (!isOracleDesktopReleaseState(value)) {
    throw new Error(
      "Oracle desktop host returned invalid release state."
    );
  }
  return value;
}

contextBridge.exposeInMainWorld(
  "oracleDesktop",
  oracleDesktopBridge
);

contextBridge.exposeInMainWorld(
  "oracleDesktopRelease",
  oracleDesktopReleaseBridge
);
