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
  validateTransferConstructionAuthority,
  validateTransferIdentity,
  writeJsonAtomicCreateOnly,
} from "./stage3-core.mjs";

const expected = {
  attemptId: "r4-20260803T115002258Z-31ab0bf6",
  authorityId: "authority-r4-20260803T115002258Z-31ab0bf6",
  candidateCommit: "f7203f9b602b182a2bd006bc3cff3113b839be8e",
  candidateTree: "5d7eca4c012874df0b839533dfab283b54778661",
  harnessCommit: "a31c2897dd063e8e995e558cd83ecd188b8392ff",
  harnessTree: "ec0dc354553b6be38daaee4cd2383e325bd94837",
  closureCommit: "9a180ad7452df3e800f09615283587e3679e83c0",
  closureTree: "00e38d83769a46571ce659e002a0f4b8a22da147",
  acceptedEvidenceIndexSha256:
    "a8231570ff07337df16d84a1b5398072c308b2b29dba273a2b872df17263fd91",
  finalEvidenceManifestSha256:
    "876be1c0342c7dc9f70965faa3daffe0c9c1d8d7a3e2c41b144155350557784d",
  archiveSha256:
    "3f1f11dd04ddbc3b4eb51db344f71c12252cc7e41e8ae072950d3a74c1452495",
  msixSha256:
    "8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5",
  releaseManifestSha256:
    "be26608410c26af2ef1d784949d2fa7c2af874de41ab1e13968da85c3372e7e7",
  releaseManifestSignatureSha256:
    "3f4c1aab2eb0a5ab22e7455347ff9d59af523fd6424e59a638399383fdb19bf0",
  sbomSha256:
    "0b3627e41b252a3065a7199593fcc20a08f073bb9aa466b4feded16d3fc5a1b3",
  provenanceSha256:
    "3a29a893780b569b39fdaa0e355ebde2514e6465eb6f62b040e84ebb820e5392",
  certificateThumbprint: "03BEFBF303751D3DC14DF3FA224EB6BC5A6E4222",
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
  "stage-2-requalification-r4",
  contract.stage2.attemptId
);
const acceptedEvidenceRoot = join(acceptedAttemptRoot, "evidence");
const acceptedReleaseRoot = join(acceptedAttemptRoot, "release");
assert.equal(
  sha256(
    join(
      acceptedAttemptRoot,
      "Oracle.Sprint30.5.Stage2RequalificationR4QualificationEvidence.zip"
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
assert.equal(sha256(join(acceptedReleaseRoot, "oracle-0.1.2.cdx.json")), expected.sbomSha256);
assert.equal(
  sha256(join(acceptedReleaseRoot, "oracle-0.1.2.provenance.json")),
  expected.provenanceSha256
);
assert.equal(
  sha256(join(repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5",
    "stage-2-requalification-r4",
    "Oracle.Stage2RequalificationR4AcceptedEvidenceIndex.json")),
  expected.acceptedEvidenceIndexSha256
);
assert.equal(
  sha256(
    join(
      acceptedEvidenceRoot,
      "Oracle.Stage2RequalificationR4EvidenceManifest.json"
    )
  ),
  expected.finalEvidenceManifestSha256
);

const timestampUtc = "2026-07-28T22:30:45.123Z";
validateExecutionIdentity({
  authorityId: "authority-stage3-r10-20260728T223045123Z-a1b2c3d4",
  attemptId: "stage3-r10-20260728T223045123Z-a1b2c3d4",
  timestampUtc,
});
for (const invalid of [
  {
    authorityId: "authority-stage3-r10-20260728T223045123Z-a1b2c3d4",
    attemptId: "stage3-r10-20260728T223045123Z-ffffffff",
    timestampUtc,
  },
  {
    authorityId: "authority-stage3-r10-20260728T223045123Z-a1b2c3d4",
    attemptId: "stage3-r10-20260728T223045123Z-a1b2c3d4",
    timestampUtc: "2026-07-28T22:30:45.124Z",
  },
]) {
  assert.throws(() => validateExecutionIdentity(invalid));
}
validateTransferIdentity({
  transferId: "transfer-stage3-r10-20260728T223045123Z-a1b2c3d4",
  timestampUtc,
});
assert.equal(
  validateTransferConstructionAuthority("FOUNDER-AUTHORISED-STAGE3-R10-TRANSFER"),
  "FOUNDER-AUTHORISED-STAGE3-R10-TRANSFER"
);
for (const invalidAuthority of [
  undefined,
  "",
  "Founder-authorised Stage 3 Qualification R10 corrective preparation",
  "FOUNDER-AUTHORISED-STAGE3-R10-EXECUTION",
]) {
  assert.throws(
    () => validateTransferConstructionAuthority(invalidAuthority),
    /Separate Founder transfer authority is required/u
  );
}

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
  ".tmp-stage3-r10-validation",
  `fixture-${randomBytes(8).toString("hex")}`
);
mkdirSync(temporaryRoot, { recursive: true });
try {
  const publication = join(temporaryRoot, "evidence.json");
  writeJsonAtomicCreateOnly(publication, { result: "fixture" });
  assert.ok(existsSync(publication));
  assert.throws(() => writeJsonAtomicCreateOnly(publication, { result: "replacement" }));
  assert.throws(() => assertCreateOnlyDestination(publication, temporaryRoot));

  const fixtureAttemptId = "stage3-r10-20260728T223045123Z-a1b2c3d4";
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
      contract: "oracle.sprint-30-5.stage-3-r10-evidence-manifest",
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
      contract: "oracle.sprint-30-5.stage-3-r10-lifecycle",
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
      "Compress-Archive -LiteralPath $env:ORACLE_R10_FIXTURE_SOURCE -DestinationPath $env:ORACLE_R10_FIXTURE_DESTINATION",
    ],
    {
      encoding: "utf8",
      shell: false,
      env: {
        ...process.env,
        ORACLE_R10_FIXTURE_SOURCE: fixtureAttemptRoot,
        ORACLE_R10_FIXTURE_DESTINATION: returnedArchive,
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
      contract: "oracle.sprint-30-5.stage-3-r10-archive-manifest",
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
  const parent = join(repositoryRoot, ".tmp-stage3-r10-validation");
  if (existsSync(parent)) rmSync(parent, { recursive: true, force: true });
}

const harness = readFileSync(
  join(import.meta.dirname, "Invoke-OracleStage3R10Qualification.ps1"),
  "utf8"
);
const preAuthorityPreflight = readFileSync(
  join(import.meta.dirname, "Invoke-OracleStage3R10PreAuthorityPreflight.ps1"),
  "utf8"
);
const transferBuilder = readFileSync(
  join(import.meta.dirname, "prepare-transfer.mjs"),
  "utf8"
);
const continuityCollector = readFileSync(
  join(import.meta.dirname, "Get-OracleStage3R10HostContinuity.ps1"),
  "utf8"
);
const identityPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10IdentityPolicy.ps1"),
  "utf8"
);
const activationPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10ActivationPolicy.ps1"),
  "utf8"
);
const certificateTrustPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10CertificateTrustPolicy.ps1"),
  "utf8"
);
const packageInventoryPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10PackageInventoryPolicy.ps1"),
  "utf8"
);
const installedSoftwarePolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10InstalledSoftwarePolicy.ps1"),
  "utf8"
);
const installedRuntimeConfigurationPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10InstalledRuntimeConfigurationPolicy.ps1"),
  "utf8"
);
const lifecyclePolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10LifecyclePolicy.ps1"),
  "utf8"
);
const observationPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10ObservationPolicy.ps1"),
  "utf8"
);
const preflightPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10PreflightPolicy.ps1"),
  "utf8"
);
const processPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10ProcessPolicy.ps1"),
  "utf8"
);
const windowPolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10WindowPolicy.ps1"),
  "utf8"
);
const windowsExecutablePolicy = readFileSync(
  join(import.meta.dirname, "Oracle.Stage3R10WindowsExecutablePolicy.ps1"),
  "utf8"
);
const preAuthorityProbe = readFileSync(
  join(import.meta.dirname, "Invoke-OracleStage3R10PreAuthorityPreflight.ps1"),
  "utf8"
);
const developmentRehearsalPath = join(
  import.meta.dirname,
  "Invoke-OracleStage3R10DevelopmentRehearsal.ps1"
);
const installedSoftwareFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10InstalledSoftwarePolicy.ps1"
);
const lifecycleFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10LifecyclePolicy.ps1"
);
const installedRuntimeConfigurationFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10InstalledRuntimeConfigurationPolicy.ps1"
);
const hostShapeFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10HostShapeFixtures.ps1"
);
const optionalMemberAuditPath = join(
  import.meta.dirname,
  "Test-OracleStage3R10OptionalMemberAudit.ps1"
);
const processFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10ProcessPolicy.ps1"
);
const windowFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10WindowPolicy.ps1"
);
const observationFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10ObservationPolicy.ps1"
);
const certificateTrustFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10CertificateTrustPolicy.ps1"
);
const activationFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10ActivationPolicy.ps1"
);
const windowsExecutableFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10WindowsExecutablePolicy.ps1"
);
const developmentPlatformFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10DevelopmentPlatformCompatibility.ps1"
);
const phaseAudit = JSON.parse(
  readFileSync(join(import.meta.dirname, "Oracle.Stage3R10PhaseAudit.json"), "utf8")
);
const packageInventoryFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10PackageInventoryPolicy.ps1"
);
const scriptPathFixturePath = join(
  import.meta.dirname,
  "Test-OracleStage3R10ScriptPath.ps1"
);
const preExecutionGate = readFileSync(
  join(
    repositoryRoot,
    "docs",
    "sprints",
    "SPRINT_30_5_STAGE_3_R10_PRE_EXECUTION_GATE.md"
  ),
  "utf8"
);
const preparationValidationReport = readFileSync(
  join(
    repositoryRoot,
    "docs",
    "sprints",
    "SPRINT_30_5_STAGE_3_R10_PREPARATION_VALIDATION_REPORT.md"
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
assert.match(transferBuilder, /Get-OracleStage3R10HostContinuity\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10IdentityPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10ActivationPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10CertificateTrustPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10InstalledSoftwarePolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10LifecyclePolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10ObservationPolicy\.ps1/u);
assert.match(transferBuilder, /Test-OracleStage3R10ObservationPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10PackageInventoryPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10PreflightPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10ProcessPolicy\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10WindowPolicy\.ps1/u);
assert.match(transferBuilder, /Test-OracleStage3R10WindowPolicy\.ps1/u);
assert.match(harness, /Oracle\.Stage3R10WindowPolicy\.ps1/u);
assert.match(harness, /Oracle\.Stage3R10ObservationPolicy\.ps1/u);
assert.match(harness, /Invoke-OracleStage3R10CompleteStableObservation/u);
assert.doesNotMatch(harness, /\$stableUntil/u);
assert.doesNotMatch(harness, /\$samples\.Count\s+-lt/u);
assert.match(observationPolicy, /Diagnostics\.Stopwatch/u);
assert.match(observationPolicy, /measuredDurationMilliseconds/u);
assert.match(transferBuilder, /Oracle\.Stage3R10WindowsExecutablePolicy\.ps1/u);
assert.match(transferBuilder, /Invoke-OracleStage3R10PreAuthorityPreflight\.ps1/u);
assert.match(transferBuilder, /Oracle\.Stage3R10OptionalMemberAudit\.json/u);
assert.match(transferBuilder, /Test-OracleStage3R10ActivationPolicy\.ps1/u);
assert.match(harness, /"Test-OracleStage3R10ActivationPolicy\.ps1"/u);
assert.match(transferBuilder, /Oracle\.Stage3R10PhaseAudit\.json/u);
assert.match(transferBuilder, /Oracle\.Stage3R10TransferCustody\.json/u);
assert.match(transferBuilder, /authority:\s*founderAuthority,/u);
for (const admissionSource of [preAuthorityPreflight, harness]) {
  assert.match(
    admissionSource,
    /\[string\]\$custody\.authority[ \t]+-cne[ \t]*\r?\n[ \t]+"FOUNDER-AUTHORISED-STAGE3-R10-TRANSFER"/u
  );
}
assert.doesNotMatch(
  transferBuilder,
  /authority:\s*["']Founder-authorised Stage 3 Qualification R10 corrective preparation["']/u
);
assert.match(transferBuilder, /failedR2TransferModified: false/u);
assert.match(transferBuilder, /failedR3TransferModified: false/u);
assert.match(transferBuilder, /failedR4TransferModified: false/u);
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
  "FOUNDER-AUTHORISED-STAGE3-R10-EXECUTION",
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
  "Get-OracleStage3R10InstalledSoftwareInventory",
  "Get-OracleStage3R10PreAuthorityObservation",
  "ConvertFrom-OracleStage3R10WindowDiscoveryJson",
  "Assert-OracleStage3R10ProcessPackageOwnership",
  "Invoke-OracleStage3R10ApplicationActivation",
  "Assert-OracleStage3R10ApplicationActivationSucceeded",
  "initial-activation.json",
  "repair-activation.json",
  "Get-OracleStage3R10TrustImportArguments",
  "Get-OracleStage3R10TrustRemovalArguments",
  "Assert-OracleStage3R10TemporaryTrustState",
  "Assert-OracleStage3R10ExactRemovalTarget",
  "Get-PhysicalExactCertificateMatches",
  "Move-OracleStage3R10Lifecycle",
  "package-content-reconciliation.json",
  "Get-OracleStage3R10PackageZipInventory",
  "ConvertTo-OracleStage3R10CanonicalPackagePath",
  "--remote-debugging",
  "ownerAuthenticodeStatus",
  "untrusted-rejection.json",
  "tampered-rejection.json",
  "evidenceManifestSha256",
  "ExpectedTransferCustodySha256",
  "oracle.sprint-30-5.stage-3-r10-transfer-custody",
  "contract.transferMedium.hardwareSerial",
  "FOUNDER-AUTHORISED-STAGE3-R10-TRANSFER",
]) {
  assert.ok(harness.includes(required), `Harness contract missing: ${required}`);
}
assert.match(windowPolicy, /GetPackageFamilyName/u);
assert.match(windowPolicy, /ProcessQueryLimitedInformation/u);
assert.match(windowPolicy, /NativeErrorCode\s+-ne\s+87/u);
assert.match(windowPolicy, /Test-OracleStage3R10ProcessExists/u);
assert.match(windowPolicy, /StringComparer\]::OrdinalIgnoreCase/u);
assert.doesNotMatch(
  harness,
  /Path\.StartsWith\(\s*\$package\[0\]\.InstallLocation/u
);
for (const required of [
  "Accepted Stage 2 R4 binding and immutable rehash",
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
assert.equal(
  packageScripts["sprint-30-5:stage-3:r10:validate"],
  "node scripts/sprint-30-5/stage-3-r10/verify-preparation.mjs"
);
assert.equal(
  packageScripts["sprint-30-5:stage-3:r10:prepare-transfer"],
  "node scripts/sprint-30-5/stage-3-r10/prepare-transfer.mjs"
);
assert.equal(
  packageScripts["sprint-30-5:stage-3:r10:verify-return"],
  "node scripts/sprint-30-5/stage-3-r10/verify-return.mjs"
);
assert.equal(packageScripts["sprint-30-5:stage-3:r10:execute"], undefined);
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
  "Stage 3 Requalification R10 Pre-Execution Gate",
  "Execution:** Blocked and unauthorised",
  "ExpectedHarnessCommit",
  "ExpectedTransferManifestSha256",
  "ExpectedTransferCustodySha256",
  "ExpectedHostContinuitySha256",
  "FOUNDER-AUTHORISED-STAGE3-R10-TRANSFER",
  "FOUNDER-AUTHORISED-STAGE3-R10-EXECUTION",
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
  /Create-only Stage 3 Requalification R10 transfer; R1-R9 and all historical transfers remain immutable/u
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
assert.match(harness, /Get-OracleStage3R10InstalledSoftwareInventory/u);
assert.match(harness, /Get-OracleStage3R10PreAuthorityObservation[\s\S]*New-Item/u);
assert.ok(
  harness.indexOf("Get-OracleStage3R10PreAuthorityObservation") <
    harness.indexOf("[void](New-Item -ItemType Directory -Path $attemptRoot)"),
  "Pre-authority observation must complete before attempt creation."
);
assert.ok(
  harness.indexOf("$bootstrapManifestPath") <
    harness.indexOf(
      '. (Join-Path $scriptRoot "Oracle.Stage3R10IdentityPolicy.ps1")'
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
assert.match(processPolicy, /Get-OracleStage3R10RequiredProcessMember/u);
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
assert.match(preflightPolicy, /Test-OracleStage3R10ApplicationActivationApi/u);
assert.match(lifecyclePolicy, /Get-OracleStage3R10LifecyclePhases/u);
assert.match(preflightPolicy, /required Windows PowerShell 5\.1|Windows PowerShell 5\.1/u);
assert.match(preflightPolicy, /Test-OracleStage3R10ProcessIsElevated/u);
assert.match(preflightPolicy, /Machine-scoped AppX trust requires an elevated/u);
assert.match(preflightPolicy, /Get-OracleStage3R10InstalledSoftwareInventory/u);
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
    "Oracle.Stage3R10WindowPolicy.ps1"
  )
);
assert.ok(
  rehearsalResult.realPoliciesExercised.includes(
    "Oracle.Stage3R10ObservationPolicy.ps1"
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

const identityPolicyFixture = spawnSync(
  powershellExecutable,
  [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    join(import.meta.dirname, "Test-OracleStage3R10IdentityPolicy.ps1"),
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
    join(import.meta.dirname, "Oracle.Stage3R10Contract.json"),
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
assert.match(preflightPolicy, /ambientVariableMatches = 0/u);
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
  "oracle.sprint-30-5.stage-3-r10-host-continuity",
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
  assert.match(text, /\bR10\b/u);
  assert.match(text, /Stage 3[\s\S]{0,600}execution/iu);
  assert.match(text, /Stage 3[\s\S]{0,600}(?:blocked|unauthorised)/iu);
}

assert.equal(contract.authority.preparation, "founder-authorised");
assert.equal(contract.authority.transfer, "not-authorised");
assert.equal(contract.authority.execution, "not-authorised");
assert.equal(contract.authority.stage4, "not-authorised");
assert.equal(contract.transferMedium.approvalState, "requires-separate-founder-transfer-decision");
assert.deepEqual(contract.revisionLineage, {
  currentLineage: "attempt-scoped-stage-3-requalification",
  historicalQualifiedRevision: "R9",
  relationship:
    "R9 remains immutable historical qualification; R10 requalifies only the accepted Stage 2 R4 candidate",
});
assert.deepEqual(contract.correctionBasis, {
  basis: "accepted-stage-2-r4-product-baseline-change",
  historicalStage3Revision: "R9",
  historicalStage3Status: "founder-accepted-formally-closed-immutable",
  requiredSemantics:
    "repeat the complete clean Windows package lifecycle against the accepted ADR-048 R4 MSIX, including attempt-scoped runtime configuration for initial and post-reset activation",
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
assert.equal(contract.packageInventory.governedEntryCount, 2026);
assert.equal(contract.packageInventory.zipFileEntryCount, 2027);
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
assert.ok(
  !contract.historicalProtectedRoots.includes(contract.output.transferBase)
);
assert.ok(
  !contract.historicalProtectedRoots.includes(contract.output.repositoryEvidenceBase)
);
assert.doesNotThrow(() => assertOutsideHistoricalRoots(
  join(repositoryRoot, contract.output.transferBase, "transfer-stage3-r10-20260728T223045123Z-a1b2c3d4")
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

console.log("Stage 3 R10 preparation validation passed.");
