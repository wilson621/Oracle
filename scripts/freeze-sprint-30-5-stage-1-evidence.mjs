import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const stageRoot = ".artifacts/sprint-30-5/stage-1";
const temporaryRoot = ".tmp-sprint-30-5-stage-1-freeze";
const packageRoot = path.join(temporaryRoot, "Oracle.Sprint30.5.Stage1Evidence");
const frozenRoot = path.join(stageRoot, "frozen");
const archivePath = path.join(
  frozenRoot,
  "Oracle.Sprint30.5.Stage1Evidence.zip"
);
const archiveHashPath = `${archivePath}.sha256.txt`;
const committedRecordPath =
  "docs/sprints/evidence/sprint-30-5/stage-1/generated/" +
  "stage-1-frozen-evidence.json";

const sources = [
  evidence(
    `${stageRoot}/Oracle.Stage1EvidenceKit.transfer-source.json`,
    "transfer/Oracle.Stage1EvidenceKit.transfer-source.json",
    "source-kit-provenance"
  ),
  evidence(
    `${stageRoot}/Oracle.Stage1EvidenceKit.zip.sha256.txt`,
    "transfer/Oracle.Stage1EvidenceKit.zip.sha256.txt",
    "source-kit-hash"
  ),
  evidence(
    `${stageRoot}/returned-evidence-output/Oracle.Stage1LaptopAddress.json`,
    "laptop/Oracle.Stage1LaptopAddress.json",
    "qualification-host-address"
  ),
  evidence(
    `${stageRoot}/returned-evidence-output/Oracle.Stage1LaptopAddress.json.sha256.txt`,
    "laptop/Oracle.Stage1LaptopAddress.json.sha256.txt",
    "qualification-host-address-hash"
  ),
  evidence(
    `${stageRoot}/returned-evidence-output/Oracle.Stage1EvidenceReturn.zip`,
    "laptop/Oracle.Stage1EvidenceReturn.zip",
    "original-return-archive"
  ),
  evidence(
    `${stageRoot}/returned-evidence-output/Oracle.Stage1EvidenceReturn.zip.sha256.txt`,
    "laptop/Oracle.Stage1EvidenceReturn.zip.sha256.txt",
    "original-return-archive-hash"
  ),
  ...[
    "artifact-transfer.json",
    "electron-gpu-admission.json",
    "electron-gpu-admission.json.sha256.txt",
    "laptop-route-admission.json",
    "laptop-route-admission.json.sha256.txt",
    "windows-baseline.json",
    "windows-baseline.json.sha256.txt",
    "Oracle.Stage1Cleanup.json",
    "Oracle.Stage1Cleanup.json.sha256.txt",
  ].map((name) =>
    evidence(
      `${stageRoot}/returned-evidence-output/${name}`,
      `laptop/evidence/${name}`,
      "returned-machine-evidence"
    )
  ),
  ...[
    "non-allowlisted-route.json",
    "non-allowlisted-route.json.sha256.txt",
    "firewall-stop.json",
    "firewall-stop.json.sha256.txt",
  ].map((name) =>
    evidence(
      `${stageRoot}/network/${name}`,
      `development-pc/network/${name}`,
      "network-isolation-evidence"
    )
  ),
  evidence(
    `${stageRoot}/firewall-query-final.json`,
    "development-pc/network/firewall-query-final.json",
    "firewall-allowlist-readback"
  ),
  evidence(
    `${stageRoot}/allowlist-proxy.log`,
    "development-pc/network/allowlist-proxy.log",
    "source-validating-relay-log"
  ),
  evidence(
    "docs/sprints/evidence/sprint-30-5/stage-1/generated/" +
      "environment-admission-revised.json",
    "assessment/environment-admission-revised.json",
    "environment-admission-assessment"
  ),
  evidence(
    "docs/sprints/evidence/sprint-30-5/stage-1/generated/" +
      "laptop-evidence-kit.json",
    "assessment/laptop-evidence-kit.json",
    "evidence-kit-provenance"
  ),
  evidence(
    "docs/sprints/evidence/sprint-30-5/stage-1/generated/" +
      "laptop-evidence-return-review.json",
    "assessment/laptop-evidence-return-review.json",
    "final-evidence-assessment"
  ),
];

