import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const work = join(root, ".tmp-sprint-30-5-stage-2");
const artifactRoot = join(root, ".artifacts", "sprint-30-5", "stage-2");
const release = join(artifactRoot, "release");
const unpacked = join(work, "verification", "candidate");
const releaseManifestPath = join(release, "oracle-release-manifest.json");
const packagePath = join(
  release,
  "Oracle_0.1.1.0_x64_STAGE2_LOCAL_TEST_ONLY.msix"
);
const expectedPublisher =
  "CN=Oracle Stage 2 Local Test Signing - NOT PRODUCTION";
const docsEvidenceDirectory = join(
  root,
  "docs",
  "sprints",
  "evidence",
  "sprint-30-5",
  "stage-2",
  "generated"
);

assert.ok(existsSync(releaseManifestPath), "Release Manifest is missing.");
assert.ok(existsSync(packagePath), "Stage 2 MSIX is missing.");
assert.deepEqual(findSigningMaterial(work), []);
assert.deepEqual(findSigningMaterial(artifactRoot), []);

const candidate = readJson(join(release, "qualification-candidate.json"));
const manifest = readJson(releaseManifestPath);
assert.equal(candidate.runtimeManifest.version, "1.7.0");
assert.equal(candidate.runtimeManifest.canonicalTargetsEqual, true);
assert.equal(manifest.runtimeCompositionManifestVersion, "1.7.0");
assert.equal(manifest.packageVersion, "0.1.1.0");
assert.equal(
  manifest.releaseId,
  "oracle-desktop-beta-0.1.1-stage-2-local-qualification"
);
assert.deepEqual(manifest.contract, {
  name: "oracle.release-manifest",
  version: 1,
});
assert.deepEqual(manifest.signing, {
  classification: "local-test-only",
  productionTrusted: false,
  publicReleaseReady: false,
  externalDistributionAuthorised: false,
  deploymentAuthorised: false,
});
assert.equal(manifest.packageIdentity.publisher, expectedPublisher);

assertWorkspacePath(unpacked);
rmSync(unpacked, { recursive: true, force: true });
mkdirSync(unpacked, { recursive: true });
runWinApp([
  "tool",
  "makeappx",
  "unpack",
  "/p",
  packagePath,
  "/d",
  unpacked,
  "/o",
]);

const appxManifest = readFileSync(join(unpacked, "AppxManifest.xml"), "utf8");
assert.match(appxManifest, /Name="Oracle\.Platform\.LocalCertification"/u);
assert.match(appxManifest, /Version="0\.1\.1\.0"/u);
assert.match(appxManifest, /ProcessorArchitecture="x64"/u);
assert.ok(
  appxManifest.includes(`Publisher="${expectedPublisher.replaceAll("&", "&amp;")}"`)
);
assert.match(appxManifest, /Executable="Oracle\.exe"/u);
assert.match(appxManifest, /EntryPoint="Windows\.FullTrustApplication"/u);

for (const artifact of manifest.artifacts) {
  const artifactPath = artifact.path.startsWith("package:/")
    ? join(unpacked, ...artifact.path.slice("package:/".length).split("/"))
    : join(release, artifact.path);
  assert.ok(existsSync(artifactPath), `Declared artifact missing: ${artifact.path}`);
  assert.equal(statSync(artifactPath).size, artifact.size);
  assert.equal(sha256(artifactPath), artifact.sha256);
}
assert.equal(
  manifest.artifacts.filter((artifact) => artifact.kind === "msix").length,
  1
);
assert.equal(
  manifest.artifacts.filter((artifact) => artifact.kind === "native-helper").length,
  2
);

const forbiddenPackageFiles = findFiles(unpacked, (path) => {
  const name = basename(path).toLowerCase();
  return (
    name === ".env" ||
    name.startsWith(".env.") ||
    /\.(cer|key|pem|pfx)$/u.test(name)
  );
});
assert.deepEqual(forbiddenPackageFiles, []);

const packageInventory = createInventory(unpacked);
writeJson(join(release, "package-content-inventory.json"), {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-2-package-content-inventory",
  contractVersion: 1,
  packageSha256: sha256(packagePath),
  entries: packageInventory,
});

