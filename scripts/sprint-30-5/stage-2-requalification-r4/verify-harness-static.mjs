import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  approvedExecutable,
  assertAttemptOutputAvailable,
  assertGitAncestor,
  assertOutsideHistoricalRoots,
  assertNoReparseTraversal,
  assertRequiredTool,
  assertR4ArtifactPath,
  bindCertificate,
  contract,
  createAttemptRecord,
  git,
  harnessFileInventory,
  isSameOrDescendant,
  repositoryRoot,
  resolveApprovedNpmSurface,
  requiredToolVersion,
  sha256File,
  validateAttemptIdentity,
  validateBinding,
  validateCertificateThumbprint,
  validateFinalIdentity,
  validateGovernedWrapperInvocation,
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
  validateAuthorityIdentity,
  validatePhaseTransition,
} from "./execution-core.mjs";

const fixtureTimestamp = "2026-07-28T13:14:15.678Z";
const fixtureAttemptId = "r4-20260728T131415678Z-deadbeef";
const fixtureAuthorityId = `authority-${fixtureAttemptId}`;
const fixtureCommit = contract.candidate.commit;
const fixtureBinding = {
  candidateCommit: fixtureCommit,
  harnessCommit: fixtureCommit,
  machineIdentity: os.hostname(),
  packageIdentity: contract.package.identity,
  packageVersion: contract.package.version,
  wrapperProtocol: "oracle-stage2-r4-governed-wrapper-v1",
  wrapperProcessId: 4242,
};

