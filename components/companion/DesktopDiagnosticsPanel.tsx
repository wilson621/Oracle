"use client";

import type { OracleDesktopHostState } from "@/desktop/contracts";

type DesktopDiagnosticsPanelProps = {
  hostState: OracleDesktopHostState | null;
  open: boolean;
  onClose: () => void;
};

type DiagnosticValueProps = {
  label: string;
  value: string | number;
  healthy?: boolean | null;
};

export default function DesktopDiagnosticsPanel({
  hostState,
  open,
  onClose,
}: DesktopDiagnosticsPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <aside
      className="oracle-desktop-diagnostics"
      aria-label="Oracle desktop diagnostics"
    >
      <div className="oracle-desktop-diagnostics__header">
        <div>
          <p className="oracle-desktop-diagnostics__eyebrow">
            ORACLE COMPANION
          </p>

          <h2 className="oracle-desktop-diagnostics__title">
            Desktop Diagnostics
          </h2>
        </div>

        <button
          type="button"
          className="oracle-desktop-diagnostics__close"
          onClick={onClose}
          aria-label="Close desktop diagnostics"
        >
          Close
        </button>
      </div>

      {!hostState ? (
        <div className="oracle-desktop-diagnostics__empty">
          Waiting for desktop host state…
        </div>
      ) : (
        <div className="oracle-desktop-diagnostics__body">
          <DiagnosticSection title="Host">
            <DiagnosticValue
              label="Ready"
              value={formatBoolean(hostState.ready)}
              healthy={hostState.ready}
            />

            <DiagnosticValue
              label="Development"
              value={formatBoolean(
                hostState.developmentMode
              )}
              healthy={null}
            />

            <DiagnosticValue
              label="IPC connected"
              value={formatBoolean(
                hostState.runtime.ipcConnected
              )}
              healthy={
                hostState.runtime.ipcConnected
              }
            />
          </DiagnosticSection>

          <DiagnosticSection title="Window">
            <DiagnosticValue
              label="Mode"
              value={formatWindowMode(
                hostState.windowMode
              )}
            />

            <DiagnosticValue
              label="Visible"
              value={formatBoolean(
                hostState.windowVisible
              )}
              healthy={hostState.windowVisible}
            />

            <DiagnosticValue
              label="Focused"
              value={formatBoolean(
                hostState.windowFocused
              )}
              healthy={null}
            />

            <DiagnosticValue
              label="Maximised"
              value={formatBoolean(
                hostState.windowMaximized
              )}
              healthy={null}
            />

            <DiagnosticValue
              label="Transparent"
              value={formatBoolean(
                hostState.transparent
              )}
              healthy={null}
            />

            <DiagnosticValue
              label="Always on top"
              value={formatBoolean(
                hostState.alwaysOnTop
              )}
              healthy={null}
            />

            <DiagnosticValue
              label="Click-through"
              value={formatBoolean(
                hostState.clickThrough
              )}
              healthy={
                hostState.clickThrough
                  ? null
                  : true
              }
            />
          </DiagnosticSection>

          <DiagnosticSection title="Window Bounds">
            <DiagnosticValue
              label="X"
              value={hostState.bounds.x}
            />

            <DiagnosticValue
              label="Y"
              value={hostState.bounds.y}
            />

            <DiagnosticValue
              label="Width"
              value={`${hostState.bounds.width}px`}
            />

            <DiagnosticValue
              label="Height"
              value={`${hostState.bounds.height}px`}
            />
          </DiagnosticSection>

          <DiagnosticSection title="Display">
            <DiagnosticValue
              label="Display ID"
              value={hostState.display.id}
            />

            <DiagnosticValue
              label="Primary"
              value={formatBoolean(
                hostState.display.primary
              )}
              healthy={null}
            />

            <DiagnosticValue
              label="Scale factor"
              value={`${hostState.display.scaleFactor}×`}
            />

            <DiagnosticValue
              label="Estimated DPI"
              value={hostState.display.estimatedDpi}
            />

            <DiagnosticValue
              label="Display bounds"
              value={formatRectangle(
                hostState.display.bounds
              )}
            />

            <DiagnosticValue
              label="Work area"
              value={formatRectangle(
                hostState.display.workArea
              )}
            />
          </DiagnosticSection>

          <DiagnosticSection title="Runtime">
            <DiagnosticValue
              label="Host version"
              value={
                hostState.runtime
                  .desktopHostVersion
              }
            />

            <DiagnosticValue
              label="Electron"
              value={
                hostState.runtime.electronVersion
              }
            />

            <DiagnosticValue
              label="Chromium"
              value={
                hostState.runtime.chromiumVersion
              }
            />

            <DiagnosticValue
              label="Node"
              value={
                hostState.runtime.nodeVersion
              }
            />

            <DiagnosticValue
              label="Platform"
              value={hostState.runtime.platform}
            />
          </DiagnosticSection>

          <DiagnosticSection title="Recovery">
            <DiagnosticValue
              label="Restore interaction"
              value={formatShortcut(
                hostState.runtime
                  .recoveryShortcut
              )}
              healthy={true}
            />
          </DiagnosticSection>
        </div>
      )}
    </aside>
  );
}

function DiagnosticSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="oracle-desktop-diagnostics__section">
      <h3 className="oracle-desktop-diagnostics__section-title">
        {title}
      </h3>

      <dl className="oracle-desktop-diagnostics__grid">
        {children}
      </dl>
    </section>
  );
}

function DiagnosticValue({
  label,
  value,
  healthy,
}: DiagnosticValueProps) {
  return (
    <div className="oracle-desktop-diagnostics__row">
      <dt className="oracle-desktop-diagnostics__label">
        {label}
      </dt>

      <dd className="oracle-desktop-diagnostics__value">
        {healthy !== undefined &&
          healthy !== null && (
            <span
              className={
                healthy
                  ? "oracle-desktop-diagnostics__status oracle-desktop-diagnostics__status--healthy"
                  : "oracle-desktop-diagnostics__status oracle-desktop-diagnostics__status--warning"
              }
              aria-hidden="true"
            />
          )}

        <span>{value}</span>
      </dd>
    </div>
  );
}

function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}

function formatWindowMode(
  mode: OracleDesktopHostState["windowMode"]
): string {
  return mode === "overlay-preview"
    ? "Overlay Preview"
    : "Development";
}

function formatRectangle(
  rectangle: OracleDesktopHostState["bounds"]
): string {
  return `${rectangle.x}, ${rectangle.y} · ${rectangle.width} × ${rectangle.height}`;
}

function formatShortcut(shortcut: string): string {
  return shortcut
    .replace("CommandOrControl", "Ctrl")
    .replaceAll("+", " + ");
}