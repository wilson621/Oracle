import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  assertCreateOnlyDestination,
  assertOutsideHistoricalRoots,
  contract,
  copyFileCreateOnly,
  inventory,
  repositoryRoot,
  sha256,
  validateAcceptedBindings,
  validateCertificateWindow,
  validateTransferConstructionAuthority,
  validateTransferIdentity,
  validateProcessEnvelope,
  validateProgrammeIdentity,
  writeFileCreateOnly,
  writeJsonAtomicCreateOnly,
} from "./stage3-core.mjs";

const argumentsMap = parseArguments(process.argv.slice(2));
const gitExecutable = resolve(
  process.env.ProgramFiles ?? "C:\\Program Files",
  "Git",
  "cmd",
  "git.exe"
);
if (!existsSync(gitExecutable)) {
  throw new Error(`Required deterministic Git executable is missing: ${gitExecutable}`);
}
for (const name of [
  "founder-authority",
  "transfer-id",
  "timestamp-utc",
  "approved-root",
  "method",
  "medium-device",
  "medium-hardware-serial",
  "medium-filesystem",
  "medium-label",
  "medium-volume-serial",
  "expected-harness-commit",
]) {
  if (!argumentsMap.has(name)) throw new Error(`Missing --${name}.`);
}
validateProgrammeIdentity(contract.programmeIdentity);
const founderAuthority = validateTransferConstructionAuthority(
  argumentsMap.get("founder-authority")
);
for (const [argument, field] of [
  ["method", "method"],
  ["medium-device", "device"],
  ["medium-hardware-serial", "hardwareSerial"],
  ["medium-filesystem", "filesystem"],
  ["medium-label", "label"],
  ["medium-volume-serial", "volumeSerial"],
]) {
  if (argumentsMap.get(argument) !== contract.transferMedium[field]) {
    throw new Error(`Founder-approved transfer-medium identity differs: ${field}`);
  }
}

const transferId = argumentsMap.get("transfer-id");
const timestampUtc = argumentsMap.get("timestamp-utc");
validateTransferIdentity({ transferId, timestampUtc });
validateCertificateWindow(timestampUtc);
const harnessCommit = runGit(["rev-parse", "HEAD"]);
const harnessTree = runGit(["rev-parse", "HEAD^{tree}"]);
const branch = runGit(["branch", "--show-current"]);
const status = runGit(["status", "--porcelain=v1", "--untracked-files=all"]);
if (
  branch !== contract.requiredBranch ||
  status !== "" ||
  !/^[0-9a-f]{40}$/u.test(harnessCommit) ||
  !/^[0-9a-f]{40}$/u.test(harnessTree) ||
  harnessCommit !== argumentsMap.get("expected-harness-commit")
) {
  throw new Error("Stage 3 preparation repository identity is unsafe or differs.");
}
runGit([
  "merge-base",
  "--is-ancestor",
  contract.stage2.candidateCommit,
  harnessCommit,
]);

const approvedRoot = assertOutsideHistoricalRoots(resolve(argumentsMap.get("approved-root")));
const transferRoot = join(approvedRoot, transferId);
assertCreateOnlyDestination(transferRoot, approvedRoot);
if (!existsSync(approvedRoot)) {
  throw new Error("Approved transfer root must already exist.");
}

verifyImmutableHistoricalTransfer(approvedRoot, contract.preAuthorityEngineeringFailure);
verifyImmutableHistoricalTransfer(approvedRoot, contract.immutableReplacementOnlyTransfer);
verifyImmutableFailedContinuity(approvedRoot);