validateAttemptIdentity({
  attemptId: fixtureAttemptId,
  timestampUtc: fixtureTimestamp,
});
assert.deepEqual(
  validateGovernedWrapperInvocation({
    observed: "oracle-stage2-r4-governed-wrapper-v1:4242",
    parentProcessId: 4242,
  }),
  {
    protocol: "oracle-stage2-r4-governed-wrapper-v1",
    parentProcessId: 4242,
  }
);
assert.throws(
  () => validateGovernedWrapperInvocation({ observed: null, parentProcessId: 4242 }),
  /must be invoked by the governed/
);
assert.throws(
  () =>
    validateGovernedWrapperInvocation({
      observed: "oracle-stage2-r4-governed-wrapper-v1:4243",
      parentProcessId: 4242,
    }),
  /must be invoked by the governed/
);
assert.throws(
  () =>
    validateGovernedWrapperInvocation({
      observed: "oracle-stage2-r4-governed-wrapper-v1:0",
      parentProcessId: 0,
    }),
  /parent process ID is invalid/
);
assert.throws(
  () =>
    validateAttemptIdentity({
      attemptId: "r4-reused",
      timestampUtc: fixtureTimestamp,
    }),
  /Attempt ID must/
);
assert.throws(
  () =>
    validateAttemptIdentity({
      attemptId: "r4-20260728T131415678Z-00000000",
      timestampUtc: fixtureTimestamp,
    }),
  /prohibited all-zero suffix/
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
assert.equal(contract.candidate.commit, "f7203f9b602b182a2bd006bc3cff3113b839be8e");
assert.equal(contract.candidate.tree, "5d7eca4c012874df0b839533dfab283b54778661");
assert.equal(
  git(["rev-parse", `${contract.candidate.commit}^{tree}`]),
  contract.candidate.tree
);
assert.equal(
  sha256File(join(repositoryRoot, "database", "011_operator_account_provisioning.sql")),
  contract.candidate.migration011Sha256
);
assert.equal(
  sha256File(join(repositoryRoot, "database", "012_operator_identity_lifecycle.sql")),
  contract.candidate.migration012Sha256
);
assert.throws(
  () => validateBinding({ ...fixtureBinding, candidateCommit: "0".repeat(40) }),
  /candidate commit mismatch/
);
for (const binding of contract.runtimeConfiguration.productBindings) {
  assert.equal(
    sha256File(join(repositoryRoot, ...binding.path.split("/"))),
    binding.sha256,
    `Runtime-configuration product binding mismatch: ${binding.path}`
  );
}
for (const binding of contract.historicalEvidenceBindings) {
  assert.equal(
    sha256File(join(repositoryRoot, ...binding.path.split("/"))),
    binding.sha256,
    `Historical evidence hash mismatch: ${binding.path}`
  );
}
const expectedHarnessFiles = [
  "Oracle.Stage2RequalificationR4Contract.json",
  "execute-attempt.mjs",
  "execution-core.mjs",
  "execution-identity-core.ps1",
  "harness-core.mjs",
  "invoke-attempt.ps1",
  "remove-exact-certificate.ps1",
  "runtime-configuration-custody.mjs",
  "sign-release-manifest-exact.ps1",
  "verify-exact-signatures.ps1",
  "verify-execution-identity.ps1",
  "verify-harness-static.mjs",
  "verify-runtime-configuration-custody.mjs",
].map((name) => `scripts/sprint-30-5/stage-2-requalification-r4/${name}`).sort();
assert.deepEqual(
  harnessFileInventory().map((entry) => entry.path),
  expectedHarnessFiles
);
for (const name of ["node", "git", "powershell", "dotnet", "bsdtar"]) {
  assert.equal(approvedExecutable(name), contract.toolchainExecutables[name].replaceAll("/", "\\"));
  assert.throws(
    () => approvedExecutable(name, {
      existsSync: () => true,
      lstatSync: () => ({ isFile: () => false }),
      realpathSync: (path) => path,
    }),
    /not a regular file/u
  );
  assert.throws(
    () => approvedExecutable(name, {
      existsSync: () => true,
      lstatSync: () => ({ isFile: () => true }),
      realpathSync: (path) => `${path}.redirected`,
    }),
    /reparse path/u
  );
}
const npmSurface = resolveApprovedNpmSurface();
assert.equal(npmSurface.nodeExecutable.toLowerCase(), process.execPath.toLowerCase());
assert.equal(npmSurface.npmVersion, contract.toolchain.npm);
assert.equal(
  requiredToolVersion(npmSurface.nodeExecutable, [npmSurface.npmCli, "--version"]),
  contract.toolchain.npm
);
assert.match(npmSurface.npmCli, /node_modules[\\/]npm[\\/]bin[\\/]npm-cli\.js$/iu);
assert.match(npmSurface.npxCli, /node_modules[\\/]npm[\\/]bin[\\/]npx-cli\.js$/iu);
const syntheticNpmFilesystem = {
  existsSync: () => true,
  lstatSync: () => ({ isFile: () => true }),
  realpathSync: (path) => path,
  readFileSync: () => JSON.stringify({ name: "npm", version: contract.toolchain.npm }),
};
assert.doesNotThrow(() =>
  resolveApprovedNpmSurface({
    nodeExecutable: join(repositoryRoot, "synthetic-node", "node.exe"),
    filesystem: syntheticNpmFilesystem,
  })
);
assert.throws(
  () => resolveApprovedNpmSurface({
    nodeExecutable: join(repositoryRoot, "synthetic-node", "node.exe"),
    filesystem: { ...syntheticNpmFilesystem, existsSync: () => false },
  }),
  /Approved npm surface is missing/
);
assert.throws(
  () => resolveApprovedNpmSurface({
    nodeExecutable: join(repositoryRoot, "synthetic-node", "node.exe"),
    filesystem: {
      ...syntheticNpmFilesystem,
      readFileSync: () => JSON.stringify({ name: "npm", version: "0.0.0" }),
    },
  }),
  /Approved npm package identity mismatch/
);
assert.throws(
  () => resolveApprovedNpmSurface({
    nodeExecutable: join(repositoryRoot, "synthetic-node", "node.exe"),
    filesystem: {
      ...syntheticNpmFilesystem,
      realpathSync: (path) => `${path}-redirected`,
    },
  }),
  /traverses a reparse path/
);
const attemptCreationRecord = createAttemptRecord({
  ...fixtureBinding,
  authorityId: fixtureAuthorityId,
  attemptId: fixtureAttemptId,
  timestampUtc: fixtureTimestamp,
  outputRoot: join(".artifacts", "sprint-30-5", "stage-2-requalification-r4", fixtureAttemptId),
});
assert.equal(attemptCreationRecord.lifecycle.initialState, "prepared");
assert.equal(attemptCreationRecord.lifecycle.terminalStateRecordedSeparately, true);
assert.equal(attemptCreationRecord.authority.authorityId, fixtureAuthorityId);
assert.equal(attemptCreationRecord.authority.claimState, "consumed-for-this-attempt");
assert.deepEqual(attemptCreationRecord.invocation, {
  surface: "invoke-attempt.ps1",
  protocol: "oracle-stage2-r4-governed-wrapper-v1",
  wrapperProcessId: 4242,
});
assert.equal(
  attemptCreationRecord.authority.qualificationExecution,
  "founder-authorised-for-this-attempt"
);
const r2ValidatorSource = readFileSync(
  join(import.meta.dirname, "..", "stage-2-requalification-r2", "verify-harness-static.mjs"),
  "utf8"
);
const r4ValidatorSource = readFileSync(import.meta.filename, "utf8");
const fixtureLabelPattern = /^\s{8}([A-Za-z][A-Za-z0-9]*): "passed",?$/gmu;
const r2FixtureLabels = [...r2ValidatorSource.matchAll(fixtureLabelPattern)].map(
  (match) => match[1]
);
const r4FixtureLabels = new Set(
  [...r4ValidatorSource.matchAll(fixtureLabelPattern)].map((match) => match[1])
);
assert.ok(r2FixtureLabels.length > 0, "R2 regression labels were not discovered.");
for (const label of r2FixtureLabels) {
  assert.ok(r4FixtureLabels.has(label), `R4 lost inherited R2 fixture: ${label}`);
}
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
    join(
      ".artifacts",
      "sprint-30-5",
      "stage-2-requalification-r4",
      fixtureAttemptId
    ),
    join(".artifacts", "sprint-30-5", "stage-2")
  ),
  false,
  "Segment-aware protection must distinguish the R4 and historical roots."
);

