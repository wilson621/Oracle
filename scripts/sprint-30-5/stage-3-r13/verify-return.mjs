import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import yauzl from "yauzl";
import { canonicalProgrammeIdentity, sha256, validateProgrammeIdentity } from "./stage3-core.mjs";

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
assert.equal(manifest.contract, "oracle.sprint-30-5.stage-3-r13-archive-manifest");
assert.equal(validateProgrammeIdentity(manifest.programmeIdentity), canonicalProgrammeIdentity);
assert.equal(manifest.revision, "R13");
assert.match(manifest.attemptId, /^stage3-r13-\d{8}T\d{9}Z-[0-9a-f]{8}$/u);
assert.equal(
  manifest.authorityId,
  `authority-${manifest.attemptId}`
);
assert.match(manifest.evidenceManifestSha256, /^[0-9a-f]{64}$/u);

const archiveEntries = await readArchive(archive);
const evidenceManifestSuffix = "evidence/evidence-manifest.json";
const evidenceManifestEntry = uniqueSuffix(
  archiveEntries,
  evidenceManifestSuffix
);
const archivePrefix = evidenceManifestEntry.path.slice(
  0,
  -evidenceManifestSuffix.length
);
const evidenceManifest = JSON.parse(evidenceManifestEntry.data.toString("utf8"));
assert.equal(
  hashBuffer(evidenceManifestEntry.data),
  manifest.evidenceManifestSha256,
  "Archived evidence-manifest hash differs from the archive manifest."
);
assert.equal(
  evidenceManifest.contract,
  "oracle.sprint-30-5.stage-3-r13-evidence-manifest"
);
assert.equal(evidenceManifest.programmeIdentity, canonicalProgrammeIdentity);
assert.equal(evidenceManifest.revision, "R13");
assert.equal(evidenceManifest.authorityId, manifest.authorityId);
assert.equal(evidenceManifest.attemptId, manifest.attemptId);
assert.equal(
  new Set(evidenceManifest.files.map((entry) => entry.path)).size,
  evidenceManifest.files.length,
  "Archived evidence inventory contains duplicate paths."
);
for (const expected of evidenceManifest.files) {
  assert.match(expected.path, /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[^\\]+$/u);
  const entry = archiveEntries.get(`${archivePrefix}${expected.path}`);
  assert.ok(entry, `Archived evidence file is missing: ${expected.path}`);
  assert.equal(entry.data.length, expected.size);
  assert.equal(hashBuffer(entry.data), expected.sha256);
}
const completion = JSON.parse(
  uniqueSuffix(archiveEntries, "evidence/completion.json").data.toString("utf8")
);
assert.equal(completion.programmeIdentity, canonicalProgrammeIdentity);
assert.equal(completion.revision, "R13");
assert.equal(completion.result, "passed");
assert.equal(completion.authorityId, manifest.authorityId);
assert.equal(completion.attemptId, manifest.attemptId);
assert.equal(
  completion.evidenceManifestSha256,
  manifest.evidenceManifestSha256
);
assert.equal(completion.stage4Started, false);
const finalLifecycle = JSON.parse(
  uniqueSuffix(
    archiveEntries,
    "lifecycle/14-evidence-frozen.json"
  ).data.toString("utf8")
);
assert.equal(finalLifecycle.programmeIdentity, canonicalProgrammeIdentity);
assert.equal(finalLifecycle.revision, "R13");
assert.equal(finalLifecycle.phase, "evidence-frozen");
assert.equal(finalLifecycle.authorityId, manifest.authorityId);
assert.equal(finalLifecycle.attemptId, manifest.attemptId);
assert.equal(finalLifecycle.details.result, "passed");
assert.equal(
  finalLifecycle.details.evidenceManifestSha256,
  manifest.evidenceManifestSha256
);
assert.equal(
  [...archiveEntries.keys()].some((path) => path.endsWith("/evidence/failure.json")),
  false,
  "A passing returned archive contains failure evidence."
);
console.log(JSON.stringify({
  result: "verified",
  attemptId: manifest.attemptId,
  archiveSha256: archiveHash,
  evidenceManifestSha256: manifest.evidenceManifestSha256,
  archiveSize: manifest.size,
  archivedInventoryCount: evidenceManifest.files.length,
}, null, 2));

function hashBuffer(value) {
  return createHash("sha256").update(value).digest("hex");
}

function uniqueSuffix(entries, suffix) {
  const matches = [...entries.values()].filter(
    (entry) => entry.path === suffix || entry.path.endsWith(`/${suffix}`)
  );
  assert.equal(matches.length, 1, `Archive must contain exactly one ${suffix}.`);
  return matches[0];
}

function readArchive(path) {
  return new Promise((resolvePromise, reject) => {
    yauzl.open(path, { lazyEntries: true, decodeStrings: true }, (openError, zip) => {
      if (openError) {
        reject(openError);
        return;
      }
      const entries = new Map();
      zip.on("error", reject);
      zip.on("entry", (entry) => {
        const name = entry.fileName.replaceAll("\\", "/");
        if (
          name.startsWith("/") ||
          /^[A-Za-z]:/u.test(name) ||
          name.split("/").includes("..")
        ) {
          reject(new Error(`Archive entry escapes its root: ${name}`));
          zip.close();
          return;
        }
        if (name.endsWith("/")) {
          zip.readEntry();
          return;
        }
        if (entries.has(name)) {
          reject(new Error(`Archive contains a duplicate path: ${name}`));
          zip.close();
          return;
        }
        zip.openReadStream(entry, (streamError, stream) => {
          if (streamError) {
            reject(streamError);
            return;
          }
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("error", reject);
          stream.on("end", () => {
            const data = Buffer.concat(chunks);
            if (data.length !== entry.uncompressedSize) {
              reject(new Error(`Archive entry size differs: ${name}`));
              return;
            }
            entries.set(name, { path: name, data });
            zip.readEntry();
          });
        });
      });
      zip.on("end", () => resolvePromise(entries));
      zip.readEntry();
    });
  });
}
