import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  contract,
  repositoryRoot,
  sha256,
  validateAcceptedBindings,
  validateApprovedTool,
  validateProcessEnvelope,
} from "./stage4-core.mjs";

validateAcceptedBindings();
assert.equal(contract.status, "engineering-correction-qualification-barred");
assert.equal(contract.executionAuthority.founderAuthorisedQualificationExecution, false);
assert.equal(contract.executionAuthority.authorityCreationPermitted, false);
assert.equal(contract.executionAuthority.qualificationAttemptPermitted, false);
assert.equal(contract.executionAuthority.maximumAttempts, 0);
assert.equal(contract.executionAuthority.retryAfterConsumedAuthorityPermitted, false);
assert.equal(contract.transfer.required, true);
assert.equal(contract.transfer.executionAuthorised, false);
assert.equal(contract.transfer.independentVerificationRequired, true);
assert.equal(contract.acceptedPreparation.commit, "82badb7bdc9c434815c9fcc4c49f6d88b9814bf6");
assert.equal(contract.acceptedPreparation.tree, "51f9bbc9bed6eb949c87a8495fd465df5690473f");
assert.deepEqual(contract.attemptDirectoryOwnership, {
  attemptRoot: "qualification-or-rehearsal-launcher-create-only",
  logs: "launcher-owned-shared-create-only-records",
  lifecycle: "qualification-harness-create-only-records",
  evidence: "journey-controller-create-only-records",
  provider: "live-environment-controller-exclusive-ephemeral",
  qualificationControllerAdmission: {
    rootEntries: ["lifecycle", "logs"],
    logFiles: ["transfer-admission.json"],
  },
  rehearsalControllerAdmission: {
    rootEntries: ["logs"],
    logFiles: [],
  },
});
assert.equal(sha256(join(repositoryRoot, "scripts/sprint-30-5/stage-4-r2/Oracle.Stage4R2PreparationManifest.json")), contract.acceptedPreparation.preparationManifestSha256);

const approvedTools = Object.fromEntries(
  ["git", "node", "npmCli", "supabaseCli", "supabaseBinary", "docker", "powershell", "taskkill"]
    .map(name => [name, validateApprovedTool(name)])
);
assert.equal(process.execPath.toLowerCase(), approvedTools.node.path.toLowerCase());
for (const binding of contract.historicalEvidenceBindings) {
  const path = join(repositoryRoot, binding.path);
  assert.equal(existsSync(path), true, `Historical binding absent: ${binding.path}`);
  assert.equal(statSync(path).isFile(), true, `Historical binding is not a file: ${binding.path}`);
  assert.equal(sha256(path), binding.sha256, `Historical binding differs: ${binding.path}`);
}
assert.equal(contract.historicalEvidenceBindings.length, 16);

const harnessRoot = import.meta.dirname;
assert.equal(readFileSync(join(harnessRoot, "prepare-transfer.mjs"), "utf8").includes('fs.mkdirSync(approvedRoot, { recursive: true });'), true);
const executionManifest = JSON.parse(readFileSync(join(harnessRoot, "Oracle.Stage4R2ExecutionManifest.json"), "utf8"));
assert.equal(executionManifest.contract, "oracle.sprint-30-5.stage-4-r2-execution-manifest");
assert.equal(executionManifest.founderAuthorisedQualificationExecution, false);
assert.equal(executionManifest.maximumAttempts, 0);
assert.equal(executionManifest.retryAfterConsumedAuthorityPermitted, false);
const inventory = readdirSync(harnessRoot)
  .filter(name => name !== "Oracle.Stage4R2ExecutionManifest.json")
  .filter(name => statSync(join(harnessRoot, name)).isFile())
  .sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
assert.deepEqual(executionManifest.files.map(entry => entry.path), inventory);
for (const entry of executionManifest.files) {
  const path = join(harnessRoot, entry.path);
  assert.equal(statSync(path).size, entry.bytes, `Execution file size differs: ${entry.path}`);
  assert.equal(sha256(path), entry.sha256, `Execution file hash differs: ${entry.path}`);
}

