import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const acceptedPhase4Commit =
  "0d0c2e8f658479c27adb0dd96f30c95369e759e0";
const output =
  "docs/sprints/evidence/sprint-30/phase-5/generated/qualification-candidate.json";
const releaseManifestPath =
  ".tmp-sprint-29/release/oracle-release-manifest.json";
const releaseManifest = JSON.parse(
  fs.readFileSync(releaseManifestPath, "utf8")
);
const migrations = fs
  .readdirSync("database")
  .filter((name) => /^(009|010|011|012|013|014)_/u.test(name))
  .sort()
  .map((name) => `database/${name}`);
const productFiles = ["app", "components", "desktop", "lib"]
  .flatMap(walk)
  .filter((file) => /\.(ts|tsx)$/u.test(file))
  .sort();

const head = git(["rev-parse", "HEAD"]);
if (head !== acceptedPhase4Commit) {
  throw new Error(
    `Phase 5 must freeze accepted Phase 4 commit ${acceptedPhase4Commit}; received ${head}.`
  );
}

const evidence = {
  schemaVersion: 1,
  contract: "oracle.production-qualification-candidate",
  contractVersion: 1,
  phase: 5,
  frozenAt: new Date().toISOString(),
  acceptedPhase4Commit,
  sourceBaselineCommit: head,
  productSourceSha256: combinedHash(productFiles),
  runtimeManifest: {
    version: "1.7.0",
    webSourceSha256: fileHash(
      "lib/oracle/composition/web-composition-root.ts"
    ),
    electronSourceSha256: fileHash(
      "desktop/platform/desktop-composition-root.ts"
    ),
    canonicalTargetsEqual: true,
    operationalDiagnosticsDelivery: "disabled",
  },
  releaseManifest: {
    path: releaseManifestPath,
    sha256: fileHash(releaseManifestPath),
    releaseId: releaseManifest.releaseId,
    packageVersion: releaseManifest.packageVersion,
    runtimeManifestVersion:
      releaseManifest.runtimeCompositionManifestVersion,
    immutableSprint29Candidate: true,
    rebuilt: false,
    resigned: false,
    reconciliation:
      "requires-separate-founder-authority",
  },
  dependencies: {
    packageLockSha256: fileHash("package-lock.json"),
    node: process.version,
    next: JSON.parse(fs.readFileSync("package.json", "utf8")).dependencies.next,
    electron: JSON.parse(fs.readFileSync("package.json", "utf8")).devDependencies
      .electron,
  },
  migrations: Object.fromEntries(
    migrations.map((file) => [file, fileHash(file)])
  ),
  environment: {
    platform: process.platform,
    architecture: process.arch,
    osRelease: os.release(),
    osVersion: os.version(),
  },
  evidenceStatesAtFreeze: {
    liveSupabaseAuth: "unavailable",
    protectedAuthenticatedRendering: "unavailable",
    installedElectronGpu: "unavailable",
    cleanDisposableWindows: "deferred",
  },
  localContinuityRisk: {
    branch: git(["branch", "--show-current"]),
    commitsAheadOfRemoteAtFreeze: Number(
      git(["rev-list", "--count", "@{upstream}..HEAD"])
    ),
    pushAuthorised: false,
  },
  authority: {
    production: "unchanged",
    runtimePersistence: "disabled",
    persistedProducersConsumers: "disabled",
    deployment: "not-authorised",
    signing: "not-authorised",
    publication: "not-authorised",
    distribution: "not-authorised",
    remotePush: "not-authorised",
    gateC: "deferred",
    gate7: "not-authorised",
  },
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
console.log("Sprint 30 Phase 5 qualification candidate frozen.");

function walk(entry) {
  const stat = fs.statSync(entry);
  if (stat.isFile()) return [entry.replaceAll("\\", "/")];
  return fs
    .readdirSync(entry)
    .flatMap((child) => walk(path.join(entry, child)));
}

function combinedHash(files) {
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    hash.update(file);
    hash.update("\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function fileHash(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}
