import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  assertCreateOnlyDestination,
  assertNoLinkTraversal,
  assertOutsideHistoricalRoots,
  contract,
  repositoryRoot,
  sha256,
  validateAcceptedBindings,
  validateCertificateWindow,
  validateExecutionIdentity,
  validateProcessEnvelope,
  validateTransferIdentity,
  writeJsonAtomicCreateOnly,
} from "./stage3-core.mjs";

const expected = {
  attemptId: "r2-20260728T203503018Z-ec577cf4",
  authorityId: "authority-r2-20260728T203503018Z-ec577cf4",
  candidateCommit: "11475fe01fff2ec69f0188547107f4e901c531d7",
  candidateTree: "1cec636603031aa8f63c8b331aea5bbcb916567d",
  finalEvidenceManifestSha256:
    "84660931dec8c2c4f4e409465e67e49d9606f8617824e7c1212bb2e8abf1d47d",
  archiveSha256:
    "6a3d2a6878b6e778214c550854a06e4a410fd5ec60b911b606aef844d4225f0f",
  msixSha256:
    "6adb8d9b29585ff7de1b878ec2df2d76a82ce03661cf7269ced7eaff8aae50bc",
  releaseManifestSha256:
    "22d11f7273c2721efe032f5fedd956fdd4a2bfb587c55e7f84fde73dad8726ad",
  certificateThumbprint: "119937D4B90068ACE8765695C5A94321A2C40BD8",
};
validateAcceptedBindings(expected);
assert.throws(
  () => validateAcceptedBindings({ ...expected, msixSha256: "0".repeat(64) }),
  /binding mismatch/u
);
const acceptedAttemptRoot = join(
  repositoryRoot,
  ".artifacts",
  "sprint-30-5",
  "stage-2-requalification-r2",
  contract.stage2.attemptId
);
const acceptedEvidenceRoot = join(acceptedAttemptRoot, "evidence");
const acceptedReleaseRoot = join(acceptedAttemptRoot, "release");
assert.equal(
  sha256(
    join(
      acceptedAttemptRoot,
      "Oracle.Sprint30.5.Stage2RequalificationR2QualificationEvidence.zip"
    )
  ),
  expected.archiveSha256
);
assert.equal(
  sha256(join(acceptedReleaseRoot, contract.package.fileName)),
  expected.msixSha256
);
assert.equal(
  sha256(join(acceptedReleaseRoot, "oracle-release-manifest.json")),
  expected.releaseManifestSha256
);
assert.equal(
  sha256(
    join(
      acceptedEvidenceRoot,
      "Oracle.Stage2RequalificationR2EvidenceManifest.json"
    )
  ),
  expected.finalEvidenceManifestSha256
);

const timestampUtc = "2026-07-28T22:30:45.123Z";
validateExecutionIdentity({
  authorityId: "authority-stage3-r1-20260728T223045123Z-a1b2c3d4",
  attemptId: "stage3-r1-20260728T223045123Z-a1b2c3d4",
  timestampUtc,
});
for (const invalid of [
  {
    authorityId: "authority-stage3-r1-20260728T223045123Z-a1b2c3d4",
    attemptId: "stage3-r1-20260728T223045123Z-ffffffff",
    timestampUtc,
  },
  {
    authorityId: "authority-stage3-r1-20260728T223045123Z-a1b2c3d4",
    attemptId: "stage3-r1-20260728T223045123Z-a1b2c3d4",
    timestampUtc: "2026-07-28T22:30:45.124Z",
  },
]) {
  assert.throws(() => validateExecutionIdentity(invalid));
}
validateTransferIdentity({
  transferId: "transfer-stage3-r1-20260728T223045123Z-a1b2c3d4",
  timestampUtc,
});

validateCertificateWindow("2026-07-28T22:30:45.123Z");
assert.throws(
  () => validateCertificateWindow(contract.stage2.latestExecutionStartUtc),
  /margin/u
);
assert.throws(() => assertOutsideHistoricalRoots(
  join(repositoryRoot, ".artifacts", "sprint-30-5", "stage-3", "offline-transfer")
));

for (const result of [
  null,
  {},
  { status: null, signal: null, error: null },
  { status: 1, signal: null, error: null },
  { status: 0, signal: "SIGTERM", error: null },
  { status: null, signal: null, error: new Error("ENOBUFS") },
]) {
  assert.throws(() => validateProcessEnvelope(result));
}
validateProcessEnvelope({ status: 0, signal: null, error: null });

