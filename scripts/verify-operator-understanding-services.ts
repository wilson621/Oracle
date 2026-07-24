import assert from "node:assert/strict";
import {
  OPERATOR_UNDERSTANDING_MAX_SNAPSHOT_BYTES,
  OperatorUnderstandingSnapshotBudgetError,
  createOperatorEvidenceReference,
  createOperatorUnderstandingSnapshot,
} from "../lib/oracle/understanding";
import type {
  OperatorUnderstandingProjectionSource,
  OperatorUnderstandingService,
} from "../lib/oracle/services/operator-understanding";
import {
  createOperatorUnderstandingService,
} from "../lib/oracle/services/operator-understanding";
import type { OperatorService } from "../lib/oracle/services/operator";
import {
  activeClaimInput,
  evidenceInput,
  expiresAt,
  snapshotInput,
  unknownInput,
  verifiedAt,
} from "./operator-understanding-verification-fixtures";

const evidence = createOperatorEvidenceReference(evidenceInput);
const snapshot = createOperatorUnderstandingSnapshot(snapshotInput, [evidence]);

assert.equal(snapshot.operatorId, "operator-1");
assert.equal(snapshot.intelligence[0]?.confidence.score, 0.8);
assert.equal(
  snapshot.intelligence[0]?.explanation?.summary,
  activeClaimInput.explanation.summary
);
assert.equal(Object.isFrozen(snapshot), true);
assert.equal(Object.isFrozen(snapshot.identity), true);
assert.equal(Object.isFrozen(snapshot.intelligence[0]?.explanation), true);
assert.equal("operatorId" in {
  purpose: "operator-coaching",
  asOf: snapshot.asOf,
  applicationId: null,
  gameIntegration: null,
}, false);

const service = {
  async getCurrentSnapshot() {
    return snapshot;
  },
} satisfies OperatorUnderstandingService;

void service.getCurrentSnapshot().then((currentSnapshot) => {
  assert.equal(currentSnapshot.operatorId, "operator-1");
});

assert.throws(
  () =>
    createOperatorUnderstandingSnapshot(
      {
        ...snapshotInput,
        purpose: "career-planning",
      },
      [evidence]
    ),
  /eligibility purpose does not match/
);

assert.throws(
  () =>
    createOperatorUnderstandingSnapshot(
      {
        ...snapshotInput,
        generatedAt: expiresAt,
        asOf: expiresAt,
        intelligence: [
          {
            ...activeClaimInput,
            status: "disputed",
            eligibility: {
              ...activeClaimInput.eligibility,
              eligible: false,
              reasons: ["disputed"],
            },
          },
        ],
      },
      [evidence]
    ),
  /only active, eligible inferred claims/
);

assert.throws(
  () =>
    createOperatorUnderstandingSnapshot(
      {
        ...snapshotInput,
        generatedAt: "2026-08-22T12:00:00.000Z",
        asOf: "2026-08-22T12:00:00.000Z",
      },
      [evidence]
    ),
  /is not current at the Snapshot asOf time/
);

assert.throws(
  () =>
    createOperatorUnderstandingSnapshot(
      {
        ...snapshotInput,
        generatedAt: expiresAt,
        asOf: expiresAt,
      },
      [evidence]
    ),
  /is not current at the Snapshot asOf time/
);

assert.throws(
  () =>
    createOperatorUnderstandingSnapshot(
      {
        ...snapshotInput,
        identity: [
          {
            ...snapshotInput.identity[0],
            operatorId: "operator-2",
          },
        ],
      },
      [evidence]
    ),
  /another Operator's understanding/
);

assert.throws(
  () =>
    createOperatorUnderstandingSnapshot(
      {
        ...snapshotInput,
        memory: [
          {
            ...snapshotInput.memory[0],
            epistemic: "suspected",
          },
        ],
      },
      [evidence]
    ),
  /must preserve the epistemic class/
);

