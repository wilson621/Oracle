"use client";

import {
  Copy,
  Eye,
  EyeOff,
  Minus,
  Square,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import type { OracleDesktopHostState } from "@/desktop/contracts";

const OVERLAY_PREVIEW_CLASS =
  "oracle-overlay-preview";

export default function CompanionTitleBar() {
  const [hostState, setHostState] =
    useState<OracleDesktopHostState | null>(
      null
    );

  const desktopAvailable =
    typeof window !== "undefined" &&
    Boolean(window.oracleDesktop);

  useEffect(() => {
    const bridge = window.oracleDesktop;

    if (!bridge) {
      return;
    }

    let cancelled = false;

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
      bridge.onHostStateChanged((state) => {
        if (!cancelled) {
          setHostState(state);
        }
      });

    return () => {
      cancelled = true;
      unsubscribe();
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

  if (!desktopAvailable) {
    return null;
  }

  const overlayPreviewEnabled =
    hostState?.windowMode ===
    "overlay-preview";

  async function toggleOverlayPreview() {
    const state =
      await window.oracleDesktop
        ?.toggleOverlayPreview();

    if (state) {
      setHostState(state);
    }
  }

  async function minimizeWindow() {
    await window.oracleDesktop?.minimizeWindow();
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
    await window.oracleDesktop?.closeWindow();
  }

  return (
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

        {overlayPreviewEnabled && (
          <span className="oracle-desktop-titlebar__mode">
            OVERLAY PREVIEW
          </span>
        )}
      </div>

      <div className="oracle-desktop-titlebar__controls">
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
          className="oracle-desktop-titlebar__button"
          aria-label="Minimise Oracle Companion"
          title="Minimise"
          onClick={() => {
            void minimizeWindow();
          }}
        >
          <Minus size={15} strokeWidth={1.8} />
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
            <Copy size={13} strokeWidth={1.8} />
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
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}