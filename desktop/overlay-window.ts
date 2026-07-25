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
  type OracleDesktopAttachmentState,
type OracleDesktopDiscoveredWindow,
type OracleDesktopDisplayState,
  type OracleDesktopHostState,
  type OracleDesktopHostWindowDiscoveryState,
  type OracleDesktopRectangle,
  type OracleDesktopRuntimeState,
  type OracleDesktopWindowDiscoveryResult,
} from "./contracts.js";
import { OracleDesktopHostStateModel } from "./host-state.js";
import { OracleDesktopWindowDiscoveryService } from "./window-discovery.js";
import { OracleDesktopAttachmentController } from "./overlay/attachment-controller.js";
import { OracleDesktopWindowObserver } from "./overlay/window-observer.js";
import {
  getSelectedDiscoveredWindow,
  selectDesktopTarget,
  type OracleDesktopTargetCandidateInput,
} from "./targeting/index.js";
import {
  OracleCompanionSessionManager,
} from "./companion/companion-session-manager.js";
import {
  OracleCompanionGuidanceDeliveryCoordinator,
} from "./companion/companion-guidance-delivery-coordinator.js";
import {
  OracleCompanionScreenObservationCoordinator,
} from "./companion/companion-screen-observation-coordinator.js";
import {
  OracleElectronLocalWindowCapture,
} from "./companion/electron-local-window-capture.js";
import type {
  OracleCompanionScreenObservationState,
} from "./companion/companion-screen-observation-contract.js";
import type {
  CompanionGuidanceApplicationState,
} from "../lib/oracle/applications/companion/index.js";
import type {
  OracleCompanionGuidanceProviderService,
} from "../lib/oracle/services/companion-guidance/index.js";
import {
  OracleDesktopGameIntegrationCoordinator,
  type OracleDesktopSupportedGameCandidate,
} from "./companion/game-integration-coordinator.js";
import type {
  OracleGameIntegrationRegistryContract,
} from "../lib/oracle/game-integrations/index.js";
import type {
  OracleCompanionGameContext,
} from "./companion/companion-context.js";
import {
  createOracleCompanionPresentationState,
  type OracleCompanionPresentationState,
} from "./companion/companion-presentation-state.js";
import {
  OracleDesktopHostSnapshotCoordinator,
} from "./platform/desktop-host-snapshot-coordinator.js";
import {
  OracleDesktopDiagnostics,
} from "./platform/desktop-diagnostics.js";
import type {
  OracleDesktopDiagnostic,
} from "./platform/desktop-diagnostic.js";
import {
  OracleDesktopRecoveryService,
} from "./platform/desktop-recovery-service.js";
import type {
  OracleDesktopRecovery,
} from "./platform/desktop-recovery.js";
import {
  OracleDesktopTimelineService,
} from "./platform/desktop-timeline-service.js";
import type {
  OracleDesktopTimelineEntry,
} from "./platform/desktop-timeline.js";
import {
  OracleDesktopTelemetryService,
} from "./platform/desktop-telemetry-service.js";
import type {
  OracleDesktopTelemetrySnapshot,
} from "./platform/desktop-telemetry.js";

export type CompanionHostWindowOptions = {
  companionUrl: string;
  gameIntegrationRegistry: OracleGameIntegrationRegistryContract;
  guidanceService: OracleCompanionGuidanceProviderService;
};

const DEVELOPMENT_WINDOW_WIDTH = 1200;
const DEVELOPMENT_WINDOW_HEIGHT = 800;

const DEVELOPMENT_BACKGROUND =
  "#090b10";

const TRANSPARENT_BACKGROUND =
  "#00000000";

const STANDARD_WINDOWS_DPI = 96;

const ATTACHMENT_TRACKING_INTERVAL_MS =
  250;

const WINDOW_DISCOVERY_RETRY_INTERVAL_MS =
  1_000;

export class CompanionHostWindowController {
  private window:
    BrowserWindow | null = null;

  private readonly hostState =
    new OracleDesktopHostStateModel();

