import {
  app,
  globalShortcut,
  ipcMain,
  type IpcMainInvokeEvent,
} from "electron";
import {
  DESKTOP_CHANNELS,
  ORACLE_DESKTOP_RECOVERY_SHORTCUT,
  type OracleDesktopToggleWatchHotkeyState,
  type OracleReportGenerationStatus,
  type OracleWatchIndicatorSettings,
} from "./contracts.js";
import { CompanionHostWindowController } from "./overlay-window.js";
import { WatchIndicatorWindowController } from "./watch-indicator-window.js";
import {
  DEFAULT_TOGGLE_WATCH_ACCELERATOR,
  DEFAULT_POSITIONING_MODE_ACCELERATOR,
  loadHotkeySettings,
  saveHotkeySettings,
} from "./companion/hotkey-settings-store.js";
import {
  getOracleDesktopGameIntegrationRegistry,
  getOracleDesktopGuidanceProviderService,
  getOracleDesktopPlatformHealth,
  startOracleDesktopPlatform,
  stopOracleDesktopPlatform,
} from "./platform/desktop-composition-root.js";
import {
  ORACLE_DESKTOP_RELEASE_CHANNELS,
} from "./release/desktop-release-contract.js";
import {
  OracleDesktopUpdateCoordinator,
} from "./release/desktop-update-coordinator.js";
import {
  OraclePackagedNextServer,
} from "./runtime/packaged-next-server.js";
import {
  consumeInstalledRuntimeConfiguration,
} from "./runtime/installed-runtime-configuration.js";

const DEFAULT_COMPANION_URL =
  "http://localhost:3000/companion";

app.enableSandbox();

let hostWindowController:
  | CompanionHostWindowController
  | null = null;
let watchIndicator:
  | WatchIndicatorWindowController
  | null = null;
let unsubscribeIndicatorMatchStatus:
  | (() => void)
  | null = null;
let companionUrl =
  DEFAULT_COMPANION_URL;
let packagedProviderOrigin:
  string | undefined;
// Populated inside app.whenReady() below -- app.getPath("userData"), which
// loadHotkeySettings() needs, is only safe to call once Electron is ready.
let toggleWatchAccelerator =
  DEFAULT_TOGGLE_WATCH_ACCELERATOR;
let toggleWatchRegistered = false;
let positioningModeAccelerator =
  DEFAULT_POSITIONING_MODE_ACCELERATOR;
let positioningModeRegistered = false;

const packagedNextServer =
  new OraclePackagedNextServer();

const desktopUpdateCoordinator =
  new OracleDesktopUpdateCoordinator({
    currentVersion: app.getVersion(),
    manifestProvider: null,
    replacementBoundary: {
      invalidateObservation: () => {
        hostWindowController
          ?.invalidateObservationForReplacement();
      },
      detachCompanion: () => {
        hostWindowController
          ?.detachForReplacement();
      },
      stopRuntime: () => {
        hostWindowController?.close();
        hostWindowController = null;
        teardownWatchIndicator();
        packagedNextServer.stop();
        stopOracleDesktopPlatform();
      },
    },
  });

const hasSingleInstanceLock =
  app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    restoreInteraction();
  });

  app
    .whenReady()
    .then(async () => {
      companionUrl =
        await resolveCompanionUrl();

      const health = startOracleDesktopPlatform();
      if (health.status === "failed") {
        throw new Error(
          "Oracle Desktop Platform failed its composition readiness gate."
        );
      }

      registerIpcHandlers();
      registerReleaseIpcHandlers();
      registerRecoveryShortcut();

      const storedHotkeySettings =
        loadHotkeySettings();
      toggleWatchAccelerator =
        storedHotkeySettings.toggleWatchAccelerator;
      toggleWatchRegistered =
        registerToggleWatchShortcut(
          toggleWatchAccelerator
        );
      positioningModeAccelerator =
        storedHotkeySettings.positioningModeAccelerator;
      positioningModeRegistered =
        registerPositioningModeShortcut(
          positioningModeAccelerator
        );

      hostWindowController =
        createHostWindowController();

      await hostWindowController.create();

      attachWatchIndicator(
        hostWindowController
      );
    })
    .catch((error: unknown) => {
      console.error(
        "Oracle Companion desktop host failed to start.",
        error
      );

      app.exit(1);
    });
}

app.on("activate", () => {
  if (
    hostWindowController?.getWindow()
  ) {
    restoreInteraction();
    return;
  }

  hostWindowController =
    createHostWindowController();

  void hostWindowController
    .create()
    .then(() => {
      if (hostWindowController) {
        attachWatchIndicator(
          hostWindowController
        );
      }
    })
    .catch((error: unknown) => {
      console.error(
        "Oracle Companion window failed to reopen.",
        error
      );
    });
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  removeIpcHandlers();
  removeReleaseIpcHandlers();

  hostWindowController?.close();
  hostWindowController = null;
  teardownWatchIndicator();
  packagedNextServer.stop();
  stopOracleDesktopPlatform();
});