const temporaryRoot = join(
  repositoryRoot,
  ".tmp-stage3-r1-validation",
  `fixture-${randomBytes(8).toString("hex")}`
);
mkdirSync(temporaryRoot, { recursive: true });
try {
  const publication = join(temporaryRoot, "evidence.json");
  writeJsonAtomicCreateOnly(publication, { result: "fixture" });
  assert.ok(existsSync(publication));
  assert.throws(() => writeJsonAtomicCreateOnly(publication, { result: "replacement" }));
  assert.throws(() => assertCreateOnlyDestination(publication, temporaryRoot));

  const returnedArchive = join(temporaryRoot, "stage3-r1-fixture.zip");
  writeFileSync(returnedArchive, "fixture archive bytes");
  const returnedArchiveHash = sha256(returnedArchive);
  const returnedSidecar = `${returnedArchive}.sha256.txt`;
  const returnedManifest = `${returnedArchive}.manifest.json`;
  writeFileSync(
    returnedSidecar,
    `${returnedArchiveHash}  stage3-r1-fixture.zip\n`
  );
  writeFileSync(
    returnedManifest,
    `${JSON.stringify({
      contract: "oracle.sprint-30-5.stage-3-r1-archive-manifest",
      authorityId: "authority-stage3-r1-20260728T223045123Z-a1b2c3d4",
      attemptId: "stage3-r1-20260728T223045123Z-a1b2c3d4",
      archive: "stage3-r1-fixture.zip",
      size: 21,
      sha256: returnedArchiveHash,
      evidenceManifestSha256: "1".repeat(64),
    }, null, 2)}\n`
  );
  const returned = spawnSync(
    process.execPath,
    [
      join(import.meta.dirname, "verify-return.mjs"),
      "--archive",
      returnedArchive,
      "--sidecar",
      returnedSidecar,
      "--manifest",
      returnedManifest,
    ],
    { encoding: "utf8", shell: false }
  );
  validateProcessEnvelope(returned);
  assert.match(returned.stdout, /"result": "verified"/u);

  const link = join(temporaryRoot, "link");
  try {
    symlinkSync(temporaryRoot, link, "junction");
    assert.throws(() => assertNoLinkTraversal(join(link, "escape"), temporaryRoot));
  } catch (error) {
    if (existsSync(link) && lstatSync(link).isSymbolicLink()) throw error;
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
  const parent = join(repositoryRoot, ".tmp-stage3-r1-validation");
  if (existsSync(parent)) rmSync(parent, { recursive: true, force: true });
}

const harness = readFileSync(
  join(import.meta.dirname, "Invoke-OracleStage3R1Qualification.ps1"),
  "utf8"
);
const transferBuilder = readFileSync(
  join(import.meta.dirname, "prepare-transfer.mjs"),
  "utf8"
);
const continuityCollector = readFileSync(
  join(import.meta.dirname, "Get-OracleStage3R1HostContinuity.ps1"),
  "utf8"
);
const preExecutionGate = readFileSync(
  join(
    repositoryRoot,
    "docs",
    "sprints",
    "SPRINT_30_5_STAGE_3_R1_PRE_EXECUTION_GATE.md"
  ),
  "utf8"
);
const packageScripts = JSON.parse(
  readFileSync(join(repositoryRoot, "package.json"), "utf8")
).scripts;
assert.match(transferBuilder, /candidate\.candidateCommit/u);
assert.match(transferBuilder, /candidate\.sourceTree/u);
assert.doesNotMatch(transferBuilder, /candidate\.repository/u);
assert.doesNotMatch(transferBuilder, /randomBytes|Math\.random/u);
assert.match(transferBuilder, /Get-OracleStage3R1HostContinuity\.ps1/u);
assert.match(transferBuilder, /expected-harness-commit/u);
assert.match(transferBuilder, /status --porcelain|--porcelain=v1/u);
assert.match(transferBuilder, /merge-base/u);
assert.match(transferBuilder, /harnessTree/u);
assert.match(transferBuilder, /ProgramFiles[\s\S]*Git[\s\S]*cmd[\s\S]*git\.exe/u);
for (const required of [
  "FOUNDER-AUTHORISED-STAGE3-R1-EXECUTION",
  "Write-CreateOnlyJson",
  "Assert-CreateOnlyPath",
  "Oracle.WindowDiscovery.exe",
  "Oracle.WindowObserver.exe",
  '"-user", "-addstore", "Root"',
  '"-user", "-delstore", "Root"',
  'Status -cne "Valid"',
  "Get-ExactCertificateMatches",
  "Reset-AppxPackage",
  "HostContinuityPath",
  "ExpectedHostContinuitySha256",
  "ExpectedHarnessCommit",
  "continuityMaximumAgeMinutes",
  "candidateCommit",
  "candidateTree",
  "Executing harness or contract bytes differ from the transfer",
  "processEvidenceCounts",
  "Assert-PackageContent",
  "package-content-reconciliation.json",
  "--remote-debugging",
  "ownerAuthenticodeStatus",
  "untrusted-rejection.json",
  "tampered-rejection.json",
  "evidenceManifestSha256",
]) {
  assert.ok(harness.includes(required), `Harness contract missing: ${required}`);
}
assert.equal(
  packageScripts["sprint-30-5:stage-3:r1:validate"],
  "node scripts/sprint-30-5/stage-3-r1/verify-preparation.mjs"
);
assert.equal(
  packageScripts["sprint-30-5:stage-3:r1:prepare-transfer"],
  "node scripts/sprint-30-5/stage-3-r1/prepare-transfer.mjs"
);
assert.equal(
  packageScripts["sprint-30-5:stage-3:r1:verify-return"],
  "node scripts/sprint-30-5/stage-3-r1/verify-return.mjs"
);
assert.equal(packageScripts["sprint-30-5:stage-3:r1:execute"], undefined);
for (const forbidden of [
  "Import-Certificate",
  "Remove-Item -LiteralPath \"Cert:",
  "Stop-Process -Name",
  "Get-Process -Name \"Oracle\" | Select-Object -First",
  "Set-Content",
]) {
  assert.ok(!harness.includes(forbidden), `Forbidden harness behaviour: ${forbidden}`);
}
for (const required of [
  "Stage 3 Qualification R1 Pre-Execution Gate",
  "Execution:** Blocked and unauthorised",
  "ExpectedHarnessCommit",
  "ExpectedTransferManifestSha256",
  "ExpectedHostContinuitySha256",
  "FOUNDER-AUTHORISED-STAGE3-R1-TRANSFER",
  "FOUNDER-AUTHORISED-STAGE3-R1-EXECUTION",
  contract.stage2.candidateCommit,
  contract.stage2.msixSha256,
  contract.stage2.latestExecutionStartUtc.replace(".000Z", "Z"),
]) {
  assert.ok(
    preExecutionGate.includes(required),
    `Pre-execution gate contract missing: ${required}`
  );
}
assert.ok(!harness.includes('"-addstore", "TrustedPeople"'));
assert.match(harness, /ExpectedTransferManifestSha256/u);
assert.match(harness, /CycloneDX/u);
assert.match(harness, /CheckSignature\(\$true\)/u);
assert.match(harness, /Transfer payload inventory is missing, duplicate or unexpected/u);

for (const required of [
  "oracle.sprint-30-5.stage-3-r1-host-continuity",
  "Get-CimInstance Win32_ComputerSystem",
  "Confirm-SecureBootUEFI",
  "Get-Tpm",
  "Get-MpComputerStatus",
  "reagentc.exe",
  "SoftwareLicensingProduct",
  "Get-AppxPackage",
  "Get-Item -LiteralPath",
  "[IO.File]::Move",
]) {
  assert.ok(
    continuityCollector.includes(required),
    `Host-continuity collector contract missing: ${required}`
  );
}
for (const forbidden of [
  "Add-AppxPackage",
  "Remove-AppxPackage",
  "Import-Certificate",
  "certutil",
  "Set-Content",
]) {
  assert.ok(
    !continuityCollector.includes(forbidden),
    `Host-continuity collector mutates governed machine state: ${forbidden}`
  );
}

const legacyTransfer = readFileSync(
  join(repositoryRoot, "scripts", "prepare-sprint-30-5-stage-3-offline-transfer.mjs"),
  "utf8"
);
const legacyHarness = readFileSync(
  join(
    repositoryRoot,
    "scripts",
    "sprint-30-5",
    "stage-3-qualification",
    "Invoke-OracleStage3Qualification.ps1"
  ),
  "utf8"
);
assert.match(legacyTransfer, /HISTORICAL_STAGE3_ENTRY_POINT_RETIRED/u);
assert.match(legacyHarness, /HISTORICAL_STAGE3_ENTRY_POINT_RETIRED/u);

const governance = [
  "docs/QUALIFICATION_REGISTER.md",
  "docs/PROJECT_BOARD.md",
  "docs/MASTER_BUILD_PLAN.md",
  "docs/ENGINEERING_PROGRAMME.md",
  "docs/sprints/SPRINT_INDEX.md",
].map((path) => readFileSync(join(repositoryRoot, path), "utf8"));
for (const text of governance) {
  assert.match(text, /Stage 3 (?:Qualification )?R1/iu);
  assert.match(text, /Stage 3[\s\S]{0,600}execution/iu);
  assert.match(text, /Stage 3[\s\S]{0,600}(?:blocked|unauthorised)/iu);
}

assert.equal(contract.authority.preparation, "founder-authorised");
assert.equal(contract.authority.transfer, "not-authorised");
assert.equal(contract.authority.execution, "not-authorised");
assert.equal(contract.authority.stage4, "not-authorised");

console.log("Stage 3 R1 preparation validation passed.");
