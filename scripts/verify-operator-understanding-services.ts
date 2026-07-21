import assert from "node:assert/strict";
import {
  createOperatorEvidenceReference,
  createOperatorUnderstandingSnapshot,
} from "../lib/oracle/understanding";
import type {
  OperatorUnderstandingService,
} from "../lib/oracle/services/operator-understanding";
import {
  activeClaimInput,
  evidenceInput,
  expiresAt,
  snapshotInput,
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

process.stdout.write("Operator Understanding service contract verification passed.\n");
