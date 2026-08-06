import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname);
const repository = resolve(root, "..", "..", "..");
const contract = JSON.parse(readFileSync(join(root, "Oracle.Stage4R5Contract.json"), "utf8"));
const topology = JSON.parse(readFileSync(join(root, "Oracle.Stage4R5ProviderTopology.json"), "utf8"));

assert.equal(contract.status, "engineering-preparation-qualification-barred");
assert.deepEqual(contract.classification, ["NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "ENGINEERING PREPARATION"]);
assert.equal(contract.acceptedChain.stage2.revision, "R8");
assert.equal(contract.acceptedChain.stage2.candidateCommit, "4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d");
assert.equal(contract.package.sha256, "97bedef7bae989ac251e4866835591c63550311aef6b172cf5caf3b204a6e490");
assert.equal(contract.acceptedChain.stage3.revision, "R13");
assert.equal(contract.acceptedChain.stage3.attemptId, "stage3-r13-20260806T162253957Z-b0cb2a17");
assert.equal(contract.acceptedChain.stage3.providerConnectivityClaimed, false);
assert.equal(contract.acceptedChain.stage3.authenticationClaimed, false);
assert.equal(contract.acceptedChain.historicalStage4.revision, "R4");
assert.equal(contract.acceptedChain.historicalStage4.disposition, "accepted-immutable-history-for-r6-r12-only");
assert.equal(contract.requiredJourneys.length, 10);
assert.equal(contract.requiredLifecycle.length, 20);
assert.equal(contract.claimPreservation.realSupabaseProviderRequired, true);
assert.equal(contract.claimPreservation.providerFixtureEquivalencePermitted, false);
assert.equal(contract.claimPreservation.mainPcQualificationExceptionPermitted, false);
for (const value of Object.values(contract.authorityBoundary)) if (typeof value === "boolean" && value !== contract.authorityBoundary.engineeringPreparationAuthorised && value !== contract.authorityBoundary.futureExecutionRequiresSeparateFounderAuthority) assert.equal(value, false);
assert.equal(contract.authorityBoundary.maximumTransfers, 0);
assert.equal(contract.authorityBoundary.maximumAuthorities, 0);
assert.equal(contract.authorityBoundary.maximumAttempts, 0);
assert.deepEqual(contract.hostArchitecture.qualificationHost.requiredAbsentDevelopmentTools, ["git", "node", "npm", "supabase", "docker", "python", "dotnet", "msbuild"]);
assert.deepEqual(contract.network.providerPublications, [54321, 54324]);
assert.equal(contract.network.postgresRemoteAccessPermitted, false);
assert.equal(contract.network.internetPermittedDuringQualification, false);
assert.equal(topology.qualificationHost.identity, "Founder-QA-01");
assert.equal(topology.providerHost.qualificationExecution, false);

const cleanHostFiles = [
  "Invoke-OracleStage4R5CleanHostJourney.ps1",
  "Oracle.Stage4R5JourneyPolicy.ps1",
  "Oracle.Stage4R5LifecyclePolicy.ps1",
  "Oracle.Stage4R5NetworkPolicy.ps1",
];
for (const file of cleanHostFiles) {
  const text = readFileSync(join(root, file), "utf8");
  for (const pattern of [/C:\\Dev\\project-meta/iu, /Get-Command\s+(git|node|npm|supabase|docker|python|dotnet|msbuild)/iu, /\b(git\.exe|node\.exe|npm\.cmd|supabase\.exe|docker\.exe|python\.exe|dotnet\.exe|msbuild\.exe)\b/iu]) assert.doesNotMatch(text, pattern, `${file} contains a clean-host-prohibited dependency`);
}

const scripts = readdirSync(root).filter(name => name.endsWith(".ps1"));
const powershell = resolve(process.env.SystemRoot ?? "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
const parse = spawnSync(powershell, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", `$errors=@();Get-ChildItem -LiteralPath '${root.replaceAll("'", "''")}' -Filter '*.ps1'|ForEach-Object{$tokens=$null;$parse=$null;[void][Management.Automation.Language.Parser]::ParseFile($_.FullName,[ref]$tokens,[ref]$parse);$errors+=@($parse)};if($errors.Count-ne0){$errors|ForEach-Object{Write-Error $_.Message};exit 1}`], { encoding: "utf8", windowsHide: true });
assert.equal(parse.status, 0, `${parse.stdout}\n${parse.stderr}`);
const policy = spawnSync(powershell, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", join(root, "Test-OracleStage4R5Policies.ps1")], { encoding: "utf8", windowsHide: true });
assert.equal(policy.status, 0, `${policy.stdout}\n${policy.stderr}`);
const policyRecord = JSON.parse(policy.stdout);
assert.equal(policyRecord.result, "passed");
assert.equal(policyRecord.providerStateCreated, false);
assert.equal(policyRecord.relayStateCreated, false);
assert.equal(policyRecord.transferCreated, false);
assert.equal(policyRecord.authorityCreated, false);
assert.equal(policyRecord.attemptCreated, false);

const git = resolve(process.env.ProgramFiles ?? "C:\\Program Files", "Git", "cmd", "git.exe");
const changed = spawnSync(git, ["status", "--porcelain"], { cwd: repository, encoding: "utf8", windowsHide: true });
assert.equal(changed.status, 0, changed.stderr);
for (const line of changed.stdout.split(/\r?\n/u).filter(Boolean)) {
  const path = line.slice(3).replaceAll("\\", "/");
  assert.ok(path.startsWith("scripts/sprint-30-5/stage-4-r5/") || path.startsWith("docs/"), `Out-of-scope preparation change: ${path}`);
}

process.stdout.write(`${JSON.stringify({
  result: "passed",
  classification: ["NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "ENGINEERING PREPARATION VERIFICATION"],
  powershellScriptsParsed: scripts.length,
  requiredJourneys: contract.requiredJourneys.length,
  requiredLifecyclePhases: contract.requiredLifecycle.length,
  providerImplementation: contract.provider.implementation,
  qualificationHost: contract.hostArchitecture.qualificationHost.identity,
  providerStateCreated: false,
  relayStateCreated: false,
  transferCreated: false,
  authorityCreated: false,
  attemptCreated: false,
}, null, 2)}\n`);