  private readonly windowDiscovery =
    new OracleDesktopWindowDiscoveryService();

  private readonly attachment:
    OracleDesktopAttachmentController;

  private readonly windowObserver =
    new OracleDesktopWindowObserver();

  private readonly desktopHostSnapshots =
    new OracleDesktopHostSnapshotCoordinator();

  private readonly companionSession =
    new OracleCompanionSessionManager();

  private readonly guidanceDelivery:
    OracleCompanionGuidanceDeliveryCoordinator;

  private readonly screenObservation =
    new OracleCompanionScreenObservationCoordinator(
      new OracleElectronLocalWindowCapture()
    );

  private readonly gameIntegrations:
    OracleDesktopGameIntegrationCoordinator;

  private pendingGameContext:
    OracleCompanionGameContext | null = null;

  private discoveryRetryTimer:
    NodeJS.Timeout | null = null;

  private readonly diagnostics =
    new OracleDesktopDiagnostics();

  private readonly recovery =
    new OracleDesktopRecoveryService();

  private readonly timeline =
    new OracleDesktopTimelineService();

  private readonly telemetry =
    new OracleDesktopTelemetryService(
      this.timeline
    );

  private screenEventsRegistered = false;

  private discoveryRunId = 0;
  private developmentBounds:
  OracleDesktopRectangle | null = null;

  private readonly handleDisplayChange =
    () => {
      this.publishState();
    };

  constructor(
  private readonly options:
    CompanionHostWindowOptions
) {
  this.gameIntegrations =
    new OracleDesktopGameIntegrationCoordinator(
      options.gameIntegrationRegistry
    );

  this.guidanceDelivery =
    new OracleCompanionGuidanceDeliveryCoordinator(
      options.guidanceService
    );

  this.guidanceDelivery.subscribe(
    () => this.publishCompanionGuidanceState()
  );
  this.screenObservation.subscribe(
    () => this.publishCompanionScreenObservationState()
  );

  this.recovery.subscribe(
    (recovery) => {
      this.timeline.consumeRecovery(
        recovery
      );
    }
  );

  this.diagnostics.subscribe(
    (diagnostic) => {
      this.timeline.consumeDiagnostic(
        diagnostic
      );

      this.recovery.consumeDiagnostic(
        diagnostic
      );
    }
  );

  this.desktopHostSnapshots
    .subscribeEvents((event) => {
      this.timeline.consumeHostEvent(
        event
      );

      this.diagnostics
        .consumeHostEvent(event);

      if (
        event.type ===
        "desktop-host.snapshot-captured"
      ) {
        this.companionSession
          .captureContext(
            {
              desktop:
                event.snapshot,
            }
          );
      }
    });

  this.attachment =
    new OracleDesktopAttachmentController({
      trackingIntervalMs:
        ATTACHMENT_TRACKING_INTERVAL_MS,

      onStateChanged: (
        attachmentState
      ) => {
        this.applyAttachmentBounds(
          attachmentState
        );

        this.publishState();

        this.synchroniseCompanionSessionAttachment(
          attachmentState
        );
      },

      onTargetUnavailable: () => {
        this.scheduleWindowDiscovery(
          0
        );
      },
    });
}

  async create(): Promise<BrowserWindow> {
    const existingWindow =
      this.getWindow();

    if (existingWindow) {
      this.showAndFocus();
      return existingWindow;
    }

    const window = new BrowserWindow({
      width:
        DEVELOPMENT_WINDOW_WIDTH,

      height:
        DEVELOPMENT_WINDOW_HEIGHT,

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

        allowRunningInsecureContent:
          false,

        devTools:
          process.env.NODE_ENV !==
          "production",
      },
    });

    this.window = window;

    this.hostState.reset();
    this.attachment.reset();

    this.registerNavigationSecurity(
      window
    );

    this.registerWindowEvents(
      window
    );

    this.registerScreenEvents();

    this.companionSession.start(
      {
        desktop:
          this.captureDesktopHostSnapshot(),
      }
    );

    this.publishCompanionPresentationState();

