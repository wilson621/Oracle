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
  type OracleDesktopToggleWatchHotkeyState,
  type OraclePlatformHealthSnapshot,
  type CompanionGuidanceApplicationState,
  type OracleCompanionScreenObservationState,
  type OracleMatchRecordingResult,
  type OracleMatchRecordingState,
  type OracleMatchVideoRecordingResult,
  type OracleMatchVideoRecordingState,
  type OracleWatchIndicatorSettings,
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
  isOracleMatchRecordingState,
} from "./companion/match-recording-contract.js";
import {
  isOracleMatchVideoRecordingState,
} from "./companion/match-video-recording-contract.js";
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

  getMatchRecordingState: async () => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.getMatchRecordingState
    );
    return requireMatchRecordingState(value);
  },

  startMatchRecording: async () => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.startMatchRecording
    );
    return requireMatchRecordingState(value);
  },

  stopMatchRecording: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.stopMatchRecording
    ) as Promise<OracleMatchRecordingResult | null>,

  onMatchRecordingStateChanged: (listener) => {
    let subscribed = true;
    const handler = (
      _event: IpcRendererEvent,
      value: unknown
    ) => {
      if (subscribed && isOracleMatchRecordingState(value)) {
        listener(value);
      }
    };
    ipcRenderer.on(
      DESKTOP_CHANNELS.matchRecordingStateChanged,
      handler
    );
    return () => {
      subscribed = false;
      ipcRenderer.removeListener(
        DESKTOP_CHANNELS.matchRecordingStateChanged,
        handler
      );
    };
  },

  onMatchRecordingHotkeyStopped: (listener) => {
    let subscribed = true;
    const handler = (
      _event: IpcRendererEvent,
      value: unknown
    ) => {
      if (subscribed && isOracleMatchRecordingResult(value)) {
        listener(value);
      }
    };
    ipcRenderer.on(
      DESKTOP_CHANNELS.matchRecordingHotkeyStopped,
      handler
    );
    return () => {
      subscribed = false;
      ipcRenderer.removeListener(
        DESKTOP_CHANNELS.matchRecordingHotkeyStopped,
        handler
      );
    };
  },

  getMatchVideoRecordingState: async () => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.getMatchVideoRecordingState
    );
    return requireMatchVideoRecordingState(value);
  },

  startMatchVideoRecording: async () => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.startMatchVideoRecording
    );
    return requireMatchVideoRecordingState(value);
  },

  stopMatchVideoRecording: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.stopMatchVideoRecording
    ) as Promise<OracleMatchVideoRecordingResult | null>,

  onMatchVideoRecordingStateChanged: (listener) => {
    let subscribed = true;
    const handler = (
      _event: IpcRendererEvent,
      value: unknown
    ) => {
      if (subscribed && isOracleMatchVideoRecordingState(value)) {
        listener(value);
      }
    };
    ipcRenderer.on(
      DESKTOP_CHANNELS.matchVideoRecordingStateChanged,
      handler
    );
    return () => {
      subscribed = false;
      ipcRenderer.removeListener(
        DESKTOP_CHANNELS.matchVideoRecordingStateChanged,
        handler
      );
    };
  },

  readMatchVideoBytes: (videoPath) =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.readMatchVideoBytes,
      videoPath
    ) as Promise<Uint8Array>,

  deleteMatchVideoFile: (videoPath) =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.deleteMatchVideoFile,
      videoPath
    ) as Promise<void>,

  getToggleWatchHotkey: async () => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.getToggleWatchHotkey
    );
    return requireToggleWatchHotkeyState(value);
  },

  setToggleWatchHotkey: async (accelerator) => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.setToggleWatchHotkey,
      accelerator
    );
    return requireToggleWatchHotkeyState(value);
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

  notifyReportGenerationStatus: (status) =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.notifyReportGenerationStatus,
      status
    ) as Promise<void>,

  getWatchIndicatorSettings: async () => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.getWatchIndicatorSettings
    );
    return requireWatchIndicatorSettings(value);
  },

  setWatchIndicatorHidden: async (hidden) => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.setWatchIndicatorHidden,
      hidden
    );
    return requireWatchIndicatorSettings(value);
  },

  enterIndicatorPositioningMode: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.enterIndicatorPositioningMode
    ) as Promise<void>,

  exitIndicatorPositioningMode: () =>
    ipcRenderer.invoke(
      DESKTOP_CHANNELS.exitIndicatorPositioningMode
    ) as Promise<void>,

  getIndicatorPositioningHotkey: async () => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.getIndicatorPositioningHotkey
    );
    return requireToggleWatchHotkeyState(value);
  },

  setIndicatorPositioningHotkey: async (accelerator) => {
    const value: unknown = await ipcRenderer.invoke(
      DESKTOP_CHANNELS.setIndicatorPositioningHotkey,
      accelerator
    );
    return requireToggleWatchHotkeyState(value);
  },

  onIndicatorPositioningModeChanged: (listener) => {
    let subscribed = true;
    const handler = (
      _event: IpcRendererEvent,
      value: unknown
    ) => {
      if (subscribed && typeof value === "boolean") {
        listener(value);
      }
    };
    ipcRenderer.on(
      DESKTOP_CHANNELS.indicatorPositioningModeChanged,
      handler
    );
    return () => {
      subscribed = false;
      ipcRenderer.removeListener(
        DESKTOP_CHANNELS.indicatorPositioningModeChanged,
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

function requireMatchRecordingState(
  value: unknown
): OracleMatchRecordingState {
  if (!isOracleMatchRecordingState(value)) {
    throw new Error(
      "Oracle desktop host returned invalid match recording state."
    );
  }
  return value;
}

function requireMatchVideoRecordingState(
  value: unknown
): OracleMatchVideoRecordingState {
  if (!isOracleMatchVideoRecordingState(value)) {
    throw new Error(
      "Oracle desktop host returned invalid match video recording state."
    );
  }
  return value;
}

function isOracleMatchRecordingResult(
  value: unknown
): value is OracleMatchRecordingResult {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.sessionId === "string" &&
    typeof record.startedAt === "string" &&
    typeof record.stoppedAt === "string" &&
    Array.isArray(record.frames)
  );
}

function requireToggleWatchHotkeyState(
  value: unknown
): OracleDesktopToggleWatchHotkeyState {
  if (typeof value !== "object" || value === null) {
    throw new Error(
      "Oracle desktop host returned an invalid toggle-watch hotkey state."
    );
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.accelerator !== "string" ||
    typeof record.registered !== "boolean"
  ) {
    throw new Error(
      "Oracle desktop host returned an invalid toggle-watch hotkey state."
    );
  }
  return value as OracleDesktopToggleWatchHotkeyState;
}

function requireWatchIndicatorSettings(
  value: unknown
): OracleWatchIndicatorSettings {
  if (typeof value !== "object" || value === null) {
    throw new Error(
      "Oracle desktop host returned invalid watch indicator settings."
    );
  }
  const record = value as Record<string, unknown>;
  const position = record.position;
  const positionValid =
    position === null ||
    (typeof position === "object" &&
      position !== null &&
      typeof (position as Record<string, unknown>).x === "number" &&
      typeof (position as Record<string, unknown>).y === "number");
  if (typeof record.hidden !== "boolean" || !positionValid) {
    throw new Error(
      "Oracle desktop host returned invalid watch indicator settings."
    );
  }
  return value as OracleWatchIndicatorSettings;
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
