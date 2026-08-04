import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { validateContract } from "./stage5-r2-core.mjs";

const root = import.meta.dirname;
const repository = resolve(root, "..", "..", "..");
const contract = validateContract(JSON.parse(readFileSync(join(root, "Oracle.Stage5R2CleanHostContract.json"), "utf8")));
const manifest = JSON.parse(readFileSync(join(root, "Oracle.Stage5R2PreparationManifest.json"), "utf8"));
assert.equal(manifest.status, "engineering-preparation-qualification-barred");
assert.deepEqual([manifest.maximumTransfers, manifest.maximumAuthorities, manifest.maximumAttempts], [0, 0, 0]);
assert.equal(manifest.qualificationHostDeveloperToolCount, 0);
assert.equal(manifest.fixtureEquivalenceClaimed, false);
const sha256 = path => createHash("sha256").update(readFileSync(path)).digest("hex");
for (const entry of manifest.files) assert.equal(sha256(join(root, entry.path)), entry.sha256, entry.path);
const accepted = [
  ["docs/sprints/evidence/sprint-30-5/stage-2-requalification-r6/Oracle.Stage2RequalificationR6AcceptedEvidenceIndex.json", contract.acceptedChain.stage2.acceptedEvidenceIndexSha256],
  ["docs/sprints/evidence/sprint-30-5/stage-3-r12/Oracle.Stage3R12AcceptedEvidenceIndex.json", contract.acceptedChain.stage3.acceptedEvidenceIndexSha256],
  ["docs/sprints/evidence/sprint-30-5/stage-4-r4/Oracle.Stage4R4AcceptedEvidenceIndex.json", contract.acceptedChain.stage4.acceptedEvidenceIndexSha256],
  [".artifacts/sprint-30-5/stage-2-requalification-r6/r6-20260803T171057940Z-5e914d18/release/Oracle_0.1.4.0_x64_STAGE2_REQUALIFICATION_R6_LOCAL_TEST_ONLY.msix", contract.package.sha256],
];
for (const [path, expected] of accepted) assert.equal(sha256(join(repository, path)), expected, path);
const runtimeFiles = ["Oracle.Stage5CleanHostFixtureProvider.cs", "Invoke-OracleStage5R2EdgeSemanticProbe.ps1", "Measure-OracleStage5R2InstalledPackage.ps1", "Invoke-OracleStage5R2CompanionTransitions.ps1"];
for (const file of runtimeFiles) {
  const text = readFileSync(join(root, file), "utf8");
  for (const pattern of [/C:\\Dev\\project-meta/iu, /Get-Command\s+(git|node|npm|supabase|docker)/iu, /\b(repositoryRoot|git\.exe|node\.exe|npm\.cmd|supabase\.exe|docker\.exe)\b/iu]) assert.doesNotMatch(text, pattern, `${file} contains a clean-host-prohibited dependency`);
}
console.log(JSON.stringify({ result: "passed", classification: "NON-QUALIFICATION PREPARATION VERIFICATION", manifestFiles: manifest.files.length, acceptedBindings: accepted.length, transferCreated: false, authorityCreated: false, attemptCreated: false }));
