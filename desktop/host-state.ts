export type OracleDesktopWindowMode =
  | "development"
  | "overlay-preview";

export type OracleDesktopRectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OracleDesktopDisplayState = {
  id: string;
  primary: boolean;

  scaleFactor: number;

  /**
   * Indicative desktop DPI derived from the platform scale factor.
   * A scale factor of 1 maps to the standard 96 DPI baseline.
   */
  estimatedDpi: number;

  bounds: OracleDesktopRectangle;
  workArea: OracleDesktopRectangle;
};

export type OracleDesktopRuntimeState = {
  ipcConnected: boolean;
  recoveryShortcut: string;

  desktopHostVersion: string;
  electronVersion: string;
  chromiumVersion: string;
  nodeVersion: string;

  platform: NodeJS.Platform;
};

export type OracleDesktopHostState = {
  ready: boolean;

  windowVisible: boolean;
  windowFocused: boolean;
  windowMaximized: boolean;

  windowMode: OracleDesktopWindowMode;

  transparent: boolean;
  alwaysOnTop: boolean;
  clickThrough: boolean;

  bounds: OracleDesktopRectangle;
  display: OracleDesktopDisplayState;
  runtime: OracleDesktopRuntimeState;

  developmentMode: boolean;
};

export type OracleDesktopNativeWindowObservation = {
  visible: boolean;
  focused: boolean;
  maximized: boolean;

  bounds: OracleDesktopRectangle;
  display: OracleDesktopDisplayState;
  runtime: OracleDesktopRuntimeState;
};

type OracleDesktopHostConfiguration = {
  windowMode: OracleDesktopWindowMode;
  alwaysOnTop: boolean;
  clickThrough: boolean;
};

const INITIAL_HOST_CONFIGURATION: OracleDesktopHostConfiguration = {
  windowMode: "development",
  alwaysOnTop: false,
  clickThrough: false,
};

export class OracleDesktopHostStateModel {
  private configuration: OracleDesktopHostConfiguration = {
    ...INITIAL_HOST_CONFIGURATION,
  };

  getWindowMode(): OracleDesktopWindowMode {
    return this.configuration.windowMode;
  }

  isTransparent(): boolean {
    return (
      this.configuration.windowMode ===
      "overlay-preview"
    );
  }

  isAlwaysOnTop(): boolean {
    return this.configuration.alwaysOnTop;
  }

  isClickThrough(): boolean {
    return this.configuration.clickThrough;
  }

  canEnableClickThrough(): boolean {
    return this.isTransparent();
  }

  toggleOverlayPreview(): OracleDesktopWindowMode {
    const nextWindowMode: OracleDesktopWindowMode =
      this.configuration.windowMode ===
      "development"
        ? "overlay-preview"
        : "development";

    this.configuration = {
      ...this.configuration,
      windowMode: nextWindowMode,

      /*
       * Development mode must always remain interactive.
       */
      clickThrough:
        nextWindowMode === "development"
          ? false
          : this.configuration.clickThrough,
    };

    return this.configuration.windowMode;
  }

  toggleAlwaysOnTop(): boolean {
    this.configuration = {
      ...this.configuration,
      alwaysOnTop:
        !this.configuration.alwaysOnTop,
    };

    return this.configuration.alwaysOnTop;
  }

  toggleClickThrough(): boolean {
    if (
      !this.configuration.clickThrough &&
      !this.canEnableClickThrough()
    ) {
      throw new Error(
        "Click-through can only be enabled while transparent overlay preview is active."
      );
    }

    this.configuration = {
      ...this.configuration,
      clickThrough:
        !this.configuration.clickThrough,
    };

    return this.configuration.clickThrough;
  }

  setAlwaysOnTop(enabled: boolean): void {
    this.configuration = {
      ...this.configuration,
      alwaysOnTop: enabled,
    };
  }

  setClickThrough(enabled: boolean): void {
    if (
      enabled &&
      !this.canEnableClickThrough()
    ) {
      throw new Error(
        "Click-through can only be enabled while transparent overlay preview is active."
      );
    }

    this.configuration = {
      ...this.configuration,
      clickThrough: enabled,
    };
  }

  restoreInteraction(): void {
    this.configuration = {
      ...this.configuration,
      clickThrough: false,
    };
  }

  reset(): void {
    this.configuration = {
      ...INITIAL_HOST_CONFIGURATION,
    };
  }

  createSnapshot(
    observation: OracleDesktopNativeWindowObservation,
    developmentMode: boolean
  ): OracleDesktopHostState {
    return {
      ready: true,

      windowVisible: observation.visible,
      windowFocused: observation.focused,
      windowMaximized: observation.maximized,

      windowMode:
        this.configuration.windowMode,

      transparent: this.isTransparent(),
      alwaysOnTop:
        this.configuration.alwaysOnTop,
      clickThrough:
        this.configuration.clickThrough,

      bounds: cloneRectangle(
        observation.bounds
      ),

      display: {
        ...observation.display,
        bounds: cloneRectangle(
          observation.display.bounds
        ),
        workArea: cloneRectangle(
          observation.display.workArea
        ),
      },

      runtime: {
        ...observation.runtime,
      },

      developmentMode,
    };
  }
}

function cloneRectangle(
  rectangle: OracleDesktopRectangle
): OracleDesktopRectangle {
  return {
    x: rectangle.x,
    y: rectangle.y,
    width: rectangle.width,
    height: rectangle.height,
  };
}