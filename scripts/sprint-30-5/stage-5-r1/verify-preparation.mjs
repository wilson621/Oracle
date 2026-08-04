import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  contract,
  harnessRoot,
  repositoryRoot,
  sha256,
  validateAcceptedBindings,
  validateApprovedTool,
  validateAuthorityBoundary,
  validateProcessEnvelope,
  validateProductBoundary,
} from "./stage5-core.mjs";

validateAuthorityBoundary();
validateAcceptedBindings();
const productDrift = validateProductBoundary();
assert.notEqual(contract.acceptedEngineeringBaseline.commit, "PENDING_IMPLEMENTATION_COMMIT");
assert.notEqual(contract.acceptedEngineeringBaseline.tree, "PENDING_IMPLEMENTATION_TREE");
assert.match(contract.acceptedEngineeringBaseline.commit, /^[0-9a-f]{40}$/u);
assert.match(contract.acceptedEngineeringBaseline.tree, /^[0-9a-f]{40}$/u);

const git = validateApprovedTool("git");
const node = validateApprovedTool("node");
const powershell = validateApprovedTool("powershell");
const commitType = run(git.path, ["cat-file", "-t", contract.acceptedEngineeringBaseline.commit]).stdout.trim();
assert.equal(commitType, "commit");
const boundTree = run(git.path, ["rev-parse", contract.acceptedEngineeringBaseline.commit + "^{tree}"]).stdout.trim();
assert.equal(boundTree, contract.acceptedEngineeringBaseline.tree);