    try {
      await window.loadURL(
        this.options.companionUrl
      );
    } catch (error) {
      this.close();

      throw error;
    }

    this.companionSession.markReady(
      {
        desktop:
          this.captureDesktopHostSnapshot(),
      }
    );

    this.publishCompanionPresentationState();

    if (!window.isDestroyed()) {
  this.developmentBounds =
    normaliseRectangle(
      window.getBounds()
    );

  this.applyHostState();

  window.show();
      window.focus();

      this.publishState();

      void this.refreshWindowDiscovery();
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
      this.getWindow()
        ?.webContents.id ===
      webContentsId
    );
  }

  getRecentDiagnostics(): readonly OracleDesktopDiagnostic[] {
    return this.diagnostics
      .getRecentDiagnostics();
  }

  getRecentRecoveries(): readonly OracleDesktopRecovery[] {
    return this.recovery
      .getRecentRecoveries();
  }

  getRecentTimelineEntries(): readonly OracleDesktopTimelineEntry[] {
    return this.timeline
      .getRecentEntries();
  }

  getDesktopTelemetry(): OracleDesktopTelemetrySnapshot {
    return this.telemetry.getSnapshot();
  }

  getState(): OracleDesktopHostState {
    const window =
      this.getRequiredWindow();

    const bounds =
      normaliseRectangle(
        window.getBounds()
      );

    const display =
      screen.getDisplayMatching(
        bounds
      );

    return this.hostState.createSnapshot(
      {
        visible:
          window.isVisible(),

        focused:
          window.isFocused(),

        maximized:
          window.isMaximized(),

        bounds,

        display:
          createDisplayState(
            display
          ),

        runtime:
          createRuntimeState(),

        attachment:
          this.attachment.getState(),
      },
      process.env.NODE_ENV !==
        "production"
    );
  }

  getCompanionPresentationState(): OracleCompanionPresentationState {
    return createOracleCompanionPresentationState(
      this.companionSession
        .getSnapshot()
    );
  }

  getCompanionGuidanceState(): CompanionGuidanceApplicationState {
    return this.guidanceDelivery.getState();
  }

  requestCompanionGuidance(
    control: unknown
  ): Promise<CompanionGuidanceApplicationState> {
    return this.guidanceDelivery.request(control);
  }

  getCompanionScreenObservationState():
    OracleCompanionScreenObservationState {
    return this.screenObservation.getState();
  }

  controlCompanionScreenObservation(
    control: unknown
  ): Promise<OracleCompanionScreenObservationState> {
    const session = this.companionSession.getSnapshot();
    const attachment = this.attachment.getState();
    return this.screenObservation.applyControl(
      control,
      session,
      attachment.status === "attached" ? attachment.target : null
    );
  }

  showAndFocus(): void {
    const window =
      this.getWindow();

    if (!window) {
      return;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window.show();

    if (
      !this.hostState
        .isClickThrough()
    ) {
      window.focus();
    }

    this.publishState();
  }

  toggleOverlayPreview(): OracleDesktopHostState {
  const previousMode =
    this.hostState.getWindowMode();

  if (
    previousMode ===
    "development"
  ) {
    this.captureDevelopmentBounds();
  }

  const nextMode =
    this.hostState
      .toggleOverlayPreview();

  this.applyHostState();

  if (
    nextMode ===
    "overlay-preview"
  ) {
    this.applyAttachmentBounds(
      this.attachment.getState()
    );
  } else {
    this.restoreDevelopmentBounds();
  }

  if (
    !this.hostState
      .isClickThrough()
  ) {
    this.focusInteractiveWindow();
  }

  this.publishState();

  return this.getState();
}

  toggleAlwaysOnTop(): OracleDesktopHostState {
    this.hostState
      .toggleAlwaysOnTop();

    this.applyHostState();
    this.publishState();

    return this.getState();
  }

  toggleClickThrough(): OracleDesktopHostState {
    const clickThroughEnabled =
      this.hostState
        .toggleClickThrough();

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
    this.hostState
      .restoreInteraction();

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
    const window =
      this.getWindow();

    this.cancelWindowDiscovery();

    this.attachment.reset();
this.developmentBounds = null;

this.unregisterScreenEvents();
this.companionSession.end(
  {
    desktop:
      this.desktopHostSnapshots.getSnapshot(),
  }
);
this.publishCompanionPresentationState();
this.desktopHostSnapshots.clear();
    if (!window) {
      this.window = null;
      return;
    }

    window.close();
  }

  private async refreshWindowDiscovery(): Promise<void> {
    this.cancelDiscoveryRetry();

    const runId =
      ++this.discoveryRunId;

    this.hostState
      .markWindowDiscoveryStarted();

    this.publishState();

    const result =
      await this.windowDiscovery
        .discover();

    if (
      runId !==
        this.discoveryRunId ||
      !this.getWindow()
    ) {
      return;
    }

    const discoveryState =
      this.createHostWindowDiscoveryState(
        result
      );

    const foregroundHandle =
      await this.readForegroundHandle();

    if (
      runId !==
        this.discoveryRunId ||
      !this.getWindow()
    ) {
      return;
    }

    this.hostState
      .setWindowDiscovery(
        discoveryState
      );

    const attached =
      this.coordinateAttachment(
      discoveryState.windows,
      foregroundHandle
    );

    this.publishState();

    if (!attached) {
      this.scheduleWindowDiscovery();
    }
  }

  private coordinateAttachment(
  discoveredWindows:
    OracleDesktopDiscoveredWindow[],
  foregroundHandle:
    string | null
): boolean {
  const attachmentState =
    this.attachment.getState();

  if (
    attachmentState.status ===
      "attached"
  ) {
    return true;
  }

  const candidateInputs =
    this.createTargetCandidateInputs(
      discoveredWindows,
      foregroundHandle
    );

  const supportedCandidates =
    this.gameIntegrations
      .evaluateCandidates(
        candidateInputs
      )
      .filter(
        (
          result
        ): result is OracleDesktopSupportedGameCandidate =>
          result.status ===
          "supported"
      );

  const decision =
    selectDesktopTarget(
      supportedCandidates.map(
        (result) =>
          result.candidate
      )
    );

const selectedWindow =
  getSelectedDiscoveredWindow(
    decision
  );

if (!selectedWindow) {
  return false;
}

const selectedCandidate =
  supportedCandidates.find(
    (result) =>
      result.candidate
        .discoveredWindow.id ===
      selectedWindow.id
  );

if (!selectedCandidate) {
  return false;
}

this.pendingGameContext =
  selectedCandidate.gameContext;

try {
  this.attachment.attach(
    selectedWindow
  );

  this.cancelDiscoveryRetry();

  return (
    this.attachment
      .getState().status ===
    "attached"
  );
} catch {
  this.pendingGameContext =
    null;

  if (
    this.attachment
      .getState().status ===
    "attached"
  ) {
    this.attachment.detach(
      "Oracle Companion could not establish a safe game-aware attachment."
    );
  }

  return false;
} finally {
  this.pendingGameContext =
    null;
}
}

private synchroniseCompanionSessionAttachment(
  attachmentState:
    OracleDesktopAttachmentState
): void {
  const session =
    this.companionSession.getSnapshot();

  const desktopSnapshot =
    this.desktopHostSnapshots.getSnapshot();

  if (!session || !desktopSnapshot) {
    return;
  }

  if (
    attachmentState.status ===
      "attached" &&
    session.status === "ready"
  ) {
    if (!this.pendingGameContext) {
      throw new Error(
        "Oracle Companion cannot attach a Session without resolved game context."
      );
    }

    this.companionSession.markAttached(
      {
        desktop:
          desktopSnapshot,

        game:
          this.pendingGameContext,
      }
    );

    this.publishCompanionPresentationState();

    return;
  }

  if (
    attachmentState.status !==
      "detached"
  ) {
    return;
  }

  if (session.status === "attached") {
    this.companionSession.markReady({
      desktop:
        desktopSnapshot,

      game: null,
    });

    this.publishCompanionPresentationState();

    return;
  }

  this.companionSession.captureContext({
    desktop:
      desktopSnapshot,

    game: null,
  });

  this.publishCompanionPresentationState();
}

private scheduleWindowDiscovery(
  delayMs =
    WINDOW_DISCOVERY_RETRY_INTERVAL_MS
): void {
  if (
    this.discoveryRetryTimer ||
    !this.getWindow() ||
    this.attachment
      .getState().status ===
      "attached"
  ) {
    return;
  }

  this.discoveryRetryTimer =
    setTimeout(
      () => {
        this.discoveryRetryTimer =
          null;

        void this.refreshWindowDiscovery();
      },
      delayMs
    );
}

private cancelDiscoveryRetry(): void {
  if (!this.discoveryRetryTimer) {
    return;
  }

  clearTimeout(
    this.discoveryRetryTimer
  );

  this.discoveryRetryTimer =
    null;
}

private cancelWindowDiscovery(): void {
  this.cancelDiscoveryRetry();
  this.discoveryRunId += 1;
}
private createTargetCandidateInputs(
  discoveredWindows:
    OracleDesktopDiscoveredWindow[],
  foregroundHandle:
    string | null
): OracleDesktopTargetCandidateInput[] {
  return discoveredWindows.map(
    (discoveredWindow) => {
      const display =
        screen.getDisplayMatching(
          normaliseRectangle(
            discoveredWindow.bounds
          )
        );

      return {
        discoveredWindow,

        display:
          createDisplayState(
            display
          ),

        isForeground:
          foregroundHandle === null
            ? null
            : discoveredWindow.handle ===
              foregroundHandle,
      };
    }
  );
}

  private async readForegroundHandle(): Promise<
    string | null
  > {
    try {
      return await this.windowObserver
        .getForegroundHandle();
    } catch (error) {
      console.warn(
        "Oracle Companion could not capture the foreground window snapshot.",
        error
      );

      return null;
    }
  }

  private createHostWindowDiscoveryState(
    result:
      OracleDesktopWindowDiscoveryResult
  ): OracleDesktopHostWindowDiscoveryState {
    const ownWindow =
      this.getRequiredWindow();

    const ownHandle =
      getNativeWindowHandleString(
        ownWindow
      );

    const windows =
      result.windows.filter(
        (window) =>
          !isOracleCompanionWindow(
            window.handle,
            window.processId,
            ownHandle
          )
      );

    return {
      status: result.status,
      platform: result.platform,

      windows,

      discoveredAt:
        result.discoveredAt,

      durationMs:
        result.durationMs,

      error: result.error,
    };
  }
private applyAttachmentBounds(
  attachmentState:
    OracleDesktopAttachmentState
): void {
  if (
    this.hostState.getWindowMode() !==
      "overlay-preview" ||
    attachmentState.status !==
      "attached"
  ) {
    return;
  }

  const observation =
    attachmentState.observation;

  if (
    !observation ||
    !observation.exists ||
    !observation.visible ||
    observation.minimized ||
    !observation.bounds
  ) {
    return;
  }

  const window =
    this.getWindow();

  if (!window) {
    return;
  }

  const currentBounds =
    normaliseRectangle(
      window.getBounds()
    );

  const targetBounds =
    normaliseRectangle(
      observation.bounds
    );

  if (
    areRectanglesEqual(
      currentBounds,
      targetBounds
    )
  ) {
    return;
  }

  window.setBounds(
    targetBounds,
    false
  );
}

private captureDevelopmentBounds(): void {
  const window =
    this.getWindow();

  if (!window) {
    return;
  }

  this.developmentBounds =
    normaliseRectangle(
      window.getBounds()
    );
}

private restoreDevelopmentBounds(): void {
  const window =
    this.getWindow();

  if (
    !window ||
    !this.developmentBounds
  ) {
    return;
  }

  const restoredBounds = {
    ...this.developmentBounds,
  };

  const currentBounds =
    normaliseRectangle(
      window.getBounds()
    );

  if (
    areRectanglesEqual(
      currentBounds,
      restoredBounds
    )
  ) {
    return;
  }

  window.setBounds(
    restoredBounds,
    false
  );
}
  private applyHostState(): void {
    const window =
      this.getRequiredWindow();

    window.setBackgroundColor(
      this.hostState
        .isTransparent()
        ? TRANSPARENT_BACKGROUND
        : DEVELOPMENT_BACKGROUND
    );

    window.setAlwaysOnTop(
      this.hostState
        .isAlwaysOnTop(),
      "floating"
    );

    window.setIgnoreMouseEvents(
      this.hostState
        .isClickThrough(),
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
    const allowedOrigin =
      new URL(
        this.options
          .companionUrl
      ).origin;

    window.webContents
      .setWindowOpenHandler(
        () => ({
          action: "deny",
        })
      );

    window.webContents.on(
      "will-navigate",
      (
        event,
        navigationUrl
      ) => {
        let navigationOrigin:
          string;

        try {
          navigationOrigin =
            new URL(
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
    const publishState =
  () => {
    if (
      this.hostState.getWindowMode() ===
      "development"
    ) {
      this.captureDevelopmentBounds();
    }

    this.publishState();
  };

    window.on(
      "show",
      publishState
    );

    window.on(
      "hide",
      publishState
    );

    window.on(
      "focus",
      publishState
    );

    window.on(
      "blur",
      publishState
    );

    window.on(
      "move",
      publishState
    );

    window.on(
      "resize",
      publishState
    );

    window.on(
      "maximize",
      publishState
    );

    window.on(
      "unmaximize",
      publishState
    );

    window.on(
      "restore",
      publishState
    );

    window.on(
      "always-on-top-changed",
      publishState
    );

    window.on(
      "closed",
      () => {
        this.cancelWindowDiscovery();

        this.unregisterScreenEvents();

        this.attachment.reset();

this.developmentBounds = null;

this.companionSession.end(
  {
    desktop:
      this.desktopHostSnapshots.getSnapshot(),
  }
);
this.publishCompanionPresentationState();
this.desktopHostSnapshots.clear();

this.window = null;
this.hostState.reset();
      }
    );

    window.on(
      "unresponsive",
      () => {
        this.diagnostics.report({
          severity: "error",
          category: "runtime",
          code: "desktop-window.unresponsive",
          message:
            "Oracle Companion desktop window became unresponsive.",
        });

        console.error(
          "Oracle Companion desktop window became unresponsive."
        );
      }
    );

    window.on(
      "responsive",
      () => {
        this.diagnostics.report({
          severity: "info",
          category: "runtime",
          code: "desktop-window.responsive",
          message:
            "Oracle Companion desktop window became responsive again.",
        });
      }
    );

    window.webContents.on(
      "render-process-gone",
      (
        _event,
        details
      ) => {
        this.guidanceDelivery.invalidate();
        this.screenObservation.invalidate(
          "Renderer recovery invalidated local screen observation consent."
        );
        this.diagnostics.report({
          severity: "critical",
          category: "runtime",
          code: "desktop-renderer.process-gone",
          message:
            "Oracle Companion renderer exited unexpectedly.",
          data: {
            reason: details.reason,
            exitCode: details.exitCode,
          },
        });

        console.error(
          "Oracle Companion renderer exited.",
          {
            reason:
              details.reason,

            exitCode:
              details.exitCode,
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
        this.diagnostics.report({
          severity: "error",
          category: "runtime",
          code: "desktop-renderer.load-failed",
          message:
            "Oracle Companion failed to load its application surface.",
          data: {
            errorCode,
            errorDescription,
            validatedUrl,
          },
        });

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

    window.webContents.on(
      "did-finish-load",
      () => {
        this.publishCompanionPresentationState();
        this.diagnostics.report({
          severity: "info",
          category: "runtime",
          code: "desktop-renderer.load-succeeded",
          message:
            "Oracle Companion loaded its application surface successfully.",
        });

        this.diagnostics.report({
          severity: "info",
          category: "runtime",
          code: "desktop-renderer.process-restored",
          message:
            "Oracle Companion renderer is available.",
        });
      }
    );
  }

  private registerScreenEvents(): void {
    if (
      this.screenEventsRegistered
    ) {
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

    this.screenEventsRegistered =
      true;
  }

  private unregisterScreenEvents(): void {
    if (
      !this.screenEventsRegistered
    ) {
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

    this.screenEventsRegistered =
      false;
  }

  private captureDesktopHostSnapshot() {
    return this.desktopHostSnapshots
      .capture(this.getState());
  }

  private publishState(): void {
    const window =
      this.getWindow();

    if (
      !window ||
      window.webContents
        .isDestroyed()
    ) {
      return;
    }

    const state =
      this.getState();

    this.desktopHostSnapshots
      .capture(state);

    window.webContents.send(
      DESKTOP_CHANNELS
        .hostStateChanged,

      state
    );
  }

  private publishCompanionPresentationState(): void {
    this.guidanceDelivery.synchronise(
      this.companionSession.getSnapshot()
    );
    const attachment = this.attachment.getState();
    this.screenObservation.synchronise(
      this.companionSession.getSnapshot(),
      attachment.status === "attached" ? attachment.target : null
    );

    const window =
      this.getWindow();

    if (
      !window ||
      window.webContents
        .isDestroyed()
    ) {
      return;
    }

    window.webContents.send(
      DESKTOP_CHANNELS
        .companionPresentationStateChanged,

      this.getCompanionPresentationState()
    );
  }

  private publishCompanionGuidanceState(): void {
    const window = this.getWindow();
    if (!window || window.webContents.isDestroyed()) return;
    window.webContents.send(
      DESKTOP_CHANNELS.companionGuidanceStateChanged,
      this.getCompanionGuidanceState()
    );
  }

  private publishCompanionScreenObservationState(): void {
    const window = this.getWindow();
    if (!window || window.webContents.isDestroyed()) return;
    window.webContents.send(
      DESKTOP_CHANNELS.companionScreenObservationStateChanged,
      this.getCompanionScreenObservationState()
    );
  }

  private getRequiredWindow(): BrowserWindow {
    const window =
      this.getWindow();

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
      screen
        .getPrimaryDisplay()
        .id,

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

function getNativeWindowHandleString(
  window: BrowserWindow
): string | null {
  const handle =
    window.getNativeWindowHandle();

  if (handle.length >= 8) {
    return handle
      .readBigUInt64LE(0)
      .toString();
  }

  if (handle.length >= 4) {
    return String(
      handle.readUInt32LE(0)
    );
  }

  return null;
}

function isOracleCompanionWindow(
  discoveredHandle: string,
  discoveredProcessId: number,
  ownHandle: string | null
): boolean {
  if (
    ownHandle &&
    discoveredHandle ===
      ownHandle
  ) {
    return true;
  }

  return (
    discoveredProcessId ===
    process.pid
  );
}

function areRectanglesEqual(
  left: OracleDesktopRectangle,
  right: OracleDesktopRectangle
): boolean {
  return (
    left.x === right.x &&
    left.y === right.y &&
    left.width === right.width &&
    left.height === right.height
  );
}
function normaliseRectangle(
  rectangle: Rectangle
): OracleDesktopRectangle {
  return {
    x: Math.round(
      rectangle.x
    ),

    y: Math.round(
      rectangle.y
    ),

    width: Math.max(
      1,
      Math.round(
        rectangle.width
      )
    ),

    height: Math.max(
      1,
      Math.round(
        rectangle.height
      )
    ),
  };
}

function normaliseScaleFactor(
  scaleFactor: number
): number {
  if (
    !Number.isFinite(
      scaleFactor
    ) ||
    scaleFactor <= 0
  ) {
    return 1;
  }

  return Number(
    scaleFactor.toFixed(3)
  );
}
