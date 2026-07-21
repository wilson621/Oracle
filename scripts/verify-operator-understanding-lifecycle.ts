import assert from "node:assert/strict";
import {
  OPERATOR_DECLARATION_REVISION_CONTRACT,
  OPERATOR_INTELLIGENCE_CLAIM_CONTRACT,
  assertOperatorClaimLifecycleTransition,
  assertOperatorClaimRevisionTransition,
  assertOperatorDeclarationLifecycleTransition,
  assertOperatorDeclarationRevisionTransition,
  createOperatorDeclarationRevision,
  createOperatorDeclarationTombstone,
  createOperatorEvidenceReference,
  createOperatorIntelligenceClaimRevision,
  createOperatorIntelligenceClaimTombstone,
  isOperatorClaimLifecycleTransition,
  isOperatorDeclarationLifecycleTransition,
  type OperatorClaimLifecycleStatus,
  type OperatorDeclarationLifecycleStatus,
} from "../lib/oracle/understanding";
import {
  activeClaimInput,
  declaredIdentityInput,
  evidenceInput,
  verifiedAt,
} from "./operator-understanding-verification-fixtures";

const claimStatuses: readonly OperatorClaimLifecycleStatus[] = [
  "candidate",
  "active",
  "disputed",
  "superseded",
  "expired",
  "deleted",
];

const allowedClaimTransitions = new Set([
  "candidate:active",
  "candidate:expired",
  "candidate:deleted",
  "active:active",
  "active:disputed",
  "active:superseded",
  "active:expired",
  "active:deleted",
  "disputed:active",
  "disputed:superseded",
  "disputed:expired",
  "disputed:deleted",
  "superseded:deleted",
  "expired:candidate",
  "expired:deleted",
]);

for (const from of claimStatuses) {
  for (const to of claimStatuses) {
    const expected = allowedClaimTransitions.has(`${from}:${to}`);

    assert.equal(isOperatorClaimLifecycleTransition(from, to), expected);

    if (expected) {
      assert.doesNotThrow(() =>
        assertOperatorClaimLifecycleTransition(from, to)
      );
    } else {
      assert.throws(
        () => assertOperatorClaimLifecycleTransition(from, to),
        /is invalid/
      );
    }
  }
}

const declarationStatuses:
  readonly OperatorDeclarationLifecycleStatus[] = [
    "active",
    "corrected",
    "superseded",
    "withdrawn",
    "deleted",
  ];

const allowedDeclarationTransitions = new Set([
  "active:corrected",
  "active:superseded",
  "active:withdrawn",
  "active:deleted",
  "corrected:active",
  "corrected:superseded",
  "corrected:withdrawn",
  "corrected:deleted",
  "superseded:deleted",
  "withdrawn:deleted",
]);

for (const from of declarationStatuses) {
  for (const to of declarationStatuses) {
    const expected = allowedDeclarationTransitions.has(`${from}:${to}`);

    assert.equal(isOperatorDeclarationLifecycleTransition(from, to), expected);

    if (expected) {
      assert.doesNotThrow(() =>
        assertOperatorDeclarationLifecycleTransition(from, to)
      );
    } else {
      assert.throws(
        () => assertOperatorDeclarationLifecycleTransition(from, to),
        /is invalid/
      );
    }
  }
}

assert.equal(isOperatorClaimLifecycleTransition("deleted", "active"), false);
assert.equal(
  isOperatorDeclarationLifecycleTransition("deleted", "active"),
  false
);

const evidence = createOperatorEvidenceReference(evidenceInput);
const claimRevisionOne = createOperatorIntelligenceClaimRevision(
  activeClaimInput,
  [evidence]
);
const claimRevisionTwo = createOperatorIntelligenceClaimRevision(
  {
    ...activeClaimInput,
    id: "claim-1-revision-2",
    revision: 2,
    supersedesRevisionId: claimRevisionOne.id,
    evidence: activeClaimInput.evidence.map((link) => ({
      ...link,
      claimRevisionId: "claim-1-revision-2",
    })),
  },
  [evidence]
);

assert.doesNotThrow(() =>
  assertOperatorClaimRevisionTransition(claimRevisionOne, claimRevisionTwo)
);

const claimTombstone = createOperatorIntelligenceClaimTombstone({
  contract: {
    name: OPERATOR_INTELLIGENCE_CLAIM_CONTRACT,
    version: 1,
  },
  id: "claim-1-revision-3",
  claimId: "claim-1",
  operatorId: "operator-1",
  revision: 3,
  status: "deleted",
  deletedAt: verifiedAt,
  policyId: "operator-intelligence-test-policy",
  policyVersion: "1.0.0",
  supersedesRevisionId: claimRevisionTwo.id,
});

assert.doesNotThrow(() =>
  assertOperatorClaimRevisionTransition(claimRevisionTwo, claimTombstone)
);

assert.throws(
  () =>
    createOperatorIntelligenceClaimTombstone({
      ...claimTombstone,
      value: "content must not survive deletion",
    }),
  /must not retain 'value' content/
);

const declarationRevisionOne = createOperatorDeclarationRevision({
  contract: {
    name: OPERATOR_DECLARATION_REVISION_CONTRACT,
    version: 1,
  },
  id: "declaration-1-revision-1",
  declarationId: "declaration-1",
  operatorId: "operator-1",
  revision: 1,
  domain: "identity",
  key: "callsign",
  status: "active",
  epistemic: "declared",
  value: declaredIdentityInput.value,
  confidence: null,
  provenance: declaredIdentityInput.provenance,
  scope: declaredIdentityInput.scope,
  temporalValidity: declaredIdentityInput.temporalValidity,
  policyId: "operator-declaration-test-policy",
  policyVersion: "1.0.0",
  supersedesRevisionId: null,
});
const declarationRevisionTwo = createOperatorDeclarationRevision({
  ...declarationRevisionOne,
  id: "declaration-1-revision-2",
  revision: 2,
  status: "corrected",
  value: "Sentinel Prime",
  supersedesRevisionId: declarationRevisionOne.id,
});

assert.doesNotThrow(() =>
  assertOperatorDeclarationRevisionTransition(
    declarationRevisionOne,
    declarationRevisionTwo
  )
);

const declarationTombstone = createOperatorDeclarationTombstone({
  contract: {
    name: OPERATOR_DECLARATION_REVISION_CONTRACT,
    version: 1,
  },
  id: "declaration-1-revision-3",
  declarationId: "declaration-1",
  operatorId: "operator-1",
  revision: 3,
  status: "deleted",
  deletedAt: verifiedAt,
  policyId: "operator-declaration-test-policy",
  policyVersion: "1.0.0",
  supersedesRevisionId: declarationRevisionTwo.id,
});

assert.doesNotThrow(() =>
  assertOperatorDeclarationRevisionTransition(
    declarationRevisionTwo,
    declarationTombstone
  )
);

assert.throws(
  () =>
    assertOperatorDeclarationRevisionTransition(
      declarationRevisionOne,
      declarationTombstone
    ),
  /must be monotonic/
);

process.stdout.write("Operator Understanding lifecycle verification passed.\n");
