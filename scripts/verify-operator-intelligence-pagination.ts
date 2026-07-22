import assert from "node:assert/strict";
import {
  OperatorIntelligenceCursorError,
  decodeOperatorIntelligenceCursor,
  encodeOperatorIntelligenceCursor,
} from "../lib/oracle/repositories/operator-intelligence-pagination";
import {
  OPERATOR_INTELLIGENCE_DEFAULT_PAGE_SIZE,
  OPERATOR_INTELLIGENCE_MAX_PAGE_BYTES,
  OperatorIntelligencePageBudgetError,
  createOperatorIntelligencePageRequest,
  createOperatorIntelligencePageResult,
} from "../lib/oracle/understanding";

const query = {
  operatorId: "11111111-1111-4111-8111-111111111111",
  purpose: "operator-coaching",
  asOf: "2026-07-22T12:00:00.000Z",
  scope: { type: "operator" },
} as const;

function main() {
  verifyPageContracts();
  verifyCursorRoundTrip();
  verifyCursorFailures();
  process.stdout.write("Operator Intelligence pagination verification passed.\n");
}

function verifyPageContracts() {
  const request = createOperatorIntelligencePageRequest();
  assert.equal(request.pageSize, OPERATOR_INTELLIGENCE_DEFAULT_PAGE_SIZE);
  assert.equal(request.cursor, null);
  assert.equal(Object.isFrozen(request), true);
  assert.equal(Object.isFrozen(request.contract), true);
  assert.deepEqual(JSON.parse(JSON.stringify(request)), request);

  assert.throws(
    () => createOperatorIntelligencePageRequest({ pageSize: 101 }),
    OperatorIntelligencePageBudgetError
  );
  assert.throws(
    () => createOperatorIntelligencePageRequest({ pageSize: 0 }),
    OperatorIntelligencePageBudgetError
  );

  const result = createOperatorIntelligencePageResult({
    kind: "eligible-claims",
    items: [{ id: "claim-1" }],
    readWatermark: "2026-07-22T12:01:00.000Z",
    nextCursor: null,
    hasMore: false,
  });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.items), true);
  assert.ok(result.serializedBytes < OPERATOR_INTELLIGENCE_MAX_PAGE_BYTES);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);

  assert.throws(
    () => createOperatorIntelligencePageResult({
      kind: "eligible-claims",
      items: [{ value: "x".repeat(OPERATOR_INTELLIGENCE_MAX_PAGE_BYTES) }],
      readWatermark: "2026-07-22T12:01:00.000Z",
      nextCursor: null,
      hasMore: false,
    }),
    OperatorIntelligencePageBudgetError
  );
}

function verifyCursorRoundTrip() {
  const cursor = encodeOperatorIntelligenceCursor({
    kind: "eligible-claims",
    query,
    readWatermark: "2026-07-22T12:01:00.000Z",
    position: {
      orderValue: "2026-07-20T09:00:00.000Z",
      tieBreaker: "claim-1",
    },
    issuedAt: "2026-07-22T12:00:00.000Z",
  });
  const decoded = decodeOperatorIntelligenceCursor({
    cursor,
    kind: "eligible-claims",
    query,
    now: "2026-07-22T12:05:00.000Z",
  });

  assert.equal(decoded.readWatermark, "2026-07-22T12:01:00.000Z");
  assert.equal(decoded.position.tieBreaker, "claim-1");
  assert.equal(Object.isFrozen(decoded), true);
  assert.equal(cursor.includes(query.operatorId), false);
  assert.equal(cursor.includes(query.purpose), false);
}

function verifyCursorFailures() {
  const cursor = encodeOperatorIntelligenceCursor({
    kind: "eligible-claims",
    query,
    readWatermark: "2026-07-22T12:01:00.000Z",
    position: { orderValue: "1", tieBreaker: "claim-1" },
    issuedAt: "2026-07-22T12:00:00.000Z",
  });

  assert.throws(
    () => decodeOperatorIntelligenceCursor({
      cursor: `${cursor}corrupt`,
      kind: "eligible-claims",
      query,
      now: "2026-07-22T12:05:00.000Z",
    }),
    (error: unknown) =>
      error instanceof OperatorIntelligenceCursorError &&
      error.code === "OPERATOR_INTELLIGENCE_CURSOR_INVALID"
  );
  assert.throws(
    () => decodeOperatorIntelligenceCursor({
      cursor,
      kind: "eligible-claims",
      query: { ...query, purpose: "different-purpose" },
      now: "2026-07-22T12:05:00.000Z",
    }),
    (error: unknown) =>
      error instanceof OperatorIntelligenceCursorError &&
      error.code === "OPERATOR_INTELLIGENCE_CURSOR_QUERY_MISMATCH"
  );
  assert.throws(
    () => decodeOperatorIntelligenceCursor({
      cursor,
      kind: "eligible-claims",
      query,
      now: "2026-07-22T12:16:00.000Z",
    }),
    (error: unknown) =>
      error instanceof OperatorIntelligenceCursorError &&
      error.code === "OPERATOR_INTELLIGENCE_CURSOR_EXPIRED"
  );
}

main();
