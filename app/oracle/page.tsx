"use client";

import { useState } from "react";
import CompanionTitleBar from "@/components/companion/CompanionTitleBar";
import AppLayout from "@/components/layout/AppLayout";
import OracleHero from "@/components/oracle/OracleHero";
import OracleInput from "@/components/oracle/OracleInput";
import OracleLoading from "@/components/oracle/OracleLoading";
import type {
  OracleConversationApplicationResponse,
} from "@/lib/oracle/applications/conversation/oracle-conversation-application";

type ConversationApiResponse = {
  conversation?: OracleConversationApplicationResponse;
  error?: string;
};

export default function OraclePage() {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [conversation, setConversation] =
    useState<OracleConversationApplicationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAskOracle(text: string) {
    if (!text.trim()) {
      setError("Ask Oracle a question first.");
      return;
    }
    setIsAnalysing(true);
    setConversation(null);
    setError(null);
    try {
      const response = await fetch("/api/oracle/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: crypto.randomUUID(), text }),
      });
      const data = (await response.json()) as ConversationApiResponse;
      if (!response.ok || !data.conversation) {
        setError(data.error ?? "Oracle conversation is unavailable.");
        return;
      }
      setConversation(data.conversation);
    } catch {
      setError("Oracle conversation could not be reached.");
    } finally {
      setIsAnalysing(false);
    }
  }

  return (
    <>
      <CompanionTitleBar />
      <div className="oracle-desktop-content">
        <AppLayout>
          <OracleHero isAnalysing={isAnalysing} />
          <OracleInput
            isAnalysing={isAnalysing}
            onAskOracle={handleAskOracle}
          />
          {isAnalysing && <OracleLoading />}
          {error && (
            <p
              className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-700/60 bg-amber-950/40 p-5 text-amber-100"
              role="status"
            >
              {error}
            </p>
          )}
          {conversation && (
            <article className="mx-auto mt-6 max-w-3xl rounded-3xl border border-cyan-900 bg-slate-950 p-6 text-slate-100">
              <h2 className="text-xl font-bold">Oracle</h2>
              <p className="mt-3 leading-7">{conversation.answer}</p>
              <dl className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-100">Confidence</dt>
                  <dd>{Math.round(conversation.confidence * 100)}%</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-100">Scope</dt>
                  <dd>{conversation.scope.join(", ") || "No factual scope"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-100">Freshness</dt>
                  <dd>{conversation.freshness.asOf}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-100">Synthesis</dt>
                  <dd>{conversation.synthesis.provider}</dd>
                </div>
              </dl>
              {conversation.evidence.length > 0 && (
                <p className="mt-5 text-sm text-slate-400">
                  Evidence:{" "}
                  {conversation.evidence
                    .map(({ source, sourceRecordId }) =>
                      `${source}:${sourceRecordId}`)
                    .join(", ")}
                </p>
              )}
              {conversation.limitations.length > 0 && (
                <p className="mt-3 text-sm text-amber-200">
                  Limitations: {conversation.limitations.join(" ")}
                </p>
              )}
            </article>
          )}
        </AppLayout>
      </div>
    </>
  );
}
