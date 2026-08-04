import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { closeSync, constants, existsSync, linkSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from "node:path";

export const repositoryRoot = resolve(import.meta.dirname, "..", "..", "..");
export const contractPath = join(import.meta.dirname, "Oracle.Stage4R3Contract.json");
export const contract = Object.freeze(JSON.parse(readFileSync(contractPath, "utf8").replace(/^\uFEFF/u, "")));
const shaPattern = /^[0-9a-f]{64}$/u;
const compactTime = "(\\d{8}T\\d{9}Z)";
const suffix = "([0-9a-f]{8})";
const attemptPattern = new RegExp(`^stage4-r3-${compactTime}-${suffix}$`, "u");
const authorityPattern = new RegExp(`^authority-stage4-r3-${compactTime}-${suffix}$`, "u");

export function sha256(path) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
export function canonicalUtc(timestampUtc) {
  const value = new Date(timestampUtc);
  if (Number.isNaN(value.valueOf()) || value.toISOString() !== timestampUtc) throw new Error("Timestamp must be canonical ISO-8601 UTC.");
  return timestampUtc.replaceAll("-", "").replaceAll(":", "").replace(".", "");
}
export function validateExecutionIdentity({ authorityId, attemptId, timestampUtc }) {
  const authority = authorityPattern.exec(authorityId ?? "");
  const attempt = attemptPattern.exec(attemptId ?? "");
  if (!authority || !attempt || authority[1] !== canonicalUtc(timestampUtc) || attempt[1] !== authority[1] || attempt[2] !== authority[2]) {
    throw new Error("Stage 4 authority and attempt identity mismatch.");
  }
}
export function validateAcceptedBindings() {
  for (const group of [contract.stage2, contract.stage3, contract.historicalStage4]) {
    for (const [key, value] of Object.entries(group)) {
      if (key.toLowerCase().includes("sha256")) assert.match(value, shaPattern);
    }
  }
  assert.equal(contract.schemaVersion, "3.0.0");
  assert.equal(contract.revision, "R3");
  assert.equal(contract.executionSurface, "accepted-r6-installed-msix");
  assert.equal(contract.stage2.revision, "R6");
  assert.equal(contract.stage2.candidateCommit, contract.repository.acceptedCandidateCommit);
  assert.equal(contract.stage2.candidateTree, contract.repository.acceptedCandidateTree);
  assert.equal(contract.stage2.msixSha256, "492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430");
  assert.equal(contract.stage3.revision, "R12");
  assert.equal(contract.stage3.evidenceManifestSha256, "d0238d0859a871d2589f66cbddc5f337b33638b32a02375b71f39fc2dac461d0");
  assert.equal(contract.stage3.providerConnectivityClaimed, false);
  assert.equal(contract.stage3.authenticationClaimed, false);
  assert.equal(contract.historicalStage4.revision, "R1");
  assert.equal(contract.status, "engineering-preparation-qualification-barred");
  assert.equal(contract.executionAuthority.founderAuthorisedQualificationExecution, false);
  assert.equal(contract.executionAuthority.authorityCreationPermitted, false);
  assert.equal(contract.executionAuthority.qualificationAttemptPermitted, false);
  assert.equal(contract.executionAuthority.requiredFutureToken, null);
  assert.equal(contract.executionAuthority.maximumAttempts, 0);
  assert.equal(contract.executionAuthority.retryAfterConsumedAuthorityPermitted, false);
  assert.equal(contract.transfer.executionAuthorised, false);
  assert.equal(contract.historicalStage4R2Failure.result, "failed");
  assert.equal(contract.historicalStage4R2Failure.disposition, "accepted-immutable-failed-qualification");
  assert.equal(contract.historicalStage4R2Failure.failureSha256, "eff42158ed5fdf9a25c4bd4535762f09e624061939835789850bf69481298538");
  assert.equal(contract.historicalStage4R2Failure.failureClosureSha256, "deb9a5c53a4be5bebbad5d21de0563036069e2aa7f19fb8f3b264280dbf0da86");
  assert.equal(contract.historicalStage4R2Failure.acceptedFailedEvidenceIndexSha256, "1473cc282818567ea6f76ab240ea833a4689bf0f3ca6193843667247a0b75fde");
  assert.equal(contract.historicalStage4R2Failure.retryProhibited, true);
  assert.equal(contract.acceptedR2Correction.correctionCommit, "8fc782df9869bc3c0e85a0d6d01ee7ef0d866175");
  assert.equal(contract.acceptedR2Correction.correctionTree, "911684539ef85f88e2092daacb896795097e0dd8");
  assert.equal(contract.acceptedR2Correction.programmeClosureCommit, "1514ebc830e902cbb9440f2108b13e7daf29babe");
  assert.equal(contract.acceptedR2Correction.programmeClosureTree, "808f0f4bbc8bd72b749a04099ae8a2fe88e55398");
  assert.equal(contract.acceptedR2Correction.executionManifestSha256, "a8466c117d087d04634c34f04743adf35071723daa8675711e1fd870e6e6a5f1");
  assert.equal(contract.acceptedR2Correction.engineeringClosureSha256, "09b11b2f0b2bdf617d2d0476bd5bb41ab5f5e8dcc600cdefe6b3489b6e99ea12");

}
export function validateSupabaseOfflinePolicy() {
  const policy = contract.toolchain?.supabaseOfflineTelemetry;
  if (!policy || typeof policy !== "object") throw new Error("Supabase offline telemetry policy is absent.");
  assert.equal(policy.environmentVariable, "SUPABASE_TELEMETRY_DISABLED");
  assert.equal(policy.value, "1");
  assert.equal(policy.nativeBinaryEnvironmentVariable, "SUPABASE_CLI_BINARY_OVERRIDE");
  assert.deepEqual(policy.commands, ["--version", "init", "start", "status", "stop"]);
  assert.equal(policy.networkAccessPermitted, false);
  assert.equal(policy.nonZeroExitAccepted, false);
  assert.equal(policy.policySource, "https://supabase.com/docs/guides/local-development/cli/getting-started#telemetry");
  return Object.freeze({ ...policy, commands: Object.freeze([...policy.commands]) });
}
export function validateSupabaseMachineReadableOutputPolicy() {
  const policy = contract.toolchain?.supabaseMachineReadableOutput;
  if (!policy || typeof policy !== "object" || Array.isArray(policy)) throw new Error("Supabase machine-readable output policy is absent.");
  assert.equal(policy.argument, "--output");
  assert.equal(policy.value, "json");
  assert.deepEqual(policy.commands, ["start", "status"]);
  assert.equal(policy.topLevelType, "object");
  assert.equal(policy.emptyOutputAccepted, false);
  assert.equal(policy.humanReadableOutputAccepted, false);
  return Object.freeze({ ...policy, commands: Object.freeze([...policy.commands]) });
}
export function buildSupabaseJsonArguments(command, commandArguments = []) {
  const policy = validateSupabaseMachineReadableOutputPolicy();
  if (typeof command !== "string" || !policy.commands.includes(command)) throw new Error(`Supabase command is not approved for JSON output: ${command}`);
  if (!Array.isArray(commandArguments) || commandArguments.some(argument => typeof argument !== "string")) throw new Error("Supabase command arguments are invalid.");
  if (commandArguments.some(argument => argument === policy.argument || argument === "-o" || argument.startsWith(`${policy.argument}=`))) throw new Error("Supabase output format may only be supplied by the governed policy.");
  return [command, ...commandArguments, policy.argument, policy.value];
}
export function parseSupabaseJsonObject(stdout, label) {
  if (typeof label !== "string" || !label) throw new Error("Supabase JSON output label is absent.");
  if (typeof stdout !== "string" || !stdout.trim()) throw new Error(`${label} emitted empty output instead of JSON.`);
  const text = stdout.trim();
  if (!text.startsWith("{")) throw new Error(`${label} emitted human-readable or non-object output instead of JSON.`);
  let value;
  try { value = JSON.parse(text); } catch (error) { throw new Error(`${label} emitted malformed JSON.`, { cause: error }); }
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} JSON must be one object.`);
  return value;
}
export function createGovernedEnvironment(baseEnvironment, governedPath, supabaseBinaryPath) {
  if (!baseEnvironment || typeof baseEnvironment !== "object" || Array.isArray(baseEnvironment)) throw new Error("Base process environment is invalid.");
  if (typeof governedPath !== "string" || !governedPath || typeof supabaseBinaryPath !== "string" || !supabaseBinaryPath) throw new Error("Governed tool environment binding is incomplete.");
  const policy = validateSupabaseOfflinePolicy();
  const replaced = new Set(["path", policy.environmentVariable.toLowerCase(), policy.nativeBinaryEnvironmentVariable.toLowerCase()]);
  const environment = Object.fromEntries(Object.entries(baseEnvironment).filter(([key]) => !replaced.has(key.toLowerCase())));
  environment.Path = governedPath;
  environment[policy.environmentVariable] = policy.value;
  environment[policy.nativeBinaryEnvironmentVariable] = supabaseBinaryPath;
  assertSupabaseOfflineEnvironment(environment, supabaseBinaryPath);
  return environment;
}
export function assertSupabaseOfflineEnvironment(environment, supabaseBinaryPath) {
  const policy = validateSupabaseOfflinePolicy();
  for (const [name, value] of [[policy.environmentVariable, policy.value], [policy.nativeBinaryEnvironmentVariable, supabaseBinaryPath]]) {
    const matches = Object.keys(environment ?? {}).filter(key => key.toLowerCase() === name.toLowerCase());
    if (matches.length !== 1 || matches[0] !== name || environment[name] !== value) throw new Error(`Governed Supabase environment mismatch: ${name}`);
  }
  return true;
}
export function isSameOrDescendant(path, root) {
  const relation = relative(resolve(root), resolve(path));
  return relation === "" || (!relation.startsWith(`..${sep}`) && relation !== ".." && !isAbsolute(relation));
}
export function assertNoLinkTraversal(path, boundary) {
  const target = resolve(path); const root = resolve(boundary);
  if (!isSameOrDescendant(target, root)) throw new Error("Path escapes governed boundary.");
  let current = root;
  if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error("Governed root is a link.");
  for (const part of relative(root, target).split(sep).filter(Boolean)) {
    current = join(current, part);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error("Link traversal rejected.");
  }
  return target;
}
export function admitAttemptDirectoryLayout({ attemptRoot, artifactBoundary, teardownOnly = false, expectedRootEntries = [], expectedLogFiles = [] }) {
  const root = assertNoLinkTraversal(attemptRoot, artifactBoundary);
  if (!existsSync(root) || !lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink()) throw new Error("Attempt root must be a caller-owned non-link directory.");
  const logsRoot = assertNoLinkTraversal(join(root, "logs"), root);
  if (!existsSync(logsRoot) || !lstatSync(logsRoot).isDirectory() || lstatSync(logsRoot).isSymbolicLink()) throw new Error("Caller-owned attempt logs directory is absent or invalid.");
  const providerRoot = assertNoLinkTraversal(join(root, "provider"), root);
  if (teardownOnly) {
    if (existsSync(providerRoot) && (!lstatSync(providerRoot).isDirectory() || lstatSync(providerRoot).isSymbolicLink())) throw new Error("Provider teardown root is not a non-link directory.");
  } else {
    if (!Array.isArray(expectedRootEntries) || !Array.isArray(expectedLogFiles)) throw new Error("Attempt directory admission inventory is absent.");
    if (existsSync(providerRoot)) throw new Error("Live-controller-owned provider directory already exists.");
    const rootEntries = readdirSync(root, { withFileTypes: true });
    if (rootEntries.some(entry => entry.isSymbolicLink())) throw new Error("Attempt root contains a linked entry.");
    assert.deepEqual(rootEntries.map(entry => entry.name).sort(), [...expectedRootEntries].sort(), "Attempt root inventory differs from the mode-bound ownership contract.");
    const logEntries = readdirSync(logsRoot, { withFileTypes: true });
    if (logEntries.some(entry => !entry.isFile() || entry.isSymbolicLink())) throw new Error("Caller-owned logs contain a non-regular entry.");
    assert.deepEqual(logEntries.map(entry => entry.name).sort(), [...expectedLogFiles].sort(), "Caller-owned log inventory differs from the mode-bound ownership contract.");
    mkdirSync(providerRoot, { recursive: false });
  }
  return Object.freeze({ root, logsRoot, providerRoot, logsOwnership: "caller-shared-create-only", providerOwnership: "live-controller-exclusive-ephemeral" });
}
export function validateApprovedTool(name) {
  const specification = contract.toolchain?.approvedTools?.[name];
  if (!specification || typeof specification.path !== "string" || typeof specification.realPath !== "string" || typeof specification.sha256 !== "string") throw new Error(`Approved tool identity is incomplete: ${name}`);
  const target = resolve(specification.path);
  if (target.toLowerCase() !== specification.path.toLowerCase()) throw new Error(`Approved tool path is not canonical: ${name}`);
  assertNoLinkTraversal(target, parse(target).root);
  const metadata = lstatSync(target);
  if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error(`Approved tool is not a non-reparse regular file: ${name}`);
  const realPath = realpathSync.native(target);
  if (realPath.toLowerCase() !== specification.realPath.toLowerCase()) throw new Error(`Approved tool real-path mismatch: ${name}`);
  const hash = sha256(target);
  if (hash !== specification.sha256) throw new Error(`Approved tool SHA-256 mismatch: ${name}`);
  return Object.freeze({ name, path: target, realPath, sha256: hash, regularFile: true, reparsePoint: false, ancestryReparseFree: true });
}export function assertSafeCreateOnly(path, boundary) {
  const target = assertNoLinkTraversal(path, boundary);
  for (const protectedRoot of contract.historicalProtectedRoots) {
    if (isSameOrDescendant(target, resolve(repositoryRoot, protectedRoot))) throw new Error("Historical evidence is immutable.");
  }
  if (existsSync(target)) throw new Error("Create-only destination exists.");
  return target;
}
export function writeCreateOnly(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  const descriptor = openSync(path, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY);
  try { writeFileSync(descriptor, content); } finally { closeSync(descriptor); }
}
export function writeJsonAtomicCreateOnly(path, value) {
  if (existsSync(path)) throw new Error("Governed evidence already exists.");
  const temporary = `${path}.partial-${process.pid}`;
  try {
    writeCreateOnly(temporary, `${JSON.stringify(value, null, 2)}\n`);
    linkSync(temporary, path);
  } finally { if (existsSync(temporary)) unlinkSync(temporary); }
}
export function validateProviderEndpoint(value) {
  const url = new URL(value);
  if (url.protocol !== "http:") throw new Error("Disposable provider must use the isolated HTTP route.");
  const host = url.hostname;
  const loopback = host === "127.0.0.1" || host === "localhost";
  if (!loopback || url.username || url.password) throw new Error("Provider endpoint is not loopback-only.");
  return url.toString().replace(/\/$/u, "");
}
export function redactEvidence(value, secretValues) {
  let text = typeof value === "string" ? value : JSON.stringify(value);
  for (const secret of secretValues) if (typeof secret === "string" && secret.length > 0) text = text.replaceAll(secret, "[REDACTED]");
  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/u.test(text)) throw new Error("JWT-like value remains in evidence.");
  return text;
}
export function validateProcessEnvelope(result) {
  if (!result || typeof result !== "object") throw new Error("Process result is absent.");
  if (result.error) throw new Error(`Process startup failed: ${result.error.message}`);
  if (result.signal) throw new Error(`Process terminated by signal ${result.signal}.`);
  if (!Number.isInteger(result.status)) throw new Error("Process exit status is null or undefined.");
  if (result.status !== 0) throw new Error(`Process exited with status ${result.status}.`);
  return result;
}
export function inventory(root, paths) {
  return [...paths].sort((a, b) => a < b ? -1 : a > b ? 1 : 0).map(path=>({path:relative(root,path).replaceAll("\\","/"),size:statSync(path).size,sha256:sha256(path)}));
}
