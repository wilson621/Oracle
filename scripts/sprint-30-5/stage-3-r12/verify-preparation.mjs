import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  assertCreateOnlyDestination,
  canonicalProgrammeIdentity,
  assertNoLinkTraversal,
  assertOutsideHistoricalRoots,
  contract,
  repositoryRoot,
  sha256,
  validateAcceptedBindings,
  validateCertificateWindow,
  validateExecutionIdentity,
  validateProcessEnvelope,
  validateProgrammeIdentity,
  validateTransferConstructionAuthority,
  validateTransferIdentity,
  writeJsonAtomicCreateOnly,
} from "./stage3-core.mjs";

const expected = {
  attemptId: "r6-20260803T171057940Z-5e914d18",
  authorityId: "authority-r6-20260803T171057940Z-5e914d18",
  candidateCommit: "ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff",
  candidateTree: "8455a05780989a9d5f6c6d527f7d427d94526b04",
  harnessCommit: "0b10f074d86ac9256462602c0e7bda528b8fba57",
  harnessTree: "b32db4b2c7ebaf8ff6c1d2070e0056b6b7557f80",
  closureCommit: "190fb262fa8cd2ab24c2585e21b3bd7c8bd7e335",
  closureTree: "8268f8b09328ff06419b1cd9d4d9d45087da1d77",
  acceptedEvidenceIndexSha256:
    "3ef36e908803528853c1bd16a1ee555a520b40648e64e6f0e2f1ed643ea46863",
  finalEvidenceManifestSha256:
    "a637a7fdf49f6b2a957738c89cb02015b6384d227c2c72f77a2aabdd721bf288",
  archiveSha256:
    "7884c93b222cd5f16f51dd5ba1b56c51af5008e1f6c999dcff92a8c1a26ac690",
  msixSha256:
    "492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430",
  releaseManifestSha256:
    "bd3dde2a3b37d75ccdcfecd8fa49bda2a493d340ead7283fddd2dd11a6e59bd3",
  releaseManifestSignatureSha256:
    "4c8ec3b09f4bb03d5475398963e22a67657b9f4f4e5475fa03f512eae1cc97ac",
  sbomSha256:
    "ccefd235db62c007613d0280b6c35051999c3c757ce78a93581d9fcea626de22",
  provenanceSha256:
    "64c829eea43eed7b53af25712be38cda53f827b13844d544380f1776921e3920",
  certificateThumbprint: "8C24858C147873EF46A9D61018FA2702B6222EA2",
};
validateAcceptedBindings(expected);
const failedR11Root = join(
  repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5", "stage-3-r11"
);
const failedR11AttemptRoot = join(
  failedR11Root, "Oracle.Stage3R11Evidence",
  "stage3-r11-20260803T175715661Z-84bf486c"
);
assert.equal(
  sha256(join(failedR11Root, "Oracle.Stage3R11FailedEvidenceIndex.json")),
  contract.immutableFailedQualification.failedEvidenceIndexSha256
);
assert.equal(
  sha256(join(failedR11Root, "Oracle.Stage3R11Evidence", "authorities", "authority-stage3-r11-20260803T175715661Z-84bf486c.json")),
  contract.immutableFailedQualification.authoritySha256
);
assert.equal(
  sha256(join(failedR11AttemptRoot, "evidence", "failure.json")),
  contract.immutableFailedQualification.failureSha256
);
assert.equal(
  sha256(join(failedR11AttemptRoot, "evidence", "runtime-observation.json")),
  contract.immutableFailedQualification.runtimeObservationSha256
);
assert.equal(
  sha256(join(failedR11AttemptRoot, "evidence", "Oracle.Stage3R11HostContinuity.json")),
  contract.immutableFailedQualification.continuitySha256
);
assert.throws(
  () => validateAcceptedBindings({ ...expected, msixSha256: "0".repeat(64) }),
  /binding mismatch/u
);
const acceptedAttemptRoot = join(
  repositoryRoot,
  ".artifacts",
  "sprint-30-5",
  "stage-2-requalification-r6",
  contract.stage2.attemptId
);
const acceptedEvidenceRoot = join(acceptedAttemptRoot, "evidence");
const acceptedReleaseRoot = join(acceptedAttemptRoot, "release");
assert.equal(
  sha256(
    join(
      acceptedAttemptRoot,
      "Oracle.Sprint30.5.Stage2RequalificationR6QualificationEvidence.zip"
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
  sha256(join(acceptedReleaseRoot, "oracle-release-manifest.json.p7s")),
  expected.releaseManifestSignatureSha256
);
assert.equal(sha256(join(acceptedReleaseRoot, "oracle-0.1.4.cdx.json")), expected.sbomSha256);
assert.equal(
  sha256(join(acceptedReleaseRoot, "oracle-0.1.4.provenance.json")),
  expected.provenanceSha256
);
assert.equal(
  sha256(join(repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5",
    "stage-2-requalification-r6",
    "Oracle.Stage2RequalificationR6AcceptedEvidenceIndex.json")),
  expected.acceptedEvidenceIndexSha256
);
assert.equal(
  sha256(
    join(
      acceptedEvidenceRoot,
      "Oracle.Stage2RequalificationR6EvidenceManifest.json"
    )
  ),
  expected.finalEvidenceManifestSha256
);

const timestampUtc = "2026-07-28T22:30:45.123Z";
validateExecutionIdentity({
  authorityId: "authority-stage3-r12-20260728T223045123Z-a1b2c3d4",
  attemptId: "stage3-r12-20260728T223045123Z-a1b2c3d4",
  timestampUtc,
});
for (const invalid of [
  {
    authorityId: "authority-stage3-r12-20260728T223045123Z-a1b2c3d4",
    attemptId: "stage3-r12-20260728T223045123Z-ffffffff",
    timestampUtc,
  },
  {
    authorityId: "authority-stage3-r12-20260728T223045123Z-a1b2c3d4",
    attemptId: "stage3-r12-20260728T223045123Z-a1b2c3d4",
    timestampUtc: "2026-07-28T22:30:45.124Z",
  },
]) {
  assert.throws(() => validateExecutionIdentity(invalid));
}
validateTransferIdentity({
  transferId: "transfer-stage3-r12-20260728T223045123Z-a1b2c3d4",
  timestampUtc,
});
assert.equal(
  validateProgrammeIdentity(contract.programmeIdentity),
  canonicalProgrammeIdentity
);
for (const invalidProgrammeIdentity of [
  "Sprint 30.5 Stage 3 Qualification R12",
  "sprint 30.5 Stage 3 Requalification R12",
  "Sprint 30.5  Stage 3 Requalification R12",
  "Sprint 30.5 Stage-3 Requalification R12",
  "Sprint 30.5 Stage 4 Requalification R12",
  "Sprint 30.5 Stage 3 Requalification R9",
]) {
  assert.throws(
    () => validateProgrammeIdentity(invalidProgrammeIdentity),
    /programme identity differs/u
  );
}
for (const rejectedTransfer of [
  {
    transferId: "transfer-stage3-r10-20260803T130243096Z-7a48bde6",
    timestampUtc: "2026-08-03T13:02:43.096Z",
  },
  {
    transferId: "transfer-stage3-r10-20260803T133216036Z-9dc6f3f1",
    timestampUtc: "2026-08-03T13:32:16.036Z",
  },
]) {
  assert.throws(
    () => validateTransferIdentity(rejectedTransfer),
    /invalid Stage 3 R12 format/u
  );
}
for (const invalidAuthority of [
  undefined,
  "",
  "FOUNDER-AUTHORISED-STAGE3-R12-EXECUTION",
]) {
  assert.throws(
    () => validateTransferConstructionAuthority(invalidAuthority),
    /Separate Founder transfer authority is required/u
  );
}
assert.equal(
  validateTransferConstructionAuthority("FOUNDER-AUTHORISED-STAGE3-R12-TRANSFER"),
  "FOUNDER-AUTHORISED-STAGE3-R12-TRANSFER"
);

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
  ".tmp-stage3-r12-validation",
  `fixture-${randomBytes(8).toString("hex")}`
);
mkdirSync(temporaryRoot, { recursive: true });
try {
  const publication = join(temporaryRoot, "evidence.json");
  writeJsonAtomicCreateOnly(publication, { result: "fixture" });
  assert.ok(existsSync(publication));
  assert.throws(() => writeJsonAtomicCreateOnly(publication, { result: "replacement" }));
  assert.throws(() => assertCreateOnlyDestination(publication, temporaryRoot));

  const fixtureAttemptId = "stage3-r12-20260728T223045123Z-a1b2c3d4";
  const fixtureAuthorityId = `authority-${fixtureAttemptId}`;
  const fixtureAttemptRoot = join(temporaryRoot, fixtureAttemptId);
  const fixtureEvidenceRoot = join(fixtureAttemptRoot, "evidence");
  const fixtureLifecycleRoot = join(fixtureAttemptRoot, "lifecycle");
  mkdirSync(fixtureEvidenceRoot, { recursive: true });
  mkdirSync(fixtureLifecycleRoot, { recursive: true });
  const fixturePayload = join(fixtureEvidenceRoot, "host-admission.json");
  writeFileSync(fixturePayload, '{"result":"passed"}\n');
  const fixtureInventory = [{
    path: "evidence/host-admission.json",
    size: statSync(fixturePayload).size,
    sha256: sha256(fixturePayload),
  }];
  const fixtureEvidenceManifest = join(
    fixtureEvidenceRoot,
    "evidence-manifest.json"
  );
  writeFileSync(
    fixtureEvidenceManifest,
    `${JSON.stringify({
      contract: "oracle.sprint-30-5.stage-3-r12-evidence-manifest",
      programmeIdentity: canonicalProgrammeIdentity,
      revision: "R12",
      authorityId: fixtureAuthorityId,
      attemptId: fixtureAttemptId,
      scope: "fixture",
      excludedFinalFiles: [],
      files: fixtureInventory,
    }, null, 2)}\n`
  );
  const fixtureEvidenceManifestHash = sha256(fixtureEvidenceManifest);
  writeFileSync(
    join(fixtureEvidenceRoot, "completion.json"),
    `${JSON.stringify({
      programmeIdentity: canonicalProgrammeIdentity,
      revision: "R12",
      result: "passed",
      authorityId: fixtureAuthorityId,
      attemptId: fixtureAttemptId,
      evidenceManifestSha256: fixtureEvidenceManifestHash,
      stage4Started: false,
    }, null, 2)}\n`
  );
  writeFileSync(
    join(fixtureLifecycleRoot, "14-evidence-frozen.json"),
    `${JSON.stringify({
      contract: "oracle.sprint-30-5.stage-3-r12-lifecycle",
      programmeIdentity: canonicalProgrammeIdentity,
      revision: "R12",
      authorityId: fixtureAuthorityId,
      attemptId: fixtureAttemptId,
      phase: "evidence-frozen",
      details: {
        result: "passed",
        evidenceManifestSha256: fixtureEvidenceManifestHash,
      },
    }, null, 2)}\n`
  );
  const returnedArchive = join(temporaryRoot, `${fixtureAttemptId}.zip`);
  const archiveCreation = spawnSync(
    join(
      process.env.SystemRoot ?? "C:\\Windows",
      "System32",
      "WindowsPowerShell",
      "v1.0",
      "powershell.exe"
    ),
    [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "Compress-Archive -LiteralPath $env:ORACLE_R12_FIXTURE_SOURCE -DestinationPath $env:ORACLE_R12_FIXTURE_DESTINATION",
    ],
    {
      encoding: "utf8",
      shell: false,
      env: {
        ...process.env,
        ORACLE_R12_FIXTURE_SOURCE: fixtureAttemptRoot,
        ORACLE_R12_FIXTURE_DESTINATION: returnedArchive,
      },
    }
  );
  validateProcessEnvelope(archiveCreation);
  const returnedArchiveHash = sha256(returnedArchive);
  const returnedSidecar = `${returnedArchive}.sha256.txt`;
  const returnedManifest = `${returnedArchive}.manifest.json`;
  writeFileSync(
    returnedSidecar,
    `${returnedArchiveHash}  ${fixtureAttemptId}.zip\n`
  );
  writeFileSync(
    returnedManifest,
    `${JSON.stringify({
      contract: "oracle.sprint-30-5.stage-3-r12-archive-manifest",
      programmeIdentity: canonicalProgrammeIdentity,
      revision: "R12",
      authorityId: fixtureAuthorityId,
      attemptId: fixtureAttemptId,
      archive: `${fixtureAttemptId}.zip`,
      size: statSync(returnedArchive).size,
      sha256: returnedArchiveHash,
      evidenceManifestSha256: fixtureEvidenceManifestHash,
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
  const mismatchedManifest = `${returnedArchive}.mismatched.manifest.json`;
  writeFileSync(
    mismatchedManifest,
    readFileSync(returnedManifest, "utf8").replace(
      fixtureEvidenceManifestHash,
      "1".repeat(64)
    )
  );
  const mismatchedReturn = spawnSync(
    process.execPath,
    [
      join(import.meta.dirname, "verify-return.mjs"),
      "--archive",
      returnedArchive,
      "--sidecar",
      returnedSidecar,
      "--manifest",
      mismatchedManifest,
    ],
    { encoding: "utf8", shell: false }
  );
  assert.notEqual(mismatchedReturn.status, 0);
  const rejectedIdentityManifest = `${returnedArchive}.rejected-identity.manifest.json`;
  writeFileSync(
    rejectedIdentityManifest,
    readFileSync(returnedManifest, "utf8").replace(
      canonicalProgrammeIdentity,
      "Sprint 30.5 Stage 3 Qualification R12"
    )
  );
  const rejectedIdentityReturn = spawnSync(
    process.execPath,
    [
      join(import.meta.dirname, "verify-return.mjs"),
      "--archive",
      returnedArchive,
      "--sidecar",
      returnedSidecar,
      "--manifest",
      rejectedIdentityManifest,
    ],
    { encoding: "utf8", shell: false }
  );
  assert.notEqual(rejectedIdentityReturn.status, 0);

  const link = join(temporaryRoot, "link");
  try {
    symlinkSync(temporaryRoot, link, "junction");
    assert.throws(() => assertNoLinkTraversal(join(link, "escape"), temporaryRoot));
  } catch (error) {
    if (existsSync(link) && lstatSync(link).isSymbolicLink()) throw error;
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
  const parent = join(repositoryRoot, ".tmp-stage3-r12-validation");
  if (existsSync(parent)) rmSync(parent, { recursive: true, force: true });
}

const harness = readFileSync(
  join(import.meta.dirname, "Invoke-OracleStage3R12Qualification.ps1"),
  "utf8"
);
const preAuthorityPreflight = readFileSync(
  join(import.meta.dirname, "Invoke-OracleStage3R12PreAuthorityPreflight.ps1"),
  "utf8"
);
const transferBuilder = readFileSync(
  join(import.meta.dirname, "prepare-transfer.mjs"),
  "utf8"
);
const continuityCollector = readFileSync(
  join(import.meta.dirname, "Get-OracleStage3R12HostContinuity.ps1"),
  "utf8"
);
const identityPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12IdentityPolicy.ps1"),
  "utf8"
);
const activationPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12ActivationPolicy.ps1"),
  "utf8"
);
const certificateTrustPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12CertificateTrustPolicy.ps1"),
  "utf8"
);
const packageInventoryPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12PackageInventoryPolicy.ps1"),
  "utf8"
);
const installedSoftwarePolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12InstalledSoftwarePolicy.ps1"),
  "utf8"
);
const installedRuntimeConfigurationPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12InstalledRuntimeConfigurationPolicy.ps1"),
  "utf8"
);
const lifecyclePolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12LifecyclePolicy.ps1"),
  "utf8"
);
const observationPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12ObservationPolicy.ps1"),
  "utf8"
);
const preflightPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12PreflightPolicy.ps1"),
  "utf8"
);
const processPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12ProcessPolicy.ps1"),
  "utf8"
);
const transferInventoryPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12TransferInventoryPolicy.ps1"),
  "utf8"
);
const windowPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12WindowPolicy.ps1"),
  "utf8"
);
const windowsExecutablePolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R12WindowsExecutablePolicy.ps1"),
  "utf8"
);
const preAuthorityProbe = readFileSync(
  join(import.meta.dirname, "Invoke-OracleStage3R12PreAuthorityPreflight.ps1"),
  "utf8"
);
const developmentRehearsalPath = join(
  import.meta.dirname,
  "Invoke-OracleStage3R12DevelopmentRehearsal.ps1"
);
const installedSoftwareFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12InstalledSoftwarePolicy.ps1"
);
const lifecycleFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12LifecyclePolicy.ps1"
);
const installedRuntimeConfigurationFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12InstalledRuntimeConfigurationPolicy.ps1"
);
const hostShapeFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12HostShapeFixtures.ps1"
);
const optionalMemberAuditPath = join(
  import.meta.dirname,
  "Test-OracleStage3R12OptionalMemberAudit.ps1"
);
const processFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12ProcessPolicy.ps1"
);
const transferInventoryFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12TransferInventoryPolicy.ps1"
);
const windowFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12WindowPolicy.ps1"
);
const observationFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12ObservationPolicy.ps1"
);
const certificateTrustFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12CertificateTrustPolicy.ps1"
);
const activationFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12ActivationPolicy.ps1"
);
const windowsExecutableFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12WindowsExecutablePolicy.ps1"
);
const developmentPlatformFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12DevelopmentPlatformCompatibility.ps1"
);
const phaseAudit = JSON.parse(
  readFileSync(join(import.meta.dirname, "Oracle.Stage3R12PhaseAudit.json"), "utf8")
);
const hostShapeFixtures = JSON.parse(
  readFileSync(join(import.meta.dirname, "Oracle.Stage3R12HostShapeFixtures.json"), "utf8")
);
const harnessReadme = readFileSync(join(import.meta.dirname, "README.md"), "utf8");
const stage3R12Plan = readFileSync(
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_PLAN.md"),
  "utf8"
);
const packageInventoryFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12PackageInventoryPolicy.ps1"
);
const scriptPathFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R12ScriptPath.ps1"
);
const preExecutionGate = readFileSync(
  join(
    repositoryRoot,
    "docs",
    "sprints",
    "SPRINT_30_5_STAGE_3_R12_PRE_EXECUTION_GATE.md"
  ),
  "utf8"
);
const preparationValidationReport = readFileSync(
  join(
    repositoryRoot,
    "docs",
    "sprints",
    "SPRINT_30_5_STAGE_3_R12_PREPARATION_VALIDATION_REPORT.md"
  ),
  "utf8"
);
const engineeringCorrection = readFileSync(
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_ENGINEERING_CORRECTION.md"),
  "utf8"
);
const engineeringClosure = readFileSync(
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_ENGINEERING_CLOSURE.md"),
  "utf8"
);const qualificationMission = readFileSync(
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_QUALIFICATION_MISSION.md"),
  "utf8"
);const packageScripts = JSON.parse(
  readFileSync(join(repositoryRoot, "package.json"), "utf8")
).scripts;
assert.equal(contract.programmeIdentity, canonicalProgrammeIdentity);
assert.equal(contract.revision, "R12");
assert.equal(phaseAudit.programmeIdentity, canonicalProgrammeIdentity);
assert.equal(hostShapeFixtures.continuity.normal.programmeIdentity, canonicalProgrammeIdentity);
for (const governedDocument of [
  harnessReadme,
  stage3R12Plan,
  preExecutionGate,
  preparationValidationReport,
  engineeringCorrection,
  engineeringClosure,
  qualificationMission,
]) {
  assert.ok(governedDocument.includes(canonicalProgrammeIdentity));
}
for (const operationalSource of [
  transferBuilder,
  continuityCollector,
  preAuthorityPreflight,
  preflightPolicy,
  harness,
]) {
  assert.ok(
    !operationalSource.includes("Sprint 30.5 Stage 3 Qualification R12"),
    "Reachable R12 source retains the rejected programme identity."
  );
}
assert.match(transferBuilder, /programmeIdentity:\s*contract\.programmeIdentity/u);
assert.match(continuityCollector, /programmeIdentity = \$contract\.programmeIdentity/u);
assert.match(
  preAuthorityPreflight,
  /\[string\]\$manifest\.programmeIdentity[ \t]+-cne[ \t]*\r?\n[ \t]+\[string\]\$contract\.programmeIdentity/u
);
assert.match(
  preAuthorityPreflight,
  /\[string\]\$custody\.programmeIdentity[ \t]+-cne[ \t]*\r?\n[ \t]+\[string\]\$contract\.programmeIdentity/u
);
assert.match(
  harness,
  /\[string\]\$manifest\.programmeIdentity[ \t]+-cne[ \t]*\r?\n[ \t]+\[string\]\$contract\.programmeIdentity/u
);
assert.match(
  harness,
  /\[string\]\$custody\.programmeIdentity[ \t]+-cne[ \t]*\r?\n[ \t]+\[string\]\$contract\.programmeIdentity/u
);
assert.match(transferBuilder, /candidate\.candidateCommit/u);
assert.match(transferBuilder, /candidate\.sourceTree/u);
assert.doesNotMatch(transferBuilder, /candidate\.repository/u);
assert.doesNotMatch(transferBuilder, /randomBytes|Math\.random/u);
assert.match(transferBuilder, /Get-OracleStage3R12HostContinuity\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12IdentityPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12ActivationPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12CertificateTrustPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12InstalledSoftwarePolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12LifecyclePolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12ObservationPolicy\.ps1/u);
assert.match(transferBuilder, /Test-OracleStage3R12ObservationPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12PackageInventoryPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12PreflightPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12ProcessPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12TransferInventoryPolicy\.ps1/u);
assert.match(transferBuilder, /Test-OracleStage3R12TransferInventoryPolicy\.ps1/u);
assert.match(harness, /Assert-OracleStage3R12TransferPayloadInventory/u);
assert.doesNotMatch(harness, /\$expectedPayload\s*=\s*@\(/u);
assert.match(transferInventoryPolicy, /founder-bound-transfer-manifest/u);
assert.match(transferInventoryPolicy, /actualDirectoryMustMatchManifest/u);
assert.match(transferInventoryPolicy, /requiredSubsetMustBePresent/u);
assert.match(transferBuilder, /plannedPayloadNameSet/u);
assert.match(transferBuilder, /contract\.transferPayload\.requiredFileNames/u);
assert.match(transferBuilder, /SPRINT_30_5_STAGE_3_R12_REPLACEMENT_TRANSFER_COMPLETION\.md/u);
assert.match(transferBuilder, /SPRINT_30_5_STAGE_3_R12_EXECUTION_ENABLED_MISSION\.md/u);
assert.match(transferBuilder, /SPRINT_30_5_STAGE_3_R12_EXECUTION_ENABLED_VALIDATION_REPORT\.md/u);
assert.match(transferBuilder, /Oracle\.Stage3R12WindowPolicy\.ps1/u);
assert.match(transferBuilder, /Test-OracleStage3R12WindowPolicy\.ps1/u);
assert.match(harness, /Oracle\.Stage3R12WindowPolicy\.ps1/u);
assert.match(harness, /Oracle\.Stage3R12ObservationPolicy\.ps1/u);
assert.match(harness, /Invoke-OracleStage3R12CompleteStableObservation/u);
assert.doesNotMatch(harness, /\$stableUntil/u);
assert.doesNotMatch(harness, /\$samples\.Count\s+-lt/u);
assert.match(observationPolicy, /Diagnostics\.Stopwatch/u);
assert.match(observationPolicy, /measuredDurationMilliseconds/u);
assert.match(transferBuilder, /Oracle\.Stage3R12WindowsExecutablePolicy\.ps1/u);
assert.match(transferBuilder, /Invoke-OracleStage3R12PreAuthorityPreflight\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R12OptionalMemberAudit\.json/u);
assert.match(transferBuilder, /Test-OracleStage3R12ActivationPolicy\.ps1/u);
assert.ok(contract.transferPayload.requiredFileNames.includes("Test-OracleStage3R12ActivationPolicy.ps1"));
assert.match(transferBuilder, /Oracle\.Stage3R12PhaseAudit\.json/u);
assert.match(transferBuilder, /Oracle\.Stage3R12TransferCustody\.json/u);
assert.match(transferBuilder, /authority:\s*founderAuthority,/u);
for (const admissionSource of [preAuthorityPreflight, harness]) {
  assert.match(
    admissionSource,
    /\[string\]\$custody\.authority[ \t]+-cne[ \t]*\r?\n[ \t]+"FOUNDER-AUTHORISED-STAGE3-R12-TRANSFER"/u
  );
}
assert.doesNotMatch(
  transferBuilder,
  /authority:\s*["']Founder-authorised Stage 3 Qualification R12 corrective preparation["']/u
);
assert.match(transferBuilder, /failedR2TransferModified: false/u);
assert.match(transferBuilder, /failedR3TransferModified: false/u);
assert.match(transferBuilder, /rejectedR10TransfersModified: false/u);
assert.match(transferBuilder, /previousR12PreAuthorityFailureModified: false/u);
assert.match(transferBuilder, /previousR12ReplacementOnlyTransferModified: false/u);
assert.match(transferBuilder, /verifyImmutableHistoricalTransfer\(approvedRoot, contract\.preAuthorityEngineeringFailure\)/u);
assert.match(transferBuilder, /verifyImmutableHistoricalTransfer\(approvedRoot, contract\.immutableReplacementOnlyTransfer\)/u);
assert.match(transferBuilder, /Immutable first R12 failed continuity record differs/u);
assert.match(transferBuilder, /immutablePreAuthorityEngineeringFailure:\s*contract\.preAuthorityEngineeringFailure/u);
assert.match(transferBuilder, /immutableReplacementOnlyTransfer:\s*contract\.immutableReplacementOnlyTransfer/u);
assert.match(transferBuilder, /Immutable historical R12 payload totals differ/u);
assert.match(transferBuilder, /previousR5TransferModified: false/u);
assert.match(transferBuilder, /previousR6TransferModified: false/u);
assert.match(transferBuilder, /previousR7TransferModified: false/u);
assert.match(transferBuilder, /historicalTransfersModified: false/u);
assert.match(transferBuilder, /medium-hardware-serial/u);
assert.match(transferBuilder, /contract\.transferMedium/u);
assert.match(transferBuilder, /expected-harness-commit/u);
assert.match(transferBuilder, /status --porcelain|--porcelain=v1/u);
assert.match(transferBuilder, /merge-base/u);
assert.match(transferBuilder, /harnessTree/u);
assert.match(transferBuilder, /ProgramFiles[\s\S]*Git[\s\S]*cmd[\s\S]*git\.exe/u);
for (const required of [
  "FOUNDER-AUTHORISED-STAGE3-R12-EXECUTION",
  "Write-CreateOnlyJson",
  "Assert-CreateOnlyPath",
  "Oracle.WindowDiscovery.exe",
  "Oracle.WindowObserver.exe",
  'Status -cne "Valid"',
  "Get-ExactCertificateMatches",
  "Reset-AppxPackage",
  "HostContinuityPath",
  "ExpectedHostContinuitySha256",
  "ExpectedHarnessCommit",
  "candidateCommit",
  "candidateTree",
  "Executing harness, contract or policy bytes differ from the transfer",
  "processEvidenceCounts",
  "Assert-PackageContent",
  "Get-OracleStage3R12InstalledSoftwareInventory",
  "Get-OracleStage3R12PreAuthorityObservation",
  "ConvertFrom-OracleStage3R12WindowDiscoveryJson",
  "Assert-OracleStage3R12ProcessPackageOwnership",
  "Invoke-OracleStage3R12ApplicationActivation",
  "Assert-OracleStage3R12ApplicationActivationSucceeded",
  "initial-activation.json",
  "repair-activation.json",
  "Get-OracleStage3R12TrustImportArguments",
  "Get-OracleStage3R12TrustRemovalArguments",
  "Assert-OracleStage3R12TemporaryTrustState",
  "Assert-OracleStage3R12ExactRemovalTarget",
  "Get-PhysicalExactCertificateMatches",
  "Move-OracleStage3R12Lifecycle",
  "package-content-reconciliation.json",
  "Get-OracleStage3R12PackageZipInventory",
  "ConvertTo-OracleStage3R12CanonicalPackagePath",
  "--remote-debugging",
  "ownerAuthenticodeStatus",
  "untrusted-rejection.json",
  "tampered-rejection.json",
  "evidenceManifestSha256",
  "ExpectedTransferCustodySha256",
  "oracle.sprint-30-5.stage-3-r12-transfer-custody",
  "contract.transferMedium.hardwareSerial",
  "FOUNDER-AUTHORISED-STAGE3-R12-TRANSFER",
]) {
  assert.ok(harness.includes(required), `Harness contract missing: ${required}`);
}
assert.match(
  harness,
  /\[string\]\$contract\.authority\.execution\s+-cne\s+"founder-authorised"/u
);
assert.match(harness, /qualification execution is not authorised by the contract/u);
assert.match(windowPolicy, /GetPackageFamilyName/u);
assert.match(windowPolicy, /ProcessQueryLimitedInformation/u);
assert.match(windowPolicy, /NativeErrorCode\s+-ne\s+87/u);
assert.match(windowPolicy, /Test-OracleStage3R12ProcessExists/u);
assert.match(windowPolicy, /StringComparer\]::OrdinalIgnoreCase/u);
assert.doesNotMatch(
  harness,
  /Path\.StartsWith\(\s*\$package\[0\]\.InstallLocation/u
);
for (const required of [
  "Accepted Stage 2 R6 binding and immutable rehash",
  "ADR-048 installed runtime-configuration lifecycle",
  "Optional-member and StrictMode audit",
  "Lifecycle and failure-path audit",
  "NON-QUALIFICATION",
  "Pre-authority host probe",
  contract.stage2.msixSha256,
  contract.stage2.archiveSha256,
]) {
  assert.ok(
    preparationValidationReport.includes(required),
    `Preparation validation report is missing: ${required}`
  );
}
for (const required of [
  "reset is asynchronous",
  "at most 120 polls at 250 milliseconds",
  "ApplicationDataManager.CreateForPackageFamily",
  "R12 creates no transfer, authority, attempt or qualification evidence",
]) {
  assert.ok(engineeringCorrection.includes(required), `Engineering correction is missing: ${required}`);
}
for (const required of [
  "Engineering mission complete",
  "Real elevated Windows integration",
  "No R12 transfer was constructed",
  "new explicit Founder mission",
]) {
  assert.ok(engineeringClosure.includes(required), `Engineering closure is missing: ${required}`);
}
for (const required of [
  "SPRINT_30_5_STAGE_3_R12_PLAN.md",
  "SPRINT_30_5_STAGE_3_R12_QUALIFICATION_MISSION.md",
  "SPRINT_30_5_STAGE_3_R12_ENGINEERING_CORRECTION.md",
  "SPRINT_30_5_STAGE_3_R12_PREPARATION_VALIDATION_REPORT.md",
  "SPRINT_30_5_STAGE_3_R12_PRE_EXECUTION_GATE.md",
  "SPRINT_30_5_STAGE_3_R12_ENGINEERING_CLOSURE.md",
]) {
  assert.ok(transferBuilder.includes(required), `Future transfer source list is missing: ${required}`);
}
for (const required of [
  "Founder-authorised",
  "mission is authorised.",
  "creation and immediate consumption of one attempt authority only after every",
  "does not authorise Stage 4, production, publication or deployment",
]) {
  assert.ok(qualificationMission.includes(required), `Qualification mission is missing: ${required}`);
}assert.equal(packageScripts["sprint-30-5:stage-3:r12:validate"], "node scripts/sprint-30-5/stage-3-r12/verify-preparation.mjs");
assert.equal(packageScripts["sprint-30-5:stage-3:r12:rehearse"], "powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/sprint-30-5/stage-3-r12/Invoke-OracleStage3R12DevelopmentRehearsal.ps1");
for (const operation of ["prepare-transfer", "verify-return", "execute"]) {
  assert.equal(packageScripts[`sprint-30-5:stage-3:r12:${operation}`], undefined);
}
for (const revision of ["r6", "r7", "r8", "r9"]) {
  for (const operation of ["validate", "rehearse", "prepare-transfer", "execute"]) {
    assert.equal(
      packageScripts[`sprint-30-5:stage-3:${revision}:${operation}`],
      undefined
    );
  }
}
assert.equal(
  packageScripts["sprint-30-5:stage-3:r6:verify-return"],
  "node scripts/sprint-30-5/stage-3-r6/verify-return.mjs"
);
assert.equal(
  packageScripts["sprint-30-5:stage-3:r7:verify-return"],
  "node scripts/sprint-30-5/stage-3-r7/verify-return.mjs"
);
assert.equal(
  packageScripts["sprint-30-5:stage-3:r8:verify-return"],
  "node scripts/sprint-30-5/stage-3-r8/verify-return.mjs"
);
for (const forbidden of [
  "Import-Certificate",
  "Remove-Item -LiteralPath \"Cert:",
  "Stop-Process -Name",
  "Get-Process -Name \"Oracle\" | Select-Object -First",
  "Set-Content",
  "Expand-Archive",
]) {
  assert.ok(!harness.includes(forbidden), `Forbidden harness behaviour: ${forbidden}`);
}
for (const required of [
  "Stage 3 Requalification R12 Pre-Execution Gate",
  "Execution:** Founder-authorised after every pre-authority gate passes",
  "Fresh transfer construction:** Founder-authorised",
  "ExpectedHarnessCommit",
  "ExpectedTransferManifestSha256",
  "ExpectedTransferCustodySha256",
  contract.stage2.candidateCommit,
  contract.stage2.msixSha256,
  contract.stage2.latestExecutionStartUtc.replace(".000Z", "Z"),
  contract.transferMedium.hardwareSerial,
  contract.transferMedium.volumeSerial,
]) {
  assert.ok(
    preExecutionGate.includes(required),
    `Pre-execution gate contract missing: ${required}`
  );
}

assert.match(
  transferBuilder,
  /Create-only replacement Stage 3 Requalification R12 transfer; the first R12 package and all historical transfers remain immutable/u
);
for (const required of [
  "PSObject.Properties",
  "StringComparer]::Ordinal.Compare",
  "machine-64",
  "machine-32",
  "current-user",
  "Get-ItemProperty",
  "ErrorAction Stop",
]) {
  assert.ok(
    installedSoftwarePolicy.includes(required),
    `Installed-software policy contract missing: ${required}`
  );
}
assert.doesNotMatch(harness, /\$_\.DisplayName/u);
assert.match(harness, /Get-OracleStage3R12InstalledSoftwareInventory/u);
assert.match(harness, /Get-OracleStage3R12PreAuthorityObservation[\s\S]*New-Item/u);
assert.ok(
  harness.indexOf("Get-OracleStage3R12PreAuthorityObservation") <
    harness.indexOf("[void](New-Item -ItemType Directory -Path $attemptRoot)"),
  "Pre-authority observation must complete before attempt creation."
);
assert.ok(
  harness.indexOf("$bootstrapManifestPath") <
    harness.indexOf(
      '. (Join-Path $scriptRoot "Oracle.Stage3R12IdentityPolicy.ps1")'
    ),
  "Manifest-bound bootstrap verification must precede policy execution."
);
assert.match(harness, /\$authorityConsumed\s*=\s*\$false/u);
assert.match(harness, /\$authorityConsumed\s*=\s*\$true/u);
assert.match(harness, /if \(\$authorityConsumed\)[\s\S]*remove-exact-machine-trust/u);
assert.match(harness, /completedLifecyclePhases = @\(\$lifecycleState\.completed\)/u);
assert.doesNotMatch(
  harness.slice(harness.lastIndexOf("} catch {")),
  /completedLifecyclePhases = \$phaseIndex/u
);
assert.match(harness, /Get-NetTCPConnection -ErrorAction Stop/u);
assert.match(preflightPolicy, /Compress-Archive"; parameters = @\("LiteralPath"/u);
assert.match(processPolicy, /Get-OracleStage3R12RequiredProcessMember/u);
assert.match(processPolicy, /Governed process returned a null exit status/u);
assert.match(processPolicy, /Governed process terminated by signal/u);
assert.match(
  windowsExecutablePolicy,
  /certutil\.exe[\s\S]*reagentc\.exe/u
);
assert.doesNotMatch(
  windowsExecutablePolicy,
  /explorer\.exe/iu
);
assert.doesNotMatch(
  harness,
  /explorer\.exe|shell:AppsFolder/iu
);
assert.doesNotMatch(
  preflightPolicy,
  /explorer\.exe|shell:AppsFolder/iu
);
assert.match(activationPolicy, /IApplicationActivationManager/u);
assert.match(activationPolicy, /ActivateApplication/u);
assert.match(activationPolicy, /CLSCTX_LOCAL_SERVER/u);
assert.match(activationPolicy, /AO_NOERRORUI/u);
assert.match(activationPolicy, /0x00000000/u);
assert.match(activationPolicy, /processId/u);
assert.match(preflightPolicy, /Test-OracleStage3R12ApplicationActivationApi/u);
assert.match(lifecyclePolicy, /Get-OracleStage3R12LifecyclePhases/u);
assert.match(preflightPolicy, /required Windows PowerShell 5\.1|Windows PowerShell 5\.1/u);
assert.match(preflightPolicy, /Test-OracleStage3R12ProcessIsElevated/u);
assert.match(preflightPolicy, /Machine-scoped AppX trust requires an elevated/u);
assert.match(preflightPolicy, /Get-OracleStage3R12InstalledSoftwareInventory/u);
assert.match(preflightPolicy, /continuityMaximumAgeMinutes/u);
assert.match(preAuthorityProbe, /NON-QUALIFICATION|PreAuthorityObservation/u);
for (const required of [
  "[Uri]::UnescapeDataString",
  "[Content_Types].xml",
  "[StringComparer]::Ordinal",
  "duplicate canonical paths",
  "Package ZIP contains a directory entry",
]) {
  assert.ok(
    packageInventoryPolicy.includes(required),
    `Package-inventory policy contract missing: ${required}`
  );
}
assert.match(identityPolicy, /\[StringComparer\]::OrdinalIgnoreCase\.Equals/u);
for (const source of [continuityCollector, preflightPolicy]) {
  assert.match(source, /Test-OracleWindowsComputerName/u);
  assert.match(source, /\$env:COMPUTERNAME/u);
}
assert.doesNotMatch(
  continuityCollector,
  /\$env:COMPUTERNAME\s+-c(?:eq|ne)\s+\$contract\.host\.deviceName/u
);
assert.doesNotMatch(
  preflightPolicy,
  /\$env:COMPUTERNAME\s+-c(?:eq|ne)\s+(?:\[string\])?\$contract\.host\.deviceName/u
);
assert.doesNotMatch(
  preflightPolicy,
  /\$hostContinuity\.host\.deviceName\s+-c(?:eq|ne)/u
);
assert.match(preflightPolicy, /deviceName = \$env:COMPUTERNAME/u);
assert.match(continuityCollector, /deviceName = \$env:COMPUTERNAME/u);

const powershellExecutable = join(
  process.env.SystemRoot ?? "C:\\Windows",
  "System32",
  "WindowsPowerShell",
  "v1.0",
  "powershell.exe"
);
function runPowerShellFixture(path, extraArguments = []) {
  const result = spawnSync(
    powershellExecutable,
    [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      path,
      ...extraArguments,
    ],
    {
      encoding: "utf8",
      shell: false,
      windowsHide: true,
      maxBuffer: 16 * 1024 * 1024,
    }
  );
  validateProcessEnvelope(result);
  return JSON.parse(result.stdout);
}

const installedSoftwareResult = runPowerShellFixture(installedSoftwareFixturePath);
assert.equal(installedSoftwareResult.result, "passed");
assert.equal(installedSoftwareResult.missingDisplayNameIgnored, true);
assert.equal(installedSoftwareResult.duplicatesPreserved, 2);
assert.equal(installedSoftwareResult.deterministic, true);
assert.equal(installedSoftwareResult.inaccessibleViewRejected, true);

const lifecycleResult = runPowerShellFixture(lifecycleFixturePath);
assert.equal(lifecycleResult.result, "passed");
assert.equal(lifecycleResult.failureInjectionCount, phaseAudit.phases.length);
assert.deepEqual(
  lifecycleResult.successPathPhases,
  phaseAudit.phases.map(({ phase }) => phase)
);
assert.equal(lifecycleResult.skipRejected, true);
assert.equal(lifecycleResult.repeatRejected, true);

const hostShapeResult = runPowerShellFixture(hostShapeFixturePath);
assert.equal(hostShapeResult.result, "passed");
assert.equal(hostShapeResult.missingComputerMemberRejected, true);
assert.equal(hostShapeResult.missingTpmMemberRejected, true);
assert.equal(hostShapeResult.missingDefenderMemberRejected, true);
assert.equal(hostShapeResult.missingContinuityMemberRejected, true);

const optionalMemberResult = runPowerShellFixture(optionalMemberAuditPath);
assert.equal(optionalMemberResult.disposition, "passed");
assert.equal(optionalMemberResult.unclassifiedCount, 0);
assert.ok(optionalMemberResult.memberAccessCount > 0);

const processResult = runPowerShellFixture(processFixturePath);
assert.equal(processResult.result, "passed");
assert.equal(processResult.startupErrorCaptured, true);
assert.equal(processResult.signalCaptured, true);
assert.equal(processResult.nullStatusRejected, true);
assert.equal(processResult.nonzeroRejected, true);
assert.equal(processResult.stdoutAndStderrPreserved, true);
assert.equal(processResult.evidenceRecords, 5);

const transferInventoryResult = runPowerShellFixture(transferInventoryFixturePath);
assert.equal(transferInventoryResult.result, "pass");
assert.equal(transferInventoryResult.governedAdditionalManifestEntryAccepted, true);
assert.equal(transferInventoryResult.unmanifestedFileRejected, true);
assert.equal(transferInventoryResult.missingRequiredFileRejected, true);
assert.equal(transferInventoryResult.duplicateManifestEntryRejected, true);
assert.equal(transferInventoryResult.caseAliasDuplicateRejected, true);
assert.equal(transferInventoryResult.tamperedPayloadRejected, true);

const certificateTrustResult = runPowerShellFixture(
  certificateTrustFixturePath
);
assert.equal(certificateTrustResult.result, "passed");
assert.equal(
  certificateTrustResult.importStore,
  "LocalMachine\\TrustedPeople"
);
assert.equal(
  certificateTrustResult.removalStore,
  "LocalMachine\\TrustedPeople"
);
assert.equal(certificateTrustResult.exactThumbprintOnly, true);
assert.equal(certificateTrustResult.inheritedLogicalProjectionAccepted, true);
assert.equal(certificateTrustResult.partialImportCleanupTargetAccepted, true);
assert.equal(
  certificateTrustResult.unexpectedPhysicalOrLogicalTrustRejected,
  true
);
assert.equal(certificateTrustResult.contractMismatchRejected, true);

const activationResult = runPowerShellFixture(activationFixturePath);
assert.equal(activationResult.result, "passed");
assert.equal(activationResult.directActivation, true);
assert.equal(activationResult.explorerExitCodeIgnored, true);
assert.equal(activationResult.classContext, "CLSCTX_LOCAL_SERVER");
assert.equal(activationResult.successHresult, "0x00000000");
assert.ok(activationResult.successProcessId > 0);
assert.equal(activationResult.malformedAumidRejected, true);
assert.equal(activationResult.nonzeroHresultRejected, true);
assert.equal(activationResult.zeroProcessIdRejected, true);
assert.equal(activationResult.runnerErrorRejected, true);
assert.equal(activationResult.incompleteNativeResultRejected, true);
assert.equal(activationResult.nullNativeResultRejected, true);
assert.equal(activationResult.missingMemberRejected, true);

const windowsExecutableResult = runPowerShellFixture(
  windowsExecutableFixturePath
);
assert.equal(windowsExecutableResult.result, "passed");
assert.equal(windowsExecutableResult.systemToolsUseSystemDirectory, true);
assert.equal(windowsExecutableResult.explorerExcluded, true);
assert.equal(windowsExecutableResult.nonCanonicalNameRejected, true);

const platformResult = runPowerShellFixture(
  developmentPlatformFixturePath,
  [
    "-AcceptedPackagePath",
    join(acceptedReleaseRoot, contract.package.fileName),
  ]
);
assert.equal(platformResult.result, "passed");
assert.equal(platformResult.powershellEdition, "Desktop");
assert.equal(platformResult.powershellVersion, "5.1.26100.8875");
assert.equal(platformResult.is64BitProcess, true);
assert.equal(platformResult.compressArchiveLiteralPath, true);
assert.equal(
  platformResult.detachedSignerThumbprint,
  contract.stage2.certificateThumbprint
);
assert.equal(platformResult.hostAdmissionInferred, false);
assert.equal(platformResult.applicationActivation.available, true);
assert.equal(
  platformResult.applicationActivation.classContext,
  "CLSCTX_LOCAL_SERVER"
);
assert.equal(platformResult.windowsExecutables.explorer, undefined);

const windowPolicyResult = runPowerShellFixture(windowFixturePath);
assert.equal(windowPolicyResult.result, "passed");
assert.equal(windowPolicyResult.multiWindowArrayFlattened, true);
assert.equal(windowPolicyResult.malformedShapesRejected, true);
assert.equal(windowPolicyResult.exactAppModelOwnershipRequired, true);
assert.equal(windowPolicyResult.wrongAndMissingOwnershipRejected, true);
assert.equal(windowPolicyResult.exitedOpenProcessRaceClassified, true);
assert.equal(windowPolicyResult.unverifiableLiveProcessRejected, true);
assert.equal(windowPolicyResult.accessDeniedRemainsFailClosed, true);
assert.equal(windowPolicyResult.identityMismatchRemainsFailClosed, true);
assert.equal(windowPolicyResult.livePidAffirmativelyDetected, true);
assert.equal(
  windowPolicyResult.absentPidRequiresExplicitNoProcessResult,
  true
);
assert.equal(windowPolicyResult.processQueryFailureRejected, true);
assert.equal(windowPolicyResult.emptyProcessQueryRejected, true);
assert.equal(windowPolicyResult.evidencePid, 9808);

const observationPolicyResult = runPowerShellFixture(observationFixturePath);
assert.equal(observationPolicyResult.result, "passed");
assert.equal(observationPolicyResult.shortSampleDidNotComplete, true);
assert.equal(observationPolicyResult.exactMinimumCompleted, true);
assert.equal(observationPolicyResult.measuredDurationMilliseconds, 60000);
assert.equal(observationPolicyResult.backwardsTimeRejected, true);
assert.equal(observationPolicyResult.invalidSampleRejected, true);
assert.equal(
  observationPolicyResult.defaultClockMeasuredAtLeastOneSecond,
  true
);

const rehearsalResult = runPowerShellFixture(developmentRehearsalPath);
assert.equal(rehearsalResult.result, "passed");
assert.equal(rehearsalResult.failureInjectionCount, phaseAudit.phases.length);
assert.equal(rehearsalResult.authorityConsumed, false);
assert.equal(rehearsalResult.hostMutation, false);
assert.equal(rehearsalResult.qualificationEvidenceCreated, false);
assert.equal(rehearsalResult.archiveCreateOnlyPublication, true);
assert.equal(rehearsalResult.archiveSha256Verified, true);
assert.ok(
  rehearsalResult.realPoliciesExercised.includes(
    "Oracle.Stage3R12WindowPolicy.ps1"
  )
);
assert.ok(
  rehearsalResult.realPoliciesExercised.includes(
    "Oracle.Stage3R12ObservationPolicy.ps1"
  )
);

const installedRuntimeConfigurationFixture = spawnSync(
  powershellExecutable,
  ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy",
    "Bypass", "-File", installedRuntimeConfigurationFixturePath],
  { encoding: "utf8", shell: false, windowsHide: true }
);
validateProcessEnvelope(installedRuntimeConfigurationFixture);
const installedRuntimeConfigurationResult = JSON.parse(
  installedRuntimeConfigurationFixture.stdout
);
assert.equal(installedRuntimeConfigurationResult.result, "pass");
assert.equal(installedRuntimeConfigurationResult.createOnly, true);
assert.equal(installedRuntimeConfigurationResult.secretFreeAdmissionRecord, true);
assert.equal(installedRuntimeConfigurationResult.entropyFailureRejected, true);
assert.equal(installedRuntimeConfigurationResult.allZeroEntropyRejected, true);
assert.equal(installedRuntimeConfigurationResult.zeroResidue, true);
assert.equal(installedRuntimeConfigurationResult.postResetRegistrationMismatchRejected, true);
assert.equal(installedRuntimeConfigurationResult.postResetInitializerFailureRejected, true);
assert.equal(installedRuntimeConfigurationResult.postResetUnexpectedPathRejected, true);
assert.equal(installedRuntimeConfigurationResult.postResetSupportedInitialization, true);
assert.equal(installedRuntimeConfigurationResult.unconfiguredBootstrapActivationRequired, false);

const identityPolicyFixture = spawnSync(
  powershellExecutable,
  [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    join(import.meta.dirname, "Test-OracleStage3R12IdentityPolicy.ps1"),
  ],
  { encoding: "utf8", shell: false, windowsHide: true }
);
validateProcessEnvelope(identityPolicyFixture);
const identityPolicyResult = JSON.parse(identityPolicyFixture.stdout);
assert.equal(identityPolicyResult.result, "passed");
assert.equal(identityPolicyResult.comparison, "ordinal-ignore-case");
assert.equal(identityPolicyResult.rawObservedDeviceName, "FOUNDER-QA-01");

const packageInventoryFixture = spawnSync(
  powershellExecutable,
  [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    packageInventoryFixturePath,
    "-AcceptedPackagePath",
    join(acceptedReleaseRoot, contract.package.fileName),
    "-AcceptedInventoryPath",
    join(acceptedReleaseRoot, "package-content-inventory.json"),
    "-ContractPath",
    join(import.meta.dirname, "Oracle.Stage3R12Contract.json"),
  ],
  { encoding: "utf8", shell: false, windowsHide: true }
);
validateProcessEnvelope(packageInventoryFixture);
const packageInventoryResult = JSON.parse(packageInventoryFixture.stdout);
assert.equal(packageInventoryResult.result, "passed");
assert.equal(packageInventoryResult.canonicalPath, "@scope/file.txt");
assert.equal(packageInventoryResult.reservedMetadataPath, "[Content_Types].xml");
assert.equal(packageInventoryResult.duplicateRejected, true);
assert.equal(packageInventoryResult.encodedTraversalRejected, true);
assert.equal(packageInventoryResult.deterministicRepeat, true);
assert.equal(packageInventoryResult.contentMismatchDetected, true);
assert.equal(packageInventoryResult.reservedMetadataMismatchDetected, true);
assert.equal(packageInventoryResult.acceptedPackageSha256, expected.msixSha256);
assert.equal(
  packageInventoryResult.acceptedGovernedEntries,
  contract.packageInventory.governedEntryCount
);
assert.equal(
  packageInventoryResult.acceptedZipFileEntries,
  contract.packageInventory.zipFileEntryCount
);
assert.equal(
  packageInventoryResult.acceptedPercentEncodedEntries,
  contract.packageInventory.percentEncodedEntryCount
);
assert.equal(
  packageInventoryResult.acceptedReservedMetadataSha256,
  contract.packageInventory.reservedContainerMetadata.sha256
);
assert.match(certificateTrustPolicy, /@\(("-addstore"), "TrustedPeople"/u);
assert.match(certificateTrustPolicy, /@\(("-delstore"), "TrustedPeople"/u);
assert.doesNotMatch(
  harness,
  /"-user"[\s\S]{0,40}"-(?:addstore|delstore)"/u
);
assert.doesNotMatch(harness, /"(?:addstore|delstore)"[\s\S]{0,40}"Root"/u);
assert.match(harness, /physicalStore = "LocalMachine\\TrustedPeople"/u);
assert.match(harness, /exact-machine-trust-import/u);
assert.match(harness, /exact-machine-trust-remove/u);
assert.match(harness, /ExpectedTransferManifestSha256/u);
assert.match(harness, /New-GovernedRuntimeConfiguration/u);
assert.match(harness, /Get-OracleInstalledRuntimeActivationArguments/u);
assert.match(harness, /Assert-RuntimeConfigurationConsumedAndRemoveNamespace/u);
assert.match(installedRuntimeConfigurationPolicy, /FileMode\]::CreateNew/u);
assert.match(installedRuntimeConfigurationPolicy, /RandomNumberGenerator\]::Create/u);
assert.match(installedRuntimeConfigurationPolicy, /ApplicationDataManager, Windows\.Management\.Core, ContentType=WindowsRuntime\]::CreateForPackageFamily/u);
assert.match(harness, /post-reset-package-data-initialization\.json/u);
assert.match(harness, /Reset-AppxPackage[\s\S]{0,900}Initialize-OracleInstalledRuntimePackageData[\s\S]{0,900}New-GovernedRuntimeConfiguration/u);
assert.doesNotMatch(harness, /Reset-AppxPackage[\s\S]{0,900}Invoke-OracleStage3R12ApplicationActivation[\s\S]{0,900}Initialize-OracleInstalledRuntimePackageData/u);
assert.match(preflightPolicy, /ambientVariableMatches = 0/u);
assert.match(harness, /CycloneDX/u);
assert.match(harness, /CheckSignature\(\$true\)/u);
assert.match(transferInventoryPolicy, /Transfer payload directory differs from the governed manifest/u);
assert.match(harness, /Transfer root contains missing or unexpected entries/u);
assert.match(
  harness,
  /\$scriptPath\s*=\s*\$MyInvocation\.MyCommand\.Path/u
);
assert.match(
  harness,
  /\$scriptRoot\s*=\s*Split-Path\s+-Parent\s+\$scriptPath/u
);
assert.match(harness, /Get-Sha256\s+\$scriptPath/u);
assert.equal(
  (harness.match(/\$MyInvocation\.MyCommand\.Path/gu) ?? []).length,
  1,
  "Harness may resolve MyCommand.Path only once at script scope."
);
assert.equal(
  (continuityCollector.match(/\$MyInvocation\.MyCommand\.Path/gu) ?? []).length,
  1,
  "Continuity collector may resolve MyCommand.Path only at script scope."
);

const scriptPathFixture = spawnSync(
  powershellExecutable,
  [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    scriptPathFixturePath,
    "-ExpectedScriptPath",
    scriptPathFixturePath,
    "-ExpectedSha256",
    sha256(scriptPathFixturePath),
  ],
  { encoding: "utf8", shell: false, windowsHide: true }
);
validateProcessEnvelope(scriptPathFixture);
const scriptPathResult = JSON.parse(scriptPathFixture.stdout);
assert.equal(scriptPathResult.result, "passed");
assert.equal(scriptPathResult.invocationMode, "powershell.exe -File");
assert.equal(
  scriptPathResult.scriptCommandType,
  "System.Management.Automation.ExternalScriptInfo"
);
assert.equal(
  scriptPathResult.functionCommandType,
  "System.Management.Automation.FunctionInfo"
);
assert.equal(scriptPathResult.functionHasPathProperty, false);
assert.equal(scriptPathResult.sha256, sha256(scriptPathFixturePath));

for (const required of [
  "oracle.sprint-30-5.stage-3-r12-host-continuity",
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
for (const revision of ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"]) {
  const revisionRoot = join(
    repositoryRoot,
    "scripts",
    "sprint-30-5",
    `stage-3-${revision}`
  );
  const retiredTransfer = readFileSync(
    join(revisionRoot, "prepare-transfer.mjs"),
    "utf8"
  );
  const retiredHarness = readFileSync(
    join(
      revisionRoot,
      `Invoke-OracleStage3${revision.toUpperCase()}Qualification.ps1`
    ),
    "utf8"
  );
  const retirementToken =
    `STAGE3_${revision.toUpperCase()}_ENTRY_POINT_RETIRED`;
  assert.match(
    retiredTransfer,
    new RegExp(
      `throw new Error\\([\\s\\S]{0,100}"${retirementToken}:`,
      "u"
    )
  );
  assert.ok(
    retiredTransfer.indexOf("assertHistoricalEntryPointRetired();") <
      retiredTransfer.indexOf("const argumentsMap"),
    `${revision.toUpperCase()} transfer retirement guard is not first.`
  );
  assert.match(
    retiredHarness,
    new RegExp(`throw "${retirementToken}:`, "u")
  );
  assert.ok(
    retiredHarness.indexOf(`throw "${retirementToken}:`) <
      retiredHarness.indexOf("Set-StrictMode"),
    `${revision.toUpperCase()} qualification retirement guard is not first.`
  );
  for (const operation of ["prepare-transfer", "validate", "rehearse"]) {
    assert.equal(
      packageScripts[`sprint-30-5:stage-3:${revision}:${operation}`],
      undefined
    );
  }
}

const governance = [
  "docs/QUALIFICATION_REGISTER.md",
  "docs/PROJECT_BOARD.md",
  "docs/MASTER_BUILD_PLAN.md",
  "docs/ENGINEERING_PROGRAMME.md",
  "docs/sprints/SPRINT_INDEX.md",
].map((path) => readFileSync(join(repositoryRoot, path), "utf8"));
for (const text of governance) {
  assert.match(text, /\bR8\b|R2[–-]R8/u);
  assert.match(text, /\bR12\b/u);
  assert.match(text, /Stage 3[\s\S]{0,600}execution/iu);
  assert.match(text, /Stage 3[\s\S]{0,600}(?:blocked|unauthorised)/iu);
}

assert.deepEqual(contract.rejectedTransfers, [
  {
    transferId: "transfer-stage3-r10-20260803T130243096Z-7a48bde6",
    manifestSha256: "105d3004aa7c91f43eb440bced6d9806a963676ea0a9b2e661b8b32d7684aaed",
    custodySha256: "fe57b149fda7192e473755149b2a202276b3abb6da826f542d5bf563b63ec5d2",
    disposition: "immutable-rejected-custody-authority-mismatch",
  },
  {
    transferId: "transfer-stage3-r10-20260803T133216036Z-9dc6f3f1",
    manifestSha256: "3caaeb29b432acca0aaccb43da45fc294f564e76d103cc274428ee83ad365e1e",
    custodySha256: "7972737c6ec8b9884cf26816d316b809ffb6e01c22efb45ca88ef1b204e62317",
    disposition: "immutable-rejected-programme-identity-contradiction",
  },
  {
    transferId: "transfer-stage3-r12-20260803T190836740Z-2b8363bb",
    manifestSha256: "81e05a570cfffb886af7f65e60ab8658d1fdb92d6d9b1d21ae23981b36b830f0",
    custodySha256: "b31cde2f075b3b1ac34d168c6bbdd3a671bb9a447426388272a50a1de7b42115",
    disposition: "immutable-pre-authority-engineering-failure",
  },
  {
    transferId: "transfer-stage3-r12-20260803T201110346Z-3cf28c94",
    manifestSha256: "603b86c649463e4871a9a0ba2e43a9d231f1ec755c0c01fdf79428cafc55f66a",
    custodySha256: "681ea3eeb092d2be4ec66ab3603c499782d0757ed8c8c7094273e4829674904e",
    disposition: "immutable-replacement-only-execution-barred",
  },
]);
assert.equal(contract.authority.preparation, "founder-accepted-engineering-baseline");
assert.equal(contract.authority.transfer, "founder-authorised");
assert.equal(contract.authority.execution, "founder-authorised");
assert.equal(contract.authority.stage4, "not-authorised");
assert.equal(contract.transferMedium.approvalState, "founder-authorised-execution-enabled-mission");
assert.equal(contract.revisionLineage.relationship, "R9 remains accepted immutable history; R11 is immutable failed qualification; the first R12 package is immutable pre-authority failure; the replacement-only R12 transfer is immutable execution-barred history; one fresh execution-enabled R12 mission is Founder-authorised");
assert.equal(contract.correctionBasis.basis, "stage-3-r11-post-reset-package-data-lifecycle-defect");
assert.equal(contract.correctionBasis.failedStage3Revision, "R11");
assert.equal(contract.correctionBasis.failedStage3Attempt, "stage3-r11-20260803T175715661Z-84bf486c");
assert.deepEqual(contract.preAuthorityEngineeringFailure, {
  transferId: "transfer-stage3-r12-20260803T190836740Z-2b8363bb",
  harnessCommit: "955238054ec18dd8ba4cabac6da15b24d84dedf3",
  manifestSha256: "81e05a570cfffb886af7f65e60ab8658d1fdb92d6d9b1d21ae23981b36b830f0",
  custodySha256: "b31cde2f075b3b1ac34d168c6bbdd3a671bb9a447426388272a50a1de7b42115",
  continuitySha256: "a71d06ee38b2568384aa46c84bd23af5a7cfbfcb988fad9c676b127fec9622d8",
  continuityResult: "failed",
  continuityIssue: "oracle-package",
  authorityCreated: false,
  attemptCreated: false,
  qualificationExecuted: false,
  identityDisposition: "expired-never-reuse",
});
assert.deepEqual(contract.immutableReplacementOnlyTransfer, {
  transferId: "transfer-stage3-r12-20260803T201110346Z-3cf28c94",
  harnessCommit: "68a304d6caad3caaf84d3a6b4f63802ab4b6fe83",
  harnessTree: "5925665667932cb049789003512b1071a56de528",
  closureHead: "9fd90463b89eda92a082a4724957549b189d4b71",
  manifestSha256: "603b86c649463e4871a9a0ba2e43a9d231f1ec755c0c01fdf79428cafc55f66a",
  custodySha256: "681ea3eeb092d2be4ec66ab3603c499782d0757ed8c8c7094273e4829674904e",
  payloadFiles: 57,
  payloadBytes: 580675315,
  disposition: "immutable-replacement-only-execution-barred",
  identityDisposition: "expired-never-reuse",
  authorityCreated: false,
  attemptCreated: false,
  qualificationExecuted: false,
});
assert.equal(contract.transferPayload.inventoryAuthority, "founder-bound-transfer-manifest");
assert.equal(contract.transferPayload.actualDirectoryMustMatchManifest, true);
assert.equal(contract.transferPayload.requiredSubsetMustBePresent, true);
assert.ok(contract.transferPayload.requiredFileNames.includes("Oracle.Stage3R12TransferInventoryPolicy.ps1"));
assert.ok(contract.transferPayload.requiredFileNames.includes("Test-OracleStage3R12TransferInventoryPolicy.ps1"));
assert.equal(contract.immutableFailedQualification.failedEvidenceIndexSha256, "2e43a590d1dab0bdfb8707dfaa1de625008766c3a8590c91c201640cca43168f");
assert.equal(contract.immutableFailedQualification.failureSha256, "2e6cf6fb9d131c66376e247c94d5198db5e6ff4f8e740868b6f85194d004a489");
assert.equal(contract.immutableFailedQualification.authorityConsumed, true);
assert.equal(contract.runtimeConfiguration.postResetPackageDataInitialization.api, "Windows.Management.Core.ApplicationDataManager.CreateForPackageFamily");
assert.equal(contract.runtimeConfiguration.postResetPackageDataInitialization.registrationStabilization, "bounded-120-polls-at-250ms");
assert.equal(contract.runtimeConfiguration.postResetPackageDataInitialization.packageRootMayReappearDuringStabilization, true);
assert.equal(contract.runtimeConfiguration.postResetPackageDataInitialization.apiInvokedAfterRegistrationStabilizes, true);
assert.equal(contract.runtimeConfiguration.postResetPackageDataInitialization.manualPackageRootCreationForbidden, true);
assert.equal(contract.runtimeConfiguration.postResetPackageDataInitialization.unconfiguredBootstrapActivationForbidden, true);
assert.deepEqual(contract.applicationActivation, {
  api: "IApplicationActivationManager.ActivateApplication",
  classId: "45BA127D-10A8-46EA-8AB7-56EA9078943C",
  interfaceId: "2E941141-7F97-4756-BA1D-9DECDE894A3D",
  classContext: "CLSCTX_LOCAL_SERVER",
  activateOptions: "AO_NOERRORUI",
  successHresult: "0x00000000",
  requiresNonzeroProcessId: true,
  runtimeProof: ["Oracle.WindowDiscovery", "Oracle.WindowObserver"],
  explorerExitCodeIsQualificationEvidence: false,
});
assert.deepEqual(contract.observation, {
  discoveryTimeoutSeconds: 60,
  stabilitySeconds: 60,
  minimumMeasuredMilliseconds: 60000,
  durationClock: "monotonic-stopwatch",
  durationStart: "first-valid-captured-sample",
  durationCompletion: "final-valid-captured-sample-at-or-after-minimum",
  sampleCountIsDurationProof: false,
  minimumWidth: 1,
  minimumHeight: 1,
});
assert.equal(contract.temporaryTrust.physicalLocation, "LocalMachine");
assert.equal(contract.temporaryTrust.store, "TrustedPeople");
assert.equal(contract.temporaryTrust.importExecutable, "certutil.exe");
assert.deepEqual(
  contract.temporaryTrust.importArguments,
  ["-addstore", "TrustedPeople", "<attempt-certificate.cer>"]
);
assert.deepEqual(
  contract.temporaryTrust.removalArguments,
  ["-delstore", "TrustedPeople", "<exact-uppercase-sha1-thumbprint>"]
);
assert.deepEqual(contract.temporaryTrust.forbiddenArguments, ["-user", "-f"]);
assert.equal(
  contract.temporaryTrust.requiresFinalZeroPhysicalAndLogicalResidue,
  true
);
assert.equal(
  contract.packageInventory.canonicalPathRepresentation,
  "single-percent-decoded-forward-slash-logical-package-path"
);
assert.equal(contract.packageInventory.governedEntryCount, 2028);
assert.equal(contract.packageInventory.zipFileEntryCount, 2029);
assert.equal(contract.packageInventory.percentEncodedEntryCount, 70);
assert.deepEqual(
  {
    path: contract.packageInventory.reservedContainerMetadata.path,
    rawZipPath: contract.packageInventory.reservedContainerMetadata.rawZipPath,
    size: contract.packageInventory.reservedContainerMetadata.size,
    sha256: contract.packageInventory.reservedContainerMetadata.sha256,
  },
  {
    path: "[Content_Types].xml",
    rawZipPath: "[Content_Types].xml",
    size: 2374,
    sha256: "3261997987ea9adb75f9e3cee463f6582c6b83f5d462129a77eea21a9d938515",
  }
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    ".artifacts/sprint-30-5/stage-3-r3"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    "docs/sprints/evidence/sprint-30-5/stage-3-r3"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    ".artifacts/sprint-30-5/stage-3-r4"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    "docs/sprints/evidence/sprint-30-5/stage-3-r4"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    ".artifacts/sprint-30-5/stage-3-r5"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    "docs/sprints/evidence/sprint-30-5/stage-3-r5"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    ".artifacts/sprint-30-5/stage-3-r6"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    "docs/sprints/evidence/sprint-30-5/stage-3-r6"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    ".artifacts/sprint-30-5/stage-3-r7"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    "docs/sprints/evidence/sprint-30-5/stage-3-r7"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    ".artifacts/sprint-30-5/stage-3-r8"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(
    "docs/sprints/evidence/sprint-30-5/stage-3-r8"
  )
);
assert.ok(
  contract.historicalProtectedRoots.includes(".artifacts/sprint-30-5/stage-3-r9")
);
assert.ok(
  contract.historicalProtectedRoots.includes("docs/sprints/evidence/sprint-30-5/stage-3-r9")
);
assert.ok(contract.historicalProtectedRoots.includes(".artifacts/sprint-30-5/stage-3-r11"));
assert.ok(contract.historicalProtectedRoots.includes("docs/sprints/evidence/sprint-30-5/stage-3-r11"));
assert.ok(
  !contract.historicalProtectedRoots.includes(contract.output.transferBase)
);
assert.ok(
  !contract.historicalProtectedRoots.includes(contract.output.repositoryEvidenceBase)
);
assert.doesNotThrow(() => assertOutsideHistoricalRoots(
  join(repositoryRoot, contract.output.transferBase, "transfer-stage3-r12-20260728T223045123Z-a1b2c3d4")
));assert.equal(contract.runtimeConfiguration.providerConnectivityClaimed, false);
assert.equal(contract.runtimeConfiguration.authenticationClaimed, false);
assert.equal(
  contract.runtimeConfiguration.downstreamInstalledAuthenticationRequalificationRequired,
  true
);assert.equal(contract.preAuthority.requiredPowerShellEdition, "Desktop");
assert.equal(contract.preAuthority.requiredPowerShellVersion, "5.1");
assert.equal(contract.preAuthority.requiredProcessArchitecture, "x64");
assert.equal(contract.preAuthority.requiredElevation, "administrator");
assert.equal(contract.preAuthority.authorityCreationRequiresPass, true);
assert.equal(contract.preAuthority.hostMutationPermitted, false);
assert.equal(phaseAudit.phases.length, 14);
assert.equal(
  new Set(phaseAudit.phases.map(({ phase }) => phase)).size,
  phaseAudit.phases.length
);
for (const phase of phaseAudit.phases) {
  for (const required of [
    "preconditions",
    "expectedHostState",
    "filesRead",
    "filesCreated",
    "registryAccess",
    "packageOperations",
    "certificateOperations",
    "externalCommands",
    "success",
    "failure",
    "teardown",
    "evidence",
    "retry",
    "next",
  ]) {
    assert.ok(
      Object.hasOwn(phase, required),
      `Phase audit missing ${required}: ${phase.phase}`
    );
  }
}

console.log("Stage 3 R12 preparation validation passed.");
