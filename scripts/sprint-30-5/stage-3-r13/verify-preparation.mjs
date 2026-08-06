import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  contract,
  repositoryRoot,
  sha256,
  validateAcceptedBindings,
  validateProcessEnvelope,
  validateProgrammeIdentity,
  validateTransferConstructionAuthority,
} from "./stage3-core.mjs";

const harnessRoot = import.meta.dirname;
const readJson = (path) => JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/u, ""));
const requireHash = (path, expected, label) => {
  if (!existsSync(path)) throw new Error(`${label} is absent: ${path}`);
  assert.equal(sha256(path), expected, `${label} hash differs`);
};

validateProgrammeIdentity(contract.programmeIdentity);
assert.equal(contract.revision, "R13");
assert.equal(contract.requiredBranch, "sprint-9-overlay");
assert.equal(contract.stage2.revision, "R8");
assert.equal(contract.package.version, "0.1.6.0");
assert.equal(contract.package.fileName, "Oracle_0.1.6.0_x64_STAGE2_REQUALIFICATION_R8_LOCAL_TEST_ONLY.msix");
assert.equal(contract.stage2.msixSha256, "97bedef7bae989ac251e4866835591c63550311aef6b172cf5caf3b204a6e490");
assert.equal(contract.stage2.certificateThumbprint, "A01F08EB5A07308FEAB3812692516C667D50EA56");
assert.equal(contract.stage2.archiveRequired, false);
assert.equal(contract.stage2.archiveProduced, false);
validateAcceptedBindings(contract.stage2);

assert.equal(contract.engineeringWorkstation.deviceName, "DESKTOP-M3H22E4");
assert.equal(contract.engineeringWorkstation.repositoryRequired, true);
assert.equal(contract.transferMedium.approvalState, "not-authorised-under-current-preparation");
assert.equal(contract.host.deviceName.toUpperCase(), "FOUNDER-QA-01");
assert.equal(contract.host.repositoryPermitted, false);
assert.equal(contract.host.developmentToolInstallationPermitted, false);
for (const dependency of ["git", "node", "npm", "supabase", "docker", "python", "dotnet", "msbuild"]) {
  assert.ok(contract.host.prohibitedDependencies.includes(dependency));
}
assert.ok(contract.host.forbiddenRepositoryPaths.includes("C:\\Dev\\project-meta"));

assert.equal(contract.authority.preparation, "founder-authorised-bounded-engineering-preparation");
for (const field of ["transfer", "execution", "stage4", "production", "publication", "deployment"]) {
  assert.equal(contract.authority[field], "not-authorised");
}
assert.equal(contract.preparationState.transferCreated, false);
assert.equal(contract.preparationState.authorityCreated, false);
assert.equal(contract.preparationState.attemptCreated, false);
assert.equal(contract.preparationState.qualificationEvidenceCreated, false);
assert.equal(contract.preparationState.transferCreationPermitted, false);
assert.equal(contract.preparationState.qualificationExecutionPermitted, false);
assert.equal(contract.preparationState.maximumTransfers, 0);
assert.equal(contract.preparationState.maximumAuthorities, 0);
assert.equal(contract.preparationState.maximumAttempts, 0);
assert.throws(
  () => validateTransferConstructionAuthority("FOUNDER-AUTHORISED-STAGE3-R13-TRANSFER"),
  /not authorised/u
);

const freezeRoot = resolve(repositoryRoot, contract.stage2.engineeringFreezeRoot);
const releaseRoot = join(freezeRoot, "release");
const verificationRoot = join(freezeRoot, "verification");
requireHash(join(freezeRoot, "Oracle.Stage2R8EngineeringCandidateFreeze.json"), contract.stage2.engineeringFreezeSha256, "R8 engineering freeze");
for (const [name, expected] of [
  [contract.package.fileName, contract.stage2.msixSha256],
  [contract.package.publicCertificateFileName, contract.stage2.publicCertificateSha256],
  ["oracle-release-manifest.json", contract.stage2.releaseManifestSha256],
  ["oracle-release-manifest.json.p7s", contract.stage2.releaseManifestSignatureSha256],
  ["oracle-0.1.6.cdx.json", contract.stage2.sbomSha256],
  ["oracle-0.1.6.provenance.json", contract.stage2.provenanceSha256],
  ["package-content-inventory.json", contract.stage2.packageInventorySha256],
  ["signature-and-trust-verification.json", contract.stage2.signatureVerificationSha256],
]) requireHash(join(releaseRoot, name), expected, `R8 release ${name}`);
requireHash(join(verificationRoot, "runtime-configuration-build-secrecy.json"), contract.stage2.runtimeConfigurationBuildSecrecySha256, "R8 runtime secrecy record");
assert.equal(statSync(join(releaseRoot, contract.package.fileName)).size, contract.stage2.msixBytes);

