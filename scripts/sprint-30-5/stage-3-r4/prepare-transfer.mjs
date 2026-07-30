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
  validateTransferIdentity,
  validateProcessEnvelope,
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
if (argumentsMap.get("founder-authority") !== "FOUNDER-AUTHORISED-STAGE3-R4-TRANSFER") {
  throw new Error("Separate Founder transfer authority is required.");
}
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

const stage2AttemptRoot = join(
  repositoryRoot,
  ".artifacts",
  "sprint-30-5",
  "stage-2-requalification-r2",
  contract.stage2.attemptId
);
const releaseRoot = join(stage2AttemptRoot, "release");
const evidenceRoot = join(stage2AttemptRoot, "evidence");
const archive = join(
  stage2AttemptRoot,
  "Oracle.Sprint30.5.Stage2RequalificationR2QualificationEvidence.zip"
);
const sources = [
  archive,
  join(releaseRoot, contract.package.fileName),
  join(releaseRoot, "oracle-release-manifest.json"),
  join(releaseRoot, "oracle-release-manifest.json.p7s"),
  join(releaseRoot, "oracle-0.1.1.cdx.json"),
  join(releaseRoot, "oracle-0.1.1.provenance.json"),
  join(releaseRoot, "package-content-inventory.json"),
  join(releaseRoot, "signature-and-trust-verification.json"),
  join(evidenceRoot, "Oracle.Stage2RequalificationR2EvidenceManifest.json"),
  join(evidenceRoot, "qualification-candidate.json"),
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
  join(import.meta.dirname, "Oracle.Stage3R4Contract.json"),
  join(import.meta.dirname, "Oracle.Stage3R4IdentityPolicy.ps1"),
  join(import.meta.dirname, "Oracle.Stage3R4PackageInventoryPolicy.ps1"),
  join(import.meta.dirname, "Get-OracleStage3R4HostContinuity.ps1"),
  join(import.meta.dirname, "Invoke-OracleStage3R4Qualification.ps1"),
  join(import.meta.dirname, "README.md"),
];
for (const source of sources) {
  if (!existsSync(source)) throw new Error(`Required R2 transfer source is missing: ${source}`);
}

const candidate = JSON.parse(
  readFileSync(join(evidenceRoot, "qualification-candidate.json"), "utf8")
);
const finalManifestPath = join(
  evidenceRoot,
  "Oracle.Stage2RequalificationR2EvidenceManifest.json"
);
const finalManifest = JSON.parse(readFileSync(finalManifestPath, "utf8"));
validateAcceptedBindings({
  attemptId: candidate.attemptId,
  authorityId: candidate.authorityId,
  candidateCommit: candidate.candidateCommit,
  candidateTree: candidate.sourceTree,
  finalEvidenceManifestSha256: sha256(finalManifestPath),
  archiveSha256: sha256(archive),
  msixSha256: sha256(join(releaseRoot, contract.package.fileName)),
  releaseManifestSha256: sha256(join(releaseRoot, "oracle-release-manifest.json")),
  certificateThumbprint: finalManifest.exactCertificateThumbprint,
});

mkdirSync(transferRoot);
const payloadRoot = join(transferRoot, "payload");
mkdirSync(payloadRoot);
for (const source of sources) {
  copyFileCreateOnly(source, join(payloadRoot, basename(source)));
}
const entries = inventory(
  transferRoot,
  sources.map((source) => join(payloadRoot, basename(source)))
);
const manifestPath = join(transferRoot, "Oracle.Stage3R4TransferManifest.json");
writeJsonAtomicCreateOnly(manifestPath, {
  schemaVersion: "1.0.0",
  contract: "oracle.sprint-30-5.stage-3-r4-transfer",
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
const custodyPath = join(transferRoot, "Oracle.Stage3R4TransferCustody.json");
writeJsonAtomicCreateOnly(custodyPath, {
  schemaVersion: "1.0.0",
  contract: "oracle.sprint-30-5.stage-3-r4-transfer-custody",
  transferId,
  recordedAtUtc: timestampUtc,
  operator: "Codex",
  founder: "Lee Wilson",
  authority: "Founder-authorised Stage 3 Qualification R4 corrective preparation",
  purpose:
    "Create-only corrective Stage 3 R4 transfer; R1, failed R2 and failed R3 remain immutable",
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