if (fs.existsSync(archivePath) || fs.existsSync(archiveHashPath)) {
  throw new Error("The frozen Stage 1 evidence package already exists.");
}
for (const item of sources) {
  if (!fs.existsSync(item.source) || !fs.statSync(item.source).isFile()) {
    throw new Error(`Required Stage 1 evidence is missing: ${item.source}`);
  }
}

removeExact(temporaryRoot);
fs.mkdirSync(packageRoot, { recursive: true });
for (const item of sources) {
  const destination = path.join(packageRoot, item.target);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(item.source, destination);
}

const entries = sources
  .map((item) => ({
    path: item.target.replaceAll("\\", "/"),
    role: item.role,
    size: fs.statSync(item.source).size,
    sha256: fileHash(item.source),
  }))
  .sort((left, right) => left.path.localeCompare(right.path));
const packageManifest = {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-1-frozen-evidence-package",
  contractVersion: 1,
  frozenAt: new Date().toISOString(),
  stage: {
    milestone: "Sprint 30.5",
    number: 1,
    name: "Environment Admission",
    status: "founder-accepted-and-closed",
  },
  hostClassification:
    "controlled-non-pristine-physical-qualification-host",
  cleanWindowsQualificationSatisfied: false,
  cleanWindowsQualificationRequiredLater: true,
  technicalEvidenceComplete: true,
  cleanupComplete: true,
  stage2Started: false,
  preClosureHead: git(["rev-parse", "HEAD"]),
  branch: git(["branch", "--show-current"]),
  entries,
  authority: {
    production: "unchanged",
    deployment: "not-authorised",
    signing: "not-authorised",
    distribution: "not-authorised",
    remotePush: "not-authorised",
    gateC: "deferred",
    gate7: "not-authorised",
    stage2: "not-started-requires-founder-authorisation",
  },
  privacy: {
    rawPackageStorage: "workspace-local-ignored-artifact",
    committedRecordContainsRawMachineInventory: false,
  },
};
const packageManifestPath = path.join(packageRoot, "package-manifest.json");
fs.writeFileSync(
  packageManifestPath,
  `${JSON.stringify(packageManifest, null, 2)}\n`
);

fs.mkdirSync(frozenRoot, { recursive: true });
execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-Command",
    `Compress-Archive -LiteralPath '${escapePowerShell(
      packageRoot
    )}' -DestinationPath '${escapePowerShell(
      archivePath
    )}' -CompressionLevel Optimal`,
  ],
  { stdio: "inherit" }
);
const archiveSha256 = fileHash(archivePath);
fs.writeFileSync(
  archiveHashPath,
  `${archiveSha256}  ${path.basename(archivePath)}\n`
);

const committedRecord = {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-1-frozen-evidence",
  contractVersion: 1,
  frozenAt: packageManifest.frozenAt,
  status: "founder-accepted-and-closed",
  archive: {
    filename: path.basename(archivePath),
    sha256: archiveSha256,
    size: fs.statSync(archivePath).size,
    storage: "workspace-local-ignored-artifact",
  },
  packageManifestSha256: fileHash(packageManifestPath),
  evidenceEntries: entries.length,
  technicalEvidenceComplete: true,
  cleanupComplete: true,
  stage2Started: false,
  hostClassification: packageManifest.hostClassification,
  cleanWindowsQualificationSatisfied: false,
  cleanWindowsQualificationRequiredLater: true,
  rawMachineInventoryCommitted: false,
};
fs.writeFileSync(
  committedRecordPath,
  `${JSON.stringify(committedRecord, null, 2)}\n`
);
removeExact(temporaryRoot);

console.log(`Frozen Stage 1 evidence: ${path.resolve(archivePath)}`);
console.log(`SHA-256: ${archiveSha256}`);

function evidence(source, target, role) {
  return { source, target, role };
}

function fileHash(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function removeExact(entry) {
  const resolved = path.resolve(entry);
  const workspace = path.resolve(".");
  if (!resolved.startsWith(`${workspace}${path.sep}`)) {
    throw new Error(`Refusing to remove path outside workspace: ${resolved}`);
  }
  fs.rmSync(resolved, { recursive: true, force: true });
}

function escapePowerShell(value) {
  return path.resolve(value).replaceAll("'", "''");
}
