import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { contract, validateAcceptedBindings, validateProductBoundary } from "./stage5-core.mjs";

validateAcceptedBindings();
assert.deepEqual(validateProductBoundary(), contract.repository.permittedPostCandidateProductDrift.paths);
const boundary = contract.authorityBoundary;
assert.equal(contract.status, "founder-authorised-execution-enabled");
assert.equal(boundary.transferCreationPermitted, true);
assert.equal(boundary.maximumTransfers, 1);
assert.equal(boundary.maximumAuthorities, 1);
assert.equal(boundary.maximumAttempts, 1);
assert.equal(boundary.retryPermitted, false);
assert.equal(contract.qualificationProtocol.independentCycles, 2);
assert.equal(contract.qualificationProtocol.activeJourneySecondsPerCycle, 1800);
assert.equal(contract.qualificationProtocol.soakSecondsPerCycle, 3600);
assert.equal(contract.qualificationProtocol.minimumSampleCompleteness, 0.99);
assert.equal(contract.host.browserInspection.exactSha256BoundAtPreAuthority, true);

const mission = source("Invoke-OracleStage5R1QualificationMission.ps1");
for (const required of [
  "Assert-OracleStage5R1Transfer", "Invoke-OracleStage4R4PreAuthorityChecks",
  'for($cycle=1;$cycle-le[int]$contract.qualificationProtocol.independentCycles;$cycle++)',
  "ORACLE_STAGE5_QUALIFICATION_ATTEMPT_ID", "ORACLE_STAGE5_EDGE_SHA256",
  "evaluate-qualified-mission.mjs", "retryProhibited=$true", "CreateNew",
]) assert.ok(mission.includes(required), `Mission controller is missing ${required}.`);
assert.ok(mission.indexOf("Write-CreateOnlyJson $authorityPath") > mission.indexOf("Invoke-OracleStage4R4PreAuthorityChecks"));
assert.ok(mission.indexOf("Write-CreateOnlyJson $authorityPath") > mission.indexOf("Host or browser state differs from preflight"));

const preflight = source("Invoke-OracleStage5R1PreAuthorityPreflight.ps1");
assert.ok(preflight.includes("oracle.sprint-30-5.stage-5-r1-pre-authority-preflight"));
assert.ok(!preflight.includes("oracle.sprint-30-5.stage-4-r4-pre-authority-preflight"));
for (const required of ["contract.host.requiredIdentity", "Win32_ComputerSystem", "Win32_VideoController", "Microsoft Basic Render", "GPU Engine", "LogPixels", "hostAdmission", "authorityCreated=$false", "attemptCreated=$false"]) {
  assert.ok(preflight.includes(required), `Preflight is missing ${required}.`);
}
const environment = source("execute-observed-environment.mjs");
assert.ok(environment.includes("stage5CycleControllerAdmission"));
assert.ok(environment.includes("Stage 5 cycle root differs from its authority-bound identity"));
const observer = source("Measure-OracleStage5R1InstalledPackage.ps1");
for (const required of ["ORACLE_STAGE5_QUALIFICATION_CYCLE", "activeJourneySecondsPerCycle", "soakSecondsPerCycle", "minimumSampleCompleteness", "GOVERNED-STAGE-5-R1-QUALIFICATION"]) assert.ok(observer.includes(required));
const workload = source("run-qualified-workload.mjs");
for (const required of ["Network.setCookie", "Accessibility.getFullAXTree", "prefers-reduced-motion", "contrastViolations", "horizontalOverflowAt200PercentPixels", "activeJourneySecondsPerCycle", "companionTransitions"]) assert.ok(workload.includes(required));
const transitions = source("Invoke-OracleStage5R1CompanionTransitions.ps1");
for (const required of ["cod.exe", '"attach"', '"detach"', '"degradation"', '"recovery"', "installed-uia-owned-process-tree", "Oracle.Stage5GameWindowFixture.exe", "companionFixture.sha256"]) assert.ok(transitions.includes(required));
assert.ok(!transitions.includes("Add-Type -TypeDefinition"));
assert.ok(source("Oracle.Stage5GameWindowFixture.cs").includes("Call of Duty: Warzone"));
assert.equal(contract.host.companionFixture.qualificationHostCompilationPermitted, false);
for (const transferSource of [source("prepare-transfer.mjs"), source("verify-transfer.mjs"), source("Oracle.Stage5R1TransferPolicy.ps1")]) assert.ok(!transferSource.includes("stage-4-r4-transfer"));
const transfer = source("prepare-transfer.mjs");
assert.ok(transfer.includes("COPYFILE_EXCL")); assert.ok(transfer.includes('flag: "wx"'));
console.log(JSON.stringify({ result: "passed", classification: "STAGE-5-R1-EXECUTION-ADVERSARIAL-STATIC", authorityCreated: false, attemptCreated: false, transferCreated: false }, null, 2));

function source(name) { return readFileSync(join(import.meta.dirname, name), "utf8"); }
