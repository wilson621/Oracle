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

const DEFAULT_COMPANION_URL =
  "http://localhost:3000/oracle";

let hostWindowController:
  | CompanionHostWindowController
  | null = null;

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
      registerIpcHandlers();
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

  hostWindowController?.close();
  hostWindowController = null;
});

app.on("will-quit", () => {
  globalShortcut.unregister(
    ORACLE_DESKTOP_RECOVERY_SHORTCUT
  );
});

function createHostWindowController(): CompanionHostWindowController {
  return new CompanionHostWindowController({
    companionUrl:
      process.env.ORACLE_COMPANION_URL ??
      DEFAULT_COMPANION_URL,
  });
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
    DESKTOP_CHANNELS
      .getCompanionPresentationState,
    (event) => {
      return requireAuthorizedController(
        event
      ).getCompanionPresentationState();
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
    )
  ) {
    throw new Error(
      "Unauthorized Oracle desktop IPC sender."
    );
  }

  return hostWindowController;
}
