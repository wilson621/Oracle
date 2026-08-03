import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

export const repositoryRoot = resolve(import.meta.dirname, "..", "..", "..");
export const contractPath = join(
  import.meta.dirname,
  "Oracle.Stage3R10Contract.json"
);
export const contract = Object.freeze(
  JSON.parse(readFileSync(contractPath, "utf8").replace(/^\uFEFF/u, ""))
);

const shaPattern = /^[0-9a-f]{64}$/u;
const compactTime = "(\\d{8}T\\d{9}Z)";
const suffix = "([0-9a-f]{8})";
const attemptPattern = new RegExp(`^stage3-r10-${compactTime}-${suffix}$`, "u");
const authorityPattern = new RegExp(
  `^authority-stage3-r10-${compactTime}-${suffix}$`,
  "u"
);
const transferPattern = new RegExp(`^transfer-stage3-r10-${compactTime}-${suffix}$`, "u");

export function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function canonicalUtc(timestampUtc) {
  const value = new Date(timestampUtc);
  if (Number.isNaN(value.valueOf()) || value.toISOString() !== timestampUtc) {
    throw new Error("Timestamp must be canonical ISO-8601 UTC.");
  }
  return timestampUtc.replaceAll("-", "").replaceAll(":", "").replace(".", "");
}

function validateScopedId(value, timestampUtc, pattern, label) {
  const match = pattern.exec(value ?? "");
  if (!match) {
    throw new Error(`${label} has an invalid Stage 3 R10 format.`);
  }
  if (match[1] !== canonicalUtc(timestampUtc)) {
    throw new Error(`${label} timestamp does not match timestampUtc.`);
  }
  return match[2];
}

export function validateExecutionIdentity({
  authorityId,
  attemptId,
  timestampUtc,
}) {
  const authoritySuffix = validateScopedId(
    authorityId,
    timestampUtc,
    authorityPattern,
    "Authority ID"
  );
  const attemptSuffix = validateScopedId(
    attemptId,
    timestampUtc,
    attemptPattern,
    "Attempt ID"
  );
  if (authoritySuffix !== attemptSuffix) {
    throw new Error("Authority and attempt suffixes must match.");
  }
}

export function validateTransferIdentity({ transferId, timestampUtc }) {
  validateScopedId(transferId, timestampUtc, transferPattern, "Transfer ID");
}

export function isSameOrDescendant(path, root) {
  const relation = relative(resolve(root), resolve(path));
  return (
    relation === "" ||
    (!relation.startsWith(`..${sep}`) && relation !== ".." && !isAbsolute(relation))
  );
}

export function assertOutsideHistoricalRoots(path) {
  const target = resolve(path);
  for (const protectedRoot of contract.historicalProtectedRoots) {
    if (isSameOrDescendant(target, resolve(repositoryRoot, protectedRoot))) {
      throw new Error(`Refusing output in immutable root: ${protectedRoot}`);
    }
  }
  return target;
}

export function assertNoLinkTraversal(
  path,
  boundary,
  filesystem = { existsSync, lstatSync }
) {
  const target = resolve(path);
  const root = resolve(boundary);
  if (filesystem.existsSync(root) && filesystem.lstatSync(root).isSymbolicLink()) {
    throw new Error(`Approved boundary is a symbolic link or junction: ${root}`);
  }
  if (!isSameOrDescendant(target, root)) {
    throw new Error("Output escapes its approved boundary.");
  }
  const segments = relative(root, target).split(sep).filter(Boolean);
  let current = root;
  for (const segment of segments) {
    current = join(current, segment);
    if (
      filesystem.existsSync(current) &&
      filesystem.lstatSync(current).isSymbolicLink()
    ) {
      throw new Error(`Output traverses a symbolic link or junction: ${current}`);
    }
  }
}

export function assertCreateOnlyDestination(path, boundary) {
  const target = assertOutsideHistoricalRoots(path);
  assertNoLinkTraversal(target, boundary);
  if (existsSync(target)) {
    throw new Error(`Create-only destination already exists: ${target}`);
  }
  return target;
}

export function createDirectoryExclusive(path, boundary) {
  const target = assertCreateOnlyDestination(path, boundary);
  mkdirSync(target, { recursive: false });
  return target;
}

