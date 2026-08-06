import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import {
  contract,
  sha256,
  validateAcceptedBindings,
  validateProgrammeIdentity,
  writeJsonAtomicCreateOnly,
} from "./stage3-core.mjs";

const args = parseArguments(process.argv.slice(2));
for (const name of ["transfer-root", "expected-manifest-sha256", "expected-custody-sha256", "expected-harness-commit", "output"]) {
  if (!args.has(name)) throw new Error(`Missing --${name}.`);
}
validateProgrammeIdentity(contract.programmeIdentity);
validateAcceptedBindings(contract.stage2);
assert.equal(contract.authority.transfer, "founder-authorised");
assert.equal(contract.authority.execution, "founder-authorised");
assert.equal(contract.mission.maximumTransfers, 1);
assert.equal(contract.mission.maximumAuthorities, 1);
assert.equal(contract.mission.maximumAttempts, 1);
assert.equal(contract.mission.retryAuthorised, false);

const transferRoot = resolve(args.get("transfer-root"));
const manifestPath = join(transferRoot, "Oracle.Stage3R13TransferManifest.json");
const custodyPath = join(transferRoot, "Oracle.Stage3R13TransferCustody.json");
const expectedRoot = [
  "Oracle.Stage3R13TransferCustody.json",
  "Oracle.Stage3R13TransferCustody.json.sha256.txt",
  "Oracle.Stage3R13TransferManifest.json",
  "Oracle.Stage3R13TransferManifest.json.sha256.txt",
  "payload",
].sort();
assert.deepEqual(readdirSync(transferRoot).sort(), expectedRoot);
assert.equal(sha256(manifestPath), args.get("expected-manifest-sha256"));
assert.equal(sha256(custodyPath), args.get("expected-custody-sha256"));
assert.equal(
  readFileSync(`${manifestPath}.sha256.txt`, "ascii"),
  `${args.get("expected-manifest-sha256")}  ${basename(manifestPath)}\n`
);
assert.equal(
  readFileSync(`${custodyPath}.sha256.txt`, "ascii"),
  `${args.get("expected-custody-sha256")}  ${basename(custodyPath)}\n`
);

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const custody = JSON.parse(readFileSync(custodyPath, "utf8"));
assert.equal(manifest.contract, "oracle.sprint-30-5.stage-3-r13-transfer");
assert.equal(manifest.programmeIdentity, contract.programmeIdentity);
assert.equal(manifest.revision, "R13");
assert.match(manifest.transferId, /^transfer-stage3-r13-\d{8}T\d{9}Z-[0-9a-f]{8}$/u);
assert.equal(manifest.preparation.harnessCommit, args.get("expected-harness-commit"));
assert.match(manifest.preparation.harnessTree, /^[0-9a-f]{40}$/u);
assert.equal(manifest.preparation.oeomVersion, "1.0");
assert.equal(manifest.executionAuthorisation, "founder-authorised");
assert.equal(manifest.method, contract.transferMedium.method);
assert.deepEqual(manifest.transferMedium, contract.transferMedium);
assert.deepEqual(manifest.acceptedStage2, contract.stage2);
assert.equal(manifest.privateKeyIncluded, false);
assert.equal(manifest.productionCredentialIncluded, false);
assert.equal(manifest.productSourceIncluded, false);
assert.equal(manifest.cleanHost.repositoryPermitted, false);
assert.equal(manifest.cleanHost.developmentToolInstallationPermitted, false);

assert.equal(custody.contract, "oracle.sprint-30-5.stage-3-r13-transfer-custody");
assert.equal(custody.programmeIdentity, contract.programmeIdentity);
assert.equal(custody.revision, "R13");
assert.equal(custody.transferId, manifest.transferId);
assert.equal(custody.authority, "FOUNDER-AUTHORISED-STAGE3-R13-TRANSFER");
assert.equal(custody.manifest.sha256, sha256(manifestPath));
assert.equal(custody.manifest.size, statSync(manifestPath).size);
assert.deepEqual(custody.transferMedium, contract.transferMedium);
assert.equal(custody.sourceRepository.harnessCommit, args.get("expected-harness-commit"));
assert.equal(custody.state, "prepared-create-only-awaiting-independent-verification");