const stage2AttemptRoot = join(
  repositoryRoot,
  ".artifacts",
  "sprint-30-5",
  "stage-2-requalification-r6",
  contract.stage2.attemptId
);
const releaseRoot = join(stage2AttemptRoot, "release");
const evidenceRoot = join(stage2AttemptRoot, "evidence");
const archive = join(
  stage2AttemptRoot,
  "Oracle.Sprint30.5.Stage2RequalificationR6QualificationEvidence.zip"
);
const sources = [
  archive,
  join(releaseRoot, contract.package.fileName),
  join(releaseRoot, "oracle-release-manifest.json"),
  join(releaseRoot, "oracle-release-manifest.json.p7s"),
  join(releaseRoot, "oracle-0.1.4.cdx.json"),
  join(releaseRoot, "oracle-0.1.4.provenance.json"),
  join(releaseRoot, "package-content-inventory.json"),
  join(releaseRoot, "signature-and-trust-verification.json"),
  join(evidenceRoot, "runtime-configuration-build-secrecy.json"),
  join(evidenceRoot, "Oracle.Stage2RequalificationR6EvidenceManifest.json"),
  join(evidenceRoot, "qualification-candidate.json"),
  join(
    repositoryRoot,
    "docs", "sprints", "evidence", "sprint-30-5",
    "stage-2-requalification-r6",
    "Oracle.Stage2RequalificationR6AcceptedEvidenceIndex.json"
  ),
  join(
    repositoryRoot, "docs", "sprints",
    "SPRINT_30_5_STAGE_2_REQUALIFICATION_R6_CLOSURE.md"
  ),
  join(
    repositoryRoot,
    "docs",
    "sprints",
    "evidence",
    "sprint-30-5",
    "stage-3-host-admission",
    "returned-evidence-r2",
    contract.host.hostAdmissionFileName
  ),
  join(
    repositoryRoot,
    "docs", "sprints", "evidence", "sprint-30-5", "stage-3-r11",
    "Oracle.Stage3R11FailedEvidenceIndex.json"
  ),
  join(
    repositoryRoot,
    "docs", "sprints", "evidence", "sprint-30-5", "stage-3-r11",
    "Oracle.Stage3R11Evidence", "authorities",
    "authority-stage3-r11-20260803T175715661Z-84bf486c.json"
  ),
  join(
    repositoryRoot,
    "docs", "sprints", "evidence", "sprint-30-5", "stage-3-r11",
    "Oracle.Stage3R11Evidence", "stage3-r11-20260803T175715661Z-84bf486c",
    "evidence", "failure.json"
  ),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R11_FAILURE_CLOSURE.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R11_FAILED_ATTEMPT_ANALYSIS.md"),
  join(
    stage2AttemptRoot,
    "verification",
    "unpacked",
    "resources",
    "app",
    "dist-native",
    "Oracle.WindowDiscovery.exe"
  ),
  join(
    stage2AttemptRoot,
    "verification",
    "unpacked",
    "resources",
    "app",
    "dist-native",
    "Oracle.WindowObserver.exe"
  ),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_PLAN.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_QUALIFICATION_MISSION.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_PRE_AUTHORITY_FAILURE_CLOSURE.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_TRANSFER_INVENTORY_CORRECTION.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_REPLACEMENT_TRANSFER_VALIDATION_REPORT.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_REPLACEMENT_TRANSFER_COMPLETION.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_EXECUTION_ENABLED_MISSION.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_EXECUTION_ENABLED_VALIDATION_REPORT.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_ENGINEERING_CORRECTION.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_PREPARATION_VALIDATION_REPORT.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_PRE_EXECUTION_GATE.md"),
  join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_3_R12_ENGINEERING_CLOSURE.md"),  join(import.meta.dirname, "Oracle.Stage3R12Contract.json"),
  join(import.meta.dirname, "Oracle.Stage3R12ActivationPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12CertificateTrustPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12IdentityPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12InstalledSoftwarePolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12InstalledRuntimeConfigurationPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12LifecyclePolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12ObservationPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12PackageInventoryPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12PreflightPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12ProcessPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12TransferInventoryPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12WindowPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12WindowsExecutablePolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R12PhaseAudit.json"),
  join(import.meta.dirname, "Test-OracleStage3R12OptionalMemberAudit.ps1"),
  join(import.meta.dirname, "Test-OracleStage3R12InstalledRuntimeConfigurationPolicy.ps1"),
  join(import.meta.dirname, "Test-OracleStage3R12ObservationPolicy.ps1"),
  join(import.meta.dirname, "Test-OracleStage3R12TransferInventoryPolicy.ps1"),
  join(import.meta.dirname, "Test-OracleStage3R12ActivationPolicy.ps1"),
  join(import.meta.dirname, "Test-OracleStage3R12CertificateTrustPolicy.ps1"),
  join(import.meta.dirname, "Test-OracleStage3R12WindowPolicy.ps1"),
  join(import.meta.dirname, "Get-OracleStage3R12HostContinuity.ps1"),
  join(import.meta.dirname, "Invoke-OracleStage3R12PreAuthorityPreflight.ps1"),
  join(import.meta.dirname, "Invoke-OracleStage3R12Qualification.ps1"),
  join(import.meta.dirname, "README.md"),
];
for (const source of sources) {
  if (!existsSync(source)) throw new Error(`Required R12 transfer source is missing: ${source}`);
}
const plannedPayloadNames = [
  ...sources.map((source) => basename(source)),
  "Oracle.Stage3R12OptionalMemberAudit.json",
];
const plannedPayloadNameSet = new Set(
  plannedPayloadNames.map((name) => name.toLocaleLowerCase("en-US"))
);
if (plannedPayloadNameSet.size !== plannedPayloadNames.length) {
  throw new Error("Planned R12 transfer payload contains duplicate file names.");
}
for (const requiredFileName of contract.transferPayload.requiredFileNames) {
  if (!plannedPayloadNameSet.has(requiredFileName.toLocaleLowerCase("en-US"))) {
    throw new Error(`Planned R12 transfer omits required payload: ${requiredFileName}`);
  }
}

