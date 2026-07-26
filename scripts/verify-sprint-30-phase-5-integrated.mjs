import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const evidenceDirectory =
  "docs/sprints/evidence/sprint-30/phase-5/generated";
const candidate = readJson(`${evidenceDirectory}/qualification-candidate.json`);
const matrix = readJson(`${evidenceDirectory}/integrated-matrix.json`);
const quality = readJson(`${evidenceDirectory}/quality-contract.json`);
const performance = readJson(`${evidenceDirectory}/web-performance.json`);
const supplyChain = readJson(`${evidenceDirectory}/supply-chain.json`);
const releaseManifest = readJson(candidate.releaseManifest.path);
const productFiles = ["app", "components", "desktop", "lib"]
  .flatMap(walk)
  .filter((file) => /\.(ts|tsx)$/u.test(file))
  .sort();

assert.equal(candidate.phase, 5);
assert.equal(candidate.runtimeManifest.version, "1.7.0");
assert.equal(candidate.runtimeManifest.canonicalTargetsEqual, true);
assert.equal(candidate.runtimeManifest.operationalDiagnosticsDelivery, "disabled");
assert.equal(candidate.productSourceSha256, combinedHash(productFiles));
assert.equal(
  candidate.runtimeManifest.webSourceSha256,
  fileHash("lib/oracle/composition/web-composition-root.ts")
);
assert.equal(
  candidate.runtimeManifest.electronSourceSha256,
  fileHash("desktop/platform/desktop-composition-root.ts")
);
assert.equal(candidate.dependencies.packageLockSha256, fileHash("package-lock.json"));

for (const [migration, sha256] of Object.entries(candidate.migrations)) {
  assert.equal(fileHash(migration), sha256, `${migration} changed after candidate freeze.`);
}
assert.equal(
  fs.readdirSync("database").some((name) => /^015_/u.test(name)),
  false,
  "Migration 015 is outside Sprint 30 authority."
);

assert.equal(fileHash(candidate.releaseManifest.path), candidate.releaseManifest.sha256);
assert.equal(releaseManifest.runtimeCompositionManifestVersion, "1.6.0");
assert.equal(releaseManifest.signing.classification, "local-test-only");
assert.equal(releaseManifest.signing.productionTrusted, false);
assert.equal(releaseManifest.signing.externalDistributionAuthorised, false);
assert.equal(releaseManifest.signing.deploymentAuthorised, false);
assert.equal(candidate.releaseManifest.immutableSprint29Candidate, true);
assert.equal(candidate.releaseManifest.rebuilt, false);
assert.equal(candidate.releaseManifest.resigned, false);

assert.equal(quality.phase, 5);
assert.equal(quality.result, "passed");
assert.equal(performance.phase, 5);
assert.equal(performance.result, "passed");
assert.equal(performance.protectedRenderedRoutes.result, "unavailable");
assert.equal(performance.protectedRenderedRoutes.passClaimed, false);
assert.equal(performance.gpu.result, "unavailable");
assert.equal(performance.gpu.passClaimed, false);
assert.equal(supplyChain.phase, 5);
assert.equal(supplyChain.result, "passed");
assert.equal(supplyChain.verification.fullNpmAuditVulnerabilities, 0);
assert.equal(supplyChain.verification.productionNpmAuditVulnerabilities, 0);
assert.equal(supplyChain.immutableSprint29PackageChanged, false);

assert.equal(
  matrix.result,
  "passed-with-mandatory-deferred-and-unavailable-evidence"
);
assert.equal(matrix.findings.openCriticalSourceFindings, 0);
assert.equal(matrix.findings.openHighSourceFindings, 0);
assert.equal(matrix.programmeConclusion.phase5Engineering, "complete");
assert.equal(matrix.programmeConclusion.sprint30DefinitionOfDone, "not-satisfied");
assert.equal(matrix.programmeConclusion.productionQualification, "incomplete");
assert.equal(matrix.programmeConclusion.releaseAuthority, false);
assert.equal(matrix.disposableEnvironment.containersRemoved, true);
assert.equal(matrix.disposableEnvironment.productionCredentialsUsed, false);

for (const authority of [candidate.authority, matrix.authority]) {
  assert.notEqual(authority.production, "changed");
  assert.notEqual(authority.runtimePersistence, "enabled");
  assert.notEqual(authority.remotePush, true);
}

const requiredDocumentation = [
  "docs/sprints/SPRINT_30_PHASE_5_IMPLEMENTATION.md",
  "docs/sprints/SPRINT_30_PRODUCTION_QUALIFICATION_DOSSIER.md",
  "docs/sprints/SPRINT_30_FOUNDER_ACCEPTANCE_REQUIRED.md",
];
for (const document of requiredDocumentation) {
  const content = fs.readFileSync(document, "utf8");
  assert.match(content, /qualification(?:-|.{0,8})incomplete/iu);
}
assert.match(
  fs.readFileSync("docs/sprints/SPRINT_30_FOUNDER_ACCEPTANCE_REQUIRED.md", "utf8"),
  /Option A/u
);

const output = {
  schemaVersion: 1,
  contract: "oracle.sprint-30-phase-5-integrated-verification",
  contractVersion: 1,
  phase: 5,
  verifiedAt: new Date().toISOString(),
  result: "passed-with-deferred-and-unavailable-mandatory-evidence",
  candidate: {
    acceptedPhase4Commit: candidate.acceptedPhase4Commit,
    productSourceSha256: candidate.productSourceSha256,
    packageLockSha256: candidate.dependencies.packageLockSha256,
    runtimeManifestVersion: candidate.runtimeManifest.version,
    releaseManifestRuntimeVersion:
      candidate.releaseManifest.runtimeManifestVersion,
  },
  verified: {
    frozenProductSource: true,
    frozenDependencies: true,
    migrations009Through014Immutable: true,
    migration015Absent: true,
    runtimeManifest17SourcesFrozen: true,
    sprint29ReleaseManifest16Immutable: true,
    qualityEvidence: true,
    performanceEvidence: true,
    supplyChainEvidence: true,
    integratedMatrix: true,
    documentation: true,
  },
  conclusion: {
    phase5Engineering: "complete",
    productionQualification: "incomplete",
    sprint30DefinitionOfDone: "not-satisfied",
    releaseAuthority: false,
  },
};

const outputPath = `${evidenceDirectory}/integrated-verification.json`;
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  "Sprint 30 Phase 5 integrated verification passed with mandatory evidence unavailable or deferred."
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function walk(entry) {
  const stat = fs.statSync(entry);
  if (stat.isFile()) return [entry.replaceAll("\\", "/")];
  return fs
    .readdirSync(entry)
    .flatMap((child) => walk(path.join(entry, child)));
}

function combinedHash(files) {
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    hash.update(file);
    hash.update("\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function fileHash(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}