const sbom = readJson(join(release, "oracle-0.1.1.cdx.json"));
assert.equal(sbom.bomFormat, "CycloneDX");
assert.equal(sbom.specVersion, "1.6");
assert.ok(sbom.components.length > 0);
const provenance = readJson(
  join(release, "oracle-0.1.1.provenance.json")
);
assert.equal(provenance._type, "https://in-toto.io/Statement/v1");
assert.equal(provenance.predicateType, "https://slsa.dev/provenance/v1");
assert.equal(provenance.subject[0].digest.sha256, sha256(packagePath));
assert.equal(
  provenance.predicate.buildDefinition.externalParameters.runtimeManifestVersion,
  "1.7.0"
);
assert.equal(
  provenance.predicate.buildDefinition.internalParameters.sourceCommit,
  candidate.sourceCommit
);
const storeCleanup = readJson(join(release, "signing-store-cleanup.json"));
assert.equal(storeCleanup.status, "passed");
assert.equal(storeCleanup.trustRemoved, true);
assert.equal(storeCleanup.remaining.length, 0);
assert.ok(
  storeCleanup.removed.some(
    (entry) =>
      entry.location === "CurrentUser" &&
      entry.store === "My" &&
      entry.hadPrivateKey === true
  ),
  "The initial packaging-tool signing-store residue was not recorded."
);
const sprint29Certification = readJson(
  join(
    root,
    "docs",
    "sprints",
    "evidence",
    "sprint-29",
    "release-certification.json"
  )
);
const sprint29PackagePath = join(
  root,
  ".tmp-sprint-29",
  "release",
  "Oracle_0.1.0.0_x64_LOCAL_TEST_ONLY.msix"
);
assert.ok(existsSync(sprint29PackagePath), "Immutable Sprint 29 package is missing.");
assert.equal(
  sha256(sprint29PackagePath),
  sprint29Certification.candidateSha256,
  "Immutable Sprint 29 package hash changed."
);
const sprint29Provenance = readJson(
  join(
    root,
    ".tmp-sprint-29",
    "release",
    "oracle-0.1.0.provenance.json"
  )
);

const signatureEvidence = JSON.parse(
  run("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    join(root, "scripts", "verify-sprint-30-5-stage-2-signatures.ps1"),
    "-ReleaseDirectory",
    release,
    "-UnpackedDirectory",
    unpacked,
    "-ExpectedSubject",
    expectedPublisher,
  ]).trim()
);
assert.equal(signatureEvidence.status, "passed");
assert.equal(signatureEvidence.releaseManifestSignature.valid, true);
assert.equal(signatureEvidence.certificateStoreMatches.length, 0);
assert.equal(signatureEvidence.trustRemoved, true);
assert.equal(signatureEvidence.privateSigningMaterialDestroyed, true);
writeJson(join(release, "signature-and-trust-verification.json"), signatureEvidence);

const summary = {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-2-certification",
  contractVersion: 1,
  verifiedAt: new Date().toISOString(),
  status: "passed",
  sourceCommit: candidate.sourceCommit,
  sourceTree: candidate.sourceTree,
  runtimeManifest: {
    version: "1.7.0",
    webElectronMechanicalEquality: "passed",
    releaseManifestReconciliation: "passed",
  },
  package: {
    filename: basename(packagePath),
    packageVersion: "0.1.1.0",
    sha256: sha256(packagePath),
    size: statSync(packagePath).size,
    contentEntries: packageInventory.length,
    contentInventory: "mechanically-verified",
    forbiddenContent: "absent",
    installed: false,
  },
  releaseManifest: {
    sha256: sha256(releaseManifestPath),
    signature: "cryptographically-valid-detached-cms",
    artifactEquality: "passed",
  },
  sbom: "cyclonedx-1.6-verified",
  provenance: "slsa-shaped-verified",
  signing: {
    classification: "local-test-only",
    subject: expectedPublisher,
    thumbprint: signatureEvidence.releaseManifestSignature.thumbprint,
    certificateNotAfter: signatureEvidence.releaseManifestSignature.notAfter,
    privateMaterialDestroyed: true,
    exportedCertificateDestroyed: true,
    certificateTrustRemoved: true,
    certificateStoreMatches: 0,
    productionTrusted: false,
    initialTeardownDefect: {
      detectedFailClosed: true,
      cause: "packaging-tool-current-user-personal-store-residue",
      residueIncludedPrivateKey: true,
      corrected: true,
      finalStoreMatches: 0,
    },
  },
  immutableSprint29Package: {
    modified: false,
    sha256: sprint29Certification.candidateSha256,
    acceptedEvidenceMatch: true,
    historicalProvenancePackageLockSha256:
      sprint29Provenance.predicate.buildDefinition.resolvedDependencies[0]
        .digest.sha256,
    currentPackageLockSha256: candidate.dependencies.packageLockSha256,
    genericVerifierCompatibility:
      "historical-provenance-lock-differs-from-current-source-lock",
  },
  production: {
    published: false,
    externallyDistributed: false,
    deployed: false,
    remotePush: false,
  },
  stage3Started: false,
  limitation:
    "Local test signing proves packaging and distribution mechanics only. It must never be interpreted as production publisher trust, public release readiness, operational certification, deployment authority or permission to distribute Oracle externally.",
};
writeJson(join(release, "stage-2-certification.json"), summary);
mkdirSync(docsEvidenceDirectory, { recursive: true });
writeJson(join(docsEvidenceDirectory, "stage-2-certification.json"), summary);