const maximumTotalSnapshot = createOperatorUnderstandingSnapshot(
  {
    ...snapshotInput,
    unknowns: Array.from({ length: 247 }, (_, index) => ({
      ...unknownInput,
      id: `unknown-${index}`,
      key: `unknown-key-${index}`,
    })),
  },
  [evidence]
);
assert.equal(
  maximumTotalSnapshot.identity.length +
    maximumTotalSnapshot.memory.length +
    maximumTotalSnapshot.intelligence.length +
    maximumTotalSnapshot.unknowns.length,
  250
);

assert.throws(
  () => createOperatorUnderstandingSnapshot(
    {
      ...snapshotInput,
      unknowns: Array.from({ length: 248 }, (_, index) => ({
        ...unknownInput,
        id: `over-budget-unknown-${index}`,
        key: `over-budget-key-${index}`,
      })),
    },
    [evidence]
  ),
  (error: unknown) =>
    error instanceof OperatorUnderstandingSnapshotBudgetError &&
    error.budget === "total-items"
);

assert.throws(
  () => createOperatorUnderstandingSnapshot(
    {
      ...snapshotInput,
      intelligence: Array.from({ length: 101 }, () => activeClaimInput),
      memory: [],
    },
    [evidence]
  ),
  (error: unknown) =>
    error instanceof OperatorUnderstandingSnapshotBudgetError &&
    error.budget === "intelligence-items"
);

assert.throws(
  () => createOperatorUnderstandingSnapshot(
    {
      ...snapshotInput,
      unknowns: [{
        ...unknownInput,
        reason: "x".repeat(OPERATOR_UNDERSTANDING_MAX_SNAPSHOT_BYTES),
      }],
      memory: [],
      intelligence: [],
    },
    [evidence]
  ),
  (error: unknown) =>
    error instanceof OperatorUnderstandingSnapshotBudgetError &&
    error.budget === "serialized-payload"
);

void verifyAuthenticatedProjectionService()
  .then(() => {
    process.stdout.write(
      "Operator Understanding service contract verification passed.\n"
    );
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });

async function verifyAuthenticatedProjectionService() {
  const operatorService = {
    async getCurrentOperator() {
      return {
        id: "operator-1",
        email: null,
        callsign: null,
        designation: null,
        primary_game: null,
        combat_rating: null,
        xp: 0,
        level: 1,
        total_sessions: 0,
        created_at: verifiedAt,
      };
    },
    async provisionCurrentOperator() {
      throw new Error("not used");
    },
  } satisfies OperatorService;
  let selectedOperatorId: string | null = null;
  const source = {
    async load(operatorId, request) {
      void request;
      selectedOperatorId = operatorId;
      return {
        operatorId,
        sourceUpdatedAt: verifiedAt,
        policySetVersion: snapshotInput.policySetVersion,
        identity: snapshot.identity,
        preferences: snapshot.preferences,
        goals: snapshot.goals,
        state: snapshot.state,
        memory: snapshot.memory,
        intelligence: snapshot.intelligence,
        unknowns: snapshot.unknowns,
        evidenceReferences: [evidence],
      };
    },
  } satisfies OperatorUnderstandingProjectionSource;
  const authenticatedService = createOperatorUnderstandingService(
    operatorService,
    source,
    { maximumSourceAgeSeconds: 60 }
  );
  const authenticatedSnapshot = await authenticatedService.getCurrentSnapshot({
    purpose: snapshot.purpose,
    asOf: verifiedAt,
    applicationId: null,
    gameIntegration: {
      id: "example-game",
      version: "1.0.0",
    },
  });
  assert.equal(selectedOperatorId, "operator-1");
  assert.equal(authenticatedSnapshot.operatorId, "operator-1");

  const staleService = createOperatorUnderstandingService(
    operatorService,
    {
      ...source,
      async load(operatorId, request) {
        return {
          ...(await source.load(operatorId, request)),
          sourceUpdatedAt: "2026-07-21T11:00:00.000Z",
        };
      },
    },
    { maximumSourceAgeSeconds: 60 }
  );
  await assert.rejects(
    staleService.getCurrentSnapshot({
      purpose: snapshot.purpose,
      asOf: verifiedAt,
      applicationId: null,
      gameIntegration: null,
    }),
    /freshness budget/
  );
}
