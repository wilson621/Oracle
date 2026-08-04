import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const harnessRoot = import.meta.dirname;
const repositoryRoot = path.resolve(harnessRoot, "../../..");
const contract = JSON.parse(fs.readFileSync(path.join(harnessRoot, "Oracle.Stage4R3Contract.json"), "utf8"));
if (contract.status !== "founder-authorised-execution-enabled" || contract.transfer.executionAuthorised !== true || contract.executionAuthority.founderAuthorisedQualificationExecution !== true || contract.executionAuthority.authorityCreationPermitted !== true || contract.executionAuthority.qualificationAttemptPermitted !== true) {
  throw new Error("Stage 4 R3 transfer preparation is not Founder-authorised by the bound contract.");
}
const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i].replace(/^--/u, ""), process.argv[i + 1]);
const transferId = required("transfer-id");
const timestampUtc = required("timestamp-utc");
const executionCommit = required("execution-commit");
const executionTree = required("execution-tree");
assert.match(transferId, new RegExp(contract.identity.transferPattern, "u"));
const identity = transferId.slice("transfer-stage4-r3-".length);
assert.equal(timestampUtc.replace(/[-:.]/gu, "").replace(/Z$/u, "Z"), identity.slice(0, 19));
assert.equal(git(["rev-parse", "HEAD"]), executionCommit);
assert.equal(git(["rev-parse", "HEAD^{tree}"]), executionTree);
assert.equal(git(["status", "--porcelain=v1"]), "");
assert.equal(git(["branch", "--show-current"]), contract.repository.branch);

const approvedRoot = path.resolve(repositoryRoot, contract.paths.transferRoot);
const transferRoot = path.join(approvedRoot, transferId);
assertWithin(transferRoot, approvedRoot);
if (fs.existsSync(transferRoot)) throw new Error("Create-only transfer identity already exists.");
fs.mkdirSync(approvedRoot, { recursive: true });
fs.mkdirSync(transferRoot, { recursive: false });
const payloadRoot = path.join(transferRoot, contract.transfer.payloadDirectory);
fs.mkdirSync(payloadRoot);

copyDirectory(harnessRoot, path.join(payloadRoot, "harness"), () => true);
const migrationRoot = path.join(payloadRoot, "database/migrations");
fs.mkdirSync(migrationRoot, { recursive: true });
for (const name of contract.provider.requiredMigrations) copyFile(path.join(repositoryRoot, "database", name), path.join(migrationRoot, name));
const msixTarget = path.join(transferRoot, ...contract.transfer.msixRelativePath.split("/"));
copyFile(path.join(repositoryRoot, contract.package.artifactPath), msixTarget);
const certificateTarget = path.join(transferRoot, ...contract.transfer.certificateRelativePath.split("/"));
copyFile(path.join(repositoryRoot, contract.package.publicCertificatePath), certificateTarget);

const files = inventory(payloadRoot);
const executionManifestPath = path.join(harnessRoot, "Oracle.Stage4R3ExecutionManifest.json");
const manifest = {
  contract: "oracle.sprint-30-5.stage-4-r3-transfer-manifest",
  schemaVersion: "1.0.0",
  transferId,
  createdAtUtc: timestampUtc,
  executionCommit,
  executionTree,
  acceptedPreparationCommit: contract.acceptedPreparation.commit,
  acceptedPreparationTree: contract.acceptedPreparation.tree,
  acceptedPreparationManifestSha256: contract.acceptedPreparation.preparationManifestSha256,
  executionManifestSha256: sha256(executionManifestPath),
  founderAuthorisedQualificationExecution: contract.executionAuthority.founderAuthorisedQualificationExecution,
  singleAttemptOnly: true,
  files,
};
const manifestPath = path.join(transferRoot, contract.transfer.manifestFile);
writeCreateOnly(manifestPath, manifest);
const manifestSha256 = sha256(manifestPath);
writeTextCreateOnly(`${manifestPath}.sha256.txt`, `${manifestSha256}  ${path.basename(manifestPath)}\n`);
const custody = {
  contract: "oracle.sprint-30-5.stage-4-r3-transfer-custody",
  schemaVersion: "1.0.0",
  transferId,
  createdAtUtc: timestampUtc,
  manifestSha256,
  executionCommit,
  executionTree,
  createOnly: true,
  independentVerificationRequired: true,
  files: files.length,
  bytes: files.reduce((sum, item) => sum + item.bytes, 0),
  source: "accepted-r2-execution-baseline",
  destination: "local-qualification-host-admission-root",
};
const custodyPath = path.join(transferRoot, contract.transfer.custodyFile);
writeCreateOnly(custodyPath, custody);
const custodySha256 = sha256(custodyPath);
writeTextCreateOnly(`${custodyPath}.sha256.txt`, `${custodySha256}  ${path.basename(custodyPath)}\n`);
console.log(JSON.stringify({ transferId, transferRoot, manifestSha256, custodySha256, files: files.length, bytes: custody.bytes }, null, 2));

function required(name) { const value = args.get(name); if (!value) throw new Error(`Required argument is absent: --${name}`); return value; }
function git(arguments_) { const result = spawnSync(contract.toolchain.approvedTools.git.path, arguments_, { cwd: repositoryRoot, encoding: "utf8", shell: false }); if (result.status !== 0) throw new Error(result.stderr); return result.stdout.trim(); }
function assertWithin(candidate, root) { const resolved = path.resolve(candidate); const prefix = `${path.resolve(root)}${path.sep}`.toLowerCase(); if (!resolved.toLowerCase().startsWith(prefix)) throw new Error("Path escapes governed transfer root."); }
function copyDirectory(source, target, include) { fs.mkdirSync(target, { recursive: false }); for (const name of fs.readdirSync(source).sort()) { if (!include(name)) continue; const item = path.join(source, name); if (!fs.statSync(item).isFile()) throw new Error(`Unexpected harness entry: ${name}`); copyFile(item, path.join(target, name)); } }
function copyFile(source, target) { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL); }
function sha256(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function inventory(root) { return walk(root).map(file => ({ path: path.relative(root, file).replaceAll("\\", "/"), bytes: fs.statSync(file).size, sha256: sha256(file) })).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0); }
function walk(root) { return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => { const item = path.join(root, entry.name); if (entry.isSymbolicLink()) throw new Error("Reparse/symbolic transfer entry rejected."); return entry.isDirectory() ? walk(item) : entry.isFile() ? [item] : []; }); }
function writeCreateOnly(file, value) { writeTextCreateOnly(file, `${JSON.stringify(value, null, 2)}\n`); }
function writeTextCreateOnly(file, value) { fs.writeFileSync(file, value, { encoding: "utf8", flag: "wx" }); }
