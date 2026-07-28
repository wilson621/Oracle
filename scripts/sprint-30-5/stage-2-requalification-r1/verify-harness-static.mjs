import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import {
  assertAttemptOutputAvailable,
  assertGitAncestor,
  assertOutsideHistoricalRoots,
  assertNoReparseTraversal,
  assertRequiredTool,
  assertR1ArtifactPath,
  bindCertificate,
  contract,
  git,
  isSameOrDescendant,
  repositoryRoot,
  validateAttemptIdentity,
  validateBinding,
  validateCertificateThumbprint,
  validateFinalIdentity,
  validateMachineQualificationState,
  validateRepositorySnapshot,
  validateToolchainVersions,
  writeJsonAtomicCreateOnly,
} from "./harness-core.mjs";
import {
  FOUNDER_EXECUTION_AUTHORITY,
  assertFounderExecutionAuthority,
  assertSingleAttemptAuthorityAvailable,
  claimSingleAttemptAuthority,
  executionPhases,
  selectExactCertificateMatches,
  validatePhaseTransition,
} from "./execution-core.mjs";

const fixtureTimestamp = "2026-07-28T13:14:15.678Z";
const fixtureAttemptId = "r1-20260728T131415678Z-deadbeef";
const fixtureCommit = "a".repeat(40);
const fixtureBinding = {
  candidateCommit: fixtureCommit,
  harnessCommit: fixtureCommit,
  machineIdentity: os.hostname(),
  packageIdentity: contract.package.identity,
  packageVersion: contract.package.version,
};

validateAttemptIdentity({
  attemptId: fixtureAttemptId,
  timestampUtc: fixtureTimestamp,
});
assert.throws(
  () =>
    validateAttemptIdentity({
      attemptId: "r1-reused",
      timestampUtc: fixtureTimestamp,
    }),
  /Attempt ID must/
);
assert.throws(
  () =>
    validateToolchainVersions({
      ...contract.toolchain,
      node: "0.0.0",
    }),
  /Toolchain identity mismatch for node/
);
assert.doesNotThrow(() => validateToolchainVersions(contract.toolchain));
assert.throws(
  () =>
    validateAttemptIdentity({
      attemptId: fixtureAttemptId,
      timestampUtc: "2026-07-28T13:14:15.679Z",
    }),
  /does not match/
);
assert.doesNotThrow(() => validateBinding(fixtureBinding));
assert.throws(
  () => validateBinding({ ...fixtureBinding, machineIdentity: "other-host" }),
  /Machine identity mismatch/
);
assert.throws(
  () => validateBinding({ ...fixtureBinding, packageIdentity: "Other.Package" }),
  /Unexpected package identity/
);
assert.doesNotThrow(() =>
  validateRepositorySnapshot(
    {
      branch: contract.requiredBranch,
      head: fixtureCommit,
      status: "",
    },
    fixtureBinding
  )
);
assert.throws(
  () =>
    validateRepositorySnapshot(
      { branch: "wrong-branch", head: fixtureCommit, status: "" },
      fixtureBinding
    ),
  /Wrong branch/
);
assert.throws(
  () =>
    validateRepositorySnapshot(
      { branch: contract.requiredBranch, head: "b".repeat(40), status: "" },
      fixtureBinding
    ),
  /Unexpected HEAD/
);
assert.throws(
  () =>
    validateRepositorySnapshot(
      { branch: contract.requiredBranch, head: fixtureCommit, status: " M file" },
      fixtureBinding
    ),
  /clean repository/
);

for (const historical of contract.historicalProtectedRoots) {
  assert.throws(
    () => assertOutsideHistoricalRoots(join(historical, "forbidden.json")),
    /immutable historical root/
  );
}
assert.equal(
  isSameOrDescendant(
    join(".artifacts", "sprint-30-5", "stage-2-requalification", fixtureAttemptId),
    join(".artifacts", "sprint-30-5", "stage-2")
  ),
  false,
  "Segment-aware protection must distinguish the R1 and historical roots."
);