app.on("will-quit", () => {
  globalShortcut.unregister(
    ORACLE_DESKTOP_RECOVERY_SHORTCUT
  );
  globalShortcut.unregister(
    toggleWatchAccelerator
  );
  globalShortcut.unregister(
    positioningModeAccelerator
  );
});

/**
 * (Re)creates the small always-on-top watch indicator alongside a freshly
 * created (or reopened) Companion window and wires it to that window's
 * match-recording status stream. Idempotent-ish: safe to call again after
 * "activate" reopens the Companion window, since teardownWatchIndicator()
 * always runs first wherever the Companion window itself is torn down.
 */
function attachWatchIndicator(
  controller: CompanionHostWindowController
): void {
  if (!watchIndicator) {
    watchIndicator = new WatchIndicatorWindowController(
      (positioning) => {
        controller
          .getWindow()
          ?.webContents.send(
            DESKTOP_CHANNELS.indicatorPositioningModeChanged,
            positioning
          );
      }
    );
    watchIndicator.create();
  }

  unsubscribeIndicatorMatchStatus?.();
  unsubscribeIndicatorMatchStatus =
    controller.subscribeMatchRecordingStatus((status) => {
      watchIndicator?.setMatchRecordingStatus(status);
    });
}

function teardownWatchIndicator(): void {
  unsubscribeIndicatorMatchStatus?.();
  unsubscribeIndicatorMatchStatus = null;
  watchIndicator?.destroy();
  watchIndicator = null;
}

function normaliseReportGenerationStatus(
  value: unknown
): OracleReportGenerationStatus {
  return value === "generating" ||
    value === "ready" ||
    value === "failed"
    ? value
    : "idle";
}

function currentWatchIndicatorSettings(): OracleWatchIndicatorSettings {
  return (
    watchIndicator?.getSettings() ?? {
      hidden: false,
      position: null,
    }
  );
}

function createHostWindowController(): CompanionHostWindowController {
  return new CompanionHostWindowController({
    companionUrl,
    gameIntegrationRegistry:
      getOracleDesktopGameIntegrationRegistry(),
    guidanceService:
      getOracleDesktopGuidanceProviderService(),
    providerOrigin:
      packagedProviderOrigin,
  });
}

async function resolveCompanionUrl():
  Promise<string> {
  if (app.isPackaged) {
    const runtimeConfiguration =
      consumeInstalledRuntimeConfiguration(
        process.argv
      );
    packagedProviderOrigin =
      new URL(
        runtimeConfiguration.environment
          .ORACLE_SUPABASE_URL
      ).origin;
    return await packagedNextServer.start(
      process.resourcesPath,
      runtimeConfiguration.environment
    );
  }

  return (
    process.env.ORACLE_COMPANION_URL ??
    DEFAULT_COMPANION_URL
  );
}

function registerRecoveryShortcut(): void {
  const registered =
    globalShortcut.register(
      ORACLE_DESKTOP_RECOVERY_SHORTCUT,
      () => {
        restoreInteraction();
      }
    );

  if (!registered) {
    console.warn(
      `Oracle Companion could not register the recovery shortcut '${ORACLE_DESKTOP_RECOVERY_SHORTCUT}'.`
    );
  }
}

function registerToggleWatchShortcut(
  accelerator: string
): boolean {
  const registered =
    globalShortcut.register(
      accelerator,
      () => {
        hostWindowController
          ?.toggleMatchRecordingFromHotkey();
      }
    );

  if (!registered) {
    console.warn(
      `Oracle Companion could not register the Watch & Coach hotkey '${accelerator}'.`
    );
  }

  return registered;
}

function applyToggleWatchHotkey(
  accelerator: unknown
): OracleDesktopToggleWatchHotkeyState {
  if (
    typeof accelerator !== "string" ||
    accelerator.trim().length === 0
  ) {
    return currentToggleWatchHotkeyState();
  }

  const trimmed = accelerator.trim();
  if (trimmed === toggleWatchAccelerator) {
    return currentToggleWatchHotkeyState();
  }

  const previousAccelerator =
    toggleWatchAccelerator;
  const previousRegistered =
    toggleWatchRegistered;

  if (toggleWatchRegistered) {
    globalShortcut.unregister(
      previousAccelerator
    );
  }

  const registered =
    registerToggleWatchShortcut(trimmed);

  if (registered) {
    toggleWatchAccelerator = trimmed;
    toggleWatchRegistered = true;
    persistHotkeySettings();
  } else {
    // Couldn't bind the requested combination (most likely already claimed
    // by another running application) -- restore the previous one rather
    // than leaving the Operator with no working hotkey at all.
    toggleWatchAccelerator =
      previousAccelerator;
    toggleWatchRegistered =
      previousRegistered
        ? registerToggleWatchShortcut(
            previousAccelerator
          )
        : false;
  }

  return currentToggleWatchHotkeyState();
}

