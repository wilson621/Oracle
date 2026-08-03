import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { assertSafeCreateOnly, contract, repositoryRoot, validateApprovedTool, validateProcessEnvelope } from "./stage4-core.mjs";

const rehearsalBoundary = resolve(repositoryRoot, contract.paths.rehearsalRoot);
const root = join(rehearsalBoundary, `rehearsal-${randomBytes(8).toString("hex")}`);
assertSafeCreateOnly(root, rehearsalBoundary); mkdirSync(root, { recursive: true });
const output = join(root, "evidence", "live-journey.json");
const tools = Object.fromEntries(["node", "npmCli", "docker", "powershell", "taskkill"].map(name => [name, validateApprovedTool(name)]));
assert.equal(resolve(process.execPath).toLowerCase(), resolve(tools.node.path).toLowerCase(), "Rehearsal was not launched by the contract-approved Node executable.");
const args = [join(import.meta.dirname, "execute-live-environment.mjs")];
const result = spawnSync(process.execPath, args, { cwd: repositoryRoot, encoding: "utf8", shell: false, maxBuffer: 64 * 1024 * 1024, env: { ...process.env, ORACLE_STAGE4_EXECUTION_MODE: "development-rehearsal", ORACLE_STAGE4_ATTEMPT_ROOT: root, ORACLE_STAGE4_JOURNEY_OUTPUT: output, ORACLE_STAGE4_DOCKER_PATH: tools.docker.path, ORACLE_STAGE4_NPM_CLI_PATH: tools.npmCli.path, ORACLE_STAGE4_NODE_PATH: tools.node.path, ORACLE_STAGE4_POWERSHELL_PATH: tools.powershell.path, ORACLE_STAGE4_TASKKILL_PATH: tools.taskkill.path, ORACLE_STAGE4_DEVELOPMENT_REHEARSAL: "1" } });
try {
  validateProcessEnvelope(result);
  const journey = JSON.parse(readFileSync(output, "utf8")); assert.deepEqual(journey.classification, ["NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "DEVELOPMENT REHEARSAL"]);
  const ids = journey.journeys.map(item => item.id); assert.deepEqual([...ids].sort(codePointCompare), [...contract.requiredJourneys].sort(codePointCompare)); assert.ok(journey.journeys.every(item => item.result === "passed"));
  const environment = JSON.parse(readFileSync(join(root, "logs", "environment-result.json"), "utf8")); assert.equal(environment.mode, "development-rehearsal"); assert.equal(environment.result, "passed"); assert.equal(environment.zeroResidue, true); assert.equal(environment.cleanupFailures.length, 0);
  const processSummary = JSON.parse(readFileSync(join(root, "logs", "process-summary.json"), "utf8"));
  for (const label of ["provider-start", "provider-status"]) {
    const matches = processSummary.filter(record => record.label === label);
    assert.equal(matches.length, 1, "Expected one " + label + " process record.");
    assert.deepEqual(matches[0].arguments.slice(-2), ["--output", "json"], label + " did not use the governed JSON output contract.");
  }
  assert.equal(existsSync(join(repositoryRoot, ".next")), false, "Web build residue remains.");
  console.log(JSON.stringify({ result: "passed", classification: journey.classification, authorityCreated: false, attemptCreated: false, qualificationEvidence: false, liveProviderExercised: true, requiredJourneys: journey.journeys.length, operationalPhases: environment.phaseEvents.map(item => item.phase), zeroResidue: true }, null, 2));
  rmSync(root, { recursive: true, force: false });
} catch (error) {
  throw new AggregateError([error, new Error(`stdout: ${result.stdout}`), new Error(`stderr: ${result.stderr}`)], `Stage 4 live development rehearsal failed; NON-QUALIFICATION diagnostics remain at ${root}`, { cause: error });
}
function codePointCompare(a, b) { return a < b ? -1 : a > b ? 1 : 0; }