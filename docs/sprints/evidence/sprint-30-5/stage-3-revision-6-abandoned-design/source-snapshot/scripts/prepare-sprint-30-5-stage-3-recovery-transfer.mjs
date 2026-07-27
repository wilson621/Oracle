import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const artifactRoot = join(root, ".artifacts", "sprint-30-5", "stage-3");
const sourceArchive = join(
  root,
  ".artifacts",
  "sprint-30-5",
  "stage-2",
  "Oracle.Sprint30.5.Stage2QualificationEvidence.zip"
);
const sourceKit = join(
  root,
  "scripts",
  "sprint-30-5",
  "stage-3-qualification"
);
const revision5Transfer = join(artifactRoot, "offline-transfer");
const recoveryInput = join(artifactRoot, "recovery-input");
const outputRoot = join(
  artifactRoot,
  "recovery",
  "offline-transfer-r6"
);
const kitDestination = join(outputRoot, "stage-3-qualification-kit");
const historyRoot = join(outputRoot, "immutable-history");

const expected = Object.freeze({
  archive:
    "8c20f6da7f0262ed4ef9a3a59c6a027ba3d64cb66c4e646b1f5d075da369f876",
  msix:
    "00b045996e8a7e90400ce3208b2ab36bacccf48831a6ab770827f2ecd6e45276",
  revision4Evidence:
    "164a5df278aeca15d98b7c131e4c73cadea40f511d0831f12ed4d0d46e3215e2",
  revision5PreExecution:
    "4ca600a0777971d84976d99fe3144f136b27b2a8a99b9113841e991865a2c271",
  revision5Diagnostic:
    "64f465508c7403798a24c7d4ffe129706ad6ea023973d3ec626d787c4dc282ea",
  revision5TransferManifest:
    "68f92eac7a7dffdc4cd98b4d7f66c2cb5ab0e8f18fd10ac38d036581b31bf7eb",
  revision5KitManifest:
    "e9c99092f2c95f8db04734ecec21ca206967d601a0736d371370bde08ff87791",
  revision5Harness:
    "1275df72240eae48a3939e13011ac1a5f00b9fc1b1c1f8d7de1b8954d9244395",
});

const requiredRecoveryInputs = Object.freeze([
  {
    source: join(
      recoveryInput,
      "revision-4",
      "02b-negative-path-and-trust-r4.json"
    ),
    sidecar: true,
    expectedSha256: expected.revision4Evidence,
    destinationDirectory: "revision-4",
  },
  {
    source: join(
      recoveryInput,
      "revision-5-failed-attempt",
      "01-pre-execution.json"
    ),
    sidecar: true,
    expectedSha256: expected.revision5PreExecution,
    destinationDirectory: "revision-5-failed-attempt",
  },
  {
    source: join(
      recoveryInput,
      "revision-5-failed-attempt",
      "03a-install-and-startup-r5-diagnostic.json"
    ),
    sidecar: true,
    expectedSha256: expected.revision5Diagnostic,
    destinationDirectory: "revision-5-failed-attempt",
  },
]);

const kitFiles = Object.freeze([
  "Invoke-OracleStage3Qualification.ps1",
  "Invoke-OracleStage3RecoveryRestoration.ps1",
  "Oracle.Stage3QualificationContract.json",
  "Oracle.Stage3Revision2FailureRecord.json",
  "Oracle.Stage3Revision3FailureRecord.json",
  "Oracle.Stage3Revision4FailureRecord.json",
  "Oracle.Stage3Revision5FailureRecord.json",
  "README.txt",
]);

assertFileHash(sourceArchive, expected.archive, "frozen Stage 2 archive");
assertRevision5Transfer();
for (const input of requiredRecoveryInputs) {
  assertOriginalEvidence(input);
}

assertWorkspacePath(outputRoot);
rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(kitDestination, { recursive: true });
mkdirSync(historyRoot, { recursive: true });

const payloadPaths = [];
const archiveDestination = join(outputRoot, basename(sourceArchive));
copyFileSync(sourceArchive, archiveDestination);
payloadPaths.push(archiveDestination);

for (const filename of kitFiles) {
  const source = join(sourceKit, filename);
  assert.ok(existsSync(source), `Missing recovery-kit source: ${filename}`);
  const destination = join(kitDestination, filename);
  copyFileSync(source, destination);
  payloadPaths.push(destination);
}

for (const input of requiredRecoveryInputs) {
  const destinationDirectory = join(
    historyRoot,
    input.destinationDirectory
  );
  mkdirSync(destinationDirectory, { recursive: true });
  const destination = join(destinationDirectory, basename(input.source));
  copyFileSync(input.source, destination);
  payloadPaths.push(destination);
  const sidecarDestination = `${destination}.sha256.txt`;
  copyFileSync(`${input.source}.sha256.txt`, sidecarDestination);
  payloadPaths.push(sidecarDestination);
}

