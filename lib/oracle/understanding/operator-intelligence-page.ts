import { deepFreezeUnderstanding } from "./operator-understanding-validation";

export const OPERATOR_INTELLIGENCE_PAGE_REQUEST_CONTRACT =
  "oracle.operator-intelligence-page-request" as const;
export const OPERATOR_INTELLIGENCE_PAGE_RESULT_CONTRACT =
  "oracle.operator-intelligence-page-result" as const;
export const OPERATOR_INTELLIGENCE_PAGE_CONTRACT_VERSION = 1 as const;

export const OPERATOR_INTELLIGENCE_DEFAULT_PAGE_SIZE = 50;
export const OPERATOR_INTELLIGENCE_MAX_PAGE_SIZE = 100;
export const OPERATOR_INTELLIGENCE_MAX_EVIDENCE_PER_CLAIM = 32;
export const OPERATOR_INTELLIGENCE_MAX_PAGE_BYTES = 512 * 1024;

export type OperatorIntelligencePageKind =
  | "eligible-claims"
  | "claim-lifecycle"
  | "eligibility-history";

export type OperatorIntelligencePageRequest = Readonly<{
  contract: Readonly<{
    name: typeof OPERATOR_INTELLIGENCE_PAGE_REQUEST_CONTRACT;
    version: typeof OPERATOR_INTELLIGENCE_PAGE_CONTRACT_VERSION;
  }>;
  pageSize: number;
  cursor: string | null;
}>;

export type OperatorIntelligencePageResult<Item> = Readonly<{
  contract: Readonly<{
    name: typeof OPERATOR_INTELLIGENCE_PAGE_RESULT_CONTRACT;
    version: typeof OPERATOR_INTELLIGENCE_PAGE_CONTRACT_VERSION;
  }>;
  kind: OperatorIntelligencePageKind;
  items: readonly Item[];
  readWatermark: string;
  nextCursor: string | null;
  hasMore: boolean;
  serializedBytes: number;
}>;

export class OperatorIntelligencePageBudgetError extends Error {
  readonly code = "OPERATOR_INTELLIGENCE_PAGE_BUDGET_EXCEEDED";

  constructor(
    readonly budget:
      | "page-size"
      | "serialized-payload"
      | "evidence-fan-out"
  ) {
    super(`Operator Intelligence ${budget} budget was exceeded.`);
    this.name = "OperatorIntelligencePageBudgetError";
  }
}

export function createOperatorIntelligencePageRequest(
  value: Readonly<{ pageSize?: number; cursor?: string | null }> = {}
): OperatorIntelligencePageRequest {
  const pageSize = value.pageSize ?? OPERATOR_INTELLIGENCE_DEFAULT_PAGE_SIZE;

  if (
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > OPERATOR_INTELLIGENCE_MAX_PAGE_SIZE
  ) {
    throw new OperatorIntelligencePageBudgetError("page-size");
  }

  if (
    value.cursor !== undefined &&
    value.cursor !== null &&
    (typeof value.cursor !== "string" || value.cursor.length === 0)
  ) {
    throw new Error("Operator Intelligence page cursor must be opaque text.");
  }

  return deepFreezeUnderstanding({
    contract: {
      name: OPERATOR_INTELLIGENCE_PAGE_REQUEST_CONTRACT,
      version: OPERATOR_INTELLIGENCE_PAGE_CONTRACT_VERSION,
    },
    pageSize,
    cursor: value.cursor ?? null,
  });
}

export function createOperatorIntelligencePageResult<Item>(
  value: Omit<OperatorIntelligencePageResult<Item>, "contract" | "serializedBytes">
): OperatorIntelligencePageResult<Item> {
  if (value.items.length > OPERATOR_INTELLIGENCE_MAX_PAGE_SIZE) {
    throw new OperatorIntelligencePageBudgetError("page-size");
  }

  if (value.hasMore !== (value.nextCursor !== null)) {
    throw new Error(
      "Operator Intelligence page continuation state is inconsistent."
    );
  }

  if (!Number.isFinite(Date.parse(value.readWatermark))) {
    throw new Error("Operator Intelligence page watermark is invalid.");
  }

  const resultWithoutSize = {
    contract: {
      name: OPERATOR_INTELLIGENCE_PAGE_RESULT_CONTRACT,
      version: OPERATOR_INTELLIGENCE_PAGE_CONTRACT_VERSION,
    },
    ...value,
  };
  let serializedBytes = new TextEncoder().encode(
    JSON.stringify({ ...resultWithoutSize, serializedBytes: 0 })
  ).byteLength;
  serializedBytes = new TextEncoder().encode(
    JSON.stringify({ ...resultWithoutSize, serializedBytes })
  ).byteLength;

  if (serializedBytes > OPERATOR_INTELLIGENCE_MAX_PAGE_BYTES) {
    throw new OperatorIntelligencePageBudgetError("serialized-payload");
  }

  return deepFreezeUnderstanding({
    ...resultWithoutSize,
    serializedBytes,
  }) as OperatorIntelligencePageResult<Item>;
}
