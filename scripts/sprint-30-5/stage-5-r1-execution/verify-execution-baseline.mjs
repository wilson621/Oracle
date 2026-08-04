import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { contract, repositoryRoot, sha256, validateAcceptedBindings, validateApprovedTool, validateProductBoundary } from "./stage5-core.mjs";

validateAcceptedBindings();
assert.deepEqual(validateProductBoundary(), contract.repository.permittedPostCandidateProductDrift.paths);
assert.equal(contract.status, "founder-authorised-execution-enabled");
assert.equal(contract.acceptedPreparation.commit, "6ba1c68f5330ac03b7359b0a6b03b2f8fb179df3");
assert.equal(contract.acceptedPreparation.tree, "dcca4b752faea044f31cc5ca4fa6d7922a2ccd6c");
assert.equal(contract.acceptedPreparation.preparationManifestSha256, "a193209552d9e75e43ee34da49368cc95b00ddcc99e938ade6f54c42167d763a");
assert.equal(contract.executionAuthority.founderAuthorisedQualificationExecution, true);
assert.equal(contract.authorityBoundary.maximumTransfers, 1);
assert.equal(contract.authorityBoundary.maximumAuthorities, 1);
assert.equal(contract.authorityBoundary.maximumAttempts, 1);
assert.equal(contract.authorityBoundary.retryPermitted, false);
assert.equal(contract.transfer.createOnly, true);
assert.equal(contract.transfer.independentVerificationRequired, true);

const tools = Object.fromEntries(["git", "node", "npmCli", "supabaseCli", "supabaseBinary", "docker", "powershell", "taskkill"].map(name => [name, validateApprovedTool(name)]));
assert.equal(statSync(process.execPath).isFile(), true);
const harnessRoot = import.meta.dirname;
const manifestPath = join(harnessRoot, "Oracle.Stage5R1ExecutionManifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
assert.equal(manifest.contract, "oracle.sprint-30-5.stage-5-r1-execution-manifest");
assert.equal(manifest.acceptedPreparationCommit, contract.acceptedPreparation.commit);
assert.equal(manifest.acceptedPreparationTree, contract.acceptedPreparation.tree);
assert.equal(manifest.acceptedPreparationManifestSha256, contract.acceptedPreparation.preparationManifestSha256);
assert.equal(manifest.founderAuthorisedQualificationExecution, true);
assert.equal(manifest.maximumTransfers, 1); assert.equal(manifest.maximumAuthorities, 1); assert.equal(manifest.maximumAttempts, 1);
assert.equal(manifest.retryPermitted, false); assert.equal(manifest.productModified, false);
const physical = readdirSync(harnessRoot).filter(name => name !== "Oracle.Stage5R1ExecutionManifest.json").filter(name => statSync(join(harnessRoot, name)).isFile()).sort(codePointCompare);
assert.deepEqual(manifest.files.map(item => item.path), physical);
for (const entry of manifest.files) {
  const path = join(harnessRoot, entry.path);
  assert.equal(statSync(path).size, entry.bytes, `Execution file size differs: ${entry.path}`);
  assert.equal(sha256(path), entry.sha256, `Execution file hash differs: ${entry.path}`);
}
const missionSource = readFileSync(join(harnessRoot, "Invoke-OracleStage5R1QualificationMission.ps1"), "utf8");
assert.ok(missionSource.indexOf("Write-CreateOnlyJson $authorityPath") > missionSource.indexOf("Invoke-OracleStage4R4PreAuthorityChecks"));
assert.ok(missionSource.includes("retryProhibited=$true"));
console.log(JSON.stringify({ result: "passed", classification: "STAGE-5-R1-EXECUTION-BASELINE-VALIDATION", executionFilesVerified: manifest.files.length, qualificationAdversarialCases: 51, authorityCreated: false, attemptCreated: false, transferCreated: false, productModified: false }, null, 2));

function codePointCompare(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

