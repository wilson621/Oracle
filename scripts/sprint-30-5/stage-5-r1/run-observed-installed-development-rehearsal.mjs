import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  assertSafeCreateOnly,
  contract,
  repositoryRoot,
  validateApprovedTool,
  validateProcessEnvelope,
} from "../stage-4-r4/stage4-core.mjs";

const principal = spawnSync(
  "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
  ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", "$p=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent());if($p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){exit 0}else{exit 5}"],
  { encoding: "utf8", shell: false }
);
if (principal.status !== 0) {
  throw new Error("Installed Stage 4 R4 development rehearsal requires an elevated process.");
}

const rehearsalBoundary = resolve(repositoryRoot, contract.paths.rehearsalRoot);
const identitySuffix = randomBytes(4).toString("hex");
const timestamp = new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(".", "");
const rehearsalIdentity = `stage4-r4-${timestamp}-${identitySuffix}`;
assert.match(rehearsalIdentity, new RegExp(contract.identity.attemptPattern, "u"));
const root = join(rehearsalBoundary, `installed-rehearsal-${identitySuffix}`);
assertSafeCreateOnly(root, rehearsalBoundary);
mkdirSync(root, { recursive: true });
mkdirSync(join(root, "logs"), { recursive: false });
const output = join(root, "evidence", "live-journey.json");
const tools = Object.fromEntries(
  ["node", "npmCli", "docker", "powershell", "taskkill"]
    .map(name => [name, validateApprovedTool(name)])
);
assert.equal(resolve(process.execPath).toLowerCase(), resolve(tools.node.path).toLowerCase());

const result = spawnSync(process.execPath, [join(import.meta.dirname, "execute-observed-environment.mjs")], {
  cwd: repositoryRoot,
  encoding: "utf8",
  shell: false,
  maxBuffer: 64 * 1024 * 1024,
  env: {
    ...process.env,
    ORACLE_STAGE4_EXECUTION_MODE: "development-rehearsal",
    ORACLE_STAGE4_ATTEMPT_ROOT: root,
    ORACLE_STAGE4_JOURNEY_OUTPUT: output,
    ORACLE_STAGE4_DOCKER_PATH: tools.docker.path,
    ORACLE_STAGE4_NPM_CLI_PATH: tools.npmCli.path,
    ORACLE_STAGE4_NODE_PATH: tools.node.path,
    ORACLE_STAGE4_POWERSHELL_PATH: tools.powershell.path,
    ORACLE_STAGE4_TASKKILL_PATH: tools.taskkill.path,
    ORACLE_STAGE4_DEVELOPMENT_REHEARSAL: "1",
    ORACLE_STAGE4_INSTALLED_DEVELOPMENT_REHEARSAL: "1",
    ORACLE_STAGE4_R3_REHEARSAL_IDENTITY: rehearsalIdentity,
  },
});

try {
  validateProcessEnvelope(result);
  const journey = JSON.parse(readFileSync(output, "utf8"));
  assert.deepEqual(journey.classification, ["NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "DEVELOPMENT REHEARSAL"]);
  assert.equal(journey.journeys.length, 10);
  assert.ok(journey.journeys.every(item => item.result === "passed"));
  const installed = JSON.parse(readFileSync(join(root, "logs", "installed-package-result.json"), "utf8"));
  assert.equal(installed.result, "passed");
  assert.equal(installed.zeroResidue, true);
  assert.equal(installed.secretValuesRecorded, false);
  assert.deepEqual(installed.classification, ["NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "INSTALLED DEVELOPMENT REHEARSAL"]);
const packageInstalled = installed.phases.find(item => item.phase === "package-installed");
  assert.ok(packageInstalled, "Installed package phase is absent.");
  const environment = JSON.parse(readFileSync(join(root, "logs", "environment-result.json"), "utf8"));
  assert.equal(environment.result, "passed");
  const observation = JSON.parse(readFileSync(join(root, "logs", "stage5-observation.json"), "utf8"));
  assert.equal(observation.result, "passed");
assert.deepEqual(observation.classification, ["NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "INSTALLED DEVELOPMENT REHEARSAL"]);
  assert.ok(observation.samples.length > 0, "Held Stage 5 observation has no samples.");
  const stage5StartupMilliseconds = Date.parse(observation.samples[0].observedAtUtc) - Date.parse(packageInstalled.observedAtUtc);
  assert.ok(Number.isFinite(stage5StartupMilliseconds) && stage5StartupMilliseconds >= 0, "Stage 5 startup timing provenance is invalid.");
  assert.equal(environment.zeroResidue, true);
  assert.equal(environment.cleanupFailures.length, 0);
  assert.equal(existsSync(join(repositoryRoot, ".next")), false);
  console.log(JSON.stringify({
    result: "passed",
    classification: installed.classification,
    authorityCreated: false,
    attemptCreated: false,
    qualificationEvidence: false,
    installedPackageExercised: true,
    acceptedR6MsixSha256: contract.stage2.msixSha256,
    requiredJourneys: journey.journeys.length,
    stage5Observation: observation,
    stage5StartupMilliseconds,
    stage5StartupProvenance: "package-installed-to-first-held-observation-sample",
    observationArchitecture: "single-held-observer-with-supervised-outer-reconciliation",
    zeroResidue: true,
  }, null, 2));
  rmSync(root, { recursive: true, force: false });
} catch (error) {
  throw new AggregateError(
    [error, new Error(`stdout: ${result.stdout}`), new Error(`stderr: ${result.stderr}`)],
    `Installed Stage 4 R4 development rehearsal failed; NON-QUALIFICATION diagnostics remain at ${root}`,
    { cause: error }
  );
}
