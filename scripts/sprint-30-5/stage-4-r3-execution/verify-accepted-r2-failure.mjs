import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { repositoryRoot } from "./stage4-core.mjs";

const indexPath = join(repositoryRoot, "docs/sprints/evidence/sprint-30-5/stage-4-r2/Oracle.Stage4R2AcceptedFailedEvidenceIndex.json");
const index = JSON.parse(readFileSync(indexPath, "utf8"));
assert.equal(index.contract, "oracle.sprint-30-5.stage-4-r2-accepted-failed-qualification-evidence-index");
assert.equal(index.result, "failed");
assert.equal(index.acceptedAsImmutableHistory, true);
assert.equal(index.retryProhibited, true);
assert.equal(index.attemptId, "stage4-r2-20260804T112122028Z-609ab6f0");
assert.equal(index.authorityId, "authority-stage4-r2-20260804T112122028Z-609ab6f0");
assert.equal(index.executionCommit, "7a59616dab437829156638290c691f6a8d54771e");
assert.equal(index.executionTree, "983313f3e2563ecd9ef7e783542d2cca642ed36b");
assert.deepEqual(index.completedLifecyclePhases, ["authority-consumed", "baseline-verified"]);
assert.equal(index.attemptFiles, 9);
assert.equal(index.attemptBytes, 10770);
assert.equal(index.qualificationArchiveProduced, false);
assert.equal(index.finalEvidenceManifestProduced, false);
assert.equal(index.repositoryQualificationEvidenceProduced, false);
assert.equal(index.safetyTeardownPassed, true);
assert.equal(index.zeroResidueIndependentlyVerified, true);
assert.equal(index.files.length, 19);

for (const entry of index.files) {
  assert.match(entry.path, /^(?:\.artifacts|docs\/sprints\/evidence)\//u);
  const path = resolve(repositoryRoot, entry.path);
  assert.equal(path.startsWith(`${repositoryRoot}\\`), true, `Indexed artifact escaped repository: ${entry.path}`);
  assert.equal(existsSync(path), true, `Indexed artifact is absent: ${entry.path}`);
  assert.equal(statSync(path).isFile(), true, `Indexed artifact is not a file: ${entry.path}`);
  assert.equal(statSync(path).size, entry.bytes, `Indexed artifact size differs: ${entry.path}`);
  assert.equal(sha256(path), entry.sha256, `Indexed artifact hash differs: ${entry.path}`);
}

const attemptRoot = join(repositoryRoot, ".artifacts/sprint-30-5/stage-4-r2", index.attemptId);
const physicalAttempt = walk(attemptRoot).map(path => relative(repositoryRoot, path).replaceAll("\\", "/")).sort();
const indexedAttempt = index.files.map(entry => entry.path).filter(path => path.startsWith(`.artifacts/sprint-30-5/stage-4-r2/${index.attemptId}/`)).sort();
assert.deepEqual(physicalAttempt, indexedAttempt, "Immutable failed-attempt physical inventory differs from its accepted index.");
const authority = JSON.parse(readFileSync(join(repositoryRoot, `.artifacts/sprint-30-5/stage-4-r2/authorities/${index.authorityId}.json`), "utf8"));
assert.equal(authority.consumed, true);
assert.equal(authority.attemptId, index.attemptId);
assert.equal(sha256(join(repositoryRoot, `.artifacts/sprint-30-5/stage-4-r2/authorities/${index.authorityId}.json`)), index.authoritySha256);
const failure = JSON.parse(readFileSync(join(attemptRoot, "failure.json"), "utf8"));
assert.equal(failure.result, "failed");
assert.equal(failure.retryProhibited, true);
assert.deepEqual(failure.completed, index.completedLifecyclePhases);
assert.match(failure.primaryFailure, /EEXIST: file already exists, mkdir/u);
assert.equal(failure.safetyFailure, null);
assert.equal(sha256(join(attemptRoot, "failure.json")), index.failureSha256);
const teardown = JSON.parse(readFileSync(join(attemptRoot, "logs/safety-teardown-result.json"), "utf8"));
assert.equal(teardown.result, "passed");
assert.equal(teardown.zeroResidue, true);
assert.deepEqual(teardown.cleanupFailures, []);
const resultEntry = index.files.find(entry => entry.sha256 === index.controllerResultSha256);
assert.ok(resultEntry, "Controller result binding is absent.");
const controllerResult = JSON.parse(readFileSync(join(repositoryRoot, resultEntry.path), "utf8"));
assert.equal(controllerResult.result, "failed");
assert.equal(controllerResult.preflight.result, "passed");
assert.equal(controllerResult.qualification, null);
assert.match(controllerResult.failure.message, /EEXIST: file already exists, mkdir/u);
assert.equal(existsSync(join(attemptRoot, "final-evidence-manifest.json")), false);
assert.equal(existsSync(join(attemptRoot, "Oracle.Sprint30.5.Stage4R2QualificationEvidence.zip")), false);
assert.equal(existsSync(join(repositoryRoot, "docs/sprints/evidence/sprint-30-5/stage-4-r2", index.attemptId)), false);

console.log(JSON.stringify({
  result: "passed",
  classification: "STAGE-4-R2-ACCEPTED-FAILED-QUALIFICATION-VERIFICATION",
  attemptId: index.attemptId,
  authorityConsumed: true,
  retryProhibited: true,
  indexedFiles: index.files.length,
  attemptFiles: physicalAttempt.length,
  attemptBytes: index.attemptBytes,
  safetyTeardownPassed: true,
  immutableHistoryVerified: true,
}, null, 2));

function sha256(path) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function walk(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = join(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Linked failed-attempt entry rejected: ${path}`);
    return entry.isDirectory() ? walk(path) : entry.isFile() ? [path] : [];
  });
}