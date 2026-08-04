import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { validateContract } from "./stage5-r2-core.mjs";

const root = import.meta.dirname;
const source = JSON.parse(readFileSync(join(root, "Oracle.Stage5R2CleanHostContract.json"), "utf8"));
validateContract(structuredClone(source));
const attacks = [
  c => { c.authorityBoundary.maximumTransfers = 1; },
  c => { c.authorityBoundary.qualificationExecutionPermitted = true; },
  c => { c.host.repositoryPermitted = true; },
  c => { c.host.requiredAbsentDevelopmentTools = ["git"]; },
  c => { c.claimPartition.fixtureEquivalenceClaimed = true; },
  c => { c.cleanHostFixture.loopbackOnly = false; },
  c => { c.cleanHostFixture.productionEndpointsPermitted = true; },
  c => { c.package.sha256 = "0".repeat(64); },
  c => { c.qualificationProtocol.requiredRoutes.pop(); },
  c => { c.historicalTransfers[0].disposition = "reusable"; },
];
for (const attack of attacks) {
  const candidate = structuredClone(source); attack(candidate);
  assert.throws(() => validateContract(candidate));
}
console.log(JSON.stringify({ result: "passed", classification: "NON-QUALIFICATION ADVERSARIAL VALIDATION", rejectedMutations: attacks.length }));
