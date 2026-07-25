import type {
  OracleConversationIntent,
  OracleConversationSource,
} from "./conversation-contract";

const PROHIBITED =
  /\b(delete|change|award|grant|complete|create)\b.*\b(xp|achievement|mission|session|account|progression)\b/iu;
const INJECTION =
  /\b(ignore|override|reveal|repeat)\b.{0,40}\b(instruction|system|prompt|policy|tool)\b/iu;

const SOURCES = {
  session: ["sessions", "reports"],
  trend: ["reports", "operator-understanding"],
  coaching: ["reports", "operator-understanding", "ai-coach"],
  mission: ["missions"],
  planner: ["planner", "missions"],
  progression: ["progression"],
  "game-knowledge": ["game-integrations"],
} as const satisfies Readonly<Record<
  Exclude<OracleConversationIntent, "clarification" | "prohibited">,
  readonly OracleConversationSource[]
>>;

export function classifyOracleConversationIntent(
  text: string
): OracleConversationIntent {
  const value = text.trim();
  if (!value || value.length < 4) return "clarification";
  if (PROHIBITED.test(value) || INJECTION.test(value)) return "prohibited";
  if (/\b(progress|xp|achievement|level)\b/iu.test(value)) return "progression";
  if (/\b(plan|schedule|priority)\b/iu.test(value)) return "planner";
  if (/\b(mission|objective)\b/iu.test(value)) return "mission";
  if (/\b(coach|improve|recommend|focus)\b/iu.test(value)) return "coaching";
  if (/\b(trend|over time|recent games?)\b/iu.test(value)) return "trend";
  if (/\b(session|match|report|game)\b/iu.test(value)) return "session";
  if (/\b(loadout|weapon|map|mode|mechanic)\b/iu.test(value)) {
    return "game-knowledge";
  }
  return "clarification";
}

export function sourcesForConversationIntent(
  intent: OracleConversationIntent
): readonly OracleConversationSource[] {
  return intent === "clarification" || intent === "prohibited"
    ? Object.freeze([])
    : SOURCES[intent];
}