const governedRoot = join(
  ".artifacts",
  "sprint-30-5",
  "stage-2-requalification",
  fixtureAttemptId
);
assert.doesNotThrow(() => assertR1ArtifactPath(governedRoot, fixtureAttemptId));
assert.doesNotThrow(() =>
  assertNoReparseTraversal(
    join(".artifacts", "sprint-30-5", "stage-2-requalification")
  )
);
assert.throws(
  () =>
    assertNoReparseTraversal(governedRoot, {
      existsSync: () => true,
      lstatSync: () => ({ isSymbolicLink: () => true }),
    }),
  /symbolic link or junction/
);
assert.throws(
  () => assertR1ArtifactPath(`${governedRoot}-other`, fixtureAttemptId),
  /must resolve exactly/
);
assert.doesNotThrow(() =>
  assertAttemptOutputAvailable(governedRoot, () => false)
);
assert.throws(
  () => assertAttemptOutputAvailable(governedRoot, () => true),
  /already exists/
);

for (const [base, prefix] of [
  [
    join(repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5"),
    "docs/sprints/evidence/sprint-30-5",
  ],
  [
    join(repositoryRoot, ".artifacts", "sprint-30-5"),
    ".artifacts/sprint-30-5",
  ],
]) {
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (
      entry.isDirectory() &&
      /^stage-(2|3)(?:$|-)/u.test(entry.name) &&
      entry.name !== "stage-2-requalification"
    ) {
      const expectedProtectedRoot = `${prefix}/${entry.name}`;
      assert.ok(
        contract.historicalProtectedRoots.includes(expectedProtectedRoot),
        `Historical deny-list is missing ${expectedProtectedRoot}.`
      );
    }
  }
}

const temporaryRoot = mkdtempSync(join(os.tmpdir(), "oracle-stage2-r1-static-"));
try {
  const output = join(temporaryRoot, "atomic.json");
  writeJsonAtomicCreateOnly(output, { result: "fixture" });
  assert.deepEqual(JSON.parse(readFileSync(output, "utf8")), {
    result: "fixture",
  });
  assert.throws(
    () => writeJsonAtomicCreateOnly(output, { result: "overwrite" }),
    /already exists/
  );
  assert.equal(
    readFileSync(output, "utf8"),
    '{\n  "result": "fixture"\n}\n'
  );
  assert.throws(
    () =>
      writeJsonAtomicCreateOnly(
        join(temporaryRoot, "missing", "atomic.json"),
        {}
      ),
    /parent does not exist/
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}

validateCertificateThumbprint("A".repeat(40));
assert.throws(
  () => validateCertificateThumbprint("CN=subject-wide"),
  /exact 40-character/
);
assert.doesNotThrow(() =>
  validateMachineQualificationState({ packages: 0, certificates: [] })
);
assert.throws(
  () => validateMachineQualificationState({ packages: 1, certificates: [] }),
  /already installed/
);
assert.throws(
  () =>
    validateMachineQualificationState({
      packages: 0,
      certificates: [{ thumbprint: "A".repeat(40) }],
    }),
  /already exists/
);
assert.throws(
  () => validateMachineQualificationState({ packages: 0, certificates: {} }),
  /invalid result/
);

const initialRecord = {
  certificate: { state: "not-created", thumbprint: null },
  evidence: { manifest: null, finalEvidenceHash: null },
};
const certificateBound = bindCertificate(initialRecord, "B".repeat(40));
assert.equal(certificateBound.certificate.thumbprint, "B".repeat(40));
assert.throws(
  () => bindCertificate(certificateBound, "C".repeat(40)),
  /already been bound/
);
assert.throws(
  () => validateFinalIdentity(certificateBound),
  /Final evidence manifest/
);
assert.doesNotThrow(() =>
  validateFinalIdentity({
    ...certificateBound,
    evidence: {
      manifest: "Oracle.Stage2RequalificationR1EvidenceManifest.json",
      finalEvidenceHash: "d".repeat(64),
    },
  })
);

const cleanupScript = readFileSync(
  join(import.meta.dirname, "remove-exact-certificate.ps1"),
  "utf8"
);
assert.match(cleanupScript, /Where-Object \{ \$_.Thumbprint -ceq \$Thumbprint \}/u);
assert.doesNotMatch(
  cleanupScript,
  /Where-Object \{ \$_.Subject -eq \$ExpectedSubject \}/u
);
assert.match(cleanupScript, /FileMode\]::CreateNew/u);
assert.match(
  cleanupScript,
  /exact generated R1 certificate thumbprint was not found/u
);

