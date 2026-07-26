import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const evidenceDirectory =
  "docs/sprints/evidence/sprint-30/phase-2/generated";
const releaseManifestPath =
  ".tmp-sprint-29/release/oracle-release-manifest.json";
const migrationPaths = Array.from(
  { length: 6 },
  (_, index) =>
    fs
      .readdirSync("database")
      .find((name) =>
        name.startsWith(String(index + 9).padStart(3, "0") + "_")
      )
).map((name) => `database/${name}`);
const sourceFiles = ["app", "components", "desktop", "lib"]
  .flatMap(walk)
  .filter((file) => /\.(ts|tsx)$/u.test(file))
  .sort();
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const releaseManifest = JSON.parse(
  fs.readFileSync(releaseManifestPath, "utf8")
);

const evidence = {
  schemaVersion: 1,
  contract: "oracle.production-qualification-candidate",
  contractVersion: 1,
  frozenAt: new Date().toISOString(),
  sourceBaselineCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  sourceTreeSha256: combinedHash(sourceFiles),
  runtimeManifest: {
    version: "1.6.0",
    webSourceSha256: fileHash(
      "lib/oracle/composition/web-composition-root.ts"
    ),
    electronSourceSha256: fileHash(
      "desktop/platform/desktop-composition-root.ts"
    ),
  },
  releaseManifest: {
    path: releaseManifestPath,
    sha256: fileHash(releaseManifestPath),
    releaseId: releaseManifest.releaseId,
    packageVersion: releaseManifest.packageVersion,
    productionTrusted: releaseManifest.signing.productionTrusted,
    deploymentAuthorised: releaseManifest.signing.deploymentAuthorised,
  },
  dependencies: {
    packageLockSha256: fileHash("package-lock.json"),
    node: process.version,
    next: packageJson.dependencies.next,
    electron: packageJson.devDependencies.electron,
  },
  migrations: Object.fromEntries(
    migrationPaths.map((file) => [file, fileHash(file)])
  ),
  environment: {
    platform: process.platform,
    architecture: process.arch,
    osRelease: os.release(),
    osVersion: os.version(),
  },
  authority: {
    production: "unchanged",
    runtimePersistence: "disabled",
    productionPersistence: "not-authorised",
    deployment: "not-authorised",
    gateC: "deferred",
    gate7: "not-authorised",
  },
};

fs.mkdirSync(evidenceDirectory, { recursive: true });
fs.writeFileSync(
  path.join(evidenceDirectory, "qualification-candidate.json"),
  `${JSON.stringify(evidence, null, 2)}\n`
);
process.stdout.write(
  "Sprint 30 Phase 2 qualification candidate provenance frozen.\n"
);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function fileHash(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function combinedHash(files) {
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    hash.update(file.replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}