const failedEvidenceRoot = join(
  repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5", "stage-3-r11"
);
const failedEvidenceIndexPath = join(failedEvidenceRoot, "Oracle.Stage3R11FailedEvidenceIndex.json");
const failedAuthorityPath = join(failedEvidenceRoot, "Oracle.Stage3R11Evidence", "authorities", "authority-stage3-r11-20260803T175715661Z-84bf486c.json");
const failedAttemptRoot = join(failedEvidenceRoot, "Oracle.Stage3R11Evidence", "stage3-r11-20260803T175715661Z-84bf486c");
const failedRecordPath = join(failedAttemptRoot, "evidence", "failure.json");
const failedRuntimePath = join(failedAttemptRoot, "evidence", "runtime-observation.json");
const failedContinuityPath = join(failedAttemptRoot, "evidence", "Oracle.Stage3R11HostContinuity.json");
const failedEvidenceIndex = JSON.parse(readFileSync(failedEvidenceIndexPath, "utf8"));
const failedRecord = JSON.parse(readFileSync(failedRecordPath, "utf8"));
const failedAuthority = JSON.parse(readFileSync(failedAuthorityPath, "utf8"));
if (
  sha256(failedEvidenceIndexPath) !== contract.immutableFailedQualification.failedEvidenceIndexSha256 ||
  sha256(failedRecordPath) !== contract.immutableFailedQualification.failureSha256 ||
  sha256(failedAuthorityPath) !== contract.immutableFailedQualification.authoritySha256 ||
  sha256(failedRuntimePath) !== contract.immutableFailedQualification.runtimeObservationSha256 ||
  sha256(failedContinuityPath) !== contract.immutableFailedQualification.continuitySha256 ||
  failedEvidenceIndex.preservedFileCount !== 78 || failedEvidenceIndex.preservedBytes !== 123974 ||
  failedRecord.failure !== contract.immutableFailedQualification.mandatoryFailure ||
  failedRecord.completedLifecyclePhases.length !== 8 || failedAuthority.state !== "consumed"
) {
  throw new Error("Immutable R11 failed qualification binding differs.");
}

