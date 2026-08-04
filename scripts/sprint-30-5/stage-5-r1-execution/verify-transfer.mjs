import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const harnessRoot = import.meta.dirname;
const repositoryRoot = path.resolve(harnessRoot, "../../..");
const contract = JSON.parse(fs.readFileSync(path.join(harnessRoot, "Oracle.Stage5R1Contract.json"), "utf8"));
const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i].replace(/^--/u, ""), process.argv[i + 1]);
const transferRoot = path.resolve(required("transfer-root"));
const approvedRoot = path.resolve(repositoryRoot, contract.paths.transferRoot);
assert.equal(transferRoot.toLowerCase().startsWith(`${approvedRoot}${path.sep}`.toLowerCase()), true);
const manifestPath = path.join(transferRoot, contract.transfer.manifestFile);
const custodyPath = path.join(transferRoot, contract.transfer.custodyFile);
const verificationPath = path.resolve(required("output"));
assert.equal(path.dirname(verificationPath).toLowerCase(), transferRoot.toLowerCase());
assert.equal(path.basename(verificationPath), contract.transfer.verificationFile);
assert.equal(fs.existsSync(verificationPath), false);
assert.equal(fs.existsSync(`${verificationPath}.sha256.txt`), false);
assert.equal(sha256(manifestPath), required("manifest-sha256").toLowerCase());
assert.equal(sha256(custodyPath), required("custody-sha256").toLowerCase());
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const custody = JSON.parse(fs.readFileSync(custodyPath, "utf8"));
assert.match(manifest.transferId, new RegExp(contract.identity.transferPattern, "u"));
assert.equal(manifest.executionCommit, required("execution-commit"));
assert.equal(manifest.executionTree, required("execution-tree"));
assert.equal(manifest.founderAuthorisedQualificationExecution, true);
assert.equal(manifest.singleAttemptOnly, true);
assert.equal(custody.transferId, manifest.transferId);
assert.equal(custody.manifestSha256, sha256(manifestPath));
assert.equal(custody.createOnly, true);
assert.equal(custody.independentVerificationRequired, true);
assert.equal(custody.source, "accepted-stage5-r1-execution-baseline");
const payloadRoot = path.join(transferRoot, contract.transfer.payloadDirectory);
const physical = inventory(payloadRoot);
assert.deepEqual(physical, manifest.files);
assert.equal(custody.files, physical.length);
assert.equal(custody.bytes, physical.reduce((sum, item) => sum + item.bytes, 0));
assert.equal(fs.readFileSync(`${manifestPath}.sha256.txt`, "utf8").trim(), `${sha256(manifestPath)}  ${path.basename(manifestPath)}`);
assert.equal(fs.readFileSync(`${custodyPath}.sha256.txt`, "utf8").trim(), `${sha256(custodyPath)}  ${path.basename(custodyPath)}`);
const verification = { contract: "oracle.sprint-30-5.stage-4-r4-transfer-verification", schemaVersion: "1.0.0", result: "passed", classification: "INDEPENDENT-TRANSFER-VERIFICATION", verifiedAtUtc: new Date().toISOString(), transferId: manifest.transferId, manifestSha256: sha256(manifestPath), custodySha256: sha256(custodyPath), executionCommit: manifest.executionCommit, executionTree: manifest.executionTree, files: physical.length, bytes: custody.bytes, authorityCreated: false, attemptCreated: false };
fs.writeFileSync(verificationPath, `${JSON.stringify(verification, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
const verificationSha256 = sha256(verificationPath);
fs.writeFileSync(`${verificationPath}.sha256.txt`, `${verificationSha256}  ${path.basename(verificationPath)}\n`, { encoding: "utf8", flag: "wx" });
console.log(JSON.stringify({ ...verification, verificationSha256 }, null, 2));

function required(name) { const value = args.get(name); if (!value) throw new Error(`Required argument is absent: --${name}`); return value; }
function sha256(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function inventory(root) { return walk(root).map(file => ({ path: path.relative(root, file).replaceAll("\\", "/"), bytes: fs.statSync(file).size, sha256: sha256(file) })).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0); }
function walk(root) { return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => { const item = path.join(root, entry.name); if (entry.isSymbolicLink()) throw new Error("Reparse/symbolic transfer entry rejected."); return entry.isDirectory() ? walk(item) : entry.isFile() ? [item] : []; }); }
