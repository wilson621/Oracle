"use client";

import { useState } from "react";

type OracleInputProps = {
  isAnalysing: boolean;
  onAskOracle: (prompt: string) => void;
};

export default function OracleInput({
  isAnalysing,
  onAskOracle,
}: OracleInputProps) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <label
        htmlFor="oracle-question"
        className="mb-3 block text-sm font-bold text-slate-200"
      >
        Ask Oracle about your governed evidence
      </label>
      <textarea
        id="oracle-question"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-44 w-full resize-none rounded-2xl bg-slate-900 p-5 text-white outline-none placeholder:text-slate-500"
        placeholder="Ask about a Session, report, pattern, coaching focus, Mission or progress..."
      />

      <div className="mt-4">
        <button
          type="button"
          disabled={isAnalysing || !prompt.trim()}
          onClick={() => onAskOracle(prompt)}
          className="w-full rounded-2xl bg-cyan-400 px-5 py-4 font-bold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalysing ? "Grounding..." : "Ask Oracle"}
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Conversation is transient and cannot create evidence, mutate Oracle
        state or replace an authoritative Service.
      </p>
    </div>
  );
}