const kitManifestPath = join(
  kitDestination,
  "Oracle.Stage3QualificationKit.manifest.json"
);
writeJson(kitManifestPath, {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-3-recovery-kit-manifest",
  contractVersion: 1,
  revision: 6,
  attempt: "revision-6-recovery",
  supersedesRevision5AsHistoryOnly: {
    transferManifestSha256: expected.revision5TransferManifest,
    kitManifestSha256: expected.revision5KitManifest,
    harnessSha256: expected.revision5Harness,
    outcome: "governed-stop-missing-bound-revision-4-evidence",
  },
  files: kitFiles.map((filename) => fileEntry(
    join(kitDestination, filename),
    kitDestination
  )),
  immutableInputs: requiredRecoveryInputs.map((input) => ({
    filename: basename(input.source),
    sha256: input.expectedSha256,
    sidecarRequired: true,
  })),
  authority: {
    preparationOnly: true,
    founderQa01Execution: false,
    restoration: false,
    stage4: false,
  },
});
payloadPaths.push(kitManifestPath);

const transferManifestPath = join(
  outputRoot,
  "Oracle.Stage3RecoveryTransferManifest.json"
);
writeJson(transferManifestPath, {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-3-recovery-transfer-manifest",
  contractVersion: 1,
  revision: 6,
  attempt: "revision-6-recovery",
  destinationHost: "Founder-QA-01",
  transferMethod: "Founder-approved offline removable media",
  payloadFiles: payloadPaths.map((path) => fileEntry(path, outputRoot)),
  gates: {
    revision5AttemptImmutable: true,
    freshAttemptDirectoryRequired: true,
    originalRevision4EvidenceRequired: true,
    legacyPreExecutionProhibited: true,
    restorationRequiresSeparateFounderAuthority: true,
    automaticInstallOrTrustRestoration: false,
    continuationRequiresRecoveryPreflight: true,
  },
  frozenCandidate: {
    archiveSha256: expected.archive,
    msixSha256: expected.msix,
    rebuilt: false,
    resigned: false,
  },
});
const transferManifestSha256 = sha256(transferManifestPath);
writeFileSync(
  `${transferManifestPath}.sha256.txt`,
  `${transferManifestSha256}  ${basename(transferManifestPath)}\n`,
  "ascii"
);

auditGeneratedPackage();
console.log(`Recovery transfer prepared: ${outputRoot}`);
console.log(`Payload files: ${payloadPaths.length}`);
console.log(`Transfer manifest SHA-256: ${transferManifestSha256}`);
console.log(`Kit manifest SHA-256: ${sha256(kitManifestPath)}`);

function assertRevision5Transfer() {
  const manifest = join(
    revision5Transfer,
    "Oracle.Stage3OfflineTransferManifest.json"
  );
  const kitManifest = join(
    revision5Transfer,
    "stage-3-qualification-kit",
    "Oracle.Stage3QualificationKit.manifest.json"
  );
  const harness = join(
    revision5Transfer,
    "stage-3-qualification-kit",
    "Invoke-OracleStage3Qualification.ps1"
  );
  assertFileHash(
    manifest,
    expected.revision5TransferManifest,
    "Revision 5 transfer manifest"
  );
  assertFileHash(
    kitManifest,
    expected.revision5KitManifest,
    "Revision 5 kit manifest"
  );
  assertFileHash(
    harness,
    expected.revision5Harness,
    "Revision 5 harness"
  );
}

function assertOriginalEvidence(input) {
  assertFileHash(input.source, input.expectedSha256, basename(input.source));
  const sidecar = `${input.source}.sha256.txt`;
  assert.ok(existsSync(sidecar), `Missing original sidecar: ${sidecar}`);
  const declared = readFileSync(sidecar, "utf8").trim().split(/\s+/u)[0];
  assert.equal(
    declared.toLowerCase(),
    input.expectedSha256,
    `Sidecar binding mismatch: ${sidecar}`
  );
}

function auditGeneratedPackage() {
  const manifest = JSON.parse(readFileSync(transferManifestPath, "utf8"));
  const expectedRelativePaths = new Set(
    manifest.payloadFiles.map((entry) => entry.relativePath)
  );
  const actualRelativePaths = listFiles(outputRoot)
    .filter((path) => (
      path !== transferManifestPath &&
      path !== `${transferManifestPath}.sha256.txt`
    ))
    .map((path) => normalize(relative(outputRoot, path)));
  assert.deepEqual(
    [...actualRelativePaths].sort(),
    [...expectedRelativePaths].sort()
  );
  for (const entry of manifest.payloadFiles) {
    const path = join(outputRoot, ...entry.relativePath.split("/"));
    assert.equal(sha256(path), entry.sha256);
    assert.equal(statSync(path).size, entry.size);
  }
  const sidecarHash = readFileSync(
    `${transferManifestPath}.sha256.txt`,
    "ascii"
  ).trim().split(/\s+/u)[0];
  assert.equal(sidecarHash, sha256(transferManifestPath));
  assertFileHash(archiveDestination, expected.archive, "copied archive");
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function fileEntry(path, base) {
  return {
    relativePath: normalize(relative(base, path)),
    sha256: sha256(path),
    size: statSync(path).size,
  };
}

function assertFileHash(path, expectedSha256, label) {
  assert.ok(existsSync(path), `Missing ${label}: ${path}`);
  assert.equal(sha256(path), expectedSha256, `${label} hash mismatch`);
}

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