const governedRoot = join(
  ".artifacts",
  "sprint-30-5",
  "stage-2-requalification-r4",
  fixtureAttemptId
);
assert.doesNotThrow(() => assertR4ArtifactPath(governedRoot, fixtureAttemptId));
assert.doesNotThrow(() =>
  assertNoReparseTraversal(
    join(".artifacts", "sprint-30-5", "stage-2-requalification-r4")
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
  () => assertR4ArtifactPath(`${governedRoot}-other`, fixtureAttemptId),
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
      entry.name !== "stage-2-requalification-r4"
    ) {
      const expectedProtectedRoot = `${prefix}/${entry.name}`;
      assert.ok(
        contract.historicalProtectedRoots.includes(expectedProtectedRoot),
        `Historical deny-list is missing ${expectedProtectedRoot}.`
      );
    }
  }
}

const temporaryRoot = mkdtempSync(join(os.tmpdir(), "oracle-stage2-r4-static-"));
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
      manifest: "Oracle.Stage2RequalificationR4EvidenceManifest.json",
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
assert.match(cleanupScript, /\$ConfirmPreference = "None"/u);
assert.match(cleanupScript, /FileMode\]::CreateNew/u);
assert.match(
  cleanupScript,
  /exact generated R4 certificate thumbprint was not found/u
);
assert.match(
  cleanupScript,
  /\$certUtilPath = Join-Path \(\[Environment\]::SystemDirectory\) "certutil\.exe"/u
);
assert.match(
  cleanupScript,
  /\$certUtilArguments = @\(\s*"-user",\s*"-delstore",\s*"Root",\s*\$Thumbprint\s*\)/u
);
const rootRemovalArgumentAssignment =
  /\$certUtilArguments = @\(([^)]*)\)/u.exec(cleanupScript);
assert.ok(
  rootRemovalArgumentAssignment,
  "The exact Root-removal CertUtil argument assignment must be explicit."
);
assert.doesNotMatch(rootRemovalArgumentAssignment[1], /"-f"/u);
assert.match(cleanupScript, /\$startInfo\.FileName = \$certUtilPath/u);
assert.match(cleanupScript, /\$startInfo\.UseShellExecute = \$false/u);
assert.match(cleanupScript, /\$startInfo\.RedirectStandardOutput = \$true/u);
assert.match(cleanupScript, /\$startInfo\.RedirectStandardError = \$true/u);
assert.match(cleanupScript, /stdout = \$stdout/u);
assert.match(cleanupScript, /stderr = \$stderr/u);
assert.match(
  cleanupScript,
  /ORACLE_R4_ROOT_REMOVAL_PROCESS=[\s\S]*ConvertTo-Json -Compress -Depth 5/u
);
assert.match(
  cleanupScript,
  /\$null -ne \$processError[\s\S]*\$null -ne \$signal[\s\S]*\$null -eq \$exitCode[\s\S]*\$exitCode -ne 0/u
);
assert.doesNotMatch(cleanupScript, /Get-Command[\s\S]*?certutil\.exe/iu);
assert.doesNotMatch(cleanupScript, /-Verb\s+RunAs/u);
assert.doesNotMatch(cleanupScript, /Remove-Item -LiteralPath \$rootTarget/u);
assert.match(
  cleanupScript,
  /Remove-Item -LiteralPath \$myTarget -Force -ErrorAction Stop/u
);
assert.ok(
  cleanupScript.indexOf("$rootRemoval = Invoke-ExactRootRemoval") <
    cleanupScript.indexOf("Remove-Item -LiteralPath $myTarget"),
  "CurrentUser\\Root trust must be removed before the CurrentUser\\My signing copy."
);
assert.match(cleanupScript, /\$myMatches\.Count -ne 1/u);
assert.match(cleanupScript, /\$rootMatches\.Count -gt 1/u);
assert.match(cleanupScript, /\$unexpectedMatches\.Count -ne 0/u);
assert.match(cleanupScript, /Certificate\.RawData/u);
assert.match(cleanupScript, /Certificate\.HasPrivateKey/u);
assert.match(cleanupScript, /\$remaining\.Count -ne 0/u);
assert.doesNotMatch(cleanupScript, /Where-Object[\s\S]{0,120}-like/u);

