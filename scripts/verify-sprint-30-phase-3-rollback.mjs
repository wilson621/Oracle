import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const releaseDirectory = ".tmp-sprint-29/release";
const manifestPath = path.join(
  releaseDirectory,
  "oracle-release-manifest.json"
);
const evidencePath =
  "docs/sprints/evidence/sprint-30/phase-3/generated/sprint-29-rollback-regression.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const webRoot = fs.readFileSync(
  "lib/oracle/composition/web-composition-root.ts",
  "utf8"
);
const electronRoot = fs.readFileSync(
  "desktop/platform/desktop-composition-root.ts",
  "utf8"
);

assert.deepEqual(manifest.rollback, {
  allowedTargets: ["0.0.9.0"],
  arbitraryDowngrade: false,
});
assert.equal(manifest.signing.productionTrusted, false);
assert.equal(manifest.signing.deploymentAuthorised, false);
assert.equal(manifest.runtimeCompositionManifestVersion, "1.6.0");
assert.match(webRoot, /manifestVersion:\s*"1\.7\.0"/u);
assert.match(electronRoot, /manifestVersion:\s*"1\.7\.0"/u);

const msix = manifest.artifacts.find(({ kind }) => kind === "msix");
assert.ok(msix);
const msixPath = path.join(releaseDirectory, msix.path);
assert.equal(sha256(fs.readFileSync(msixPath)), msix.sha256);

const evidence = {
  schemaVersion: 1,
  verifiedAt: new Date().toISOString(),
  result: "passed-with-explicit-candidate-reconciliation-required",
  sprint29Regression: "passed-before-evidence-recording",
  releaseId: manifest.releaseId,
  packageVersion: manifest.packageVersion,
  releaseManifestRuntimeVersion: "1.6.0",
  currentRuntimeManifestVersion: "1.7.0",
  rollbackAllowlist: manifest.rollback.allowedTargets,
  arbitraryDowngrade: false,
  packageHash: "verified",
  replacementOrdering: "verified-by-sprint-29-contract-regression",
  releaseCandidateReconciliation:
    "required-before-integrated-qualification",
  packageRebuilt: false,
  packageResigned: false,
  productionTrusted: false,
  deployed: false,
  distributed: false,
};
fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(
  "Sprint 30 Phase 3 Sprint 29 rollback regression and candidate separation verified."
);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
