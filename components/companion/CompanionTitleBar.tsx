"use client";

import {
  Copy,
  Minus,
  Square,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import type { OracleDesktopHostState } from "@/desktop/contracts";

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

  if (!desktopAvailable) {
    return null;
  }

  async function minimizeWindow() {
    await window.oracleDesktop?.minimizeWindow();
  }

  async function toggleMaximizeWindow() {
    const state =
      await window.oracleDesktop?.toggleMaximizeWindow();

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
      </div>

      <div className="oracle-desktop-titlebar__controls">
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
            <Square size={12} strokeWidth={1.8} />
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