const candidate = JSON.parse(
  readFileSync(join(evidenceRoot, "qualification-candidate.json"), "utf8")
);
const finalManifestPath = join(
  evidenceRoot,
  "Oracle.Stage2RequalificationR6EvidenceManifest.json"
);
const finalManifest = JSON.parse(readFileSync(finalManifestPath, "utf8"));
validateAcceptedBindings({
  attemptId: candidate.attemptId,
  authorityId: candidate.authorityId,
  candidateCommit: candidate.candidateCommit,
  candidateTree: candidate.sourceTree,
  harnessCommit: candidate.harnessCommit,
  harnessTree: contract.stage2.harnessTree,
  closureCommit: contract.stage2.closureCommit,
  closureTree: contract.stage2.closureTree,
  acceptedEvidenceIndexSha256: sha256(join(
    repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5",
    "stage-2-requalification-r6",
    "Oracle.Stage2RequalificationR6AcceptedEvidenceIndex.json"
  )),
  finalEvidenceManifestSha256: sha256(finalManifestPath),
  archiveSha256: sha256(archive),
  msixSha256: sha256(join(releaseRoot, contract.package.fileName)),
  releaseManifestSha256: sha256(join(releaseRoot, "oracle-release-manifest.json")),
  releaseManifestSignatureSha256: sha256(join(releaseRoot, "oracle-release-manifest.json.p7s")),
  sbomSha256: sha256(join(releaseRoot, "oracle-0.1.4.cdx.json")),
  provenanceSha256: sha256(join(releaseRoot, "oracle-0.1.4.provenance.json")),
  certificateThumbprint: finalManifest.exactCertificateThumbprint,
});

