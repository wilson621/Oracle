"use client";

import { useCallback, useEffect, useState } from "react";
import LoadoutRecommendationView from "./LoadoutRecommendationView";
import type { LoadoutRecommendation } from "./loadout-types";

const MAX_GOAL_LENGTH = 300;

export default function LoadoutIntelligenceControl() {
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [active, setActive] = useState<LoadoutRecommendation | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [history, setHistory] = useState<LoadoutRecommendation[]>([]);

  const loadHistory = useCallback(() => {
    void fetch("/api/oracle/loadout-recommendation")
      .then((response) => response.json())
      .then((body: { recommendations?: LoadoutRecommendation[] }) => {
        setHistory(body.recommendations ?? []);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleGenerate() {
    const trimmed = goal.trim();
    if (!trimmed || generating) return;

    setGenerating(true);
    setRequestError(null);
    setActive(null);
    try {
      const response = await fetch("/api/oracle/loadout-recommendation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestedGoal: trimmed }),
      });
      const body = await response.json();
      if (!response.ok) {
        setRequestError(
          body.error ?? "The loadout recommendation could not be generated."
        );
        return;
      }
      const recommendation = body.recommendation as LoadoutRecommendation;
      if (recommendation.status === "failed") {
        setRequestError(
          recommendation.raw_error ??
            "The loadout recommendation could not be generated."
        );
        return;
      }
      setActive(recommendation);
      loadHistory();
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "The loadout recommendation could not be generated."
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-teal-500/5 sm:p-8">
      <h2 className="text-2xl font-black text-white">Loadout Intelligence</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        Tell Oracle what you want -- &ldquo;no recoil build&rdquo;,
        &ldquo;movement build&rdquo;, anything -- and it&apos;ll search for
        real, current weapon data and tailor it to how you actually play,
        based on your Full Match Analysis reports. The more matches you
        analyse, the more personalised this gets; with none yet, you&apos;ll
        still get a solid build for your stated goal and today&apos;s meta.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={goal}
          maxLength={MAX_GOAL_LENGTH}
          onChange={(event) => setGoal(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void handleGenerate();
          }}
          placeholder="e.g. no recoil build, movement build, long-range..."
          className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white placeholder:text-slate-500 focus:border-teal-400/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || goal.trim().length === 0}
          className="inline-flex items-center justify-center rounded-2xl bg-teal-400 px-6 py-4 font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {generating ? "Generating..." : "Generate Loadout"}
        </button>
      </div>

      {generating && (
        <p className="mt-3 text-sm text-slate-400">
          Searching for current weapon data and building your loadout...
        </p>
      )}

      {requestError && (
        <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Recommendation failed: {requestError}
        </p>
      )}

      {active && <LoadoutRecommendationView recommendation={active} />}

      {history.length > 0 && (
        <div className="mt-8 border-t border-white/10 pt-6">
          <h3 className="text-sm font-bold tracking-wide text-slate-300">
            Past recommendations
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {history.map((recommendation) => (
              <li key={recommendation.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(recommendation);
                    setRequestError(null);
                  }}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left text-sm text-slate-300 transition hover:border-teal-400/30 hover:text-teal-200"
                >
                  &ldquo;{recommendation.requested_goal}&rdquo; --{" "}
                  {new Date(recommendation.generated_at).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
