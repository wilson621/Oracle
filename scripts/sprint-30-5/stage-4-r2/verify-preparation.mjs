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
  validateExecutionIdentity,
  validateProcessEnvelope,
} from "./stage4-core.mjs";

validateAcceptedBindings();
assert.equal(contract.status, "engineering-preparation-complete-pending-founder-execution-authority");
assert.equal(contract.executionAuthority.founderAuthorisedQualificationExecution, false);
assert.equal(contract.executionAuthority.authorityCreationPermitted, false);
assert.equal(contract.executionAuthority.qualificationAttemptPermitted, false);
assert.equal(contract.executionAuthority.preparationMayMintToken, false);
assert.equal(contract.executionAuthority.failClosedWithoutFutureContractBinding, true);
assert.equal(contract.stage2.revision, "R6");
assert.equal(contract.stage3.revision, "R12");
assert.equal(contract.historicalStage4.revision, "R1");
assert.equal(contract.package.installationRequired, true);
assert.equal(contract.package.removalRequired, true);
assert.equal(contract.installedRuntime.strictPackagedServerEnvironmentRequired, true);
assert.equal(contract.requiredJourneys.length, 10);
assert.equal(contract.requiredLifecycle.length, 20);

const approvedTools = Object.fromEntries(
  ["git", "node", "npmCli", "supabaseCli", "supabaseBinary", "docker", "powershell", "taskkill"]
    .map(name => [name, validateApprovedTool(name)])
);
assert.equal(process.execPath.toLowerCase(), approvedTools.node.path.toLowerCase());

const harnessRoot = import.meta.dirname;
const preparationManifest = JSON.parse(readFileSync(join(harnessRoot, "Oracle.Stage4R2PreparationManifest.json"), "utf8"));
assert.equal(preparationManifest.contract, "oracle.sprint-30-5.stage-4-r2-preparation-manifest");
assert.equal(preparationManifest.executionAuthorised, false);
assert.equal(preparationManifest.qualificationExecuted, false);
const physicalInventory = readdirSync(harnessRoot)
  .filter(name => name !== "Oracle.Stage4R2PreparationManifest.json")
  .filter(name => statSync(join(harnessRoot, name)).isFile())
  .sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
assert.deepEqual(preparationManifest.files.map(entry => entry.path), physicalInventory);
for (const entry of preparationManifest.files) {
  const itemPath = join(harnessRoot, entry.path);
  assert.equal(statSync(itemPath).size, entry.bytes, `Preparation size differs: ${entry.path}`);
  assert.equal(sha256(itemPath), entry.sha256, `Preparation hash differs: ${entry.path}`);
}

for (const binding of contract.historicalEvidenceBindings) {
  const path = join(repositoryRoot, binding.path);
  assert.equal(existsSync(path), true, `Historical binding absent: ${binding.path}`);
  assert.equal(statSync(path).isFile(), true, `Historical binding is not a file: ${binding.path}`);
  assert.equal(sha256(path), binding.sha256, `Historical binding differs: ${binding.path}`);
}
assert.equal(contract.historicalEvidenceBindings.length, 12);
assert.equal(sha256(join(repositoryRoot, contract.package.artifactPath)), contract.stage2.msixSha256);
assert.equal(sha256(join(repositoryRoot, contract.package.publicCertificatePath)), contract.package.publicCertificateSha256);

const candidateTree = run(approvedTools.git.path, ["show", "-s", "--format=%T", contract.repository.acceptedCandidateCommit]).stdout.trim();
assert.equal(candidateTree, contract.repository.acceptedCandidateTree);
const changedPaths = run(approvedTools.git.path, ["diff", "--name-only", contract.historicalStage4.candidateCommit, contract.stage2.candidateCommit, "--", ...contract.repository.productPaths]).stdout.trim().split(/\r?\n/u).filter(Boolean);
assert.equal(changedPaths.length, 17);
assert.equal(run(approvedTools.git.path, ["diff", "--name-only", contract.historicalStage4.candidateCommit, contract.stage2.candidateCommit, "--", "database"]).stdout.trim(), "");
assert.equal(run(approvedTools.git.path, ["diff", "--name-only", contract.historicalStage4.candidateCommit, contract.stage2.candidateCommit, "--", "package-lock.json"]).stdout.trim(), "");

validateExecutionIdentity({
  authorityId: "authority-stage4-r2-20260804T120000123Z-a1b2c3d4",
  attemptId: "stage4-r2-20260804T120000123Z-a1b2c3d4",
  timestampUtc: "2026-08-04T12:00:00.123Z",
});
assert.throws(() => validateExecutionIdentity({
  authorityId: "authority-stage4-r2-20260804T120000123Z-a1b2c3d4",
  attemptId: "stage4-r2-20260804T120000123Z-ffffffff",
  timestampUtc: "2026-08-04T12:00:00.123Z",
}));

const modules = readdirSync(harnessRoot).filter(name => name.endsWith(".mjs"));
for (const name of modules) run(approvedTools.node.path, ["--check", join(harnessRoot, name)]);

