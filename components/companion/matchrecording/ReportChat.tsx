"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./match-recording.module.css";

type ChatMessage = {
  id: string;
  role: "operator" | "oracle";
  content: string;
};

type HistoryResponse = {
  messages?: ChatMessage[];
  error?: string;
};

type AskResponse = {
  question?: ChatMessage;
  answer?: ChatMessage;
  failed?: boolean;
  error?: string;
};

/**
 * "Ask Oracle about this report" -- a small chat thread scoped to one
 * specific match report (see database/019_report_chat_messages.sql and
 * app/api/oracle/report-chat/route.ts). Used inside ReportView, so it shows
 * up everywhere a report does: right after a match, and when reopening any
 * report from Past reports.
 *
 * The caller must render this with `key={reportId}` (ReportView does) --
 * that makes switching to a different report a fresh mount rather than an
 * update, so this component's state never needs to be reset mid-effect for
 * a changed reportId; each report gets its own clean instance instead.
 */
export default function ReportChat({
  reportId,
}: Readonly<{ reportId: string }>) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/oracle/report-chat?reportId=${encodeURIComponent(reportId)}`)
      .then((response) => response.json())
      .then((body: HistoryResponse) => {
        if (!active) return;
        setMessages(body.messages ?? []);
      })
      .catch(() => {
        if (active) setError("Could not load this report's chat history.");
      })
      .finally(() => {
        if (active) setLoadingHistory(false);
      });
    return () => {
      active = false;
    };
  }, [reportId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  async function handleAsk() {
    const text = question.trim();
    if (!text || asking) return;
    setAsking(true);
    setError(null);
    // Shown immediately rather than waiting on the round trip -- replaced
    // with the real saved row once the response comes back, same
    // optimistic-then-reconcile pattern as elsewhere in this component tree.
    const optimisticId = `pending-${Date.now()}`;
    setMessages((current) => [
      ...current,
      { id: optimisticId, role: "operator", content: text },
    ]);
    setQuestion("");
    try {
      const response = await fetch("/api/oracle/report-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, question: text }),
      });
      const body = (await response.json()) as AskResponse;
      if (!response.ok || !body.answer || !body.question) {
        setError(body.error ?? "Oracle could not answer that.");
        setMessages((current) =>
          current.filter((message) => message.id !== optimisticId)
        );
        setQuestion(text);
        return;
      }
      setMessages((current) => [
        ...current.filter((message) => message.id !== optimisticId),
        body.question!,
        body.answer!,
      ]);
    } catch {
      setError("Oracle chat could not be reached.");
      setMessages((current) =>
        current.filter((message) => message.id !== optimisticId)
      );
      setQuestion(text);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className={styles.chatPanel}>
      <h3 className={styles.subheading}>Ask Oracle about this report</h3>

      {loadingHistory ? (
        <p className={styles.muted}>Loading conversation...</p>
      ) : (
        <>
          {messages.length === 0 && (
            <p className={styles.muted}>
              Ask a follow-up -- e.g. &quot;why did I die so much at
              09:52?&quot; or &quot;what should I focus on next game?&quot;
            </p>
          )}
          {messages.length > 0 && (
            <div className={styles.chatThread}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "operator"
                      ? styles.chatBubbleOperator
                      : styles.chatBubbleOracle
                  }
                >
                  <p className={styles.chatBubbleLabel}>
                    {message.role === "operator" ? "You" : "Oracle"}
                  </p>
                  <p>{message.content}</p>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>
          )}
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.chatInputRow}>
        <input
          type="text"
          className={styles.chatInput}
          placeholder="Ask a question about this match..."
          value={question}
          disabled={asking}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleAsk();
            }
          }}
        />
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => void handleAsk()}
          disabled={asking || !question.trim()}
        >
          {asking ? "Asking..." : "Ask"}
        </button>
      </div>
    </div>
  );
}
