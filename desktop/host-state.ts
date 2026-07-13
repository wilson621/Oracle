export type OracleDesktopWindowMode =
  | "development"
  | "overlay-preview";

export type OracleDesktopHostState = {
  ready: boolean;

  windowVisible: boolean;
  windowFocused: boolean;
  windowMaximized: boolean;

  windowMode: OracleDesktopWindowMode;

  transparent: boolean;
  alwaysOnTop: boolean;
  clickThrough: boolean;

  developmentMode: boolean;
};

export type OracleDesktopNativeWindowObservation = {
  visible: boolean;
  focused: boolean;
  maximized: boolean;
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
    return this.configuration.windowMode === "overlay-preview";
  }

  isAlwaysOnTop(): boolean {
    return this.configuration.alwaysOnTop;
  }

  isClickThrough(): boolean {
    return this.configuration.clickThrough;
  }

  toggleOverlayPreview(): OracleDesktopWindowMode {
    this.configuration = {
      ...this.configuration,
      windowMode:
        this.configuration.windowMode === "development"
          ? "overlay-preview"
          : "development",
    };

    return this.configuration.windowMode;
  }

  toggleAlwaysOnTop(): boolean {
    this.configuration = {
      ...this.configuration,
      alwaysOnTop: !this.configuration.alwaysOnTop,
    };

    return this.configuration.alwaysOnTop;
  }

  setAlwaysOnTop(enabled: boolean): void {
    this.configuration = {
      ...this.configuration,
      alwaysOnTop: enabled,
    };
  }

  setClickThrough(enabled: boolean): void {
    this.configuration = {
      ...this.configuration,
      clickThrough: enabled,
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

      windowMode: this.configuration.windowMode,

      transparent: this.isTransparent(),
      alwaysOnTop: this.configuration.alwaysOnTop,
      clickThrough: this.configuration.clickThrough,

      developmentMode,
    };
  }
}