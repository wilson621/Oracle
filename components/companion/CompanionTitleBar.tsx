"use client";

import {
  Activity,
  Copy,
  Eye,
  EyeOff,
  Minus,
  MousePointer2,
  Pin,
  PinOff,
  Square,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import type {
  OracleCompanionPresentationState,
  OracleDesktopHostState,
} from "@/desktop/contracts";
import DesktopDiagnosticsPanel from "./DesktopDiagnosticsPanel";

const OVERLAY_PREVIEW_CLASS =
  "oracle-overlay-preview";

export default function CompanionTitleBar() {
  const [hostState, setHostState] =
    useState<OracleDesktopHostState | null>(
      null
    );

  const [
    companionPresentation,
    setCompanionPresentation,
  ] = useState<
    OracleCompanionPresentationState | null
  >(null);

  const [
    desktopBridgeAvailable,
    setDesktopBridgeAvailable,
  ] = useState<boolean | null>(null);

  const [
    diagnosticsOpen,
    setDiagnosticsOpen,
  ] = useState(false);


  useEffect(() => {
    const bridge = window.oracleDesktop;

    let cancelled = false;

    if (!bridge) {
      void Promise.resolve().then(
        () => {
          if (!cancelled) {
            setDesktopBridgeAvailable(
              false
            );
          }
        }
      );

      return () => {
        cancelled = true;
      };
    }

    let receivedPresentationEvent =
      false;

    void bridge
      .getHostState()
      .then((state) => {
        if (!cancelled) {
          setHostState(state);
        }
      })
      .catch((error: unknown) => {
        console.error(
          "Unable to read Oracle desktop host state.",
          error
        );
      });

    const unsubscribe =
      bridge.onHostStateChanged(
        (state) => {
          if (!cancelled) {
            setHostState(state);
          }
        }
      );

    const unsubscribePresentation =
      bridge
        .onCompanionPresentationStateChanged(
          (state) => {
            receivedPresentationEvent =
              true;

            if (!cancelled) {
              setCompanionPresentation(
                state
              );
            }
          }
        );

    void bridge
      .getCompanionPresentationState()
      .then((state) => {
        if (
          !cancelled &&
          !receivedPresentationEvent
        ) {
          setCompanionPresentation(
            state
          );
        }
      })
      .catch((error: unknown) => {
        console.error(
          "Unable to read Oracle Companion presentation state.",
          error
        );
      });

    return () => {
      cancelled = true;
      unsubscribe();
      unsubscribePresentation();
    };
  }, []);

  useEffect(() => {
    const overlayPreviewEnabled =
      hostState?.windowMode ===
      "overlay-preview";

    document.documentElement.classList.toggle(
      OVERLAY_PREVIEW_CLASS,
      overlayPreviewEnabled
    );

    return () => {
      document.documentElement.classList.remove(
        OVERLAY_PREVIEW_CLASS
      );
    };
  }, [hostState?.windowMode]);

  if (
    !hostState &&
    desktopBridgeAvailable !== false
  ) {
  return null;
}

  const overlayPreviewEnabled =
    hostState?.windowMode ===
    "overlay-preview";

  const alwaysOnTopEnabled =
    hostState?.alwaysOnTop ?? false;

  const clickThroughEnabled =
    hostState?.clickThrough ?? false;

  async function toggleOverlayPreview() {
    const state =
      await window.oracleDesktop
        ?.toggleOverlayPreview();

    if (state) {
      setHostState(state);
    }
  }

  async function toggleAlwaysOnTop() {
    const state =
      await window.oracleDesktop
        ?.toggleAlwaysOnTop();

    if (state) {
      setHostState(state);
    }
  }

  async function toggleClickThrough() {
    try {
      const state =
        await window.oracleDesktop
          ?.toggleClickThrough();

      if (state) {
        setHostState(state);
      }
    } catch (error) {
      console.error(
        "Unable to toggle Oracle click-through mode.",
        error
      );
    }
  }

  async function minimizeWindow() {
    await window.oracleDesktop
      ?.minimizeWindow();
  }

  async function toggleMaximizeWindow() {
    const state =
      await window.oracleDesktop
        ?.toggleMaximizeWindow();

    if (state) {
      setHostState(state);
    }
  }

  async function closeWindow() {
    await window.oracleDesktop
      ?.closeWindow();
  }

  return (
    <>
      <header className="oracle-desktop-titlebar">
        <div className="oracle-desktop-titlebar__brand">
          <span
            className="oracle-desktop-titlebar__signal"
            aria-hidden="true"
          />

          <span className="oracle-desktop-titlebar__name">
            ORACLE
          </span>

          <span className="oracle-desktop-titlebar__division">
            COMPANION
          </span>

          <CompanionGameStatus
            state={
              companionPresentation
            }
          />

          {overlayPreviewEnabled && (
            <span className="oracle-desktop-titlebar__mode">
              OVERLAY PREVIEW
            </span>
          )}

          {alwaysOnTopEnabled && (
            <span className="oracle-desktop-titlebar__mode">
              PINNED
            </span>
          )}

          {clickThroughEnabled && (
            <span className="oracle-desktop-titlebar__mode">
              CLICK-THROUGH · CTRL+SHIFT+O
            </span>
          )}
        </div>

        <div className="oracle-desktop-titlebar__controls">
          <button
            type="button"
            className={
              diagnosticsOpen
                ? "oracle-desktop-titlebar__button oracle-desktop-titlebar__button--active"
                : "oracle-desktop-titlebar__button"
            }
            aria-label={
              diagnosticsOpen
                ? "Close desktop diagnostics"
                : "Open desktop diagnostics"
            }
            aria-expanded={diagnosticsOpen}
            title="Desktop diagnostics"
            onClick={() => {
              setDiagnosticsOpen(
                (current) => !current
              );
            }}
          >
            <Activity
              size={15}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            className={
              overlayPreviewEnabled
                ? "oracle-desktop-titlebar__button oracle-desktop-titlebar__button--active"
                : "oracle-desktop-titlebar__button"
            }
            aria-label={
              overlayPreviewEnabled
                ? "Exit transparent overlay preview"
                : "Enter transparent overlay preview"
            }
            title={
              overlayPreviewEnabled
                ? "Exit overlay preview"
                : "Preview transparency"
            }
            onClick={() => {
              void toggleOverlayPreview();
            }}
          >
            {overlayPreviewEnabled ? (
              <EyeOff
                size={15}
                strokeWidth={1.8}
              />
            ) : (
              <Eye
                size={15}
                strokeWidth={1.8}
              />
            )}
          </button>

          <button
            type="button"
            className={
              alwaysOnTopEnabled
                ? "oracle-desktop-titlebar__button oracle-desktop-titlebar__button--active"
                : "oracle-desktop-titlebar__button"
            }
            aria-label={
              alwaysOnTopEnabled
                ? "Disable always on top"
                : "Enable always on top"
            }
            title={
              alwaysOnTopEnabled
                ? "Unpin window"
                : "Pin window"
            }
            onClick={() => {
              void toggleAlwaysOnTop();
            }}
          >
            {alwaysOnTopEnabled ? (
              <PinOff
                size={15}
                strokeWidth={1.8}
              />
            ) : (
              <Pin
                size={15}
                strokeWidth={1.8}
              />
            )}
          </button>

          <button
            type="button"
            className={
              clickThroughEnabled
                ? "oracle-desktop-titlebar__button oracle-desktop-titlebar__button--active"
                : "oracle-desktop-titlebar__button"
            }
            disabled={
              !overlayPreviewEnabled &&
              !clickThroughEnabled
            }
            aria-label={
              clickThroughEnabled
                ? "Click-through enabled. Press Control Shift O to restore interaction."
                : "Enable click-through"
            }
            title={
              clickThroughEnabled
                ? "Click-through enabled — press Ctrl+Shift+O to restore interaction"
                : overlayPreviewEnabled
                  ? "Enable click-through"
                  : "Enable overlay preview first"
            }
            onClick={() => {
              void toggleClickThrough();
            }}
          >
            <MousePointer2
              size={15}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            className="oracle-desktop-titlebar__button"
            aria-label="Minimise Oracle Companion"
            title="Minimise"
            onClick={() => {
              void minimizeWindow();
            }}
          >
            <Minus
              size={15}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            className="oracle-desktop-titlebar__button"
            aria-label={
              hostState?.windowMaximized
                ? "Restore Oracle Companion"
                : "Maximise Oracle Companion"
            }
            title={
              hostState?.windowMaximized
                ? "Restore"
                : "Maximise"
            }
            onClick={() => {
              void toggleMaximizeWindow();
            }}
          >
            {hostState?.windowMaximized ? (
              <Copy
                size={13}
                strokeWidth={1.8}
              />
            ) : (
              <Square
                size={12}
                strokeWidth={1.8}
              />
            )}
          </button>

          <button
            type="button"
            className="oracle-desktop-titlebar__button oracle-desktop-titlebar__button--close"
            aria-label="Close Oracle Companion"
            title="Close"
            onClick={() => {
              void closeWindow();
            }}
          >
            <X
              size={16}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </header>

      <DesktopDiagnosticsPanel
        hostState={hostState}
        open={diagnosticsOpen}
        onClose={() =>
          setDiagnosticsOpen(false)
        }
      />
    </>
  );
}

function CompanionGameStatus({
  state,
}: {
  state:
    OracleCompanionPresentationState | null;
}) {
  const attached =
    state?.status === "attached";

  const label = attached
    ? state.activeGame.displayName
    : state?.status === "ready"
      ? "SEARCHING FOR SUPPORTED GAME"
      : state?.status === "starting"
        ? "COMPANION STARTING"
        : "COMPANION UNAVAILABLE";

  return (
    <span
      className={
        attached
          ? "oracle-desktop-titlebar__game oracle-desktop-titlebar__game--attached"
          : "oracle-desktop-titlebar__game"
      }
      title={label}
      aria-live="polite"
    >
      <span
        className="oracle-desktop-titlebar__game-signal"
        aria-hidden="true"
      />

      <span className="oracle-desktop-titlebar__game-label">
        {label}
      </span>
    </span>
  );
}
