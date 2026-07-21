import assert from "node:assert/strict";
import {
  createOracleCompanionGuidance,
} from "../lib/companion/guidance";
import {
  createCompanionGuidanceApplicationState,
  createCompanionGuidanceLoadingState,
  createCompanionGuidanceUnavailableState,
} from "../lib/oracle/applications/companion";
import type {
  OracleCompanionGuidanceProviderFailure,
  OracleCompanionGuidanceServiceResult,
} from "../lib/oracle/services/companion-guidance";

const guidance =
  createOracleCompanionGuidance({
    contract: {
      name:
        "oracle.companion-guidance",
      version: 1,
    },
    id: "application-guidance-1",
    category:
      "future_operator_domain",
    type: "clip-analysis.v2",
    title: "Review the evidence",
    summary:
      "A presentation-safe summary.",
    delivery: "advisory",
    recommendation:
      "Consider the reviewed evidence before deciding what to practise.",
    detailedExplanation:
      "The Operator retains control of the decision.",
    rationale:
      "The recommendation is supported by an attributed source.",
    evidence: [
      {
        id: "evidence-1",
        summary:
          "The source supports the recommendation.",
        sourceIds: ["source-1"],
      },
    ],
    confidence: {
      score: 0.82,
      rationale:
        "The evidence is direct and reviewed.",
    },
    priority: "high",
    sources: [
      {
        id: "source-1",
        type: "official_support",
        title: "Official Support",
        uri:
          "https://example.com/support",
        publisher: "Example Publisher",
        version: "2026-07",
        verifiedAt:
          "2026-07-21T17:00:00.000Z",
      },
    ],
    spoilerLevel: "minor",
    reassessmentTrigger:
      "Reassess when new evidence is available.",
    provenance: {
      method: "verification",
      providerId:
        "provider.internal-secret",
      providerVersion: "1.0.0",
      generatedAt:
        "2026-07-21T17:00:00.000Z",
    },
    compatibility: {
      minimumCompanionVersion: null,
      integrationId: null,
      integrationVersion: null,
      gameVersion: null,
    },
    createdAt:
      "2026-07-21T17:00:00.000Z",
    expiresAt: null,
  });

const ready =
  createCompanionGuidanceApplicationState(
    createResult({
      guidance: [guidance],
    })
  );

assert.equal(ready.status, "ready");
assert.equal(ready.cards.length, 1);
assert.equal(
  ready.cards[0].category.label,
  "Future operator domain"
);
assert.equal(
  ready.cards[0].type.label,
  "Clip analysis v2"
);
assert.equal(
  ready.cards[0].confidence.level.label,
  "High confidence"
);
assert.equal(
  ready.cards[0].priority.label,
  "High priority"
);
assert.equal(
  ready.cards[0].spoiler.label,
  "Minor spoilers"
);
assert.deepEqual(
  ready.cards[0].evidence[0]
    .sourceIds,
  ["source-1"]
);
assert.equal(
  ready.cards[0].sources[0].uri,
  "https://example.com/support"
);
assert.equal(
  ready.cards[0].sources[0].publisher,
  "Example Publisher"
);
assert.notEqual(
  ready.cards[0],
  guidance
);
assert.notEqual(
  ready.cards[0].sources[0],
  guidance.sources[0]
);
assert.equal(
  "contract" in ready.cards[0],
  false
);
assert.equal(
  "provenance" in ready.cards[0],
  false
);
assert.equal(
  "compatibility" in ready.cards[0],
  false
);
assert.equal(
  isDeeplyFrozen(ready),
  true
);

const executionFailure =
  createFailure(
    "execution",
    "provider.execution-secret",
    "Sensitive provider exception."
  );
const validationFailure =
  createFailure(
    "output-validation",
    "provider.validation-secret",
    "Sensitive validation details."
  );

const partial =
  createCompanionGuidanceApplicationState(
    createResult({
      guidance: [guidance],
      failures: [
        executionFailure,
        validationFailure,
        validationFailure,
      ],
    })
  );

assert.equal(
  partial.status,
  "partial-success"
);
assert.deepEqual(
  partial.diagnostics.map(
    (diagnostic) => diagnostic.code
  ),
  [
    "guidance-source-unavailable",
    "guidance-content-omitted",
  ],
  "Repeated provider failures must collapse into stable application diagnostics."
);

const serializedPartial =
  JSON.stringify(partial);

assert.equal(
  serializedPartial.includes(
    "provider.execution-secret"
  ),
  false
);
assert.equal(
  serializedPartial.includes(
    "Sensitive provider exception"
  ),
  false
);
assert.equal(
  serializedPartial.includes(
    "provider.validation-secret"
  ),
  false
);
assert.equal(
  serializedPartial.includes(
    "provider.execution-metadata"
  ),
  false
);
assert.equal(
  serializedPartial.includes(
    "Sensitive validation details"
  ),
  false
);
assert.equal(
  serializedPartial.includes(
    "internal.failure-code"
  ),
  false
);

const empty =
  createCompanionGuidanceApplicationState(
    createResult()
  );
assert.equal(empty.status, "empty");
assert.equal(empty.cards.length, 0);
assert.equal(empty.diagnostics.length, 0);

const failed =
  createCompanionGuidanceApplicationState(
    createResult({
      failures: [executionFailure],
    })
  );
assert.equal(failed.status, "unavailable");
assert.equal(failed.cards.length, 0);
assert.deepEqual(
  failed.diagnostics.map(
    (diagnostic) => diagnostic.code
  ),
  ["guidance-source-unavailable"]
);

const loading =
  createCompanionGuidanceLoadingState();
assert.equal(loading.status, "loading");
assert.equal(isDeeplyFrozen(loading), true);

const unavailable =
  createCompanionGuidanceUnavailableState();
assert.equal(
  unavailable.status,
  "unavailable"
);
assert.deepEqual(
  unavailable.diagnostics.map(
    (diagnostic) => diagnostic.code
  ),
  ["guidance-unavailable"]
);
assert.equal(
  isDeeplyFrozen(unavailable),
  true
);

process.stdout.write(
  "Companion Guidance application boundary verification passed.\n"
);

function createResult(
  input: Readonly<{
    guidance?:
      OracleCompanionGuidanceServiceResult["guidance"];
    failures?:
      OracleCompanionGuidanceServiceResult["failures"];
  }> = {}
): OracleCompanionGuidanceServiceResult {
  return {
    guidance: input.guidance ?? [],
    failures: input.failures ?? [],
    providers: [
      {
        providerId:
          "provider.execution-metadata",
        providerVersion: "1.0.0",
        status: "completed",
        eligibilityReason: null,
        acceptedCount:
          input.guidance?.length ?? 0,
        filteredCount: 0,
        failureCount:
          input.failures?.length ?? 0,
      },
    ],
  };
}

function createFailure(
  stage:
    OracleCompanionGuidanceProviderFailure["stage"],
  providerId: string,
  message: string
): OracleCompanionGuidanceProviderFailure {
  return {
    providerId,
    providerVersion: "1.0.0",
    stage,
    code: "internal.failure-code",
    message,
    outputIndex: null,
  };
}

function isDeeplyFrozen(
  value: unknown,
  visited = new Set<object>()
): boolean {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return true;
  }

  if (visited.has(value)) {
    return true;
  }

  visited.add(value);

  return (
    Object.isFrozen(value) &&
    Object.values(value).every(
      (child) =>
        isDeeplyFrozen(child, visited)
    )
  );
}
