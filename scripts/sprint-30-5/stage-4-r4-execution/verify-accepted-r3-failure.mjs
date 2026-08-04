import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { repositoryRoot, sha256 } from "./stage4-core.mjs";

const indexPath = join(repositoryRoot, "docs/sprints/evidence/sprint-30-5/stage-4-r3/Oracle.Stage4R3AcceptedFailedEvidenceIndex.json");
assert.equal(sha256(indexPath), "14264450be92dee9af007d25dbfc6c5d6fa3037935a7e024d7f48df9c6d8f9a6");
const index = JSON.parse(readFileSync(indexPath, "utf8"));
assert.equal(index.contract, "oracle.sprint-30-5.stage-4-r3-accepted-failed-qualification-evidence-index");
assert.equal(index.acceptedAsImmutableHistory, true);
assert.equal(index.retryProhibited, true);
assert.equal(index.files.length, 21);
assert.equal(index.attemptFiles, 11);
assert.equal(index.attemptBytes, 130856);
for (const binding of index.files) {
  const path = join(repositoryRoot, binding.path);
  assert.equal(existsSync(path), true, `Immutable R3 record absent: ${binding.path}`);
  assert.equal(statSync(path).isFile(), true, `Immutable R3 record is not a file: ${binding.path}`);
  assert.equal(statSync(path).size, binding.bytes, `Immutable R3 record size differs: ${binding.path}`);
  assert.equal(sha256(path), binding.sha256, `Immutable R3 record hash differs: ${binding.path}`);
}

const attemptRoot = join(repositoryRoot, ".artifacts/sprint-30-5/stage-4-r3", index.attemptId);
const authority = JSON.parse(readFileSync(join(repositoryRoot, index.files.find(item => item.sha256 === index.authoritySha256).path), "utf8"));
assert.equal(authority.authorityId, index.authorityId);
assert.equal(authority.attemptId, index.attemptId);
assert.equal(authority.consumed, true);

const failure = JSON.parse(readFileSync(join(attemptRoot, "failure.json"), "utf8"));
assert.equal(failure.result, "failed");
assert.equal(failure.retryProhibited, true);
assert.deepEqual(failure.completed, ["authority-consumed", "baseline-verified"]);
assert.equal(failure.safetyFailure, null);
assert.equal(failure.environment.zeroResidue, true);
assert.deepEqual(failure.environment.cleanupFailures, []);

const installed = JSON.parse(readFileSync(join(attemptRoot, "logs/installed-package-result.json"), "utf8"));
assert.equal(installed.result, "failed");
assert.equal(installed.primaryFailure, null);
assert.deepEqual(installed.cleanupFailures, ["process-stop: Cannot find a process with the process identifier 1324."]);
assert.equal(installed.zeroResidue, true);
assert.equal(installed.secretValuesRecorded, false);
const installedPhases = installed.phases.map(item => item.phase);
for (const phase of ["zero-state-verified", "trust-established", "package-installed", "runtime-configuration-created", "package-activated", "installed-server-admitted", "live-journey-passed", "package-removed", "trust-removed"]) {
  assert.equal(installedPhases.includes(phase), true, `Installed R3 phase absent: ${phase}`);
}

const journey = JSON.parse(readFileSync(join(attemptRoot, "evidence/live-journey.json"), "utf8"));
assert.equal(journey.result, "passed");
assert.equal(journey.classification, "GOVERNED-STAGE-4-R3-QUALIFICATION");
assert.equal(journey.journeys.length, 10);
assert.equal(journey.journeys.every(item => item.result === "passed"), true);

const safety = JSON.parse(readFileSync(join(attemptRoot, "logs/installed-safety-teardown.json"), "utf8"));
assert.equal(safety.result, "passed");
assert.equal(safety.zeroResidue, true);
assert.deepEqual(safety.cleanupFailures, []);

const processes = JSON.parse(readFileSync(join(attemptRoot, "logs/process-summary.json"), "utf8"));
const nonzero = processes.filter(item => item.exitCode !== 0 || item.processError !== null);
assert.equal(nonzero.length, 1);
assert.equal(nonzero[0].label, "installed-package-journey");
assert.equal(nonzero[0].exitCode, 1);
assert.equal(nonzero[0].stderr.sha256, "21b61bc5ebf6500ed5ec3364fa42b96c7968ba99bdc96ca3d9ea3e28aff96340");

for (const absent of ["completion.json", "final-evidence-manifest.json", "Oracle.Sprint30.5.Stage4R3QualificationEvidence.zip"]) {
  assert.equal(existsSync(join(attemptRoot, absent)), false, `Permanent R3 failure unexpectedly produced ${absent}`);
}

console.log(JSON.stringify({
  result: "passed",
  classification: "STAGE-4-R3-ACCEPTED-FAILED-EVIDENCE-VERIFICATION",
  authorityConsumed: true,
  retryProhibited: true,
  immutableRecordsRehashed: index.files.length,
  tenJourneysPassedBeforeCleanupFailure: true,
  governedZeroResidueVerified: true,
  authorityCreated: false,
  attemptCreated: false,
}, null, 2));