const harnessCore = readFileSync(
  join(import.meta.dirname, "harness-core.mjs"),
  "utf8"
);
assert.match(harnessCore, /linkSync\(temporary, target\)/u);
assert.doesNotMatch(harnessCore, /renameSync/u);

for (const historicalScript of [
  join(import.meta.dirname, "..", "..", "build-sprint-30-5-stage-2-release.mjs"),
  join(import.meta.dirname, "..", "..", "verify-sprint-30-5-stage-2.mjs"),
  join(
    import.meta.dirname,
    "..",
    "..",
    "verify-sprint-30-5-stage-2-signatures.ps1"
  ),
  join(
    import.meta.dirname,
    "..",
    "..",
    "remove-sprint-30-5-stage-2-test-certificate.ps1"
  ),
]) {
  const source = readFileSync(historicalScript, "utf8");
  const retirement = historicalScript.endsWith(".mjs")
    ? source.indexOf("refuseHistoricalExecution();")
    : source.indexOf("Historical Sprint 30.5 Stage 2");
  const firstDestructiveOperation = Math.min(
    ...["rmSync(", "Remove-Item", "Import-Certificate"].map((needle) => {
      const index = source.indexOf(needle);
      return index === -1 ? Number.POSITIVE_INFINITY : index;
    })
  );
  assert.ok(retirement >= 0, `Missing retirement guard: ${historicalScript}`);
  assert.ok(
    retirement < firstDestructiveOperation,
    `Retirement guard follows destructive behavior: ${historicalScript}`
  );
}

const packageJson = JSON.parse(
  readFileSync(join(import.meta.dirname, "..", "..", "..", "package.json"), "utf8")
);
assert.equal(
  packageJson.scripts["sprint-30-5:stage-2:r1:prepare"],
  "node scripts/sprint-30-5/stage-2-requalification-r1/prepare-attempt.mjs"
);
assert.equal(
  packageJson.scripts["sprint-30-5:stage-2:r1:validate"],
  "node scripts/sprint-30-5/stage-2-requalification-r1/verify-harness-static.mjs"
);
assert.ok(
  !packageJson.scripts["sprint-30-5:stage-2:r1:build"],
  "No R1 build entry point may exist before the Founder execution gate."
);
assert.ok(
  !packageJson.scripts["sprint-30-5:stage-2:r1:verify"],
  "No R1 qualification entry point may exist before the Founder execution gate."
);
assert.equal(
  packageJson.scripts["sprint-30-5:stage-2:r1:execute"],
  "node scripts/sprint-30-5/stage-2-requalification-r1/execute-attempt.mjs"
);
for (const forbiddenEntryPoint of [
  "build",
  "package",
  "sign",
  "certificate",
  "freeze",
  "stage3",
]) {
  assert.ok(
    !packageJson.scripts[
      `sprint-30-5:stage-2:r1:${forbiddenEntryPoint}`
    ],
    `Out-of-order R1 phase entry point is exposed: ${forbiddenEntryPoint}.`
  );
}

