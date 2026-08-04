import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { contract, evaluateRun, repositoryRoot } from "./stage5-core.mjs";

const argument = process.argv[2];
assert.ok(argument, "Installed rehearsal result path is required.");
const resultPath = resolve(repositoryRoot, argument);
const rehearsalRoot = resolve(repositoryRoot, contract.paths.rehearsalRoot);
assert.ok(
  resultPath.toLowerCase().startsWith(rehearsalRoot.toLowerCase() + "\\"),
  "Installed rehearsal result escapes its non-evidence root.",
);
const record = JSON.parse(readFileSync(resultPath, "utf8"));
assert.equal(record.result, "passed");
assert.deepEqual(record.classification, [
  "NON-QUALIFICATION",
  "NON-AUTHORITY",
  "NON-EVIDENCE",
  "INSTALLED DEVELOPMENT REHEARSAL",
]);
assert.equal(record.qualificationEvidence, false);
assert.equal(record.transferCreated, false);
assert.equal(record.authorityCreated, false);
assert.equal(record.attemptCreated, false);
assert.equal(record.timingMeasurementProvenance, "accepted-phase4-reference-not-installed-stage5-claim");
assert.equal(record.accessibility.qualificationAccessibilityClaimed, false);
const evaluation = evaluateRun(record, "development-rehearsal");
console.log(JSON.stringify({
  result: "passed",
  classification: "STAGE-5-R1-INSTALLED-DEVELOPMENT-REHEARSAL-VERIFICATION",
  qualificationEvidence: false,
  transferCreated: false,
  authorityCreated: false,
  attemptCreated: false,
  evaluation,
  stage4Journeys: record.stage4Rehearsal.requiredJourneys,
  zeroResidue: record.zeroResidue,
}, null, 2));
