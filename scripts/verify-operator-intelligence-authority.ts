import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type {
  OperatorIntelligencePersistenceQuery,
  OperatorIntelligenceRepository,
  OperatorIntelligenceLifecycleQuery,
  OperatorIntelligenceEligibilityHistoryQuery,
} from "../lib/oracle/repositories/operator-intelligence-repository";
import type { OperatorService } from "../lib/oracle/services/operator";
import {
  createOperatorIntelligenceService,
  OperatorIntelligenceTransitionUnavailableError,
} from "../lib/oracle/services/operator-intelligence";
import type {
  OperatorConsentDecision,
  OperatorDataPolicyDefinition,
  OperatorEvidenceDisposition,
  OperatorEvidenceReference,
  OperatorGameSessionEvidenceAdmission,
  OperatorIntelligenceClaimRevision,
  OperatorIntelligenceClaimTombstone,
  OperatorUnderstandingEligibility,
} from "../lib/oracle/understanding";
import {
  createOperatorEvidenceReference,
  createOperatorIntelligenceClaimRevision,
  createOperatorIntelligencePageRequest,
  createOperatorIntelligencePageResult,
} from "../lib/oracle/understanding";
import {
  activeClaimInput,
  evidenceInput,
} from "./operator-understanding-verification-fixtures";

const currentOperatorId = "11111111-1111-4111-8111-111111111111";

async function main() {
  await verifyCurrentOperatorInjection();
  await verifyCallerSelectionRejection();
  await verifyInactiveTransitionFailsClosed();
  verifyServerCredentialBoundary();
  verifyExclusiveRepositoryImportBoundary();
  process.stdout.write(
    "Operator Intelligence authority verification passed.\n"
  );
}

async function verifyCurrentOperatorInjection() {
  const repository = new RecordingRepository();
  const operatorService = createRecordingOperatorService();
  const service = createOperatorIntelligenceService(
    operatorService,
    repository
  );
  const ownedEvidence = createOperatorEvidenceReference({
    ...evidenceInput,
    operatorId: currentOperatorId,
  });
  const evidence = omitOperatorId(ownedEvidence);
  const candidate = createCandidateProposal(ownedEvidence);

  await service.submitCandidate({
    evidenceReferences: [evidence],
    claim: candidate,
  });

  assert.equal(operatorService.calls, 1);
  assert.equal(repository.persistedOperatorId, currentOperatorId);
  assert.equal(
    repository.persistedEvidence[0]?.operatorId,
    currentOperatorId
  );
  assert.equal(repository.persistedClaim?.operatorId, currentOperatorId);

  await service.listEligibleClaims({
    purpose: "operator-coaching",
    asOf: "2026-07-21T12:00:00.000Z",
    scope: null,
    page: createOperatorIntelligencePageRequest(),
  });
  assert.equal(repository.queriedOperatorId, currentOperatorId);
}

async function verifyCallerSelectionRejection() {
  const repository = new RecordingRepository();
  const operatorService = createRecordingOperatorService();
  const service = createOperatorIntelligenceService(
    operatorService,
    repository
  );

  await assert.rejects(
    service.submitCandidate({
      evidenceReferences: [
        {
          ...omitOperatorId(
            createOperatorEvidenceReference({
              ...evidenceInput,
              operatorId: currentOperatorId,
            })
          ),
          operatorId: "22222222-2222-4222-8222-222222222222",
        },
      ],
      claim: createCandidateProposal(
        createOperatorEvidenceReference({
          ...evidenceInput,
          operatorId: currentOperatorId,
        })
      ),
    } as never),
    /cannot select an Operator/
  );
  assert.equal(operatorService.calls, 0);
  assert.equal(repository.persistedClaim, null);
}

async function verifyInactiveTransitionFailsClosed() {
  const service = createOperatorIntelligenceService(
    createRecordingOperatorService(),
    new RecordingRepository()
  );

  await assert.rejects(
    service.transitionClaim({
      claimId: "claim-1",
      fromRevisionId: "claim-revision-1",
      fromStatus: "candidate",
      toStatus: "active",
      policyVersion: "1.0.0",
    }),
    OperatorIntelligenceTransitionUnavailableError
  );
}

function verifyServerCredentialBoundary() {
  const trustedClientPath = path.join(
    process.cwd(),
    "lib",
    "supabase-trusted-server.ts"
  );
  const trustedClient = fs.readFileSync(trustedClientPath, "utf8");
  const sourceFiles = collectTypeScriptFiles(process.cwd()).filter(
    (file) => !file.includes(`${path.sep}node_modules${path.sep}`)
  );
  const credentialReferences = sourceFiles
    .filter((file) =>
      fs.readFileSync(file, "utf8").includes("SUPABASE_SECRET_KEY")
    )
    .map((file) => path.relative(process.cwd(), file).replaceAll("\\", "/"));

  assert.match(trustedClient, /^import "server-only";/);
  assert.doesNotMatch(trustedClient, /NEXT_PUBLIC_SUPABASE_SECRET/);
  assert.doesNotMatch(trustedClient, /console\.|JSON\.stringify/);
  assert.deepEqual(credentialReferences, [
    "lib/supabase-trusted-server.ts",
    "scripts/verify-operator-intelligence-authority.ts",
  ]);
}