assert.throws(
  () => assertFounderExecutionAuthority("true"),
  /exact single-attempt Founder/
);
assert.doesNotThrow(() =>
  assertFounderExecutionAuthority(FOUNDER_EXECUTION_AUTHORITY)
);
assert.doesNotThrow(() => assertSingleAttemptAuthorityAvailable([]));
assert.throws(
  () =>
    assertSingleAttemptAuthorityAvailable([
      "Oracle.Stage2RequalificationR1SingleAttemptAuthority.json",
    ]),
  /already consumed/
);
assert.throws(
  () =>
    claimSingleAttemptAuthority({
      authority: FOUNDER_EXECUTION_AUTHORITY,
      attemptId: "../escape",
      timestampUtc: fixtureTimestamp,
      candidateCommit: fixtureCommit,
      harnessCommit: fixtureCommit,
      outputRoot: join(repositoryRoot, ".artifacts"),
    }),
  /Attempt ID must/
);
let lifecycleIndex = -1;
for (const phase of executionPhases) {
  lifecycleIndex = validatePhaseTransition(lifecycleIndex, phase);
}
assert.throws(
  () => validatePhaseTransition(-1, executionPhases[1]),
  /Invalid lifecycle transition/
);
assert.throws(
  () => validatePhaseTransition(2, executionPhases[2]),
  /Invalid lifecycle transition/
);

const exactThumbprint = "E".repeat(40);
const otherThumbprint = "F".repeat(40);
const expectedSubject =
  "CN=Oracle Stage 2 Requalification R1 Local Test Signing - NOT PRODUCTION";
const exactCertificateRecords = [
  {
    location: "CurrentUser",
    store: "My",
    thumbprint: exactThumbprint,
    subject: expectedSubject,
  },
  {
    location: "CurrentUser",
    store: "Root",
    thumbprint: exactThumbprint,
    subject: expectedSubject,
  },
  {
    location: "CurrentUser",
    store: "My",
    thumbprint: otherThumbprint,
    subject: expectedSubject,
  },
];
assert.equal(
  selectExactCertificateMatches(
    exactCertificateRecords,
    exactThumbprint,
    expectedSubject
  ).length,
  2
);
assert.throws(
  () =>
    selectExactCertificateMatches(
      exactCertificateRecords,
      "A".repeat(40),
      expectedSubject
    ),
  /exact generated certificate was not found/
);
assert.throws(
  () =>
    selectExactCertificateMatches(
      [{ ...exactCertificateRecords[0], subject: "CN=Unexpected" }],
      exactThumbprint,
      expectedSubject
    ),
  /unexpected subject/
);