function currentToggleWatchHotkeyState(): OracleDesktopToggleWatchHotkeyState {
  return {
    accelerator: toggleWatchAccelerator,
    registered: toggleWatchRegistered,
  };
}

function registerPositioningModeShortcut(
  accelerator: string
): boolean {
  const registered =
    globalShortcut.register(
      accelerator,
      () => {
        watchIndicator?.togglePositioningMode();
      }
    );

  if (!registered) {
    console.warn(
      `Oracle Companion could not register the indicator positioning hotkey '${accelerator}'.`
    );
  }

  return registered;
}

function applyPositioningModeHotkey(
  accelerator: unknown
): OracleDesktopToggleWatchHotkeyState {
  if (
    typeof accelerator !== "string" ||
    accelerator.trim().length === 0
  ) {
    return currentPositioningModeHotkeyState();
  }

  const trimmed = accelerator.trim();
  if (trimmed === positioningModeAccelerator) {
    return currentPositioningModeHotkeyState();
  }

  const previousAccelerator =
    positioningModeAccelerator;
  const previousRegistered =
    positioningModeRegistered;

  if (positioningModeRegistered) {
    globalShortcut.unregister(
      previousAccelerator
    );
  }

  const registered =
    registerPositioningModeShortcut(trimmed);

  if (registered) {
    positioningModeAccelerator = trimmed;
    positioningModeRegistered = true;
    persistHotkeySettings();
  } else {
    positioningModeAccelerator =
      previousAccelerator;
    positioningModeRegistered =
      previousRegistered
        ? registerPositioningModeShortcut(
            previousAccelerator
          )
        : false;
  }

  return currentPositioningModeHotkeyState();
}

function currentPositioningModeHotkeyState(): OracleDesktopToggleWatchHotkeyState {
  return {
    accelerator: positioningModeAccelerator,
    registered: positioningModeRegistered,
  };
}

/**
 * Both configurable hotkeys live in the same on-disk settings file (see
 * hotkey-settings-store.ts) -- always save both current values together so
 * changing one never drops the other.
 */
function persistHotkeySettings(): void {
  saveHotkeySettings({
    toggleWatchAccelerator,
    positioningModeAccelerator,
  });
}

function restoreInteraction(): void {
  if (!hostWindowController) {
    return;
  }

  try {
    hostWindowController
      .restoreInteraction();
  } catch (error) {
    console.error(
      "Oracle Companion could not restore interactive mode.",
      error
    );
  }
}

