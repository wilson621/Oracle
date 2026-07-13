import { BrowserWindow } from "electron";
import { join } from "node:path";

export type CompanionHostWindowOptions = {
  companionUrl: string;
};

const DEVELOPMENT_WINDOW_WIDTH = 1200;
const DEVELOPMENT_WINDOW_HEIGHT = 800;

export class CompanionHostWindowController {
  private window: BrowserWindow | null = null;

  constructor(
    private readonly options: CompanionHostWindowOptions
  ) {}

  async create(): Promise<BrowserWindow> {
    const existingWindow = this.getExistingWindow();

    if (existingWindow) {
      existingWindow.show();
      existingWindow.focus();

      return existingWindow;
    }

    const window = new BrowserWindow({
      width: DEVELOPMENT_WINDOW_WIDTH,
      height: DEVELOPMENT_WINDOW_HEIGHT,

      minWidth: 900,
      minHeight: 650,

      center: true,
      show: false,

      title: "Oracle Companion",

      frame: true,
      transparent: false,
      backgroundColor: "#090b10",

      alwaysOnTop: false,
      skipTaskbar: false,

      resizable: true,
      movable: true,
      minimizable: true,
      maximizable: true,
      fullscreenable: true,
      focusable: true,

      webPreferences: {
        preload: join(__dirname, "preload.js"),

        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,

        webSecurity: true,
        allowRunningInsecureContent: false,

        devTools:
          process.env.NODE_ENV !== "production",
      },
    });

    this.window = window;

    this.registerNavigationSecurity(window);
    this.registerWindowEvents(window);

    await window.loadURL(this.options.companionUrl);

    if (!window.isDestroyed()) {
      window.show();
      window.focus();
    }

    return window;
  }

  getWindow(): BrowserWindow | null {
    return this.getExistingWindow();
  }

  showAndFocus(): void {
    const window = this.getExistingWindow();

    if (!window) {
      return;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window.show();
    window.focus();
  }

  close(): void {
    const window = this.getExistingWindow();

    if (!window) {
      this.window = null;
      return;
    }

    window.close();
    this.window = null;
  }

  private getExistingWindow(): BrowserWindow | null {
    if (!this.window || this.window.isDestroyed()) {
      this.window = null;
      return null;
    }

    return this.window;
  }

  private registerNavigationSecurity(
    window: BrowserWindow
  ): void {
    const allowedOrigin = new URL(
      this.options.companionUrl
    ).origin;

    window.webContents.setWindowOpenHandler(() => ({
      action: "deny",
    }));

    window.webContents.on(
      "will-navigate",
      (event, navigationUrl) => {
        let navigationOrigin: string;

        try {
          navigationOrigin = new URL(
            navigationUrl
          ).origin;
        } catch {
          event.preventDefault();
          return;
        }

        if (navigationOrigin !== allowedOrigin) {
          event.preventDefault();
        }
      }
    );
  }

  private registerWindowEvents(
    window: BrowserWindow
  ): void {
    window.on("closed", () => {
      this.window = null;
    });

    window.on("unresponsive", () => {
      console.error(
        "Oracle Companion desktop window became unresponsive."
      );
    });

    window.webContents.on(
      "render-process-gone",
      (_event, details) => {
        console.error(
          "Oracle Companion renderer exited.",
          {
            reason: details.reason,
            exitCode: details.exitCode,
          }
        );
      }
    );

    window.webContents.on(
      "did-fail-load",
      (
        _event,
        errorCode,
        errorDescription,
        validatedUrl
      ) => {
        console.error(
          "Oracle Companion failed to load.",
          {
            errorCode,
            errorDescription,
            validatedUrl,
          }
        );
      }
    );
  }
}