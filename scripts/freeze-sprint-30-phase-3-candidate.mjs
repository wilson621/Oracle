import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const evidencePath =
  "docs/sprints/evidence/sprint-30/phase-3/generated/qualification-candidate.json";
const releaseManifestPath =
  ".tmp-sprint-29/release/oracle-release-manifest.json";
const releaseManifest = JSON.parse(
  fs.readFileSync(releaseManifestPath, "utf8")
);
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
const verificationFiles = [
  "scripts/verify-platform-composition.ts",
  "scripts/verify-sprint-30-phase-3-runtime.ts",
  "scripts/verify-sprint-30-phase-3-postgres-recovery.mjs",
  "scripts/verify-sprint-30-phase-3-rollback.mjs",
  "tsconfig.sprint-30-phase-3-verification.json",
];

const evidence = {
  schemaVersion: 1,
  contract: "oracle.production-qualification-candidate",
  contractVersion: 1,
  phase: 3,
  frozenAt: new Date().toISOString(),
  acceptedPhase2Commit:
    "2288c61b4c361833d6464739b8331483bb379ba1",
  sourceBaselineCommit: git(["rev-parse", "HEAD"]),
  sourceTreeSha256: combinedHash(sourceFiles),
  verificationSuiteSha256: combinedHash(verificationFiles),
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
  phase2Candidate: "superseded-by-approved-phase-3-composition-change",
  releaseManifest: {
    path: releaseManifestPath,
    sha256: fileHash(releaseManifestPath),
    runtimeManifestVersion:
      releaseManifest.runtimeCompositionManifestVersion,
    immutableSprint29Candidate: true,
    rebuilt: false,
    resigned: false,
    reconciliation:
      "required-before-integrated-qualification",
  },
  dependencies: {
    packageLockSha256: fileHash("package-lock.json"),
    node: process.version,
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
  localContinuityRisk: {
    branch: git(["branch", "--show-current"]),
    commitsAheadOfRemoteAtFreeze: Number(
      git(["rev-list", "--count", "@{upstream}..HEAD"])
    ),
    pushAuthorised: false,
  },
  authority: {
    production: "unchanged",
    productionDiagnostics: "disabled",
    externalProvider: "none",
    upload: false,
    retention: "none",
    runtimePersistence: "disabled",
    deployment: "not-authorised",
    signing: "not-authorised",
    gateC: "deferred",
    gate7: "not-authorised",
  },
};

fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log("Sprint 30 Phase 3 qualification candidate provenance frozen.");

function walk(entry) {
  if (!fs.existsSync(entry)) return [];
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
