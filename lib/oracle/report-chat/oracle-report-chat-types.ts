export type OracleReportChatRole = "operator" | "oracle";

/**
 * The shape a row actually has in oracle_report_chat_messages (see
 * database/019_report_chat_messages.sql) -- what both the GET (history) and
 * POST (ask) handlers on /api/oracle/report-chat put on the wire.
 */
export type OracleReportChatMessageRow = Readonly<{
  id: string;
  report_id: string;
  operator_id: string;
  role: OracleReportChatRole;
  content: string;
  created_at: string;
}>;

// Text-only (no video, no Google Search grounding) -- the report itself,
// already summarised by Full Match Analysis, is all the context this needs.
export const GEMINI_REPORT_CHAT_MODEL = "gemini-3.8-flash";

// How many of the report's own most recent chat messages to feed back to
// Gemini as conversation history. Bounded for the same reason
// MAX_MATCHES_FOR_PROFILE is bounded in the loadout service: keeps the
// prompt small/cheap, and a question from 40 messages ago is rarely still
// relevant context for the current one. The full thread is still stored
// and returned to the UI regardless of this cap.
export const MAX_HISTORY_MESSAGES_FOR_PROMPT = 20;

// A question longer than this is almost certainly pasted junk rather than
// a genuine follow-up -- same 2,000-character cap used by the (unused)
// Grounded Conversation stub this feature replaces.
export const MAX_QUESTION_LENGTH = 2_000;