const payloadRoot = join(transferRoot, "payload");
const entries = manifest.payload;
assert.ok(Array.isArray(entries) && entries.length > 0);
const paths = entries.map((entry) => entry.path);
assert.equal(new Set(paths).size, paths.length);
const actualPaths = readdirSync(payloadRoot).sort().map((name) => `payload/${name}`);
assert.deepEqual([...paths].sort(), actualPaths);
for (const entry of entries) {
  assert.match(entry.path, /^payload\/[^/\\]+$/u);
  assert.match(entry.sha256, /^[0-9a-f]{64}$/u);
  const path = join(transferRoot, entry.path);
  assert.equal(existsSync(path), true);
  assert.equal(statSync(path).size, entry.size);
  assert.equal(sha256(path), entry.sha256);
}
for (const required of contract.transferPayload.requiredFileNames) {
  assert.ok(paths.includes(`payload/${required}`), `Required payload missing: ${required}`);
}
const entryFor = (name) => entries.find((entry) => entry.path === `payload/${name}`);
for (const [name, expected] of [
  [contract.package.fileName, contract.stage2.msixSha256],
  [contract.package.publicCertificateFileName, contract.stage2.publicCertificateSha256],
  ["oracle-release-manifest.json", contract.stage2.releaseManifestSha256],
  ["oracle-release-manifest.json.p7s", contract.stage2.releaseManifestSignatureSha256],
  ["oracle-0.1.6.cdx.json", contract.stage2.sbomSha256],
  ["oracle-0.1.6.provenance.json", contract.stage2.provenanceSha256],
  ["package-content-inventory.json", contract.stage2.packageInventorySha256],
  ["signature-and-trust-verification.json", contract.stage2.signatureVerificationSha256],
  ["runtime-configuration-build-secrecy.json", contract.stage2.runtimeConfigurationBuildSecrecySha256],
  ["Oracle.Stage2RequalificationR8AcceptedEvidenceIndex.json", contract.stage2.acceptedEvidenceIndexSha256],
  ["SPRINT_30_5_STAGE_2_REQUALIFICATION_R8_CLOSURE.md", contract.stage2.closureSha256],
  ["final-evidence-manifest.json", contract.stage2.finalEvidenceManifestSha256],
  ["qualification-outcome.json", contract.stage2.qualificationOutcomeSha256],
  ["single-attempt-authority.json", contract.stage2.authoritySha256],
  ["host-continuity.json", contract.stage2.hostContinuitySha256],
]) {
  assert.equal(entryFor(name)?.sha256, expected, `Accepted binding differs: ${name}`);
}

const transferredContract = JSON.parse(readFileSync(join(payloadRoot, "Oracle.Stage3R13Contract.json"), "utf8"));
assert.deepEqual(transferredContract, contract);
const result = {
  schemaVersion: "1.0.0",
  contract: "oracle.sprint-30-5.stage-3-r13-independent-transfer-verification",
  result: "passed",
  classification: ["NON-QUALIFICATION", "NON-AUTHORITY", "TRANSFER-VERIFICATION"],
  transferId: manifest.transferId,
  manifestSha256: sha256(manifestPath),
  custodySha256: sha256(custodyPath),
  harnessCommit: manifest.preparation.harnessCommit,
  payloadFiles: entries.length,
  payloadBytes: entries.reduce((sum, entry) => sum + entry.size, 0),
  acceptedPackageSha256: contract.stage2.msixSha256,
  cleanHostBound: true,
  authorityCreated: false,
  attemptCreated: false,
  qualificationEvidenceCreated: false,
};
writeJsonAtomicCreateOnly(resolve(args.get("output")), result);
console.log(JSON.stringify({ ...result, output: resolve(args.get("output")), outputSha256: sha256(resolve(args.get("output"))) }, null, 2));

function parseArguments(values) {
  const parsed = new Map();
  for (let index = 0; index < values.length; index += 2) {
    if (!values[index]?.startsWith("--") || values[index + 1] === undefined) {
      throw new Error("Arguments must be --name value pairs.");
    }
    parsed.set(values[index].slice(2), values[index + 1]);
  }
  return parsed;
}