const powershellFiles = readdirSync(harnessRoot).filter(name => name.endsWith(".ps1"));
for (const name of powershellFiles) {
  const path = join(harnessRoot, name).replaceAll("'", "''");
  run(approvedTools.powershell.path, ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", `$e=$null;$t=$null;[Management.Automation.Language.Parser]::ParseFile('${path}',[ref]$t,[ref]$e)|Out-Null;if($e.Count){$e|ForEach-Object{Write-Error $_.Message};exit 1}`]);
}
for (const name of [
  "Test-OracleStage4R2Policies.ps1",
  "Test-OracleStage4R2ActivationPolicy.ps1",
  "Test-OracleStage4R2InstalledRuntimeConfigurationPolicy.ps1",
]) {
  run(approvedTools.powershell.path, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", join(harnessRoot, name)]);
}

const rehearsal = JSON.parse(run(approvedTools.powershell.path, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", join(harnessRoot, "Invoke-OracleStage4R2DevelopmentRehearsal.ps1")]).stdout);
assert.equal(rehearsal.result, "passed");
assert.equal(rehearsal.authorityCreated, false);
assert.equal(rehearsal.attemptCreated, false);
assert.equal(rehearsal.hostMutation, false);
assert.equal(rehearsal.qualificationEvidence, false);
assert.equal(rehearsal.failureInjectionCount, 20);

const artifactRoot = join(repositoryRoot, contract.paths.artifactRoot);
const qualification = spawnSync(approvedTools.powershell.path, [
  "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File",
  join(harnessRoot, "Invoke-OracleStage4R2Qualification.ps1"),
  "-FounderAuthorityToken", contract.executionAuthority.requiredFutureToken,
  "-FounderGrantId", "founder-stage4-r2-grant-20260804T120000123Z-a1b2c3d4",
  "-PreparationCommit", "0".repeat(40), "-PreparationTree", "0".repeat(40),
  "-PreflightRecord", join(artifactRoot, "absent.json"),
  "-PreflightSha256", "0".repeat(64),
], { cwd: repositoryRoot, encoding: "utf8", shell: false, maxBuffer: 4 * 1024 * 1024 });
assert.notEqual(qualification.status, 0, "Execution-barred R2 contract admitted qualification.");
assert.match(`${qualification.stdout}\n${qualification.stderr}`, /not Founder-authorised/u);
assert.equal(existsSync(join(artifactRoot, "authorities")), false);
assert.equal(existsSync(join(artifactRoot, "stage4-r2-20260804T120000123Z-a1b2c3d4")), false);

const installedText = readFileSync(join(harnessRoot, "Invoke-OracleStage4R2InstalledPackageJourney.ps1"), "utf8");
for (const pattern of [
  /R2 contract does not authorise qualification execution/u,
  /Import-Certificate/u,
  /Add-AppxPackage/u,
  /New-OracleInstalledRuntimeConfiguration/u,
  /Invoke-OracleStage4R2ApplicationActivation/u,
  /Get-NetTCPConnection -State Listen/u,
  /exact-installed-package-process-tree/u,
  /Remove-AppxPackage/u,
  /Get-ExactCertificate/u,
  /zeroResidue/u,
]) assert.match(installedText, pattern);
for (const forbidden of [
  /NEXT_PUBLIC_SUPABASE_URL/u,
  /NEXT_PUBLIC_SUPABASE_ANON_KEY/u,
  /Start-Process[^\n]+-Verb\s+RunAs/u,
]) assert.doesNotMatch(installedText, forbidden);
for (const strictModeScalarCount of [
  /(?<!@)\(Get-OraclePackages\)\.Count/u,
  /(?<!@)\(Get-ExactCertificate\)\.Count/u,
]) assert.doesNotMatch(installedText, strictModeScalarCount);

const controllerText = readFileSync(join(harnessRoot, "execute-live-environment.mjs"), "utf8");
assert.match(controllerText, /mode === "qualification"/u);
assert.match(controllerText, /Invoke-OracleStage4R2InstalledPackageJourney\.ps1/u);
assert.match(controllerText, /delete sharedEnvironment\[forbidden\]/u);
assert.match(controllerText, /installed-package-safety-teardown/u);

const qualificationText = readFileSync(join(harnessRoot, "Invoke-OracleStage4R2Qualification.ps1"), "utf8");
assert.match(qualificationText, /qualificationAttemptPermitted/u);
assert.match(qualificationText, /installed-package-result\.json/u);
assert.doesNotMatch(qualificationText, /Publish-Lifecycle 'source-built'/u);

console.log(JSON.stringify({
  result: "passed",
  classification: "STAGE-4-R2-ENGINEERING-PREPARATION-VALIDATION",
  qualificationExecuted: false,
  authorityCreated: false,
  attemptCreated: false,
  historicalArtifactsRehashed: contract.historicalEvidenceBindings.length,
  acceptedR6MsixRehashed: true,
  acceptedR12ClosureRehashed: true,
  historicalR1Rehashed: true,
  productContractDeltaPaths: changedPaths.length,
  lifecycleFailureInjections: rehearsal.failureInjectionCount,
  preparationFilesVerified: preparationManifest.files.length,
  executionBarredByContract: true,
}, null, 2));

function run(executable, args, env = process.env) {
  const result = spawnSync(executable, args, {
    cwd: repositoryRoot,
    env,
    encoding: "utf8",
    shell: false,
    maxBuffer: 64 * 1024 * 1024,
  });
  validateProcessEnvelope(result);
  return result;
}