function registerIpcHandlers(): void {
  removeIpcHandlers();

  ipcMain.handle(
    DESKTOP_CHANNELS.getHostState,
    (event) => {
      return requireAuthorizedController(
        event
      ).getState();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.getPlatformHealth,
    (event) => {
      requireAuthorizedController(event);
      const health = getOracleDesktopPlatformHealth();
      if (!health) {
        throw new Error("Oracle Desktop Platform health is unavailable.");
      }
      return health;
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS
      .getCompanionPresentationState,
    (event) => {
      return requireAuthorizedController(
        event
      ).getCompanionPresentationState();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.getCompanionGuidanceState,
    (event) => {
      return requireAuthorizedController(
        event
      ).getCompanionGuidanceState();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.requestCompanionGuidance,
    (event, control: unknown) => {
      return requireAuthorizedController(
        event
      ).requestCompanionGuidance(control);
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.getCompanionScreenObservationState,
    (event) =>
      requireAuthorizedController(event)
        .getCompanionScreenObservationState()
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.controlCompanionScreenObservation,
    (event, control: unknown) =>
      requireAuthorizedController(event)
        .controlCompanionScreenObservation(control)
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.getMatchRecordingState,
    (event) =>
      requireAuthorizedController(event)
        .getMatchRecordingState()
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.startMatchRecording,
    (event) =>
      requireAuthorizedController(event)
        .startMatchRecording()
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.stopMatchRecording,
    (event) =>
      requireAuthorizedController(event)
        .stopMatchRecording()
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.getToggleWatchHotkey,
    (event) => {
      requireAuthorizedController(event);
      return currentToggleWatchHotkeyState();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.setToggleWatchHotkey,
    (event, accelerator: unknown) => {
      requireAuthorizedController(event);
      return applyToggleWatchHotkey(
        accelerator
      );
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.notifyReportGenerationStatus,
    (event, status: unknown) => {
      requireAuthorizedController(event);
      watchIndicator?.setReportGenerationStatus(
        normaliseReportGenerationStatus(status)
      );
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.getWatchIndicatorSettings,
    (event) => {
      requireAuthorizedController(event);
      return currentWatchIndicatorSettings();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.setWatchIndicatorHidden,
    (event, hidden: unknown) => {
      requireAuthorizedController(event);
      return (
        watchIndicator?.setHidden(hidden === true) ??
        currentWatchIndicatorSettings()
      );
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.enterIndicatorPositioningMode,
    (event) => {
      requireAuthorizedController(event);
      watchIndicator?.enterPositioningMode();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.exitIndicatorPositioningMode,
    (event) => {
      requireAuthorizedController(event);
      watchIndicator?.exitPositioningMode();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.getIndicatorPositioningHotkey,
    (event) => {
      requireAuthorizedController(event);
      return currentPositioningModeHotkeyState();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.setIndicatorPositioningHotkey,
    (event, accelerator: unknown) => {
      requireAuthorizedController(event);
      return applyPositioningModeHotkey(
        accelerator
      );
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.toggleOverlayPreview,
    (event) => {
      return requireAuthorizedController(
        event
      ).toggleOverlayPreview();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.toggleAlwaysOnTop,
    (event) => {
      return requireAuthorizedController(
        event
      ).toggleAlwaysOnTop();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.toggleClickThrough,
    (event) => {
      return requireAuthorizedController(
        event
      ).toggleClickThrough();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.restoreInteraction,
    (event) => {
      return requireAuthorizedController(
        event
      ).restoreInteraction();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.minimizeWindow,
    (event) => {
      return requireAuthorizedController(
        event
      ).minimize();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.toggleMaximizeWindow,
    (event) => {
      return requireAuthorizedController(
        event
      ).toggleMaximize();
    }
  );

  ipcMain.handle(
    DESKTOP_CHANNELS.closeWindow,
    (event) => {
      requireAuthorizedController(
        event
      ).close();
    }
  );
}

function removeIpcHandlers(): void {
  ipcMain.removeHandler(
    DESKTOP_CHANNELS.getHostState
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.getCompanionGuidanceState
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.requestCompanionGuidance
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.getCompanionScreenObservationState
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.controlCompanionScreenObservation
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.getMatchRecordingState
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.startMatchRecording
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.stopMatchRecording
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.getPlatformHealth
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS
      .getCompanionPresentationState
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.getToggleWatchHotkey
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.setToggleWatchHotkey
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.notifyReportGenerationStatus
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.getWatchIndicatorSettings
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.setWatchIndicatorHidden
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.enterIndicatorPositioningMode
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.exitIndicatorPositioningMode
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.getIndicatorPositioningHotkey
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.setIndicatorPositioningHotkey
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.toggleOverlayPreview
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.toggleAlwaysOnTop
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.toggleClickThrough
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.restoreInteraction
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.minimizeWindow
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.toggleMaximizeWindow
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS.closeWindow
  );
}

function registerReleaseIpcHandlers(): void {
  removeReleaseIpcHandlers();

  ipcMain.handle(
    ORACLE_DESKTOP_RELEASE_CHANNELS
      .getState,
    (event) => {
      requireAuthorizedController(event);
      return desktopUpdateCoordinator
        .getState();
    }
  );

  ipcMain.handle(
    ORACLE_DESKTOP_RELEASE_CHANNELS.check,
    async (event) => {
      const controller =
        requireAuthorizedController(event);
      const state =
        await desktopUpdateCoordinator
          .checkForUpdates();
      controller
        .getWindow()
        ?.webContents.send(
          ORACLE_DESKTOP_RELEASE_CHANNELS
            .stateChanged,
          state
        );
      return state;
    }
  );
}

function removeReleaseIpcHandlers(): void {
  ipcMain.removeHandler(
    ORACLE_DESKTOP_RELEASE_CHANNELS
      .getState
  );
  ipcMain.removeHandler(
    ORACLE_DESKTOP_RELEASE_CHANNELS.check
  );
}

function requireAuthorizedController(
  event: IpcMainInvokeEvent
): CompanionHostWindowController {
  if (!hostWindowController) {
    throw new Error(
      "Oracle Companion host controller is unavailable."
    );
  }

  if (
    !hostWindowController.ownsWebContentsId(
      event.sender.id
    ) ||
    !hostWindowController.ownsFrameUrl(
      event.senderFrame?.url ?? ""
    )
  ) {
    throw new Error(
      "Unauthorized Oracle desktop IPC sender."
    );
  }

  return hostWindowController;
}