function validateSyntheticTeardownState(records) {
  const exact = records.filter(
    (record) => record.thumbprint === teardownFixtureThumbprint
  );
  const my = exact.filter(
    (record) => record.location === "CurrentUser" && record.store === "My"
  );
  const root = exact.filter(
    (record) => record.location === "CurrentUser" && record.store === "Root"
  );
  const unexpected = exact.filter(
    (record) =>
      !(
        record.location === "CurrentUser" &&
        (record.store === "My" || record.store === "Root")
      )
  );
  assert.equal(my.length, 1, "Exactly one CurrentUser\\My certificate is required.");
  assert.equal(my[0].subject, teardownExpectedSubject);
  assert.equal(my[0].rawData, "fixture-raw-certificate");
  assert.equal(my[0].hasPrivateKey, true);
  assert.ok(root.length <= 1, "At most one CurrentUser\\Root certificate is allowed.");
  assert.equal(unexpected.length, 0, "Unexpected governed-store matches are forbidden.");
  if (root.length === 1) {
    assert.equal(root[0].subject, teardownExpectedSubject);
    assert.equal(root[0].rawData, my[0].rawData);
    assert.equal(root[0].hasPrivateKey, false);
  }
  return { my, root };
}

function assertSyntheticProcessPassed(result) {
  assert.equal(result.processError, null);
  assert.equal(result.signal, null);
  assert.notEqual(result.exitCode, null);
  assert.equal(result.exitCode, 0);
}

const teardownFixtureThumbprint = "E".repeat(40);
const teardownExpectedSubject =
  "CN=Oracle Stage 2 Requalification R4 Local Test Signing - NOT PRODUCTION";