const acceptedRoot = join(
  repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5",
  "stage-2-requalification-r8"
);
const attemptRoot = join(acceptedRoot, contract.stage2.attemptId);
requireHash(join(acceptedRoot, "Oracle.Stage2RequalificationR8AcceptedEvidenceIndex.json"), contract.stage2.acceptedEvidenceIndexSha256, "accepted R8 index");
requireHash(join(attemptRoot, "final-evidence-manifest.json"), contract.stage2.finalEvidenceManifestSha256, "accepted R8 final manifest");
requireHash(join(attemptRoot, "evidence", "qualification-outcome.json"), contract.stage2.qualificationOutcomeSha256, "accepted R8 outcome");
requireHash(join(attemptRoot, "single-attempt-authority.json"), contract.stage2.authoritySha256, "accepted R8 authority");
requireHash(join(attemptRoot, "evidence", "host-continuity.json"), contract.stage2.hostContinuitySha256, "accepted R8 continuity");
requireHash(join(attemptRoot, "attempt-completion.json"), contract.stage2.completionSha256, "accepted R8 completion");
requireHash(join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_2_REQUALIFICATION_R8_CLOSURE.md"), contract.stage2.closureSha256, "accepted R8 closure");
requireHash(resolve(repositoryRoot, contract.acceptedHistoricalStage3.acceptedEvidenceIndexPath), contract.acceptedHistoricalStage3.acceptedEvidenceIndexSha256, "accepted R12 index");
requireHash(resolve(repositoryRoot, contract.acceptedHistoricalStage3.closurePath), contract.acceptedHistoricalStage3.closureSha256, "accepted R12 closure");

const phaseAudit = readJson(join(harnessRoot, "Oracle.Stage3R13PhaseAudit.json"));
const phases = phaseAudit.phases ?? phaseAudit.lifecyclePhases ?? [];
assert.equal(phases.length, 14, "R13 must retain the accepted fourteen-phase lifecycle");
assert.equal(new Set(phases.map((phase) => phase.phase ?? phase.name ?? phase.id)).size, 14);

const allFiles = readdirSync(harnessRoot).filter((name) => statSync(join(harnessRoot, name)).isFile());
assert.ok(allFiles.length >= 40);
const combined = allFiles
  .filter((name) => /\.(?:ps1|mjs|json|md)$/iu.test(name) && name !== "verify-preparation.mjs")
  .map((name) => readFileSync(join(harnessRoot, name), "utf8"))
  .join("\n");
for (const stale of [
  "Stage2RequalificationR6", "stage-2-requalification-r6",
  "STAGE2_REQUALIFICATION_R6", "Oracle_0.1.4.0_x64",
  "492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430",
]) assert.equal(combined.includes(stale), false, `stale live binding remains: ${stale}`);
const transferBuilderSource = readFileSync(join(harnessRoot, "prepare-transfer.mjs"), "utf8");
assert.match(transferBuilderSource, /execution-enabled transfer construction requires an execution-authorised contract/u);
assert.match(transferBuilderSource, /payload: entries/u);
assert.match(transferBuilderSource, /oeomVersion: "1.0"/u);
assert.ok(transferBuilderSource.includes('authority: args.get("founder-authority")'));
assert.match(transferBuilderSource, /manifest: \{/u);
assert.ok(transferBuilderSource.includes('.sha256.txt'));
assert.match(readFileSync(join(harnessRoot, "Get-OracleStage3R13HostContinuity.ps1"), "utf8"), /forbiddenRepositoryPaths/u);
assert.match(readFileSync(join(harnessRoot, "Oracle.Stage3R13PreflightPolicy.ps1"), "utf8"), /forbiddenRepositoryPaths/u);
assert.match(readFileSync(join(harnessRoot, "Oracle.Stage3R13InstalledRuntimeConfigurationPolicy.ps1"), "utf8"), /ApplicationDataManager\.CreateForPackageFamily/u);

const powershell = resolve(process.env.SystemRoot ?? "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
const syntaxScript = [
  "$ErrorActionPreference='Stop'",
  "$errors=@()",
  `Get-ChildItem -LiteralPath '${harnessRoot.replaceAll("'", "''")}' -Filter '*.ps1' | ForEach-Object {`,
  "  $tokens=$null; $parse=$null",
  "  [void][Management.Automation.Language.Parser]::ParseFile($_.FullName,[ref]$tokens,[ref]$parse)",
  "  if(@($parse).Count){$errors += $parse}",
  "}",
  "if(@($errors).Count){$errors | Format-List | Out-String | Write-Error}",
].join("; ");
const syntaxRun = spawnSync(powershell, ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", syntaxScript], {
  cwd: repositoryRoot, encoding: "utf8", shell: false, windowsHide: true, maxBuffer: 16 * 1024 * 1024,
});
validateProcessEnvelope(syntaxRun);

const unitTests = allFiles
  .filter((name) => /^Test-.*\.ps1$/u.test(name))
  .filter((name) => !/DevelopmentPlatformCompatibility|ElevatedActivationIntegration|PostResetPackageDataIntegration|PackageInventoryPolicy|ScriptPath/u.test(name))
  .sort();
for (const test of unitTests) {
  const result = spawnSync(powershell, [
    "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
    "-File", join(harnessRoot, test),
  ], { cwd: repositoryRoot, encoding: "utf8", shell: false, windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
  try {
    validateProcessEnvelope(result);
  } catch (error) {
    throw new AggregateError([error, new Error(result.stdout), new Error(result.stderr)], `${test} failed`);
  }
}

const parameterizedTests = [
  {
    name: "Test-OracleStage3R13PackageInventoryPolicy.ps1",
    args: [
      "-AcceptedPackagePath", join(releaseRoot, contract.package.fileName),
      "-AcceptedInventoryPath", join(releaseRoot, "package-content-inventory.json"),
      "-ContractPath", join(harnessRoot, "Oracle.Stage3R13Contract.json"),
    ],
  },
  {
    name: "Test-OracleStage3R13DevelopmentPlatformCompatibility.ps1",
    args: ["-AcceptedPackagePath", join(releaseRoot, contract.package.fileName)],
  },
];
for (const test of parameterizedTests) {
  const result = spawnSync(powershell, [
    "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
    "-File", join(harnessRoot, test.name), ...test.args,
  ], { cwd: repositoryRoot, encoding: "utf8", shell: false, windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
  try {
    validateProcessEnvelope(result);
  } catch (error) {
    throw new AggregateError([error, new Error(result.stdout), new Error(result.stderr)], `${test.name} failed`);
  }
}
const rehearsalRun = spawnSync(powershell, [
  "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
  "-File", join(harnessRoot, "Invoke-OracleStage3R13DevelopmentRehearsal.ps1"),
], { cwd: repositoryRoot, encoding: "utf8", shell: false, windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
validateProcessEnvelope(rehearsalRun);
const rehearsal = JSON.parse(rehearsalRun.stdout);
assert.equal(rehearsal.result, "passed");
assert.equal(rehearsal.successPathPhases.length, 14);
assert.equal(rehearsal.failureInjectionCount, 14);
assert.equal(rehearsal.authorityConsumed, false);
assert.equal(rehearsal.hostMutation, false);
assert.equal(rehearsal.qualificationEvidenceCreated, false);

console.log(JSON.stringify({
  result: "passed",
  classification: ["NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "ENGINEERING-PREPARATION"],
  programmeIdentity: contract.programmeIdentity,
  acceptedStage2Revision: contract.stage2.revision,
  acceptedStage2PackageSha256: contract.stage2.msixSha256,
  reusedLifecycle: contract.acceptedHistoricalStage3.revision,
  lifecyclePhases: phases.length,
  powershellScriptsParsed: allFiles.filter((name) => name.endsWith(".ps1")).length,
  unitTestsPassed: unitTests.length + parameterizedTests.length,
  rehearsalFailureInjections: rehearsal.failureInjectionCount,
  cleanHostBound: true,
  transferCreated: false,
  authorityCreated: false,
  attemptCreated: false,
  qualificationEvidenceCreated: false,
}, null, 2));
