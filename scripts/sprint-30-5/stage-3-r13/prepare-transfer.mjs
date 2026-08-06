import { existsSync, mkdirSync, readFileSync } from "node:fs";
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
  validateProcessEnvelope,
  validateProgrammeIdentity,
  validateTransferConstructionAuthority,
  validateTransferIdentity,
  writeFileCreateOnly,
  writeJsonAtomicCreateOnly,
} from "./stage3-core.mjs";

const args = parseArguments(process.argv.slice(2));
for (const name of [
  "founder-authority", "transfer-id", "timestamp-utc", "approved-root",
  "method", "medium-device", "medium-hardware-serial", "medium-filesystem",
  "medium-label", "medium-volume-serial", "expected-harness-commit",
]) {
  if (!args.has(name)) throw new Error(`Missing --${name}.`);
}

validateProgrammeIdentity(contract.programmeIdentity);
validateTransferConstructionAuthority(args.get("founder-authority"));
if (contract.transferMedium.approvalState !== "founder-authorised-execution-enabled-mission") {
  throw new Error("R13 transfer medium is not approved for an execution-enabled mission.");
}
if (contract.authority.execution !== "founder-authorised") {
  throw new Error("R13 execution-enabled transfer construction requires an execution-authorised contract.");
}
if (
  contract.preparationState.transferCreationPermitted !== true ||
  contract.preparationState.maximumTransfers !== 1
) {
  throw new Error("R13 transfer limits do not admit exactly one create-only transfer.");
}

for (const [argument, field] of [
  ["method", "method"], ["medium-device", "device"],
  ["medium-hardware-serial", "hardwareSerial"], ["medium-filesystem", "filesystem"],
  ["medium-label", "label"], ["medium-volume-serial", "volumeSerial"],
]) {
  if (args.get(argument) !== contract.transferMedium[field]) {
    throw new Error(`Founder-approved transfer medium differs: ${field}`);
  }
}

const transferId = args.get("transfer-id");
const timestampUtc = args.get("timestamp-utc");
validateTransferIdentity({ transferId, timestampUtc });
validateCertificateWindow(timestampUtc);
validateAcceptedBindings(contract.stage2);

const git = resolve(process.env.ProgramFiles ?? "C:\\Program Files", "Git", "cmd", "git.exe");
if (!existsSync(git)) throw new Error("Git is required only on the engineering workstation.");
const runGit = (gitArgs) => {
  const result = spawnSync(git, gitArgs, {
    cwd: repositoryRoot, encoding: "utf8", shell: false, windowsHide: true,
  });
  validateProcessEnvelope(result);
  return result.stdout.trim();
};
const harnessCommit = runGit(["rev-parse", "HEAD"]);
const harnessTree = runGit(["rev-parse", "HEAD^{tree}"]);
if (
  runGit(["branch", "--show-current"]) !== contract.requiredBranch ||
  runGit(["status", "--porcelain=v1", "--untracked-files=all"]) !== "" ||
  harnessCommit !== args.get("expected-harness-commit")
) {
  throw new Error("Stage 3 R13 engineering repository identity is unsafe or differs.");
}
runGit(["merge-base", "--is-ancestor", contract.stage2.candidateCommit, harnessCommit]);

const freezeRoot = resolve(repositoryRoot, contract.stage2.engineeringFreezeRoot);
const releaseRoot = join(freezeRoot, "release");
const verificationRoot = join(freezeRoot, "verification");
const acceptedR8Root = join(
  repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5",
  "stage-2-requalification-r8", contract.stage2.attemptId
);
const stage2IndexRoot = join(
  repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5",
  "stage-2-requalification-r8"
);
const hostAdmissionRoot = join(
  repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5",
  "stage-3-host-admission", "returned-evidence-r2"
);
const harnessRoot = import.meta.dirname;

const sources = new Map();
const add = (destinationName, source) => {
  if (sources.has(destinationName.toLowerCase())) {
    throw new Error(`Duplicate planned payload name: ${destinationName}`);
  }
  if (!existsSync(source)) throw new Error(`Required R13 source is missing: ${source}`);
  sources.set(destinationName.toLowerCase(), { destinationName, source });
};