export function writeFileCreateOnly(path, content, encoding = "utf8") {
  mkdirSync(dirname(path), { recursive: true });
  const descriptor = openSync(path, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY);
  try {
    writeFileSync(descriptor, content, Buffer.isBuffer(content) ? undefined : { encoding });
  } finally {
    closeSync(descriptor);
  }
}

export function writeJsonAtomicCreateOnly(path, value) {
  if (existsSync(path)) {
    throw new Error(`Refusing to replace governed evidence: ${path}`);
  }
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.partial-${process.pid}`;
  if (existsSync(temporary)) {
    throw new Error(`Atomic temporary destination already exists: ${temporary}`);
  }
  try {
    writeFileCreateOnly(temporary, `${JSON.stringify(value, null, 2)}\n`);
    try {
      linkSync(temporary, path);
    } catch (error) {
      throw new Error(`Atomic create-only publication failed: ${error.message}`, {
        cause: error,
      });
    }
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
}

export function copyFileCreateOnly(source, destination) {
  const data = readFileSync(source);
  writeFileCreateOnly(destination, data, undefined);
  if (sha256(source) !== sha256(destination) || statSync(source).size !== statSync(destination).size) {
    throw new Error(`Copied bytes do not match source: ${source}`);
  }
}

export function validateCertificateWindow(nowUtc) {
  const now = new Date(nowUtc);
  const deadline = new Date(contract.stage2.latestExecutionStartUtc);
  const expiry = new Date(contract.stage2.certificateNotAfterUtc);
  if ([now, deadline, expiry].some((value) => Number.isNaN(value.valueOf()))) {
    throw new Error("Certificate time state is ambiguous.");
  }
  if (deadline.valueOf() !== expiry.valueOf() - 24 * 60 * 60 * 1000) {
    throw new Error("The mandatory 24-hour certificate margin is inconsistent.");
  }
  if (now.valueOf() >= deadline.valueOf()) {
    throw new Error("The Stage 3 execution-start certificate margin is unavailable.");
  }
}

export function validateAcceptedBindings(candidate) {
  const expected = contract.stage2;
  for (const field of [
    "attemptId",
    "authorityId",
    "candidateCommit",
    "candidateTree",
    "harnessCommit",
    "harnessTree",
    "closureCommit",
    "closureTree",
    "acceptedEvidenceIndexSha256",
    "finalEvidenceManifestSha256",
    "archiveSha256",
    "msixSha256",
    "releaseManifestSha256",
    "releaseManifestSignatureSha256",
    "sbomSha256",
    "provenanceSha256",
    "certificateThumbprint",
  ]) {
    if (candidate[field] !== expected[field]) {
      throw new Error(`Accepted Stage 2 R4 binding mismatch: ${field}`);
    }
  }
  for (const field of [
    "acceptedEvidenceIndexSha256",
    "finalEvidenceManifestSha256",
    "archiveSha256",
    "msixSha256",
    "releaseManifestSha256",
    "releaseManifestSignatureSha256",
    "sbomSha256",
    "provenanceSha256",
  ]) {
    assert.match(candidate[field], shaPattern);
  }
}

export function validateProcessEnvelope(result) {
  if (!result || typeof result !== "object") {
    throw new Error("External process produced no result envelope.");
  }
  if (result.error) {
    throw new Error(`External process failed to start: ${result.error.message}`);
  }
  if (result.signal) {
    throw new Error(`External process terminated by signal ${result.signal}.`);
  }
  if (!Number.isInteger(result.status)) {
    throw new Error("External process returned a null or undefined exit status.");
  }
  if (result.status !== 0) {
    throw new Error(`External process exited with status ${result.status}.`);
  }
  return result;
}

export function inventory(root, files) {
  return [...files]
    .sort((a, b) => a.localeCompare(b, "en"))
    .map((path) => ({
      path: relative(root, path).replaceAll("\\", "/"),
      size: statSync(path).size,
      sha256: sha256(path),
    }));
}

export function assertUniqueInventory(entries) {
  const paths = entries.map((entry) => entry.path);
  assert.equal(new Set(paths).size, paths.length, "Duplicate evidence path.");
  for (const entry of entries) {
    assert.match(entry.sha256, shaPattern);
    assert.ok(Number.isSafeInteger(entry.size) && entry.size >= 0);
  }
}
