import {
  BrowserWindow,
  app,
  screen,
  type Display,
  type Rectangle,
} from "electron";
import { join } from "node:path";
import {
  DESKTOP_CHANNELS,
  ORACLE_DESKTOP_RECOVERY_SHORTCUT,
  type OracleDesktopDisplayState,
  type OracleDesktopHostState,
  type OracleDesktopRectangle,
  type OracleDesktopRuntimeState,
} from "./contracts.js";
import { OracleDesktopHostStateModel } from "./host-state.js";

export type CompanionHostWindowOptions = {
  companionUrl: string;
};

const DEVELOPMENT_WINDOW_WIDTH = 1200;
const DEVELOPMENT_WINDOW_HEIGHT = 800;

const DEVELOPMENT_BACKGROUND = "#090b10";
const TRANSPARENT_BACKGROUND = "#00000000";

const STANDARD_WINDOWS_DPI = 96;

export class CompanionHostWindowController {
  private window: BrowserWindow | null =
    null;

  private readonly hostState =
    new OracleDesktopHostStateModel();

  private screenEventsRegistered = false;

  private readonly handleDisplayChange = () => {
    this.publishState();
  };

  constructor(
    private readonly options: CompanionHostWindowOptions
  ) {}

  async create(): Promise<BrowserWindow> {
    const existingWindow =
      this.getWindow();

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
      transparent: true,
      backgroundColor:
        DEVELOPMENT_BACKGROUND,

      alwaysOnTop: false,
      skipTaskbar: false,

      resizable: true,
      movable: true,
      minimizable: true,
      maximizable: true,
      fullscreenable: true,
      focusable: true,

      webPreferences: {
        preload: join(
          __dirname,
          "preload.js"
        ),

        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,

        webSecurity: true,
        allowRunningInsecureContent: false,

        devTools:
          process.env.NODE_ENV !==
          "production",
      },
    });

    this.window = window;
    this.hostState.reset();

    this.registerNavigationSecurity(
      window
    );

    this.registerWindowEvents(window);
    this.registerScreenEvents();

    await window.loadURL(
      this.options.companionUrl
    );

    if (!window.isDestroyed()) {
      this.applyHostState();

      window.show();
      window.focus();

      this.publishState();
    }

    return window;
  }

  getWindow(): BrowserWindow | null {
    if (
      !this.window ||
      this.window.isDestroyed()
    ) {
      this.window = null;
      return null;
    }

    return this.window;
  }

  ownsWebContentsId(
    webContentsId: number
  ): boolean {
    return (
      this.getWindow()?.webContents.id ===
      webContentsId
    );
  }

  getState(): OracleDesktopHostState {
    const window =
      this.getRequiredWindow();

    const bounds =
      normaliseRectangle(
        window.getBounds()
      );

    const display =
      screen.getDisplayMatching(bounds);

    return this.hostState.createSnapshot(
      {
        visible: window.isVisible(),
        focused: window.isFocused(),
        maximized: window.isMaximized(),

        bounds,

        display:
          createDisplayState(display),

        runtime:
          createRuntimeState(),
      },
      process.env.NODE_ENV !==
        "production"
    );
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

    if (
      !this.hostState.isClickThrough()
    ) {
      window.focus();
    }

    this.publishState();
  }

  toggleOverlayPreview(): OracleDesktopHostState {
    this.hostState.toggleOverlayPreview();

    this.applyHostState();

    if (
      !this.hostState.isClickThrough()
    ) {
      this.focusInteractiveWindow();
    }

    this.publishState();

    return this.getState();
  }

  toggleAlwaysOnTop(): OracleDesktopHostState {
    this.hostState.toggleAlwaysOnTop();

    this.applyHostState();
    this.publishState();

    return this.getState();
  }

  toggleClickThrough(): OracleDesktopHostState {
    const clickThroughEnabled =
      this.hostState.toggleClickThrough();

    this.applyHostState();

    const window =
      this.getRequiredWindow();

    if (clickThroughEnabled) {
      window.blur();
    } else {
      this.focusInteractiveWindow();
    }

    this.publishState();

    return this.getState();
  }

  restoreInteraction(): OracleDesktopHostState {
    this.hostState.restoreInteraction();

    this.applyHostState();
    this.focusInteractiveWindow();
    this.publishState();

    return this.getState();
  }

  minimize(): OracleDesktopHostState {
    const window =
      this.getRequiredWindow();

    window.minimize();

    return this.getState();
  }

  toggleMaximize(): OracleDesktopHostState {
    const window =
      this.getRequiredWindow();

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

    this.unregisterScreenEvents();

    if (!window) {
      this.window = null;
      return;
    }

    window.close();
  }

  private applyHostState(): void {
    const window =
      this.getRequiredWindow();

    window.setBackgroundColor(
      this.hostState.isTransparent()
        ? TRANSPARENT_BACKGROUND
        : DEVELOPMENT_BACKGROUND
    );

    window.setAlwaysOnTop(
      this.hostState.isAlwaysOnTop(),
      "floating"
    );

    window.setIgnoreMouseEvents(
      this.hostState.isClickThrough(),
      {
        forward: true,
      }
    );
  }

  private focusInteractiveWindow(): void {
    const window =
      this.getRequiredWindow();

    if (window.isMinimized()) {
      window.restore();
    }

    if (!window.isVisible()) {
      window.show();
    }

    window.focus();
  }

  private registerNavigationSecurity(
    window: BrowserWindow
  ): void {
    const allowedOrigin = new URL(
      this.options.companionUrl
    ).origin;

    window.webContents.setWindowOpenHandler(
      () => ({
        action: "deny",
      })
    );

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

        if (
          navigationOrigin !==
          allowedOrigin
        ) {
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
    window.on("move", publishState);
    window.on("resize", publishState);
    window.on("maximize", publishState);

    window.on(
      "unmaximize",
      publishState
    );

    window.on("restore", publishState);

    window.on(
      "always-on-top-changed",
      publishState
    );

    window.on("closed", () => {
      this.unregisterScreenEvents();

      this.window = null;
      this.hostState.reset();
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

  private registerScreenEvents(): void {
    if (this.screenEventsRegistered) {
      return;
    }

    screen.on(
      "display-added",
      this.handleDisplayChange
    );

    screen.on(
      "display-removed",
      this.handleDisplayChange
    );

    screen.on(
      "display-metrics-changed",
      this.handleDisplayChange
    );

    this.screenEventsRegistered = true;
  }

  private unregisterScreenEvents(): void {
    if (!this.screenEventsRegistered) {
      return;
    }

    screen.removeListener(
      "display-added",
      this.handleDisplayChange
    );

    screen.removeListener(
      "display-removed",
      this.handleDisplayChange
    );

    screen.removeListener(
      "display-metrics-changed",
      this.handleDisplayChange
    );

    this.screenEventsRegistered = false;
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

function createDisplayState(
  display: Display
): OracleDesktopDisplayState {
  return {
    id: String(display.id),

    primary:
      display.id ===
      screen.getPrimaryDisplay().id,

    scaleFactor:
      normaliseScaleFactor(
        display.scaleFactor
      ),

    estimatedDpi: Math.round(
      STANDARD_WINDOWS_DPI *
        normaliseScaleFactor(
          display.scaleFactor
        )
    ),

    bounds:
      normaliseRectangle(
        display.bounds
      ),

    workArea:
      normaliseRectangle(
        display.workArea
      ),
  };
}

function createRuntimeState(): OracleDesktopRuntimeState {
  return {
    ipcConnected: true,

    recoveryShortcut:
      ORACLE_DESKTOP_RECOVERY_SHORTCUT,

    desktopHostVersion:
      app.getVersion(),

    electronVersion:
      process.versions.electron ??
      "unknown",

    chromiumVersion:
      process.versions.chrome ??
      "unknown",

    nodeVersion:
      process.versions.node,

    platform:
      process.platform,
  };
}

function normaliseRectangle(
  rectangle: Rectangle
): OracleDesktopRectangle {
  return {
    x: Math.round(rectangle.x),
    y: Math.round(rectangle.y),

    width: Math.max(
      1,
      Math.round(rectangle.width)
    ),

    height: Math.max(
      1,
      Math.round(rectangle.height)
    ),
  };
}

function normaliseScaleFactor(
  scaleFactor: number
): number {
  if (
    !Number.isFinite(scaleFactor) ||
    scaleFactor <= 0
  ) {
    return 1;
  }

  return Number(
    scaleFactor.toFixed(3)
  );
}