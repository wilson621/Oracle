import {
  app,
  globalShortcut,
  ipcMain,
  type IpcMainInvokeEvent,
} from "electron";
import {
  DESKTOP_CHANNELS,
  ORACLE_DESKTOP_RECOVERY_SHORTCUT,
} from "./contracts.js";
import { CompanionHostWindowController } from "./overlay-window.js";
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

const DEFAULT_COMPANION_URL =
  "http://localhost:3000/companion";

app.enableSandbox();

let hostWindowController:
  | CompanionHostWindowController
  | null = null;
let companionUrl =
  DEFAULT_COMPANION_URL;

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

      hostWindowController =
        createHostWindowController();

      await hostWindowController.create();
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
  packagedNextServer.stop();
  stopOracleDesktopPlatform();
});

app.on("will-quit", () => {
  globalShortcut.unregister(
    ORACLE_DESKTOP_RECOVERY_SHORTCUT
  );
});

function createHostWindowController(): CompanionHostWindowController {
  return new CompanionHostWindowController({
    companionUrl,
    gameIntegrationRegistry:
      getOracleDesktopGameIntegrationRegistry(),
    guidanceService:
      getOracleDesktopGuidanceProviderService(),
  });
}

async function resolveCompanionUrl():
  Promise<string> {
  if (app.isPackaged) {
    return await packagedNextServer.start(
      process.resourcesPath
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
    DESKTOP_CHANNELS.getPlatformHealth
  );

  ipcMain.removeHandler(
    DESKTOP_CHANNELS
      .getCompanionPresentationState
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
