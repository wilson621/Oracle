import {
  app,
  ipcMain,
} from "electron";
import { DESKTOP_CHANNELS } from "./contracts.js";
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
    hostWindowController?.showAndFocus();
  });

  app
    .whenReady()
    .then(async () => {
      registerIpcHandlers();

      hostWindowController =
        new CompanionHostWindowController({
          companionUrl:
            process.env.ORACLE_COMPANION_URL ??
            DEFAULT_COMPANION_URL,
        });

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
  if (hostWindowController?.getWindow()) {
    hostWindowController.showAndFocus();
    return;
  }

  hostWindowController =
    new CompanionHostWindowController({
      companionUrl:
        process.env.ORACLE_COMPANION_URL ??
        DEFAULT_COMPANION_URL,
    });

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

function registerIpcHandlers(): void {
  removeIpcHandlers();

  ipcMain.handle(
    DESKTOP_CHANNELS.getHostState,
    () => {
      const window =
        hostWindowController?.getWindow();

      return {
        ready: app.isReady(),
        windowVisible:
          window?.isVisible() ?? false,
        windowFocused:
          window?.isFocused() ?? false,
        developmentMode:
          process.env.NODE_ENV !== "production",
      };
    }
  );
}

function removeIpcHandlers(): void {
  ipcMain.removeHandler(
    DESKTOP_CHANNELS.getHostState
  );
}