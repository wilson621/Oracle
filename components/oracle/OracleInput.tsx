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
    <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-44 w-full resize-none rounded-2xl bg-slate-900 p-5 text-white outline-none placeholder:text-slate-500"
        placeholder="Tell Oracle what happened..."
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          className="flex-1 rounded-2xl border border-slate-700 px-5 py-4 font-bold text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
        >
          Upload Clip
        </button>

        <button
          disabled={isAnalysing}
          onClick={() => onAskOracle(prompt)}
          className="flex-1 rounded-2xl bg-cyan-400 px-5 py-4 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
        >
          {isAnalysing ? "Analysing..." : "Ask Oracle"}
        </button>
      </div>
    </div>
  );
}