const manifestPath = join(harnessRoot, "Oracle.Stage5R1PreparationManifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
assert.equal(manifest.contract, "oracle.sprint-30-5.stage-5-r1-preparation-manifest");
assert.equal(manifest.acceptedEngineeringBaselineCommit, contract.acceptedEngineeringBaseline.commit);
assert.equal(manifest.acceptedEngineeringBaselineTree, contract.acceptedEngineeringBaseline.tree);
assert.equal(manifest.transferPreparationPermitted, false);
assert.equal(manifest.authorityCreationPermitted, false);
assert.equal(manifest.qualificationAttemptPermitted, false);
assert.equal(manifest.qualificationExecutionPermitted, false);
assert.equal(manifest.maximumTransfers, 0);
assert.equal(manifest.maximumAuthorities, 0);
assert.equal(manifest.maximumAttempts, 0);

const inventory = readdirSync(harnessRoot)
  .filter(name => name !== "Oracle.Stage5R1PreparationManifest.json")
  .filter(name => statSync(join(harnessRoot, name)).isFile())
  .sort(codePointCompare);
assert.deepEqual(manifest.files.map(entry => entry.path), inventory);
for (const entry of manifest.files) {
  const path = join(harnessRoot, entry.path);
  assert.equal(statSync(path).size, entry.bytes, "Preparation file size differs: " + entry.path);
  assert.equal(sha256(path), entry.sha256, "Preparation file hash differs: " + entry.path);
}

const requiredDocuments = [
  "docs/sprints/SPRINT_30_5_STAGE_5_R1_PLAN.md",
  "docs/sprints/SPRINT_30_5_STAGE_5_R1_ACCEPTANCE_CONTRACT.md",
  "docs/sprints/SPRINT_30_5_STAGE_5_R1_PRE_EXECUTION_GATE.md",
  "docs/sprints/SPRINT_30_5_STAGE_5_R1_DEVELOPMENT_REHEARSAL_INVESTIGATION.md",
  "docs/sprints/SPRINT_30_5_STAGE_5_R1_PREPARATION_VALIDATION_REPORT.md",
  "docs/sprints/SPRINT_30_5_STAGE_5_R1_ENGINEERING_CLOSURE.md",
];
for (const path of requiredDocuments) {
  assert.equal(existsSync(join(repositoryRoot, path)), true, "Required Stage 5 document absent: " + path);
}

for (const name of inventory.filter(name => name.endsWith(".mjs"))) {
  run(node.path, ["--check", join(harnessRoot, name)]);
}
for (const name of inventory.filter(name => name.endsWith(".ps1"))) {
  const escaped = join(harnessRoot, name).replaceAll("'", "''");
  run(powershell.path, [
    "-NoLogo", "-NoProfile", "-NonInteractive", "-Command",
    "$e=$null;$t=$null;[Management.Automation.Language.Parser]::ParseFile('" + escaped + "',[ref]$t,[ref]$e)|Out-Null;if($e.Count){$e|ForEach-Object{Write-Error $_.Message};exit 1}",
  ]);
}

const policies = JSON.parse(run(node.path, [join(harnessRoot, "Test-OracleStage5R1Policies.mjs")]).stdout);
assert.equal(policies.result, "passed");
assert.ok(policies.qualificationAdversarialCases >= 50);
const powershellPolicies = JSON.parse(run(powershell.path, [
  "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File",
  join(harnessRoot, "Test-OracleStage5R1PowerShellPolicies.ps1"),
]).stdout);
assert.equal(powershellPolicies.result, "passed");
const rehearsal = JSON.parse(run(node.path, [join(harnessRoot, "run-development-rehearsal.mjs")]).stdout);
assert.equal(rehearsal.result, "passed");
assert.equal(rehearsal.qualificationEvidence, false);
assert.equal(rehearsal.productModified, false);
assert.equal(rehearsal.transferCreated, false);
assert.equal(rehearsal.authorityCreated, false);
assert.equal(rehearsal.attemptCreated, false);

assert.equal(inventory.some(name => /transfer|authority|qualification/i.test(name)), false);
const installedWrapper = readFileSync(join(harnessRoot, "Invoke-OracleStage5R1InstalledDevelopmentRehearsal.ps1"), "utf8");
for (const pattern of [
  /engineering-preparation-qualification-barred/u,
  /maximumTransfers/u,
  /maximumAuthorities/u,
  /maximumAttempts/u,
  /run-observed-installed-development-rehearsal\.mjs/u,
  /stage5Observation/u,
  /childLifecycleSupervisedToCompletion/u,
  /zeroResidue/u,
]) {
  assert.match(installedWrapper, pattern);
}
for (const pattern of [/UIAutomationClient/u, /Get-Counter/u, /while \(-not \$process\.HasExited\)/u]) {
  assert.doesNotMatch(installedWrapper, pattern);
}
const installedObserver = readFileSync(join(harnessRoot, "Measure-OracleStage5R1InstalledPackage.ps1"), "utf8");
for (const pattern of [
  /Get-Counter '\\GPU Engine/u,
  /UIAutomationClient/u,
  /Select-OracleStage5R1OwnedDescendants/u,
  /processExitRacePollsDiscarded/u,
  /renderStimulusOperations/u,
]) {
  assert.match(installedObserver, pattern);
}

console.log(JSON.stringify({
  result: "passed",
  classification: "STAGE-5-R1-ENGINEERING-PREPARATION-VALIDATION",
  acceptedR6MsixSha256: contract.package.sha256,
  acceptedChainRehashed: Object.keys(contract.acceptedChain),
  historicalBindingsRehashed: contract.historicalBindings.length,
  productDrift,
  preparationFilesVerified: manifest.files.length,
  qualificationAdversarialCases: policies.qualificationAdversarialCases,
  rehearsalAdversarialCases: policies.rehearsalAdversarialCases,
  deterministicRehearsalPassed: true,
  installedRehearsalRequiredForClosure: true,
  transferPreparationPermitted: false,
  authorityCreationPermitted: false,
  qualificationAttemptPermitted: false,
  qualificationExecutionPermitted: false,
  maximumTransfers: 0,
  maximumAuthorities: 0,
  maximumAttempts: 0,
  transferCreated: false,
  authorityCreated: false,
  attemptCreated: false,
}, null, 2));

function run(executable, args) {
  const result = spawnSync(executable, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    shell: false,
    maxBuffer: 64 * 1024 * 1024,
  });
  validateProcessEnvelope(result);
  return result;
}

function codePointCompare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