add(contract.package.fileName, join(releaseRoot, contract.package.fileName));
add(contract.package.publicCertificateFileName, join(releaseRoot, contract.package.publicCertificateFileName));
for (const name of [
  "oracle-release-manifest.json", "oracle-release-manifest.json.p7s",
  "oracle-0.1.6.cdx.json", "oracle-0.1.6.provenance.json",
  "package-content-inventory.json", "signature-and-trust-verification.json",
]) add(name, join(releaseRoot, name));
add("runtime-configuration-build-secrecy.json", join(verificationRoot, "runtime-configuration-build-secrecy.json"));
add("Oracle.WindowDiscovery.exe", join(verificationRoot, "unpacked", "resources", "app", "dist-native", "Oracle.WindowDiscovery.exe"));
add("Oracle.WindowObserver.exe", join(verificationRoot, "unpacked", "resources", "app", "dist-native", "Oracle.WindowObserver.exe"));
add("Oracle.Stage2RequalificationR8AcceptedEvidenceIndex.json", join(stage2IndexRoot, "Oracle.Stage2RequalificationR8AcceptedEvidenceIndex.json"));
add("SPRINT_30_5_STAGE_2_REQUALIFICATION_R8_CLOSURE.md", join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_2_REQUALIFICATION_R8_CLOSURE.md"));
add("final-evidence-manifest.json", join(acceptedR8Root, "final-evidence-manifest.json"));
add("qualification-outcome.json", join(acceptedR8Root, "evidence", "qualification-outcome.json"));
add("single-attempt-authority.json", join(acceptedR8Root, "single-attempt-authority.json"));
add("host-continuity.json", join(acceptedR8Root, "evidence", "host-continuity.json"));
add(contract.host.hostAdmissionFileName, join(hostAdmissionRoot, contract.host.hostAdmissionFileName));

for (const name of [
  "Get-OracleStage3R13HostContinuity.ps1",
  "Invoke-OracleStage3R13PreAuthorityPreflight.ps1",
  "Invoke-OracleStage3R13Qualification.ps1",
  "Oracle.Stage3R13Contract.json",
  "Oracle.Stage3R13ActivationPolicy.ps1",
  "Oracle.Stage3R13CertificateTrustPolicy.ps1",
  "Oracle.Stage3R13IdentityPolicy.ps1",
  "Oracle.Stage3R13InstalledSoftwarePolicy.ps1",
  "Oracle.Stage3R13InstalledRuntimeConfigurationPolicy.ps1",
  "Oracle.Stage3R13LifecyclePolicy.ps1",
  "Oracle.Stage3R13ObservationPolicy.ps1",
  "Oracle.Stage3R13PackageInventoryPolicy.ps1",
  "Oracle.Stage3R13PreflightPolicy.ps1",
  "Oracle.Stage3R13ProcessPolicy.ps1",
  "Oracle.Stage3R13TransferInventoryPolicy.ps1",
  "Oracle.Stage3R13WindowPolicy.ps1",
  "Oracle.Stage3R13WindowsExecutablePolicy.ps1",
  "Oracle.Stage3R13PhaseAudit.json",
  "Test-OracleStage3R13ActivationPolicy.ps1",
  "Test-OracleStage3R13CertificateTrustPolicy.ps1",
  "Test-OracleStage3R13InstalledRuntimeConfigurationPolicy.ps1",
  "Test-OracleStage3R13ObservationPolicy.ps1",
  "Test-OracleStage3R13OptionalMemberAudit.ps1",
  "Test-OracleStage3R13TransferInventoryPolicy.ps1",
  "Test-OracleStage3R13WindowPolicy.ps1",
  "README.md",
]) add(name, join(harnessRoot, name));

for (const required of contract.transferPayload.requiredFileNames) {
  if (!sources.has(required.toLowerCase()) && required !== "Oracle.Stage3R13OptionalMemberAudit.json") {
    throw new Error(`Planned R13 transfer omits required payload: ${required}`);
  }
}

const exactHashes = new Map([
  [contract.package.fileName, contract.stage2.msixSha256],
  [contract.package.publicCertificateFileName, contract.stage2.publicCertificateSha256],
  ["oracle-release-manifest.json", contract.stage2.releaseManifestSha256],
  ["oracle-release-manifest.json.p7s", contract.stage2.releaseManifestSignatureSha256],
  ["oracle-0.1.6.cdx.json", contract.stage2.sbomSha256],
  ["oracle-0.1.6.provenance.json", contract.stage2.provenanceSha256],
  ["package-content-inventory.json", contract.stage2.packageInventorySha256],
  ["signature-and-trust-verification.json", contract.stage2.signatureVerificationSha256],
  ["runtime-configuration-build-secrecy.json", contract.stage2.runtimeConfigurationBuildSecrecySha256],
  ["Oracle.Stage2RequalificationR8AcceptedEvidenceIndex.json", contract.stage2.acceptedEvidenceIndexSha256],
  ["SPRINT_30_5_STAGE_2_REQUALIFICATION_R8_CLOSURE.md", contract.stage2.closureSha256],
  ["final-evidence-manifest.json", contract.stage2.finalEvidenceManifestSha256],
  ["qualification-outcome.json", contract.stage2.qualificationOutcomeSha256],
  ["single-attempt-authority.json", contract.stage2.authoritySha256],
  ["host-continuity.json", contract.stage2.hostContinuitySha256],
]);
for (const [name, expected] of exactHashes) {
  if (sha256(sources.get(name.toLowerCase()).source) !== expected) {
    throw new Error(`Immutable R8 source differs: ${name}`);
  }
}

const approvedRoot = assertOutsideHistoricalRoots(resolve(args.get("approved-root")));
if (!existsSync(approvedRoot)) throw new Error("Approved transfer root must already exist.");
const transferRoot = join(approvedRoot, transferId);
assertCreateOnlyDestination(transferRoot, approvedRoot);
mkdirSync(transferRoot);
const payloadRoot = join(transferRoot, "payload");
mkdirSync(payloadRoot);
for (const { destinationName, source } of sources.values()) {
  copyFileCreateOnly(source, join(payloadRoot, destinationName));
}

const powershell = resolve(process.env.SystemRoot ?? "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
const auditRun = spawnSync(powershell, [
  "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
  "-File", join(harnessRoot, "Test-OracleStage3R13OptionalMemberAudit.ps1"),
], { cwd: repositoryRoot, encoding: "utf8", shell: false, windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
validateProcessEnvelope(auditRun);
const audit = JSON.parse(auditRun.stdout);
if (audit.disposition !== "passed" || audit.unclassifiedCount !== 0) {
  throw new Error("R13 optional-member audit did not pass.");
}
const auditPath = join(payloadRoot, "Oracle.Stage3R13OptionalMemberAudit.json");
writeFileCreateOnly(auditPath, `${JSON.stringify(audit, null, 2)}\n`);

const payloadFiles = [...sources.values()].map(({ destinationName }) => join(payloadRoot, destinationName));
payloadFiles.push(auditPath);
const entries = inventory(transferRoot, payloadFiles);
const manifestPath = join(transferRoot, "Oracle.Stage3R13TransferManifest.json");
writeJsonAtomicCreateOnly(manifestPath, {
  schemaVersion: "1.0.0",
  contract: "oracle.sprint-30-5.stage-3-r13-transfer",
  programmeIdentity: contract.programmeIdentity,
  revision: contract.revision,
  preparation: {
    branch: contract.requiredBranch,
    harnessCommit,
    harnessTree,
    oeomVersion: "1.0",
  },
  transferId,
  timestampUtc,
  method: args.get("method"),
  executionAuthorisation: contract.authority.execution,
  transferMedium: contract.transferMedium,
  acceptedStage2: contract.stage2,
  acceptedHistoricalStage3: contract.acceptedHistoricalStage3,
  destinationHost: contract.host,
  cleanHost: {
    deviceName: contract.host.deviceName,
    repositoryPermitted: false,
    developmentToolInstallationPermitted: false,
    prohibitedDependencies: contract.host.prohibitedDependencies,
  },
  privateKeyIncluded: false,
  productionCredentialIncluded: false,
  productSourceIncluded: false,
  inventoryAuthority: contract.transferPayload.inventoryAuthority,
  payload: entries,
});
const manifestSha256 = sha256(manifestPath);
writeFileCreateOnly(
  `${manifestPath}.sha256.txt`,
  `${manifestSha256}  ${basename(manifestPath)}\n`,
  "ascii"
);
const custodyPath = join(transferRoot, "Oracle.Stage3R13TransferCustody.json");
writeJsonAtomicCreateOnly(custodyPath, {
  schemaVersion: "1.0.0",
  contract: "oracle.sprint-30-5.stage-3-r13-transfer-custody",
  programmeIdentity: contract.programmeIdentity,
  revision: contract.revision,
  transferId,
  recordedAtUtc: timestampUtc,
  operator: "Codex",
  founder: "Lee Wilson",
  authority: args.get("founder-authority"),
  purpose: "Create-only Stage 3 R13 transfer for the exact accepted R8 candidate and clean qualification host",
  sourceRepository: {
    branch: contract.requiredBranch,
    harnessCommit,
    harnessTree,
  },
  destination: transferRoot,
  transferMedium: contract.transferMedium,
  manifest: {
    path: basename(manifestPath),
    size: readFileSync(manifestPath).length,
    sha256: manifestSha256,
  },
  verification: {
    copiedBytesVerified: true,
    inventoryVerified: true,
    acceptedR8EvidenceModified: false,
    acceptedR12EvidenceModified: false,
    historicalTransfersModified: false,
  },
  state: "prepared-create-only-awaiting-independent-verification",
});
const custodySha256 = sha256(custodyPath);
writeFileCreateOnly(
  `${custodyPath}.sha256.txt`,
  `${custodySha256}  ${basename(custodyPath)}\n`,
  "ascii"
);
console.log(JSON.stringify({
  result: "prepared",
  transferId,
  transferRoot,
  manifestSha256,
  custodyPath,
  custodySha256,
}, null, 2));

function parseArguments(values) {
  const parsed = new Map();
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    if (!key?.startsWith("--") || values[index + 1] === undefined) throw new Error("Arguments must be --name value pairs.");
    parsed.set(key.slice(2), values[index + 1]);
  }
  return parsed;
}