const executorSource = readFileSync(
  join(import.meta.dirname, "execute-attempt.mjs"),
  "utf8"
);
assert.doesNotMatch(
  executorSource,
  /build-sprint-30-5-stage-2-release\.mjs|verify-sprint-30-5-stage-2\.mjs/u
);
assert.match(executorSource, /performSafetyTeardown\(\)/u);
assert.match(executorSource, /if \(exactThumbprint && !teardownAttempted\)/u);
assert.match(executorSource, /Safety teardown may not be retried/u);
assert.match(executorSource, /complete-awaiting-founder-review/u);
assert.match(executorSource, /recoverCertificateIdentityFromStoreDelta/u);
assert.match(executorSource, /claimSingleAttemptAuthority/u);
assert.match(
  executorSource,
  /if \(!exactThumbprint && !signingMaterialDestructionAttempted\)/u
);
assert.match(executorSource, /certificateStoreEntriesPresentBeforeCleanup/u);
assert.ok(
  executorSource.indexOf("const repositoryEvidenceTarget = publishRepositoryEvidence()") <
    executorSource.indexOf(
      "createFinalRepositoryCheckpoint(repositoryEvidenceTarget)"
    ) &&
    executorSource.indexOf(
      "createFinalRepositoryCheckpoint(repositoryEvidenceTarget)"
    ) < executorSource.indexOf("const finalManifest = createFinalEvidenceManifest") &&
    executorSource.indexOf("const finalManifest = createFinalEvidenceManifest") <
      executorSource.indexOf(
        "publishFinalRepositoryEvidence(repositoryEvidenceTarget)"
      ),
  "The final repository checkpoint must follow bounded publication and precede final-manifest binding."
);
assert.match(executorSource, /new Set\(added\.map/u);
assert.match(
  executorSource,
  /publishExistingFileCreateOnly\(temporaryPackagePath, packagePath\)/u
);

const exactManifestSigner = readFileSync(
  join(import.meta.dirname, "sign-release-manifest-exact.ps1"),
  "utf8"
);

const exactSignatureVerifier = readFileSync(
  join(import.meta.dirname, "verify-exact-signatures.ps1"),
  "utf8"
);
assert.match(exactSignatureVerifier, /\$bootstrapSignature/u);
assert.match(
  exactSignatureVerifier,
  /Assert-ExactSigner -Path \$path -RequireValidStatus \$true/u
);
assert.match(exactManifestSigner, /ExpectedThumbprint/u);
assert.match(exactManifestSigner, /FileMode\]::CreateNew/u);
assert.match(exactManifestSigner, /\[IO\.File\]::Move/u);
assert.doesNotMatch(
  exactManifestSigner,
  /Where-Object\s*\{\s*\$_\.Subject/u
);

assert.equal(contract.authority.build, "not-authorised");
assert.equal(contract.authority.package, "not-authorised");
assert.equal(contract.authority.signing, "not-authorised");
assert.equal(contract.authority.qualificationExecution, "not-authorised");
assert.throws(
  () => assertRequiredTool("oracle-r1-tool-that-does-not-exist.exe"),
  /Required tool is unavailable/
);
assert.doesNotThrow(() =>
  assertGitAncestor(
    contract.governanceActivationCommit,
    git(["rev-parse", "HEAD"]),
    "static-governance-fixture"
  )
);
assert.doesNotThrow(() =>
  assertGitAncestor(
    contract.qualifiedImplementationCommit,
    git(["rev-parse", "HEAD"]),
    "static-implementation-fixture"
  )
);

console.log(
  JSON.stringify(
    {
      result: "PASS",
      fixtures: {
        mandatoryAttemptIdentity: "passed",
        timestampBinding: "passed",
        repositorySnapshotPreflight: "passed",
        identityBindingRejection: "passed",
        historicalRootRejection: "passed",
        historicalDenyListCompleteness: "passed",
        segmentAwarePathProtection: "passed",
        reparseTraversalProtection: "passed",
        exactAttemptRoot: "passed",
        existingAttemptRejection: "passed",
        atomicCreateOnlyWrite: "passed",
        existingTargetRejection: "passed",
        exactThumbprintValidation: "passed",
        exactThumbprintPresenceRequired: "passed",
        machineStatePreflight: "passed",
        immutableCertificateBinding: "passed",
        finalEvidenceBinding: "passed",
        exactThumbprintCleanupInspection: "passed",
        atomicNoReplacePublication: "passed",
        historicalEntryPointRetirement: "passed",
        safeEntryPointWiring: "passed",
        singleExecutionEntryPoint: "passed",
        founderAuthorityBoundary: "passed",
        singleAttemptAuthorityConsumptionInspection: "passed",
        exactToolchainBinding: "passed",
        orderedLifecycle: "passed",
        exactCertificateSelectionFixtures: "passed",
        noHistoricalExecutorInvocation: "passed",
        failureTeardownInspection: "passed",
        partialCertificateGenerationRecoveryInspection: "passed",
        preIdentitySigningMaterialCleanupInspection: "passed",
        zeroStoreMatchTeardownInspection: "passed",
        postTrustSignatureValidityInspection: "passed",
        postPublicationRepositoryCheckpointInspection: "passed",
        atomicPackagePublication: "passed",
        atomicExactManifestSigning: "passed",
        authorityBoundary: "passed",
        missingToolRejection: "passed",
        governanceAncestry: "passed"
      },
      qualificationExecuted: false,
      repositoryEvidenceGenerated: false
    },
    null,
    2
  )
);