mkdirSync(transferRoot);
const payloadRoot = join(transferRoot, "payload");
mkdirSync(payloadRoot);
for (const source of sources) {
  copyFileCreateOnly(source, join(payloadRoot, basename(source)));
}
const powershellExecutable = resolve(
  process.env.SystemRoot ?? "C:\\Windows",
  "System32",
  "WindowsPowerShell",
  "v1.0",
  "powershell.exe"
);
if (!existsSync(powershellExecutable)) {
  throw new Error(`Windows PowerShell 5.1 is missing: ${powershellExecutable}`);
}
const optionalMemberAuditResult = spawnSync(
  powershellExecutable,
  [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    join(import.meta.dirname, "Test-OracleStage3R12OptionalMemberAudit.ps1"),
  ],
  {
    encoding: "utf8",
    shell: false,
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  }
);
validateProcessEnvelope(optionalMemberAuditResult);
const optionalMemberAudit = JSON.parse(optionalMemberAuditResult.stdout);
if (
  optionalMemberAudit.disposition !== "passed" ||
  optionalMemberAudit.unclassifiedCount !== 0
) {
  throw new Error("R12 optional-member audit did not pass during transfer construction.");
}
const optionalMemberAuditPath = join(
  payloadRoot,
  "Oracle.Stage3R12OptionalMemberAudit.json"
);
writeFileCreateOnly(
  optionalMemberAuditPath,
  `${JSON.stringify(optionalMemberAudit, null, 2)}\n`
);
const payloadFiles = [
  ...sources.map((source) => join(payloadRoot, basename(source))),
  optionalMemberAuditPath,
];
const entries = inventory(
  transferRoot,
  payloadFiles
);
const manifestPath = join(transferRoot, "Oracle.Stage3R12TransferManifest.json");
writeJsonAtomicCreateOnly(manifestPath, {
  schemaVersion: "1.0.0",
  contract: "oracle.sprint-30-5.stage-3-r12-transfer",
  programmeIdentity: contract.programmeIdentity,
  revision: contract.revision,
  preparation: {
    branch,
    harnessCommit,
    harnessTree,
    oeomVersion: "1.0",
  },
  transferId,
  timestampUtc,
  method: argumentsMap.get("method"),
  transferMedium: contract.transferMedium,
  acceptedStage2: contract.stage2,
  immutableFailedQualification: contract.immutableFailedQualification,
  immutablePreAuthorityEngineeringFailure: contract.preAuthorityEngineeringFailure,
  immutableReplacementOnlyTransfer: contract.immutableReplacementOnlyTransfer,
  destinationHost: contract.host,
  privateKeyIncluded: false,
  productionCredentialIncluded: false,
  productSourceIncluded: false,
  payload: entries,
});
const manifestHash = sha256(manifestPath);
writeFileCreateOnly(
  `${manifestPath}.sha256.txt`,
  `${manifestHash}  ${basename(manifestPath)}\n`,
  "ascii"
);
const custodyPath = join(transferRoot, "Oracle.Stage3R12TransferCustody.json");
writeJsonAtomicCreateOnly(custodyPath, {
  schemaVersion: "1.0.0",
  contract: "oracle.sprint-30-5.stage-3-r12-transfer-custody",
  programmeIdentity: contract.programmeIdentity,
  revision: contract.revision,
  transferId,
  recordedAtUtc: timestampUtc,
  operator: "Codex",
  founder: "Lee Wilson",
  authority: founderAuthority,
  purpose:
    "Create-only replacement Stage 3 Requalification R12 transfer; the first R12 package and all historical transfers remain immutable",
  sourceRepository: {
    branch,
    harnessCommit,
    harnessTree,
  },
  destination: transferRoot,
  transferMedium: contract.transferMedium,
  manifest: {
    path: basename(manifestPath),
    size: readFileSync(manifestPath).length,
    sha256: manifestHash,
  },
  verification: {
    copiedBytesVerified: true,
    inventoryVerified: true,
    existingR1TransferModified: false,
    failedR2TransferModified: false,
    failedR3TransferModified: false,
    rejectedR10TransfersModified: false,
    previousR12PreAuthorityFailureModified: false,
    previousR12ReplacementOnlyTransferModified: false,
    previousR5TransferModified: false,
    previousR6TransferModified: false,
    previousR7TransferModified: false,
    historicalTransfersModified: false,
  },
});
const custodyHash = sha256(custodyPath);
writeFileCreateOnly(
  `${custodyPath}.sha256.txt`,
  `${custodyHash}  ${basename(custodyPath)}\n`,
  "ascii"
);
console.log(JSON.stringify({
  transferId,
  transferRoot,
  manifestHash,
  custodyPath,
  custodyHash,
}, null, 2));