for (const name of readdirSync(harnessRoot).filter(name => name.endsWith(".mjs"))) run(approvedTools.node.path, ["--check", join(harnessRoot, name)]);
for (const name of readdirSync(harnessRoot).filter(name => name.endsWith(".ps1"))) {
  const path = join(harnessRoot, name).replaceAll("'", "''");
  run(approvedTools.powershell.path, ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", `$e=$null;$t=$null;[Management.Automation.Language.Parser]::ParseFile('${path}',[ref]$t,[ref]$e)|Out-Null;if($e.Count){$e|ForEach-Object{Write-Error $_.Message};exit 1}`]);
}
for (const name of ["Test-OracleStage4R2Policies.ps1", "Test-OracleStage4R2ActivationPolicy.ps1", "Test-OracleStage4R2InstalledRuntimeConfigurationPolicy.ps1"]) {
  run(approvedTools.powershell.path, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", join(harnessRoot, name)]);
}
const acceptedFailure = JSON.parse(run(approvedTools.node.path, [join(harnessRoot, "verify-accepted-r2-failure.mjs")]).stdout);
assert.equal(acceptedFailure.result, "passed");
assert.equal(acceptedFailure.authorityConsumed, true);
assert.equal(acceptedFailure.retryProhibited, true);
const ownership = JSON.parse(run(approvedTools.node.path, [join(harnessRoot, "verify-attempt-directory-ownership.mjs")]).stdout);
assert.equal(ownership.result, "passed");
assert.equal(ownership.authorityCreated, false);
assert.equal(ownership.attemptCreated, false);
const rehearsal = JSON.parse(run(approvedTools.powershell.path, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", join(harnessRoot, "Invoke-OracleStage4R2DevelopmentRehearsal.ps1")]).stdout);
assert.equal(rehearsal.result, "passed");
assert.equal(rehearsal.authorityCreated, false);
assert.equal(rehearsal.attemptCreated, false);

const artifactRoot = join(repositoryRoot, contract.paths.artifactRoot);
const transferPreparation = spawnSync(approvedTools.node.path, [join(harnessRoot, "prepare-transfer.mjs")], { cwd: repositoryRoot, encoding: "utf8", shell: false, maxBuffer: 4 * 1024 * 1024 });
assert.notEqual(transferPreparation.status, 0, "Execution-barred R2 transfer preparation passed.");
assert.match(`${transferPreparation.stdout}${transferPreparation.stderr}`, /transfer preparation is not Founder-authorised by the bound contract/u);
const qualification = spawnSync(approvedTools.powershell.path, [
  "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", join(harnessRoot, "Invoke-OracleStage4R2Qualification.ps1"),
  "-FounderAuthorityToken", "UNAUTHORISED",
  "-FounderGrantId", "founder-stage4-r2-grant-20260804T120000123Z-a1b2c3d4",
  "-PreparationCommit", "0".repeat(40), "-PreparationTree", "0".repeat(40),
  "-PreflightRecord", join(artifactRoot, "absent.json"), "-PreflightSha256", "0".repeat(64),
  "-TransferRoot", join(artifactRoot, "transfers/absent"),
  "-TransferManifestSha256", "0".repeat(64), "-TransferCustodySha256", "0".repeat(64), "-TransferVerificationSha256", "0".repeat(64),
], { cwd: repositoryRoot, encoding: "utf8", shell: false, maxBuffer: 4 * 1024 * 1024 });
assert.notEqual(qualification.status, 0, "Execution-barred R2 qualification passed.");
assert.match(`${qualification.stdout}${qualification.stderr}`, /qualification execution is not Founder-authorised by the bound contract/u);
assert.equal(existsSync(join(artifactRoot, "authorities", "authority-stage4-r2-20260804T120000123Z-a1b2c3d4.json")), false);
assert.equal(existsSync(join(artifactRoot, "stage4-r2-20260804T120000123Z-a1b2c3d4")), false);

for (const [file, patterns] of [
  ["Invoke-OracleStage4R2PreAuthorityPreflight.ps1", [/Assert-OracleStage4R2Transfer/u, /TransferManifestSha256/u, /TransferCustodySha256/u, /TransferVerificationSha256/u]],
  ["Invoke-OracleStage4R2Qualification.ps1", [/Assert-OracleStage4R2Transfer/u, /transfer-admission\.json/u, /ORACLE_STAGE4_TRANSFER_ROOT/u]],
  ["Invoke-OracleStage4R2InstalledPackageJourney.ps1", [/transfer\.msixRelativePath/u, /transfer\.certificateRelativePath/u]],
  ["execute-live-environment.mjs", [/transfer\.migrationsRelativePath/u]],
]) {
  const text = readFileSync(join(harnessRoot, file), "utf8");
  for (const pattern of patterns) assert.match(text, pattern);
}

const qualificationHarness = readFileSync(join(harnessRoot, "Invoke-OracleStage4R2Qualification.ps1"), "utf8");
const transferAdmissionCalls = qualificationHarness
  .split(/\r?\n/u)
  .filter((line) => line.includes("Assert-OracleStage4R2Transfer"));
assert.equal(transferAdmissionCalls.length, 2, "Qualification must perform exactly two transfer-admission checks.");
for (const call of transferAdmissionCalls) {
  assert.match(
    call,
    /-ExpectedVerificationSha256\s+\$TransferVerificationSha256/u,
    "Every qualification transfer-admission check must bind the independently verified transfer hash.",
  );
}
const logsCreationIndex = qualificationHarness.indexOf("New-Item -ItemType Directory -Path (Join-Path $attemptRoot 'logs')");
const transferAdmissionIndex = qualificationHarness.indexOf("Write-CreateOnlyJson (Join-Path $attemptRoot 'logs\\transfer-admission.json')");
const liveControllerIndex = qualificationHarness.indexOf("execute-live-environment.mjs");
assert.ok(logsCreationIndex >= 0 && transferAdmissionIndex > logsCreationIndex && liveControllerIndex > transferAdmissionIndex, "Qualification directory ownership ordering is not fail-closed.");
console.log(JSON.stringify({
  result: "passed",
  classification: "STAGE-4-R2-ENGINEERING-CORRECTION-VALIDATION",
  founderAuthorisedQualificationExecution: false,
  acceptedPreparationPreserved: true,
  historicalArtifactsRehashed: contract.historicalEvidenceBindings.length,
  executionFilesVerified: executionManifest.files.length,
  transferRequired: true,
  transferPreparationPermitted: false,
  independentTransferVerificationRequired: true,
  maximumAttempts: 0,
  authorityCreated: false,
  attemptCreated: false,
}, null, 2));

function run(executable, args, env = process.env) {
  const result = spawnSync(executable, args, { cwd: repositoryRoot, env, encoding: "utf8", shell: false, maxBuffer: 64 * 1024 * 1024 });
  validateProcessEnvelope(result);
  return result;
}
