import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { sha256 } from "./stage3-core.mjs";

const values = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (!key?.startsWith("--") || !value || value.startsWith("--")) {
    throw new Error("Use --archive, --sidecar and --manifest arguments.");
  }
  if (values.has(key)) throw new Error(`Duplicate argument: ${key}`);
  values.set(key, resolve(value));
}
for (const key of ["--archive", "--sidecar", "--manifest"]) {
  if (!values.has(key) || !existsSync(values.get(key))) {
    throw new Error(`Returned evidence input is missing: ${key}`);
  }
}
const archive = values.get("--archive");
const sidecar = readFileSync(values.get("--sidecar"), "ascii").trim();
const manifest = JSON.parse(readFileSync(values.get("--manifest"), "utf8"));
const archiveHash = sha256(archive);
assert.match(sidecar, new RegExp(`^${archiveHash}  [^\\\\/]+\\.zip$`, "u"));
assert.equal(manifest.archive, archive.split(/[\\/]/u).at(-1));
assert.equal(manifest.size, statSync(archive).size);
assert.equal(manifest.sha256, archiveHash);
assert.equal(manifest.contract, "oracle.sprint-30-5.stage-3-r1-archive-manifest");
assert.match(manifest.attemptId, /^stage3-r1-\d{8}T\d{9}Z-[0-9a-f]{8}$/u);
assert.equal(
  manifest.authorityId,
  `authority-${manifest.attemptId}`
);
assert.match(manifest.evidenceManifestSha256, /^[0-9a-f]{64}$/u);
console.log(JSON.stringify({
  result: "verified",
  attemptId: manifest.attemptId,
  archiveSha256: archiveHash,
  evidenceManifestSha256: manifest.evidenceManifestSha256,
  archiveSize: manifest.size,
}, null, 2));