function verifyImmutableHistoricalTransfer(approvedRoot, failure) {
  const failureRoot = join(approvedRoot, failure.transferId);
  const manifestPath = join(failureRoot, "Oracle.Stage3R12TransferManifest.json");
  const custodyPath = join(failureRoot, "Oracle.Stage3R12TransferCustody.json");
  if (
    !existsSync(manifestPath) ||
    !existsSync(custodyPath) ||
    sha256(manifestPath) !== failure.manifestSha256 ||
    sha256(custodyPath) !== failure.custodySha256
  ) {
    throw new Error("Immutable historical R12 transfer binding differs.");
  }

  const expectedRootNames = [
    "Oracle.Stage3R12TransferCustody.json",
    "Oracle.Stage3R12TransferCustody.json.sha256.txt",
    "Oracle.Stage3R12TransferManifest.json",
    "Oracle.Stage3R12TransferManifest.json.sha256.txt",
    "payload",
  ];
  const actualRootNames = readdirSync(failureRoot).sort();
  if (JSON.stringify(actualRootNames) !== JSON.stringify(expectedRootNames)) {
    throw new Error("Immutable historical R12 transfer root shape differs.");
  }
  if (
    readFileSync(`${manifestPath}.sha256.txt`, "ascii") !==
      `${failure.manifestSha256}  Oracle.Stage3R12TransferManifest.json\n` ||
    readFileSync(`${custodyPath}.sha256.txt`, "ascii") !==
      `${failure.custodySha256}  Oracle.Stage3R12TransferCustody.json\n`
  ) {
    throw new Error("Immutable historical R12 transfer hash sidecar differs.");
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const custody = JSON.parse(readFileSync(custodyPath, "utf8"));
  if (
    manifest.transferId !== failure.transferId ||
    custody.transferId !== failure.transferId ||
    manifest.preparation.harnessCommit !== failure.harnessCommit ||
    custody.sourceRepository.harnessCommit !== failure.harnessCommit ||
    (failure.harnessTree &&
      (manifest.preparation.harnessTree !== failure.harnessTree ||
        custody.sourceRepository.harnessTree !== failure.harnessTree)) ||
    !Array.isArray(manifest.payload) ||
    manifest.payload.length === 0
  ) {
    throw new Error("Immutable historical R12 transfer identity differs.");
  }
  const expectedPayloadNames = [];
  const payloadNameSet = new Set();
  let payloadBytes = 0;
  for (const entry of manifest.payload) {
    if (
      typeof entry.path !== "string" ||
      !/^payload\/[^/\\]+$/u.test(entry.path) ||
      typeof entry.sha256 !== "string" ||
      !/^[0-9a-f]{64}$/u.test(entry.sha256) ||
      !Number.isSafeInteger(entry.size) ||
      entry.size < 0
    ) {
      throw new Error("Immutable historical R12 manifest payload entry is malformed.");
    }
    const name = basename(entry.path);
    const canonicalName = name.toLocaleLowerCase("en-US");
    if (payloadNameSet.has(canonicalName)) {
      throw new Error("Immutable historical R12 manifest payload is duplicated.");
    }
    payloadNameSet.add(canonicalName);
    expectedPayloadNames.push(name);
    payloadBytes += entry.size;
    const path = join(failureRoot, "payload", name);
    const item = lstatSync(path);
    if (
      !item.isFile() ||
      item.isSymbolicLink() ||
      item.size !== entry.size ||
      sha256(path) !== entry.sha256
    ) {
      throw new Error(`Immutable historical R12 payload differs: ${entry.path}`);
    }
  }
  expectedPayloadNames.sort();
  const actualPayloadNames = readdirSync(join(failureRoot, "payload")).sort();
  if (JSON.stringify(actualPayloadNames) !== JSON.stringify(expectedPayloadNames)) {
    throw new Error("Immutable historical R12 payload directory differs from its manifest.");
  }
  if (
    (Number.isSafeInteger(failure.payloadFiles) &&
      expectedPayloadNames.length !== failure.payloadFiles) ||
    (Number.isSafeInteger(failure.payloadBytes) &&
      payloadBytes !== failure.payloadBytes)
  ) {
    throw new Error("Immutable historical R12 payload totals differ.");
  }

}

function verifyImmutableFailedContinuity(approvedRoot) {
  const failure = contract.preAuthorityEngineeringFailure;
  const continuityRoot = join(approvedRoot, "Oracle.Stage3R12Evidence");
  const continuityName = "Oracle.Stage3R12HostContinuity.json";
  if (
    JSON.stringify(readdirSync(continuityRoot).sort()) !==
      JSON.stringify([continuityName]) ||
    sha256(join(continuityRoot, continuityName)) !== failure.continuitySha256
  ) {
    throw new Error("Immutable first R12 failed continuity record differs.");
  }
}
function parseArguments(args) {
  const parsed = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || value === undefined || value.startsWith("--")) {
      throw new Error("Arguments must be supplied as --name value pairs.");
    }
    if (parsed.has(key.slice(2))) throw new Error(`Duplicate argument: ${key}`);
    parsed.set(key.slice(2), value);
  }
  return parsed;
}

function runGit(args) {
  const result = spawnSync(gitExecutable, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    shell: false,
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
  });
  validateProcessEnvelope(result);
  return result.stdout.trim();
}
