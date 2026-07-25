import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const work = join(root, ".tmp-sprint-29");
const release = join(work, "release");
const unpacked = join(work, "verification", "candidate");
const releaseManifestPath = join(release, "oracle-release-manifest.json");
const candidateMsix = join(release, "Oracle_0.1.0.0_x64_LOCAL_TEST_ONLY.msix");
const expectedPublisher = "CN=Oracle Local Test Signing - NOT PRODUCTION";

assert.ok(existsSync(releaseManifestPath), "Release Manifest is missing.");
assert.equal(findFiles(work, (path) => path.toLowerCase().endsWith(".pfx")).length, 0);
const manifest = JSON.parse(readFileSync(releaseManifestPath, "utf8"));
assert.deepEqual(manifest.contract, {
  name: "oracle.release-manifest",
  version: 1,
});
assert.equal(manifest.packageIdentity.name, "Oracle.Platform.LocalCertification");
assert.equal(manifest.packageIdentity.publisher, expectedPublisher);
assert.equal(manifest.runtimeCompositionManifestVersion, "1.6.0");
assert.equal(manifest.channel, "beta");
assert.deepEqual(manifest.rollback, {
  allowedTargets: ["0.0.9.0"],
  arbitraryDowngrade: false,
});
assert.deepEqual(manifest.signing, {
  classification: "local-test-only",
  productionTrusted: false,
  publicReleaseReady: false,
  externalDistributionAuthorised: false,
  deploymentAuthorised: false,
});

assertWorkspacePath(unpacked);
rmSync(unpacked, { recursive: true, force: true });
mkdirSync(unpacked, { recursive: true });
runWinApp([
  "tool",
  "makeappx",
  "unpack",
  "/p",
  candidateMsix,
  "/d",
  unpacked,
  "/o",
]);

const appxManifest = readFileSync(join(unpacked, "AppxManifest.xml"), "utf8");
assert.match(appxManifest, /Name="Oracle\.Platform\.LocalCertification"/);
assert.match(appxManifest, /Version="0\.1\.0\.0"/);
assert.match(appxManifest, /ProcessorArchitecture="x64"/);
assert.ok(appxManifest.includes(`Publisher="${expectedPublisher.replaceAll("&", "&amp;")}"`));
assert.match(appxManifest, /Executable="Oracle\.exe"/);
assert.match(appxManifest, /EntryPoint="Windows\.FullTrustApplication"/);

for (const artifact of manifest.artifacts) {
  const artifactPath = artifact.path.startsWith("package:/")
    ? join(unpacked, ...artifact.path.slice("package:/".length).split("/"))
    : join(release, artifact.path);
  assert.ok(existsSync(artifactPath), `Declared artifact is missing: ${artifact.path}`);
  assert.equal(statSync(artifactPath).size, artifact.size, `Size mismatch: ${artifact.path}`);
  assert.equal(sha256(artifactPath), artifact.sha256, `Hash mismatch: ${artifact.path}`);
}
assert.equal(
  manifest.artifacts.filter((artifact) => artifact.kind === "msix").length,
  1
);
assert.equal(
  manifest.artifacts.filter((artifact) => artifact.kind === "native-helper").length,
  2
);

const forbiddenFiles = findFiles(unpacked, (path) => {
  const name = basename(path).toLowerCase();
  return (
    name === ".env" ||
    name.startsWith(".env.") ||
    name.endsWith(".pfx") ||
    name.endsWith(".pem") ||
    name.endsWith(".key")
  );
});
assert.deepEqual(forbiddenFiles, []);

const sbom = JSON.parse(readFileSync(join(release, "oracle-0.1.0.cdx.json"), "utf8"));
assert.equal(sbom.bomFormat, "CycloneDX");
assert.equal(sbom.specVersion, "1.6");
assert.ok(sbom.components.length > 0);
assert.ok(
  sbom.metadata.properties.some(
    (item) =>
      item.name === "oracle:external-distribution" &&
      item.value === "not-authorised"
  )
);
const provenance = JSON.parse(
  readFileSync(join(release, "oracle-0.1.0.provenance.json"), "utf8")
);
assert.equal(provenance._type, "https://in-toto.io/Statement/v1");
assert.equal(provenance.predicateType, "https://slsa.dev/provenance/v1");
assert.equal(
  provenance.predicate.buildDefinition.internalParameters.deploymentAuthorised,
  false
);
assert.equal(provenance.subject[0].digest.sha256, sha256(candidateMsix));
assert.equal(
  provenance.predicate.buildDefinition.resolvedDependencies[0].digest.sha256,
  sha256(join(root, "package-lock.json"))
);

const signatureEvidence = JSON.parse(
  run("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    join(root, "scripts", "verify-release-signatures.ps1"),
    "-ReleaseDirectory",
    release,
    "-UnpackedDirectory",
    unpacked,
  ])
);
assert.equal(signatureEvidence.releaseManifestSignature.valid, true);
assert.equal(signatureEvidence.releaseManifestSignature.detached, true);
assert.equal(signatureEvidence.releaseManifestSignature.subject, expectedPublisher);

const sourceFiles = [
  join(root, "desktop", "main.ts"),
  join(root, "desktop", "overlay-window.ts"),
  join(root, "desktop", "preload.ts"),
];
const source = sourceFiles.map((path) => readFileSync(path, "utf8")).join("\n");
assert.match(source, /app\.enableSandbox\(\)/);
assert.match(source, /sandbox:\s*true/);
assert.match(source, /nodeIntegration:\s*false/);
assert.match(source, /contextIsolation:\s*true/);
assert.match(source, /setWindowOpenHandler/);
assert.match(source, /setPermissionRequestHandler/);
assert.match(source, /webRequest\s*\.onBeforeRequest/);
assert.match(source, /createPackagedRequestOrigins/);
assert.match(source, /ownsFrameUrl/);
assert.doesNotMatch(source, /shell\.openExternal/);

console.log(
  JSON.stringify(
    {
      status: "passed",
      releaseManifest: "mechanically-equal",
      packageIdentity: "verified",
      packageContents: "verified",
      artifactHashes: "verified",
      authenticodeSignatures: "present-and-local-test-subject",
      releaseManifestSignature: "cryptographically-valid-detached-cms",
      sbom: "cyclonedx-1.6-verified",
      provenance: "slsa-shaped-verified",
      rendererBoundary: "verified",
      privateSigningMaterial: "destroyed",
      productionTrusted: false,
      published: false,
      distributed: false,
      deployed: false,
      limitation:
        "Local test signing proves packaging and distribution mechanics only. It must never be interpreted as production publisher trust, public release readiness, operational certification, deployment authority or permission to distribute Oracle externally.",
    },
    null,
    2
  )
);

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

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function runWinApp(args) {
  const npmPath = process.env.npm_execpath;
  if (!npmPath || !npmPath.toLowerCase().endsWith("npm-cli.js")) {
    throw new Error("npm CLI entry point is unavailable.");
  }
  return run(
    process.execPath,
    [npmPath.replace(/npm-cli\.js$/i, "npx-cli.js"), "winapp", ...args],
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
  return result.stdout.trim();
}

function assertWorkspacePath(path) {
  const relativePath = relative(root, path);
  if (
    relativePath === "" ||
    relativePath.startsWith("..") ||
    resolve(path) === root
  ) {
    throw new Error("Refusing to clear a path outside the Sprint 29 workspace.");
  }
}
