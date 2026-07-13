import { BrowserWindow } from "electron";
import { join } from "node:path";
import {
  DESKTOP_CHANNELS,
  type OracleDesktopHostState,
} from "./contracts.js";

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
    const existingWindow = this.getWindow();

    if (existingWindow) {
      this.showAndFocus();
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

      frame: false,
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
  sandbox: false,

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
      this.publishState();
    }

    return window;
  }

  getWindow(): BrowserWindow | null {
    if (!this.window || this.window.isDestroyed()) {
      this.window = null;
      return null;
    }

    return this.window;
  }

  ownsWebContentsId(webContentsId: number): boolean {
    return this.getWindow()?.webContents.id === webContentsId;
  }

  getState(): OracleDesktopHostState {
    const window = this.getRequiredWindow();

    return {
      ready: true,
      windowVisible: window.isVisible(),
      windowFocused: window.isFocused(),
      windowMaximized: window.isMaximized(),
      developmentMode:
        process.env.NODE_ENV !== "production",
    };
  }

  showAndFocus(): void {
    const window = this.getWindow();

    if (!window) {
      return;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window.show();
    window.focus();
    this.publishState();
  }

  minimize(): OracleDesktopHostState {
    const window = this.getRequiredWindow();

    window.minimize();

    return this.getState();
  }

  toggleMaximize(): OracleDesktopHostState {
    const window = this.getRequiredWindow();

    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }

    this.publishState();

    return this.getState();
  }

  close(): void {
    const window = this.getWindow();

    if (!window) {
      this.window = null;
      return;
    }

    window.close();
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
    const publishState = () => {
      this.publishState();
    };

    window.on("show", publishState);
    window.on("hide", publishState);
    window.on("focus", publishState);
    window.on("blur", publishState);
    window.on("maximize", publishState);
    window.on("unmaximize", publishState);
    window.on("restore", publishState);

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

  private publishState(): void {
    const window = this.getWindow();

    if (
      !window ||
      window.webContents.isDestroyed()
    ) {
      return;
    }

    window.webContents.send(
      DESKTOP_CHANNELS.hostStateChanged,
      this.getState()
    );
  }

  private getRequiredWindow(): BrowserWindow {
    const window = this.getWindow();

    if (!window) {
      throw new Error(
        "Oracle Companion desktop window is unavailable."
      );
    }

    return window;
  }
}