const syntheticMy = {
  location: "CurrentUser",
  store: "My",
  thumbprint: teardownFixtureThumbprint,
  subject: teardownExpectedSubject,
  rawData: "fixture-raw-certificate",
  hasPrivateKey: true,
};
const syntheticRoot = {
  ...syntheticMy,
  store: "Root",
  hasPrivateKey: false,
};
assert.doesNotThrow(() =>
  validateSyntheticTeardownState([syntheticMy, syntheticRoot])
);
assert.doesNotThrow(() => validateSyntheticTeardownState([syntheticMy]));
assert.throws(() => validateSyntheticTeardownState([syntheticRoot]));
assert.throws(() =>
  validateSyntheticTeardownState([syntheticMy, syntheticRoot, syntheticRoot])
);
assert.throws(() =>
  validateSyntheticTeardownState([
    syntheticMy,
    { ...syntheticRoot, store: "TrustedPeople" },
  ])
);
assert.throws(() =>
  validateSyntheticTeardownState([
    { ...syntheticMy, subject: "CN=Unexpected" },
  ])
);
assert.throws(() =>
  validateSyntheticTeardownState([
    syntheticMy,
    { ...syntheticRoot, rawData: "different-certificate" },
  ])
);
assert.throws(() =>
  validateSyntheticTeardownState([
    { ...syntheticMy, hasPrivateKey: false },
  ])
);
assert.doesNotThrow(() =>
  assertSyntheticProcessPassed({
    processError: null,
    signal: null,
    exitCode: 0,
  })
);
for (const failure of [
  { processError: "spawn failed", signal: null, exitCode: null },
  { processError: null, signal: "SIGTERM", exitCode: null },
  { processError: null, signal: null, exitCode: null },
  { processError: null, signal: null, exitCode: 1 },
]) {
  assert.throws(() => assertSyntheticProcessPassed(failure));
}
const afterSyntheticRootRemoval = [syntheticMy];
assert.doesNotThrow(() =>
  validateSyntheticTeardownState(afterSyntheticRootRemoval)
);
assert.equal(
  afterSyntheticRootRemoval.filter(
    (record) => record.thumbprint === teardownFixtureThumbprint
  ).length,
  1
);
assert.equal(
  afterSyntheticRootRemoval
    .filter((record) => record.store !== "My")
    .filter((record) => record.thumbprint === teardownFixtureThumbprint).length,
  0
);
const afterSyntheticMyRemoval = [];
assert.equal(
  afterSyntheticMyRemoval.filter(
    (record) => record.thumbprint === teardownFixtureThumbprint
  ).length,
  0
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
const r4PackageEntryPoints = Object.keys(packageJson.scripts).filter((name) =>
  name.startsWith("sprint-30-5:stage-2:r4:")
);
assert.deepEqual(
  r4PackageEntryPoints,
  [],
  "R4 must not modify the candidate package.json or expose independently runnable phases."
);
assert.equal(
  packageJson.scripts["sprint-30-5:stage-2:r2:execute"],
  "node scripts/sprint-30-5/stage-2-requalification-r2/execute-attempt.mjs",
  "The closed R2 entry point must remain bound to its immutable R2 harness."
);
assert.equal(
  packageJson.scripts["sprint-30-5:stage-2:r2:validate"],
  "node scripts/sprint-30-5/stage-2-requalification-r2/verify-harness-static.mjs"
);
assert.ok(
  !readdirSync(import.meta.dirname).includes("prepare-attempt.mjs"),
  "R4 must not expose a standalone attempt-preparation entry point."
);

assert.throws(
  () => assertFounderExecutionAuthority("true"),
  /exact single-attempt Founder/
);
assert.doesNotThrow(() =>
  assertFounderExecutionAuthority(FOUNDER_EXECUTION_AUTHORITY)
);
assert.doesNotThrow(() =>
  validateAuthorityIdentity({
    authorityId: fixtureAuthorityId,
    attemptId: fixtureAttemptId,
  })
);
assert.throws(
  () =>
    validateAuthorityIdentity({
      authorityId: "authority-r4-other",
      attemptId: fixtureAttemptId,
    }),
  /must exactly equal/
);
const previousAttemptId = "r4-20260728T120000000Z-01234567";
const previousAuthorityId = `authority-${previousAttemptId}`;
const previousAuthorityIds = [previousAuthorityId];
const previousAttemptIds = [previousAttemptId];
assert.doesNotThrow(() =>
  assertSingleAttemptAuthorityAvailable({
    authorityId: fixtureAuthorityId,
    attemptId: fixtureAttemptId,
    existingAuthorityIds: previousAuthorityIds,
    existingAttemptIds: previousAttemptIds,
  })
);
assert.deepEqual(previousAuthorityIds, [previousAuthorityId]);
assert.deepEqual(previousAttemptIds, [previousAttemptId]);
assert.throws(
  () =>
    assertSingleAttemptAuthorityAvailable({
      authorityId: fixtureAuthorityId,
      attemptId: fixtureAttemptId,
      existingAuthorityIds: [fixtureAuthorityId],
      existingAttemptIds: [previousAttemptId],
    }),
  /authority identity is already consumed/
);
assert.throws(
  () =>
    assertSingleAttemptAuthorityAvailable({
      authorityId: fixtureAuthorityId,
      attemptId: fixtureAttemptId,
      existingAuthorityIds: [previousAuthorityId],
      existingAttemptIds: [fixtureAttemptId],
    }),
  /attempt identity already exists/
);
assert.throws(
  () =>
    claimSingleAttemptAuthority({
      authority: FOUNDER_EXECUTION_AUTHORITY,
      authorityId: "authority-../escape",
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
  "CN=Oracle Stage 2 Requalification R4 Local Test Signing - NOT PRODUCTION";
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
assert.equal(contract.certificate.requestedLifetimeDays, 30);
assert.equal(contract.certificate.minimumRemainingLifetimeDaysAtCreation, 29);
assert.equal(contract.certificate.maximumLifetimeDays, 30);
assert.match(
  executorSource,
  /"--valid-days",\s*String\(contract\.certificate\.requestedLifetimeDays\)/u
);
assert.match(
  executorSource,
  /contract\.certificate\.minimumRemainingLifetimeDaysAtCreation \*\s*24 \*\s*60 \*\s*60 \*\s*1000/u
);
assert.match(
  executorSource,
  /contract\.certificate\.maximumLifetimeDays \* 24 \* 60 \* 60 \* 1000/u
);
assert.doesNotMatch(executorSource, /"--valid-days",\s*"2"/u);
assert.doesNotMatch(
  executorSource,
  /build-sprint-30-5-stage-2-release\.mjs|verify-sprint-30-5-stage-2\.mjs/u
);
assert.doesNotMatch(executorSource, /-Confirm:\$false/u);
assert.match(executorSource, /performSafetyTeardown\(\)/u);
assert.match(executorSource, /if \(exactThumbprint && !teardownAttempted\)/u);
assert.match(executorSource, /Safety teardown may not be retried/u);
assert.match(executorSource, /complete-awaiting-founder-review/u);
assert.match(executorSource, /recoverCertificateIdentityFromStoreDelta/u);
assert.match(executorSource, /claimSingleAttemptAuthority/u);
assert.match(executorSource, /"authority-id"/u);
assert.match(executorSource, /authorityId: input\.authorityId/u);
assert.match(executorSource, /sourceCommit: input\.candidateCommit/u);
assert.match(executorSource, /sourceTree: contract\.candidate\.tree/u);
assert.match(executorSource, /resolveApprovedNpmSurface\(\)\.npmCli/u);
assert.match(executorSource, /resolveApprovedNpmSurface\(\)\.npxCli/u);
assert.doesNotMatch(executorSource, /process\.env\.npm_execpath/u);
assert.doesNotMatch(executorSource, /npm\.cmd|corepack/iu);
assert.match(executorSource, /stage-2-requalification-r4-failure-outcome\.json/u);
assert.match(executorSource, /attemptCreationRecordSha256/u);
assert.match(executorSource, /lifecycleFailureRecordSha256/u);
assert.match(executorSource, /residualStateRequiresFounderAction/u);
assert.match(executorSource, /contract\.historicalEvidenceBindings/u);
assert.match(executorSource, /assertNoAmbientRuntimeConfiguration\(repositoryRoot\)/u);
assert.ok(
  (executorSource.match(/assertNoAmbientRuntimeConfiguration\(repositoryRoot\)/gu) ?? []).length >= 3,
  "R4 must check ambient configuration pre-authority, pre-build and post-build."
);
assert.match(executorSource, /createDeterministicBuildEnvironment\(process\.env\)/u);
assert.match(executorSource, /assertBuildCanariesAbsent\(unpacked\)/u);
assert.match(executorSource, /runtimeConfigurationPackageSecrecy: packageSecrecy/u);
assert.match(executorSource, /Immutable historical evidence binding failed/u);
assert.match(executorSource, /Historical evidence binding contains traversal/u);
assert.match(executorSource, /assertNoReparseTraversal\(historicalPath\)/u);
assert.match(executorSource, /Migration 011 does not match the fixed R4 candidate binding/u);
assert.match(executorSource, /Migration 012 does not match the fixed R4 candidate binding/u);
assert.match(
  readFileSync(join(import.meta.dirname, "execution-core.mjs"), "utf8"),
  /FOUNDER-AUTHORISED-STAGE-2-R4-SINGLE-ATTEMPT/u
);
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

const identityCore = readFileSync(
  join(import.meta.dirname, "execution-identity-core.ps1"),
  "utf8"
);
const governedInvoker = readFileSync(
  join(import.meta.dirname, "invoke-attempt.ps1"),
  "utf8"
);
const identityVerifier = readFileSync(
  join(import.meta.dirname, "verify-execution-identity.ps1"),
  "utf8"
);
assert.match(identityCore, /RandomNumberGenerator\]::Create\(\)/u);
assert.match(identityCore, /\.GetBytes\(\$entropy\)/u);
assert.doesNotMatch(identityCore, /RandomNumberGenerator\]::Fill/u);
assert.match(identityCore, /prohibited all-zero suffix/u);
assert.match(identityCore, /Secure entropy generation failed/u);
assert.doesNotMatch(identityCore, /00000000[^\r\n]*fallback/iu);
assert.match(governedInvoker, /\$ErrorActionPreference = "Stop"/u);
assert.match(governedInvoker, /New-OracleStage2R4ExecutionIdentity/u);
assert.match(governedInvoker, /if \(\$identity\.suffix -eq "00000000"\)/u);
assert.match(governedInvoker, /& \$nodePath @arguments/u);
assert.match(
  governedInvoker,
  /oracle-stage2-r4-governed-wrapper-v1:\$PID/u
);
assert.match(governedInvoker, /previousWrapperMarker/u);
assert.match(executorSource, /assertGovernedWrapperInvocation\(\)/u);
assert.match(
  harnessCore,
  /The R4 executor must be invoked by the governed invoke-attempt\.ps1 wrapper/u
);
assert.doesNotMatch(governedInvoker, /-EntropyProvider|-UtcNowProvider/u);
assert.match(identityVerifier, /fixture entropy failure/u);
assert.match(identityVerifier, /prohibited all-zero/u);

const directInvocationEnvironment = { ...process.env };
delete directInvocationEnvironment.ORACLE_STAGE2_R4_GOVERNED_WRAPPER;
const directInvocation = spawnSync(
  process.execPath,
  [join(import.meta.dirname, "execute-attempt.mjs")],
  {
    cwd: repositoryRoot,
    env: directInvocationEnvironment,
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  }
);
assert.equal(directInvocation.error, undefined);
assert.equal(directInvocation.signal, null);
assert.notEqual(directInvocation.status, 0);
assert.match(
  directInvocation.stderr,
  /must be invoked by the governed invoke-attempt\.ps1 wrapper/u
);

const exactManifestSigner = readFileSync(
  join(import.meta.dirname, "sign-release-manifest-exact.ps1"),
  "utf8"
);

const exactSignatureVerifier = readFileSync(
  join(import.meta.dirname, "verify-exact-signatures.ps1"),
  "utf8"
);
assert.doesNotMatch(
  exactSignatureVerifier,
  /Import-Certificate/u
);
assert.match(
  exactSignatureVerifier,
  /\$certUtilArguments = @\(\s*"-user",\s*"-addstore",\s*"Root",\s*\$temporaryCertificatePath\s*\)/u
);
const certUtilArgumentAssignment =
  /\$certUtilArguments = @\(([^)]*)\)/u.exec(exactSignatureVerifier);
assert.ok(
  certUtilArgumentAssignment,
  "The temporary Root-trust CertUtil argument assignment must be explicit."
);
assert.doesNotMatch(certUtilArgumentAssignment[1], /"-f"/u);
assert.match(
  exactSignatureVerifier,
  /\$certUtilPath = Join-Path \(\[Environment\]::SystemDirectory\) "certutil\.exe"/u
);
assert.match(
  exactSignatureVerifier,
  /Test-Path -LiteralPath \$certUtilPath -PathType Leaf/u
);
assert.match(
  exactSignatureVerifier,
  /\$certUtilStartInfo\.FileName = \$certUtilPath/u
);
assert.doesNotMatch(
  exactSignatureVerifier,
  /Get-Command[\s\S]*?-Name "certutil\.exe"/u
);
assert.match(
  exactSignatureVerifier,
  /\$certUtilStartInfo\.UseShellExecute = \$false/u
);
assert.match(
  exactSignatureVerifier,
  /\$temporaryCertificatePath\.Contains\('"'?\)/u
);
assert.match(
  exactSignatureVerifier,
  /\$certUtilStartInfo\.Arguments = \([\s\S]*?\$certUtilArguments \|[\s\S]*?'"' \+ \$_ \+ '"'[\s\S]*?\) -join " "/u
);
assert.doesNotMatch(exactSignatureVerifier, /cmd(?:\.exe)?\s+\/c/iu);
assert.match(
  exactSignatureVerifier,
  /location = "CurrentUser\\Root"/u
);
assert.match(exactSignatureVerifier, /\$bootstrapSignature/u);
assert.match(
  exactSignatureVerifier,
  /Assert-ExactSigner -Path \$path -RequireValidStatus \$true/u
);
assert.match(exactSignatureVerifier, /\$signature\.Status -ne "Valid"/u);
assert.match(
  exactSignatureVerifier,
  /Expected exactly one matching CurrentUser\\My signing certificate/u
);
assert.match(
  exactSignatureVerifier,
  /exact attempt certificate is already present in a trust store/u
);
assert.match(
  exactSignatureVerifier,
  /\$rootMatches\.Count -ne 1/u
);
assert.match(
  exactSignatureVerifier,
  /\$postImportMatches\.Count -ne 2/u
);
assert.match(
  exactSignatureVerifier,
  /-not \$postImportSigningMatches\[0\]\.certificate\.HasPrivateKey/u
);
assert.match(
  exactSignatureVerifier,
  /\$postImportSigningMatches\[0\]\.certificate\.Subject -cne \$ExpectedSubject/u
);
assert.match(
  exactSignatureVerifier,
  /ToBase64String\(\s*\$postImportSigningMatches\[0\]\.certificate\.RawData\s*\)/u
);
assert.match(
  exactSignatureVerifier,
  /ToBase64String\(\$rootMatches\[0\]\.certificate\.RawData\)/u
);
assert.match(
  exactSignatureVerifier,
  /\$rootMatches\[0\]\.certificate\.Subject -cne \$ExpectedSubject/u
);
assert.match(
  exactSignatureVerifier,
  /\$rootMatches\[0\]\.certificate\.Thumbprint -cne \$ExpectedThumbprint/u
);
assert.match(
  exactSignatureVerifier,
  /\$null -ne \$certUtilProcessError[\s\S]*\$null -ne \$certUtilSignal[\s\S]*\$null -eq \$certUtilExitCode[\s\S]*\$certUtilExitCode -ne 0/u
);
assert.match(exactSignatureVerifier, /stdout = \$certUtilStdout/u);
assert.match(exactSignatureVerifier, /stderr = \$certUtilStderr/u);
assert.doesNotMatch(exactSignatureVerifier, /-Verb\s+RunAs/u);
assert.match(exactManifestSigner, /ExpectedThumbprint/u);
assert.match(exactManifestSigner, /FileMode\]::CreateNew/u);
assert.match(exactManifestSigner, /\[IO\.File\]::Move/u);
assert.doesNotMatch(
  exactManifestSigner,
  /Where-Object\s*\{\s*\$_\.Subject/u
);

assert.equal(contract.authority.build, "founder-authority-required-per-attempt");
assert.equal(contract.authority.package, "founder-authority-required-per-attempt");
assert.equal(
  contract.authority.signing,
  "founder-authority-required-per-attempt-local-test-only"
);
assert.equal(
  contract.authority.qualificationExecution,
  "founder-authority-required-per-attempt"
);
assert.equal(contract.authority.stage3, "closed-not-authorised-by-r4");
assert.equal(contract.authority.stage4, "closed-not-authorised-by-r4");
assert.throws(
  () => assertRequiredTool("oracle-r4-tool-that-does-not-exist.exe"),
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
        exactCandidateCommitAndTreeBinding: "passed",
        correctedMigrationHashBinding: "passed",
        runtimeMigrationHashEnforcement: "passed",
        completeHarnessInventoryBinding: "passed",
        deterministicNpmSurfaceResolution: "passed",
        npmMissingVersionAndReparseRejection: "passed",
        powershell51IdentityGenerationInspection: "passed",
        entropyFailureAndAllZeroRejectionInspection: "passed",
        attemptCreationStateConsistency: "passed",
        terminalFailureOutcomeInspection: "passed",
        inheritedR2FixtureParity: "passed",
        historicalEvidenceHashBinding: "passed",
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
        exactRootTeardownLifecycleFixtures: "passed",
        teardownProcessFailureFixtures: "passed",
        teardownCertificateIdentityFixtures: "passed",
        teardownProcessEvidencePersistenceInspection: "passed",
        atomicNoReplacePublication: "passed",
        historicalEntryPointRetirement: "passed",
        safeEntryPointWiring: "passed",
        singleExecutionEntryPoint: "passed",
        noStandaloneAttemptPreparation: "passed",
        candidatePackageJsonPreserved: "passed",
        founderAuthorityBoundary: "passed",
        singleAttemptAuthorityConsumptionInspection: "passed",
        subsequentAttemptAuthorityIdentity: "passed",
        consumedAuthorityImmutability: "passed",
        failedAttemptImmutability: "passed",
        duplicateAuthorityRejection: "passed",
        attemptRetryRejection: "passed",
        exactToolchainBinding: "passed",
        orderedLifecycle: "passed",
        certificateValidityBudgetBinding: "passed",
        exactCertificateSelectionFixtures: "passed",
        noHistoricalExecutorInvocation: "passed",
        failureTeardownInspection: "passed",
        partialCertificateGenerationRecoveryInspection: "passed",
        preIdentitySigningMaterialCleanupInspection: "passed",
        zeroStoreMatchTeardownInspection: "passed",
        postTrustSignatureValidityInspection: "passed",
        certUtilRootTemporaryTrustInspection: "passed",
        noExternalConfirmArgumentInspection: "passed",
        internalShouldProcessConfirmationInspection: "passed",
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
