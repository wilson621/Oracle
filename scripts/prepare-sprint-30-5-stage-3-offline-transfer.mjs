import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

retireHistoricalEntryPoint();

const root = resolve(import.meta.dirname, "..");
const sourceArchive = join(
  root,
  ".artifacts",
  "sprint-30-5",
  "stage-2",
  "Oracle.Sprint30.5.Stage2QualificationEvidence.zip"
);
const kitSource = join(
  root,
  "scripts",
  "sprint-30-5",
  "stage-3-qualification"
);
const transferRoot = join(
  root,
  ".artifacts",
  "sprint-30-5",
  "stage-3",
  "offline-transfer"
);
const kitDestination = join(transferRoot, "stage-3-qualification-kit");
const archiveDestination = join(
  transferRoot,
  "Oracle.Sprint30.5.Stage2QualificationEvidence.zip"
);
const expectedArchiveSha256 =
  "8c20f6da7f0262ed4ef9a3a59c6a027ba3d64cb66c4e646b1f5d075da369f876";
const approvedKitFiles = [
  "Invoke-OracleStage3Qualification.ps1",
  "Oracle.Stage3QualificationContract.json",
  "README.txt",
];

assert.equal(sha256(sourceArchive), expectedArchiveSha256);
assertWorkspacePath(transferRoot);
rmSync(transferRoot, { recursive: true, force: true });
mkdirSync(kitDestination, { recursive: true });
copyFileSync(sourceArchive, archiveDestination);

for (const filename of approvedKitFiles) {
  copyFileSync(join(kitSource, filename), join(kitDestination, filename));
}

const kitEntries = approvedKitFiles.map((filename) => {
  const path = join(kitDestination, filename);
  return {
    relativePath: filename,
    sha256: sha256(path),
    size: statSync(path).size,
  };
});
const kitManifestPath = join(
  kitDestination,
  "Oracle.Stage3QualificationKit.manifest.json"
);
writeJson(kitManifestPath, {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-3-qualification-kit-manifest",
  contractVersion: 1,
  host: "Founder-QA-01",
  runtimeRequirements: ["Windows PowerShell 5.1", "Windows 11 x64"],
  forbiddenDependencies: [
    "Node.js",
    "Git",
    "compiler",
    "SDK",
    "development server",
    "Oracle source",
  ],
  files: kitEntries,
  authority: {
    stage3Only: true,
    stage4: false,
    production: false,
    deployment: false,
    privateKeyTransfer: false,
  },
});

const payloadPaths = [
  archiveDestination,
  ...approvedKitFiles.map((filename) => join(kitDestination, filename)),
  kitManifestPath,
];
const transferManifestPath = join(
  transferRoot,
  "Oracle.Stage3OfflineTransferManifest.json"
);
writeJson(transferManifestPath, {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-3-offline-transfer-manifest",
  contractVersion: 1,
  transferMethod: "Founder-approved offline removable media",
  sourceCheckpoint: {
    branch: "sprint-9-overlay",
    commit: "7c8af26eba548ad083abd8dfdd9dcb915b9f60b2",
  },
  destinationHost: {
    deviceName: "Founder-QA-01",
    manufacturer: "MEDION",
    model: "ERAZER P6605 MD61596",
    admissionState: "admitted-with-founder-provenance-exception",
  },
  payloadFiles: payloadPaths.map((path) => ({
    relativePath: normalize(relative(transferRoot, path)),
    sha256: sha256(path),
    size: statSync(path).size,
  })),
  approvals: {
    exactFrozenStage2Archive: true,
    selfContainedPowerShellKit: true,
    publicCertificateDerivedLaterFromSignedEvidence: true,
    privateKeyIncluded: false,
    productionCredentialIncluded: false,
    productionDataIncluded: false,
    productSourceIncluded: false,
  },
});
const manifestSha256 = sha256(transferManifestPath);
writeFileSync(
  `${transferManifestPath}.sha256.txt`,
  `${manifestSha256}  ${basename(transferManifestPath)}\n`,
  "ascii"
);

const declared = JSON.parse(readFileSync(transferManifestPath, "utf8"));
assert.equal(declared.payloadFiles.length, payloadPaths.length);
for (const entry of declared.payloadFiles) {
  const path = join(transferRoot, ...entry.relativePath.split("/"));
  assert.equal(sha256(path), entry.sha256);
  assert.equal(statSync(path).size, entry.size);
}
const kitManifest = JSON.parse(readFileSync(kitManifestPath, "utf8"));
assert.deepEqual(
  kitManifest.files.map((entry) => entry.relativePath).sort(),
  [...approvedKitFiles].sort()
);
for (const entry of kitManifest.files) {
  const path = join(kitDestination, entry.relativePath);
  assert.equal(sha256(path), entry.sha256);
  assert.equal(statSync(path).size, entry.size);
}

console.log(`Stage 3 offline transfer prepared: ${transferRoot}`);
console.log(`Payload files: ${payloadPaths.length}`);
console.log(`Transfer files including manifest and sidecar: ${payloadPaths.length + 2}`);
console.log(`Transfer manifest SHA-256: ${manifestSha256}`);

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalize(path) {
  return path.replaceAll("\\", "/");
}

function assertWorkspacePath(path) {
  const relativePath = relative(root, path);
  assert.ok(relativePath && !relativePath.startsWith(".."));
}

function retireHistoricalEntryPoint() {
  throw new Error(
    "HISTORICAL_STAGE3_ENTRY_POINT_RETIRED: use the separately authorised Stage 3 R1 transfer builder."
  );
}
