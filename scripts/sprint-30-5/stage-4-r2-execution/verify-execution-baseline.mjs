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
assert.equal(contract.status, "founder-authorised-execution-enabled");
assert.equal(contract.executionAuthority.founderAuthorisedQualificationExecution, true);
assert.equal(contract.executionAuthority.authorityCreationPermitted, true);
assert.equal(contract.executionAuthority.qualificationAttemptPermitted, true);
assert.equal(contract.executionAuthority.maximumAttempts, 1);
assert.equal(contract.executionAuthority.retryAfterConsumedAuthorityPermitted, false);
assert.equal(contract.transfer.required, true);
assert.equal(contract.transfer.executionAuthorised, true);
assert.equal(contract.transfer.independentVerificationRequired, true);
assert.equal(contract.acceptedPreparation.commit, "82badb7bdc9c434815c9fcc4c49f6d88b9814bf6");
assert.equal(contract.acceptedPreparation.tree, "51f9bbc9bed6eb949c87a8495fd465df5690473f");
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
assert.equal(contract.historicalEvidenceBindings.length, 14);

const harnessRoot = import.meta.dirname;
assert.equal(readFileSync(join(harnessRoot, "prepare-transfer.mjs"), "utf8").includes('fs.mkdirSync(approvedRoot, { recursive: true });'), true);
const executionManifest = JSON.parse(readFileSync(join(harnessRoot, "Oracle.Stage4R2ExecutionManifest.json"), "utf8"));
assert.equal(executionManifest.contract, "oracle.sprint-30-5.stage-4-r2-execution-manifest");
assert.equal(executionManifest.founderAuthorisedQualificationExecution, true);
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
const rehearsal = JSON.parse(run(approvedTools.powershell.path, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", join(harnessRoot, "Invoke-OracleStage4R2DevelopmentRehearsal.ps1")]).stdout);
assert.equal(rehearsal.result, "passed");
assert.equal(rehearsal.authorityCreated, false);
assert.equal(rehearsal.attemptCreated, false);

const artifactRoot = join(repositoryRoot, contract.paths.artifactRoot);
const qualification = spawnSync(approvedTools.powershell.path, [
  "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", join(harnessRoot, "Invoke-OracleStage4R2Qualification.ps1"),
  "-FounderAuthorityToken", contract.executionAuthority.requiredFutureToken,
  "-FounderGrantId", "founder-stage4-r2-grant-20260804T120000123Z-a1b2c3d4",
  "-PreparationCommit", "0".repeat(40), "-PreparationTree", "0".repeat(40),
  "-PreflightRecord", join(artifactRoot, "absent.json"), "-PreflightSha256", "0".repeat(64),
  "-TransferRoot", join(artifactRoot, "transfers/absent"),
  "-TransferManifestSha256", "0".repeat(64), "-TransferCustodySha256", "0".repeat(64), "-TransferVerificationSha256", "0".repeat(64),
], { cwd: repositoryRoot, encoding: "utf8", shell: false, maxBuffer: 4 * 1024 * 1024 });
assert.notEqual(qualification.status, 0, "Missing transfer/preflight admitted qualification.");
assert.equal(existsSync(join(artifactRoot, "authorities")), false);
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

console.log(JSON.stringify({
  result: "passed",
  classification: "STAGE-4-R2-EXECUTION-BASELINE-VALIDATION",
  founderAuthorisedQualificationExecution: true,
  acceptedPreparationPreserved: true,
  historicalArtifactsRehashed: contract.historicalEvidenceBindings.length,
  executionFilesVerified: executionManifest.files.length,
  transferRequired: true,
  independentTransferVerificationRequired: true,
  maximumAttempts: 1,
  authorityCreated: false,
  attemptCreated: false,
}, null, 2));

function run(executable, args, env = process.env) {
  const result = spawnSync(executable, args, { cwd: repositoryRoot, env, encoding: "utf8", shell: false, maxBuffer: 64 * 1024 * 1024 });
  validateProcessEnvelope(result);
  return result;
}
