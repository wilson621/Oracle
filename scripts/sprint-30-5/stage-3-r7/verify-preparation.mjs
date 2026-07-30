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
  authorityId: "authority-stage3-r7-20260728T223045123Z-a1b2c3d4",
  attemptId: "stage3-r7-20260728T223045123Z-a1b2c3d4",
  timestampUtc,
});
for (const invalid of [
  {
    authorityId: "authority-stage3-r7-20260728T223045123Z-a1b2c3d4",
    attemptId: "stage3-r7-20260728T223045123Z-ffffffff",
    timestampUtc,
  },
  {
    authorityId: "authority-stage3-r7-20260728T223045123Z-a1b2c3d4",
    attemptId: "stage3-r7-20260728T223045123Z-a1b2c3d4",
    timestampUtc: "2026-07-28T22:30:45.124Z",
  },
]) {
  assert.throws(() => validateExecutionIdentity(invalid));
}
validateTransferIdentity({
  transferId: "transfer-stage3-r7-20260728T223045123Z-a1b2c3d4",
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
  ".tmp-stage3-r7-validation",
  `fixture-${randomBytes(8).toString("hex")}`
);
mkdirSync(temporaryRoot, { recursive: true });
try {
  const publication = join(temporaryRoot, "evidence.json");
  writeJsonAtomicCreateOnly(publication, { result: "fixture" });
  assert.ok(existsSync(publication));
  assert.throws(() => writeJsonAtomicCreateOnly(publication, { result: "replacement" }));
  assert.throws(() => assertCreateOnlyDestination(publication, temporaryRoot));

  const fixtureAttemptId = "stage3-r7-20260728T223045123Z-a1b2c3d4";
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
      contract: "oracle.sprint-30-5.stage-3-r7-evidence-manifest",
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
      contract: "oracle.sprint-30-5.stage-3-r7-lifecycle",
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
      "Compress-Archive -LiteralPath $env:ORACLE_R7_FIXTURE_SOURCE -DestinationPath $env:ORACLE_R7_FIXTURE_DESTINATION",
    ],
    {
      encoding: "utf8",
      shell: false,
      env: {
        ...process.env,
        ORACLE_R7_FIXTURE_SOURCE: fixtureAttemptRoot,
        ORACLE_R7_FIXTURE_DESTINATION: returnedArchive,
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
      contract: "oracle.sprint-30-5.stage-3-r7-archive-manifest",
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

  const link = join(temporaryRoot, "link");
  try {
    symlinkSync(temporaryRoot, link, "junction");
    assert.throws(() => assertNoLinkTraversal(join(link, "escape"), temporaryRoot));
  } catch (error) {
    if (existsSync(link) && lstatSync(link).isSymbolicLink()) throw error;
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
  const parent = join(repositoryRoot, ".tmp-stage3-r7-validation");
  if (existsSync(parent)) rmSync(parent, { recursive: true, force: true });
}

const harness = readFileSync(
  join(import.meta.dirname, "Invoke-OracleStage3R7Qualification.ps1"),
  "utf8"
);
const transferBuilder = readFileSync(
  join(import.meta.dirname, "prepare-transfer.mjs"),
  "utf8"
);
const continuityCollector = readFileSync(
  join(import.meta.dirname, "Get-OracleStage3R7HostContinuity.ps1"),
  "utf8"
);
const identityPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R7IdentityPolicy.ps1"),
  "utf8"
);
const activationPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R7ActivationPolicy.ps1"),
  "utf8"
);
const certificateTrustPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R7CertificateTrustPolicy.ps1"),
  "utf8"
);
const packageInventoryPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R7PackageInventoryPolicy.ps1"),
  "utf8"
);
const installedSoftwarePolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R7InstalledSoftwarePolicy.ps1"),
  "utf8"
);
const lifecyclePolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R7LifecyclePolicy.ps1"),
  "utf8"
);
const preflightPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R7PreflightPolicy.ps1"),
  "utf8"
);
const processPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R7ProcessPolicy.ps1"),
  "utf8"
);
const windowsExecutablePolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R7WindowsExecutablePolicy.ps1"),
  "utf8"
);
const preAuthorityProbe = readFileSync(
  join(import.meta.dirname, "Invoke-OracleStage3R7PreAuthorityPreflight.ps1"),
  "utf8"
);
const developmentRehearsalPath = join(
  import.meta.dirname,
  "Invoke-OracleStage3R7DevelopmentRehearsal.ps1"
);
const installedSoftwareFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R7InstalledSoftwarePolicy.ps1"
);
const lifecycleFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R7LifecyclePolicy.ps1"
);
const hostShapeFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R7HostShapeFixtures.ps1"
);
const optionalMemberAuditPath = join(
  import.meta.dirname,
  "Test-OracleStage3R7OptionalMemberAudit.ps1"
);
const processFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R7ProcessPolicy.ps1"
);
const certificateTrustFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R7CertificateTrustPolicy.ps1"
);
const activationFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R7ActivationPolicy.ps1"
);
const windowsExecutableFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R7WindowsExecutablePolicy.ps1"
);
const developmentPlatformFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R7DevelopmentPlatformCompatibility.ps1"
);
const phaseAudit = JSON.parse(
  readFileSync(join(import.meta.dirname, "Oracle.Stage3R7PhaseAudit.json"), "utf8")
);
const packageInventoryFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R7PackageInventoryPolicy.ps1"
);
const scriptPathFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R7ScriptPath.ps1"
);
const preExecutionGate = readFileSync(
  join(
    repositoryRoot,
    "docs",
    "sprints",
    "SPRINT_30_5_STAGE_3_R7_PRE_EXECUTION_GATE.md"
  ),
  "utf8"
);
const preparationValidationReport = readFileSync(
  join(
    repositoryRoot,
    "docs",
    "sprints",
    "SPRINT_30_5_STAGE_3_R7_PREPARATION_VALIDATION_REPORT.md"
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
assert.match(transferBuilder, /Get-OracleStage3R7HostContinuity\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R7IdentityPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R7ActivationPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R7CertificateTrustPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R7InstalledSoftwarePolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R7LifecyclePolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R7PackageInventoryPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R7PreflightPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R7ProcessPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R7WindowsExecutablePolicy\.ps1/u);
assert.match(transferBuilder, /Invoke-OracleStage3R7PreAuthorityPreflight\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R7OptionalMemberAudit\.json/u);
assert.match(transferBuilder, /Test-OracleStage3R7ActivationPolicy\.ps1/u);
assert.match(harness, /"Test-OracleStage3R7ActivationPolicy\.ps1"/u);
assert.match(transferBuilder, /Oracle\.Stage3R7PhaseAudit\.json/u);
assert.match(transferBuilder, /Oracle\.Stage3R7TransferCustody\.json/u);
assert.match(transferBuilder, /failedR2TransferModified: false/u);
assert.match(transferBuilder, /failedR3TransferModified: false/u);
assert.match(transferBuilder, /failedR4TransferModified: false/u);
assert.match(transferBuilder, /previousR5TransferModified: false/u);
assert.match(transferBuilder, /previousR6TransferModified: false/u);
assert.match(transferBuilder, /medium-hardware-serial/u);
assert.match(transferBuilder, /contract\.transferMedium/u);
assert.match(transferBuilder, /expected-harness-commit/u);
assert.match(transferBuilder, /status --porcelain|--porcelain=v1/u);
assert.match(transferBuilder, /merge-base/u);
assert.match(transferBuilder, /harnessTree/u);
assert.match(transferBuilder, /ProgramFiles[\s\S]*Git[\s\S]*cmd[\s\S]*git\.exe/u);
for (const required of [
  "FOUNDER-AUTHORISED-STAGE3-R7-EXECUTION",
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
  "Get-OracleStage3R7InstalledSoftwareInventory",
  "Get-OracleStage3R7PreAuthorityObservation",
  "Invoke-OracleStage3R7ApplicationActivation",
  "Assert-OracleStage3R7ApplicationActivationSucceeded",
  "initial-activation.json",
  "repair-activation.json",
  "Get-OracleStage3R7TrustImportArguments",
  "Get-OracleStage3R7TrustRemovalArguments",
  "Assert-OracleStage3R7TemporaryTrustState",
  "Assert-OracleStage3R7ExactRemovalTarget",
  "Get-PhysicalExactCertificateMatches",
  "Move-OracleStage3R7Lifecycle",
  "package-content-reconciliation.json",
  "Get-OracleStage3R7PackageZipInventory",
  "ConvertTo-OracleStage3R7CanonicalPackagePath",
  "--remote-debugging",
  "ownerAuthenticodeStatus",
  "untrusted-rejection.json",
  "tampered-rejection.json",
  "evidenceManifestSha256",
  "ExpectedTransferCustodySha256",
  "oracle.sprint-30-5.stage-3-r7-transfer-custody",
  "contract.transferMedium.hardwareSerial",
]) {
  assert.ok(harness.includes(required), `Harness contract missing: ${required}`);
}
for (const required of [
  "R6 root cause and direct-activation correction",
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
assert.equal(
  packageScripts["sprint-30-5:stage-3:r7:validate"],
  "node scripts/sprint-30-5/stage-3-r7/verify-preparation.mjs"
);
assert.equal(
  packageScripts["sprint-30-5:stage-3:r7:prepare-transfer"],
  "node scripts/sprint-30-5/stage-3-r7/prepare-transfer.mjs"
);
assert.equal(
  packageScripts["sprint-30-5:stage-3:r7:verify-return"],
  "node scripts/sprint-30-5/stage-3-r7/verify-return.mjs"
);
assert.equal(packageScripts["sprint-30-5:stage-3:r7:execute"], undefined);
for (const operation of ["validate", "rehearse", "prepare-transfer", "execute"]) {
  assert.equal(
    packageScripts[`sprint-30-5:stage-3:r6:${operation}`],
    undefined
  );
}
assert.equal(
  packageScripts["sprint-30-5:stage-3:r6:verify-return"],
  "node scripts/sprint-30-5/stage-3-r6/verify-return.mjs"
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
  "Stage 3 Qualification R7 Pre-Execution Gate",
  "Execution:** Blocked and unauthorised",
  "ExpectedHarnessCommit",
  "ExpectedTransferManifestSha256",
  "ExpectedTransferCustodySha256",
  "ExpectedHostContinuitySha256",
  "FOUNDER-AUTHORISED-STAGE3-R7-TRANSFER",
  "FOUNDER-AUTHORISED-STAGE3-R7-EXECUTION",
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
  /Create-only corrected Stage 3 R7 transfer; prior R6 and historical transfers remain immutable/u
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
assert.match(harness, /Get-OracleStage3R7InstalledSoftwareInventory/u);
assert.match(harness, /Get-OracleStage3R7PreAuthorityObservation[\s\S]*New-Item/u);
assert.ok(
  harness.indexOf("Get-OracleStage3R7PreAuthorityObservation") <
    harness.indexOf("[void](New-Item -ItemType Directory -Path $attemptRoot)"),
  "Pre-authority observation must complete before attempt creation."
);
assert.ok(
  harness.indexOf("$bootstrapManifestPath") <
    harness.indexOf(
      '. (Join-Path $scriptRoot "Oracle.Stage3R7IdentityPolicy.ps1")'
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
assert.match(processPolicy, /Get-OracleStage3R7RequiredProcessMember/u);
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
assert.match(preflightPolicy, /Test-OracleStage3R7ApplicationActivationApi/u);
assert.match(lifecyclePolicy, /Get-OracleStage3R7LifecyclePhases/u);
assert.match(preflightPolicy, /required Windows PowerShell 5\.1|Windows PowerShell 5\.1/u);
assert.match(preflightPolicy, /Test-OracleStage3R7ProcessIsElevated/u);
assert.match(preflightPolicy, /Machine-scoped AppX trust requires an elevated/u);
assert.match(preflightPolicy, /Get-OracleStage3R7InstalledSoftwareInventory/u);
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

const rehearsalResult = runPowerShellFixture(developmentRehearsalPath);
assert.equal(rehearsalResult.result, "passed");
assert.equal(rehearsalResult.failureInjectionCount, phaseAudit.phases.length);
assert.equal(rehearsalResult.authorityConsumed, false);
assert.equal(rehearsalResult.hostMutation, false);
assert.equal(rehearsalResult.qualificationEvidenceCreated, false);
assert.equal(rehearsalResult.archiveCreateOnlyPublication, true);
assert.equal(rehearsalResult.archiveSha256Verified, true);

const identityPolicyFixture = spawnSync(
  powershellExecutable,
  [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    join(import.meta.dirname, "Test-OracleStage3R7IdentityPolicy.ps1"),
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
    join(import.meta.dirname, "Oracle.Stage3R7Contract.json"),
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
assert.match(harness, /CycloneDX/u);
assert.match(harness, /CheckSignature\(\$true\)/u);
assert.match(harness, /Transfer payload inventory is missing, duplicate or unexpected/u);
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
  "oracle.sprint-30-5.stage-3-r7-host-continuity",
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
for (const revision of ["r1", "r2", "r3", "r4", "r5", "r6"]) {
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
  assert.match(text, /\bR6\b|R2[–-]R6/u);
  assert.match(text, /\bR7\b/u);
  assert.match(text, /Stage 3[\s\S]{0,600}execution/iu);
  assert.match(text, /Stage 3[\s\S]{0,600}(?:blocked|unauthorised)/iu);
}

assert.equal(contract.authority.preparation, "founder-authorised");
assert.equal(contract.authority.transfer, "not-authorised");
assert.equal(contract.authority.execution, "not-authorised");
assert.equal(contract.authority.stage4, "not-authorised");
assert.deepEqual(contract.revisionLineage, {
  currentLineage: "attempt-scoped-stage-3-qualification",
  legacyAbandonedDesignRoot:
    "docs/sprints/evidence/sprint-30-5/stage-3-revision-6-abandoned-design",
  relationship:
    "distinct-current-revision; legacy design is immutable, historical and non-operational",
});
assert.deepEqual(contract.correctionBasis, {
  predecessorRevision: "R6",
  predecessorAttemptOrdinal: 1,
  acceptedFailureEvidence: "immutable-founder-accepted",
  predecessorTransferId:
    "transfer-stage3-r6-20260730T183220092Z-f04b8c19",
  predecessorTransferManifestSha256:
    "498a600a22db1c8f7bafa2ecdd8224652d3eb10619baad2e8fc7358d0b465883",
  failedPhase: "registered-appx-launch",
  invalidAssertion: "explorer-process-exit-code-zero",
  establishedFacts: [
    "machine-trust-succeeded",
    "package-installation-succeeded",
    "windows-activation-recorded",
    "desktop-appx-container-created",
  ],
  requiredSemantics:
    "IApplicationActivationManager.ActivateApplication HRESULT plus strict native window observation",
});
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
assert.equal(contract.packageInventory.governedEntryCount, 2201);
assert.equal(contract.packageInventory.zipFileEntryCount, 2202);
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
assert.equal(contract.preAuthority.requiredPowerShellEdition, "Desktop");
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

console.log("Stage 3 R7 preparation validation passed.");
