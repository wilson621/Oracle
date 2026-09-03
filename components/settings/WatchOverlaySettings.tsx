"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, MonitorSmartphone } from "lucide-react";

type HotkeySaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "conflict" }
  | { kind: "error"; message: string };

export default function WatchOverlaySettings() {
  const [bridgeAvailable, setBridgeAvailable] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [positioning, setPositioning] = useState(false);
  const [savingHidden, setSavingHidden] = useState(false);

  const [positioningHotkey, setPositioningHotkey] = useState("");
  const [positioningHotkeyDraft, setPositioningHotkeyDraft] = useState("");
  const [hotkeyStatus, setHotkeyStatus] = useState<HotkeySaveStatus>({
    kind: "idle",
  });

  useEffect(() => {
    const bridge = window.oracleDesktop;
    if (!bridge) {
      return;
    }
    let active = true;
    void Promise.all([
      bridge.getWatchIndicatorSettings(),
      bridge.getIndicatorPositioningHotkey(),
    ])
      .then(([settings, hotkey]) => {
        if (!active) return;
        setHidden(settings.hidden);
        setPositioningHotkey(hotkey.accelerator);
        setPositioningHotkeyDraft(hotkey.accelerator);
        setBridgeAvailable(true);
      })
      .catch(() => undefined);

    const unsubscribe = bridge.onIndicatorPositioningModeChanged(
      (value) => {
        if (active) setPositioning(value);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function handleToggleHidden() {
    const bridge = window.oracleDesktop;
    if (!bridge) return;
    setSavingHidden(true);
    try {
      const next = !hidden;
      const settings = await bridge.setWatchIndicatorHidden(next);
      setHidden(settings.hidden);
    } finally {
      setSavingHidden(false);
    }
  }

  async function handleStartPositioning() {
    const bridge = window.oracleDesktop;
    if (!bridge) return;
    await bridge.enterIndicatorPositioningMode();
    setPositioning(true);
  }

  async function handleFinishPositioning() {
    const bridge = window.oracleDesktop;
    if (!bridge) return;
    await bridge.exitIndicatorPositioningMode();
    setPositioning(false);
  }

  async function handleSaveHotkey() {
    const bridge = window.oracleDesktop;
    if (!bridge) return;
    const trimmed = positioningHotkeyDraft.trim();
    if (trimmed.length === 0) return;

    setHotkeyStatus({ kind: "saving" });
    try {
      const result = await bridge.setIndicatorPositioningHotkey(trimmed);
      if (result.registered) {
        setPositioningHotkey(result.accelerator);
        setPositioningHotkeyDraft(result.accelerator);
        setHotkeyStatus({ kind: "saved" });
      } else {
        setPositioningHotkey(result.accelerator);
        setPositioningHotkeyDraft(result.accelerator);
        setHotkeyStatus({ kind: "conflict" });
      }
    } catch (error) {
      setHotkeyStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not save that hotkey.",
      });
    }
  }

  if (!bridgeAvailable) {
    return null;
  }

  const hotkeyDirty =
    positioningHotkeyDraft.trim() !== positioningHotkey &&
    positioningHotkeyDraft.trim().length > 0;

  return (
    <section className="mt-6 rounded-3xl border border-slate-800 bg-black/25 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <MonitorSmartphone
          aria-hidden="true"
          className="shrink-0 text-cyan-300"
          size={28}
        />
        <div className="w-full">
          <h2 className="text-2xl font-black">Watch &amp; Coach indicator</h2>
          <p className="mt-3 leading-7 text-slate-400">
            A small always-on-top indicator confirms Oracle is watching,
            generating or has finished a report -- click-through, so it never
            intercepts a click or keypress, and it stays out of the way in
            the corner of your screen rather than sitting over your HUD.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleToggleHidden}
              disabled={savingHidden}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-black/30 px-5 py-2.5 text-sm font-bold text-slate-100 transition hover:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hidden ? (
                <>
                  <EyeOff aria-hidden="true" size={16} />
                  Hidden -- show indicator
                </>
              ) : (
                <>
                  <Eye aria-hidden="true" size={16} />
                  Visible -- hide indicator
                </>
              )}
            </button>

            {!hidden &&
              (positioning ? (
                <button
                  type="button"
                  onClick={handleFinishPositioning}
                  className="rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-bold text-black transition"
                >
                  Done positioning
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartPositioning}
                  className="rounded-xl border border-slate-700 bg-black/30 px-5 py-2.5 text-sm font-bold text-slate-100 transition hover:border-cyan-300/40"
                >
                  Reposition
                </button>
              ))}
          </div>

          {positioning && (
            <p className="mt-3 text-sm text-cyan-200">
              Drag the indicator wherever suits your HUD, then come back here
              (or press the positioning hotkey again) to drop it and save the
              spot.
            </p>
          )}

          {hidden && (
            <p className="mt-3 text-sm text-slate-500">
              With the indicator hidden, Oracle relies on the hotkey alone --
              a Windows notification will still let you know when a report is
              ready.
            </p>
          )}

          <div className="mt-6 border-t border-slate-800 pt-5">
            <p className="text-sm font-bold text-slate-200">
              Positioning hotkey
            </p>
            <p className="mt-1.5 text-sm leading-6 text-slate-400">
              Enters/exits positioning mode from anywhere -- even mid-match,
              without alt-tabbing here first.
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={positioningHotkeyDraft}
                onChange={(event) => {
                  setPositioningHotkeyDraft(event.target.value);
                  setHotkeyStatus({ kind: "idle" });
                }}
                placeholder="CommandOrControl+Shift+P"
                spellCheck={false}
                className="w-full max-w-sm rounded-xl border border-slate-700 bg-black/30 px-4 py-2.5 text-sm text-slate-100 outline-none focus-visible:border-cyan-300/60"
              />
              <button
                type="button"
                onClick={handleSaveHotkey}
                disabled={!hotkeyDirty || hotkeyStatus.kind === "saving"}
                className="rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-bold text-black transition disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {hotkeyStatus.kind === "saving" ? "Saving..." : "Save hotkey"}
              </button>
            </div>
            <p className="mt-2.5 text-sm text-slate-500">
              Currently bound to{" "}
              <span className="text-slate-300">{positioningHotkey}</span>.
            </p>
            {hotkeyStatus.kind === "saved" && (
              <p className="mt-2 text-sm text-emerald-400">Saved.</p>
            )}
            {hotkeyStatus.kind === "conflict" && (
              <p className="mt-2 text-sm text-amber-300">
                That combination is already in use by something else on your
                PC, so the previous hotkey was kept. Try a different one.
              </p>
            )}
            {hotkeyStatus.kind === "error" && (
              <p className="mt-2 text-sm text-red-400">
                {hotkeyStatus.message}
              </p>
            )}
          </div>

          <p className="mt-5 text-sm text-amber-200/90">
            This only draws over Borderless or Windowed Fullscreen. Windows&apos;
            Exclusive Fullscreen mode blocks every overlay, including Discord
            and Nvidia&apos;s -- switch Call of Duty&apos;s display mode under
            Options &gt; Graphics if you don&apos;t see it.
          </p>
        </div>
      </div>
    </section>
  );
}
