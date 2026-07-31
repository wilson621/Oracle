import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { closeSync, constants, existsSync, linkSync, lstatSync, mkdirSync, openSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

export const repositoryRoot = resolve(import.meta.dirname, "..", "..", "..");
export const contractPath = join(import.meta.dirname, "Oracle.Stage4R1Contract.json");
export const contract = Object.freeze(JSON.parse(readFileSync(contractPath, "utf8").replace(/^\uFEFF/u, "")));
const shaPattern = /^[0-9a-f]{64}$/u;
const compactTime = "(\\d{8}T\\d{9}Z)";
const suffix = "([0-9a-f]{8})";
const attemptPattern = new RegExp(`^stage4-r1-${compactTime}-${suffix}$`, "u");
const authorityPattern = new RegExp(`^authority-stage4-r1-${compactTime}-${suffix}$`, "u");

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
  for (const group of [contract.stage2, contract.stage3]) {
    for (const [key, value] of Object.entries(group)) if (key.toLowerCase().includes("sha256")) assert.match(value, shaPattern);
  }
  assert.equal(contract.stage2.revision, "R3");
  assert.equal(contract.stage2.candidateCommit, contract.repository.acceptedCandidateCommit);
  assert.equal(contract.stage2.candidateTree, contract.repository.acceptedCandidateTree);
  assert.equal(contract.stage2.msixSha256, "c2dc7c68bcc9b6dd8c3a8e39d6db5f1d5b8230b64906524e9a4c01cf25aa65d1");
  assert.equal(contract.stage3.evidenceManifestSha256, "19a8248a06b37d5fac73b42d35ac96049d3ede09249360b064d9dd692d07defe");
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
export function assertSafeCreateOnly(path, boundary) {
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