function verifyExclusiveRepositoryImportBoundary() {
  const sourceFiles = collectTypeScriptFiles(
    path.join(process.cwd(), "app")
  ).concat(
    collectTypeScriptFiles(path.join(process.cwd(), "components")),
    collectTypeScriptFiles(path.join(process.cwd(), "lib"))
  );
  const repositoryImports = sourceFiles
    .filter((file) =>
      fs
        .readFileSync(file, "utf8")
        .includes("repositories/operator-intelligence-repository")
    )
    .map((file) => path.relative(process.cwd(), file).replaceAll("\\", "/"))
    .sort();

  assert.deepEqual(repositoryImports, [
    "lib/oracle/services/operator-intelligence/operator-intelligence-service.ts",
    "lib/oracle/services/operator-intelligence/server-operator-intelligence-service.ts",
  ]);
}

function createRecordingOperatorService() {
  const service = {
    calls: 0,
    async getCurrentOperator() {
      service.calls += 1;
      return {
        id: currentOperatorId,
        email: null,
        callsign: "Verification",
        designation: "OR-VERIFY",
        primary_game: null,
        combat_rating: null,
        xp: 0,
        level: 1,
        total_sessions: 0,
        created_at: "2026-07-21T12:00:00.000Z",
      };
    },
    async completeCurrentOperatorCommissioning() {
      throw new Error("Not used by authority verification.");
    },
  } satisfies OperatorService & { calls: number };

  return service;
}

class RecordingRepository implements OperatorIntelligenceRepository {
  persistedOperatorId: string | null = null;
  persistedEvidence: readonly OperatorEvidenceReference[] = [];
  persistedClaim:
    | OperatorIntelligenceClaimRevision
    | OperatorIntelligenceClaimTombstone
    | null = null;
  queriedOperatorId: string | null = null;

  async registerPolicyDefinition(
    policy: OperatorDataPolicyDefinition
  ) {
    return policy;
  }

  async appendConsentDecision(
    _operatorId: string,
    decision: OperatorConsentDecision
  ) {
    return decision;
  }

  async admitGameSessionEvidence(
    _operatorId: string,
    _evidence: OperatorEvidenceReference,
    _disposition: OperatorEvidenceDisposition,
    admission: OperatorGameSessionEvidenceAdmission
  ) {
    return admission;
  }

  async appendEvidenceDisposition(
    _operatorId: string,
    disposition: OperatorEvidenceDisposition
  ) {
    return disposition;
  }

  async persistClaimRevision(
    operatorId: string,
    evidenceReferences: readonly OperatorEvidenceReference[],
    claimRevision:
      | OperatorIntelligenceClaimRevision
      | OperatorIntelligenceClaimTombstone
  ) {
    this.persistedOperatorId = operatorId;
    this.persistedEvidence = evidenceReferences;
    this.persistedClaim = claimRevision;
    return claimRevision;
  }

  async appendEligibilityAssessment(
    _operatorId: string,
    _claimId: string,
    _claimRevisionId: string,
    eligibility: OperatorUnderstandingEligibility
  ) {
    return eligibility;
  }

  async listEligibleClaimRevisions(
    query: OperatorIntelligencePersistenceQuery
  ) {
    this.queriedOperatorId = query.operatorId;
    return createOperatorIntelligencePageResult({
      kind: "eligible-claims",
      items: [],
      readWatermark: "2026-07-21T12:00:00.000Z",
      nextCursor: null,
      hasMore: false,
    });
  }

  async listClaimLifecycle(query: OperatorIntelligenceLifecycleQuery) {
    this.queriedOperatorId = query.operatorId;
    return createOperatorIntelligencePageResult({
      kind: "claim-lifecycle",
      items: [],
      readWatermark: "2026-07-21T12:00:00.000Z",
      nextCursor: null,
      hasMore: false,
    });
  }

  async listEligibilityHistory(
    query: OperatorIntelligenceEligibilityHistoryQuery
  ) {
    this.queriedOperatorId = query.operatorId;
    return createOperatorIntelligencePageResult({
      kind: "eligibility-history",
      items: [],
      readWatermark: "2026-07-21T12:00:00.000Z",
      nextCursor: null,
      hasMore: false,
    });
  }
}

function omitOperatorId<Value extends Readonly<{ operatorId: string }>>(
  value: Value
): Omit<Value, "operatorId"> {
  const { operatorId, ...rest } = value;
  void operatorId;
  return rest;
}

function createCandidateProposal(
  evidence: OperatorEvidenceReference
) {
  const candidate = createOperatorIntelligenceClaimRevision(
    {
      ...activeClaimInput,
      operatorId: currentOperatorId,
      status: "candidate",
      epistemic: "suspected",
      explanation: null,
      eligibility: {
        ...activeClaimInput.eligibility,
        eligible: false,
        reasons: ["candidate"],
      },
    },
    [evidence]
  );

  return {
    ...omitOperatorId(candidate),
    status: "candidate" as const,
    epistemic: "suspected" as const,
    explanation: null,
  };
}

function collectTypeScriptFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectTypeScriptFiles(entryPath);
    }

    return /\.tsx?$/.test(entry.name) ? [entryPath] : [];
  });
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
