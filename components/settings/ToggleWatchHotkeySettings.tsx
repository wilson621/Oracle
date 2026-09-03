"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";

type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "conflict" }
  | { kind: "error"; message: string };

export default function ToggleWatchHotkeySettings() {
  const [bridgeAvailable, setBridgeAvailable] = useState(false);
  const [accelerator, setAccelerator] = useState("");
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });

  useEffect(() => {
    const bridge = window.oracleDesktop;
    if (!bridge) {
      return;
    }
    let active = true;
    void bridge
      .getToggleWatchHotkey()
      .then((value) => {
        if (!active) return;
        setBridgeAvailable(true);
        setAccelerator(value.accelerator);
        setDraft(value.accelerator);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function handleSave() {
    const bridge = window.oracleDesktop;
    if (!bridge) return;
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;

    setStatus({ kind: "saving" });
    try {
      const result = await bridge.setToggleWatchHotkey(trimmed);
      if (result.registered) {
        setAccelerator(result.accelerator);
        setDraft(result.accelerator);
        setStatus({ kind: "saved" });
      } else {
        // The Companion put the previous working combination back rather
        // than leaving no hotkey bound at all -- reflect that here.
        setAccelerator(result.accelerator);
        setDraft(result.accelerator);
        setStatus({ kind: "conflict" });
      }
    } catch (error) {
      setStatus({
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

  const dirty = draft.trim() !== accelerator && draft.trim().length > 0;

  return (
    <section className="mt-6 rounded-3xl border border-slate-800 bg-black/25 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <Keyboard aria-hidden="true" className="shrink-0 text-cyan-300" size={28} />
        <div className="w-full">
          <h2 className="text-2xl font-black">Watch &amp; Coach hotkey</h2>
          <p className="mt-3 leading-7 text-slate-400">
            Start or stop watching a match from anywhere -- even while Call
            of Duty has focus -- without alt-tabbing or clicking anything.
            Uses Electron&apos;s accelerator format, e.g.{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-slate-300">
              CommandOrControl+Shift+K
            </code>
            .
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setStatus({ kind: "idle" });
              }}
              placeholder="CommandOrControl+Shift+K"
              spellCheck={false}
              className="w-full max-w-sm rounded-xl border border-slate-700 bg-black/30 px-4 py-2.5 text-sm text-slate-100 outline-none focus-visible:border-cyan-300/60"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || status.kind === "saving"}
              className="rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-bold text-black transition disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {status.kind === "saving" ? "Saving..." : "Save hotkey"}
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Currently bound to <span className="text-slate-300">{accelerator}</span>.
          </p>

          {status.kind === "saved" && (
            <p className="mt-2 text-sm text-emerald-400">Saved.</p>
          )}
          {status.kind === "conflict" && (
            <p className="mt-2 text-sm text-amber-300">
              That combination is already in use by something else on your
              PC, so the previous hotkey was kept. Try a different one.
            </p>
          )}
          {status.kind === "error" && (
            <p className="mt-2 text-sm text-red-400">{status.message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