const evidenceFiles = readdirSync(release)
  .filter((name) => name !== "stage-2-evidence-index.json")
  .sort()
  .map((name) => {
    const path = join(release, name);
    return {
      filename: name,
      sha256: sha256(path),
      size: statSync(path).size,
    };
  });
const evidenceIndex = {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-2-evidence-index",
  contractVersion: 1,
  createdAt: new Date().toISOString(),
  status: "complete",
  evidenceFiles,
};
writeJson(join(release, "stage-2-evidence-index.json"), evidenceIndex);
writeJson(join(docsEvidenceDirectory, "stage-2-evidence-index.json"), evidenceIndex);

const archive = join(
  artifactRoot,
  "Oracle.Sprint30.5.Stage2QualificationEvidence.zip"
);
rmSync(archive, { force: true });
run("tar.exe", [
  "-a",
  "-c",
  "-f",
  archive,
  "-C",
  artifactRoot,
  "release",
]);
const frozenEvidence = {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-2-frozen-evidence",
  contractVersion: 1,
  frozenAt: new Date().toISOString(),
  status: "complete-awaiting-founder-review",
  archive: {
    filename: basename(archive),
    sha256: sha256(archive),
    size: statSync(archive).size,
    storage: "workspace-local-ignored-artifact",
  },
  releaseManifestSha256: summary.releaseManifest.sha256,
  packageSha256: summary.package.sha256,
  privateSigningMaterialDestroyed: true,
  certificateTrustRemoved: true,
  stage3Started: false,
};
writeJson(join(docsEvidenceDirectory, "stage-2-frozen-evidence.json"), frozenEvidence);

console.log(JSON.stringify(summary, null, 2));
console.log(`Frozen evidence archive: ${archive}`);
console.log(`Frozen evidence SHA-256: ${frozenEvidence.archive.sha256}`);

function createInventory(directory) {
  return findFiles(directory, () => true)
    .map((relativePath) => {
      const absolute = join(root, relativePath);
      return {
        path: relative(unpacked, absolute).replaceAll("\\", "/"),
        sha256: sha256(absolute),
        size: statSync(absolute).size,
      };
    })
    .sort((left, right) => left.path.localeCompare(right.path));
}

function findSigningMaterial(directory) {
  return findFiles(directory, (path) => /\.(cer|key|pem|pfx)$/iu.test(path));
}

function findFiles(directory, predicate) {
  if (!existsSync(directory)) return [];
  const matches = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      matches.push(...findFiles(path, predicate));
    } else if (predicate(path)) {
      matches.push(relative(root, path));
    }
  }
  return matches;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/u, ""));
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function runWinApp(args) {
  const npmPath = process.env.npm_execpath;
  if (!npmPath || !npmPath.toLowerCase().endsWith("npm-cli.js")) {
    throw new Error("npm CLI entry point is unavailable.");
  }
  return run(
    process.execPath,
    [npmPath.replace(/npm-cli\.js$/iu, "npx-cli.js"), "winapp", ...args],
    { WINAPP_CLI_TELEMETRY_OPTOUT: "1" }
  );
}

function run(command, args, environment = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...environment },
    encoding: "utf8",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} failed.\n${result.stdout ?? ""}\n${result.stderr ?? ""}`
    );
  }
  return result.stdout ?? "";
}

function assertWorkspacePath(path) {
  const relativePath = relative(root, path);
  if (
    relativePath === "" ||
    relativePath.startsWith("..") ||
    resolve(path) === root
  ) {
    throw new Error("Refusing to clear a path outside the Stage 2 workspace.");
  }
}
