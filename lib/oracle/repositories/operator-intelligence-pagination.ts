import { createHash } from "node:crypto";
import type {
  OperatorIntelligencePageKind,
} from "../understanding/operator-intelligence-page";

export const OPERATOR_INTELLIGENCE_CURSOR_VERSION = 1 as const;
export const OPERATOR_INTELLIGENCE_CURSOR_TTL_MS = 15 * 60 * 1000;

type CursorQuery = object;

export type OperatorIntelligenceCursorPosition = Readonly<{
  orderValue: string;
  tieBreaker: string;
}>;

type CursorPayload = Readonly<{
  version: typeof OPERATOR_INTELLIGENCE_CURSOR_VERSION;
  kind: OperatorIntelligencePageKind;
  queryHash: string;
  readWatermark: string;
  position: OperatorIntelligenceCursorPosition;
  expiresAt: string;
}>;

export class OperatorIntelligenceCursorError extends Error {
  readonly code:
    | "OPERATOR_INTELLIGENCE_CURSOR_INVALID"
    | "OPERATOR_INTELLIGENCE_CURSOR_EXPIRED"
    | "OPERATOR_INTELLIGENCE_CURSOR_QUERY_MISMATCH";

  constructor(reason: "invalid" | "expired" | "query-mismatch") {
    const codeByReason = {
      invalid: "OPERATOR_INTELLIGENCE_CURSOR_INVALID",
      expired: "OPERATOR_INTELLIGENCE_CURSOR_EXPIRED",
      "query-mismatch": "OPERATOR_INTELLIGENCE_CURSOR_QUERY_MISMATCH",
    } as const;
    super(`Operator Intelligence cursor is ${reason}.`);
    this.name = "OperatorIntelligenceCursorError";
    this.code = codeByReason[reason];
  }
}

export function encodeOperatorIntelligenceCursor(input: Readonly<{
  kind: OperatorIntelligencePageKind;
  query: CursorQuery;
  readWatermark: string;
  position: OperatorIntelligenceCursorPosition;
  issuedAt?: string;
}>): string {
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const payload: CursorPayload = {
    version: OPERATOR_INTELLIGENCE_CURSOR_VERSION,
    kind: input.kind,
    queryHash: hashQuery(input.query),
    readWatermark: requireNonEmpty(input.readWatermark),
    position: {
      orderValue: requireNonEmpty(input.position.orderValue),
      tieBreaker: requireNonEmpty(input.position.tieBreaker),
    },
    expiresAt: new Date(
      Date.parse(requireTimestamp(issuedAt)) + OPERATOR_INTELLIGENCE_CURSOR_TTL_MS
    ).toISOString(),
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const checksum = createHash("sha256").update(body).digest("base64url");

  return `${body}.${checksum}`;
}

export function decodeOperatorIntelligenceCursor(input: Readonly<{
  cursor: string;
  kind: OperatorIntelligencePageKind;
  query: CursorQuery;
  now?: string;
}>): Readonly<{
  readWatermark: string;
  position: OperatorIntelligenceCursorPosition;
}> {
  try {
    const [body, checksum, extra] = input.cursor.split(".");

    if (!body || !checksum || extra) {
      throw new OperatorIntelligenceCursorError("invalid");
    }

    const expectedChecksum = createHash("sha256")
      .update(body)
      .digest("base64url");

    if (checksum !== expectedChecksum) {
      throw new OperatorIntelligenceCursorError("invalid");
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as Partial<CursorPayload>;

    if (
      payload.version !== OPERATOR_INTELLIGENCE_CURSOR_VERSION ||
      payload.kind !== input.kind ||
      typeof payload.queryHash !== "string" ||
      typeof payload.readWatermark !== "string" ||
      typeof payload.expiresAt !== "string" ||
      typeof payload.position?.orderValue !== "string" ||
      typeof payload.position.tieBreaker !== "string"
    ) {
      throw new OperatorIntelligenceCursorError("invalid");
    }

    if (payload.queryHash !== hashQuery(input.query)) {
      throw new OperatorIntelligenceCursorError("query-mismatch");
    }

    const now = Date.parse(requireTimestamp(input.now ?? new Date().toISOString()));

    if (Date.parse(requireTimestamp(payload.expiresAt)) <= now) {
      throw new OperatorIntelligenceCursorError("expired");
    }

    return Object.freeze({
      readWatermark: requireNonEmpty(payload.readWatermark),
      position: Object.freeze({
        orderValue: requireNonEmpty(payload.position.orderValue),
        tieBreaker: requireNonEmpty(payload.position.tieBreaker),
      }),
    });
  } catch (error) {
    if (error instanceof OperatorIntelligenceCursorError) {
      throw error;
    }

    throw new OperatorIntelligenceCursorError("invalid");
  }
}

function hashQuery(query: CursorQuery): string {
  const canonical = JSON.stringify(canonicalize(query));

  return createHash("sha256").update(canonical).digest("base64url");
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)])
    );
  }

  return value;
}

function requireTimestamp(value: string): string {
  if (!Number.isFinite(Date.parse(value))) {
    throw new OperatorIntelligenceCursorError("invalid");
  }

  return value;
}

function requireNonEmpty(value: string): string {
  if (value.length === 0) {
    throw new OperatorIntelligenceCursorError("invalid");
  }

  return value;
}
