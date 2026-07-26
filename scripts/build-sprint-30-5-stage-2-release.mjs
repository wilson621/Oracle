import { createHash, randomBytes } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import { basename, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { packager } from "@electron/packager";

const root = resolve(import.meta.dirname, "..");
const work = join(root, ".tmp-sprint-30-5-stage-2");
const stage = join(work, "app-source");
const electronOut = join(work, "electron");
const layout = join(work, "layout");
const signing = join(work, "ephemeral-signing");
const artifactRoot = join(root, ".artifacts", "sprint-30-5", "stage-2");
const release = join(artifactRoot, "release");
const publisher = "CN=Oracle Stage 2 Local Test Signing - NOT PRODUCTION";
const identity = "Oracle.Platform.LocalCertification";
const packageVersion = "0.1.1.0";
const semanticVersion = "0.1.1";
const runtimeManifestVersion = "1.7.0";
const permanentLimitation =
  "Local test signing proves packaging and distribution mechanics only. It must never be interpreted as production publisher trust, public release readiness, operational certification, deployment authority or permission to distribute Oracle externally.";

assertWorkspacePath(work);
assertWorkspacePath(artifactRoot);
requireCleanRepository();
rmSync(work, { recursive: true, force: true });
rmSync(artifactRoot, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
mkdirSync(release, { recursive: true });
mkdirSync(signing, { recursive: true });

const candidate = createCandidateRecord();
writeJson(join(release, "qualification-candidate.json"), candidate);

runBaseline();
runNpm(["run", "build"]);
runNpm(["run", "native:build"]);
runNpm(["run", "desktop:compile"]);

copyRequired(join(root, "dist-electron"), join(stage, "dist-electron"));
copyRequired(join(root, "dist-native"), join(stage, "dist-native"));
copyRequired(join(root, ".next", "standalone"), join(stage, "next"));
copyRequired(join(root, ".next", "static"), join(stage, "next", ".next", "static"));
copyRequired(join(root, "public"), join(stage, "next", "public"));
writeJson(join(stage, "package.json"), {
  name: "oracle-stage-2-local-qualification",
  productName: "Oracle Stage 2 Local Qualification",
  version: semanticVersion,
  private: true,
  main: "dist-electron/desktop/main.js",
});

const packagedPaths = await packager({
  dir: stage,
  out: electronOut,
  name: "Oracle",
  executableName: "Oracle",
  platform: "win32",
  arch: "x64",
  electronVersion: "39.8.10",
  asar: false,
  prune: false,
  overwrite: true,
});
if (packagedPaths.length !== 1) {
  throw new Error("Electron packaging did not produce exactly one x64 payload.");
}
cpSync(packagedPaths[0], layout, { recursive: true });
preparePackageManifest();

const pfxPath = join(signing, "oracle-stage-2-local-test-signing.pfx");
const password = randomBytes(32).toString("base64url");
let generatedCer;
try {
  runWinApp([
    "cert",
    "generate",
    "--manifest",
    join(layout, "Package.appxmanifest"),
    "--output",
    pfxPath,
    "--password",
    password,
    "--valid-days",
    "2",
    "--export-cer",
  ]);
  generatedCer = pfxPath.replace(/\.pfx$/iu, ".cer");

  for (const executable of [
    join(layout, "Oracle.exe"),
    join(layout, "resources", "app", "dist-native", "Oracle.WindowDiscovery.exe"),
    join(layout, "resources", "app", "dist-native", "Oracle.WindowObserver.exe"),
  ]) {
    runWinApp(["sign", executable, pfxPath, "--password", password]);
  }

  const msixPath = join(
    release,
    "Oracle_0.1.1.0_x64_STAGE2_LOCAL_TEST_ONLY.msix"
  );
  runWinApp([
    "package",
    layout,
    "--output",
    msixPath,
    "--manifest",
    join(layout, "Package.appxmanifest"),
    "--cert",
    pfxPath,
    "--cert-password",
    password,
    "--exe",
    "Oracle.exe",
  ]);

  const sbomPath = join(release, "oracle-0.1.1.cdx.json");
  writeJson(sbomPath, createSbom());
  const provenancePath = join(release, "oracle-0.1.1.provenance.json");
  writeJson(provenancePath, createProvenance(msixPath, candidate));

  const artifacts = [
    artifact("msix", msixPath),
    artifact(
      "native-helper",
      join(layout, "resources", "app", "dist-native", "Oracle.WindowDiscovery.exe"),
      "package:/resources/app/dist-native/Oracle.WindowDiscovery.exe"
    ),
    artifact(
      "native-helper",
      join(layout, "resources", "app", "dist-native", "Oracle.WindowObserver.exe"),
      "package:/resources/app/dist-native/Oracle.WindowObserver.exe"
    ),
    artifact("sbom", sbomPath),
    artifact("provenance", provenancePath),
  ];
  const releaseManifestPath = join(release, "oracle-release-manifest.json");
  writeJson(releaseManifestPath, {
    contract: { name: "oracle.release-manifest", version: 1 },
    releaseId: "oracle-desktop-beta-0.1.1-stage-2-local-qualification",
    version: semanticVersion,
    packageVersion,
    channel: "beta",
    architecture: "x64",
    packageIdentity: { name: identity, publisher },
    runtimeCompositionManifestVersion: runtimeManifestVersion,
    artifacts,
    rollback: {
      allowedTargets: ["0.1.0.0"],
      arbitraryDowngrade: false,
    },
    signing: {
      classification: "local-test-only",
      productionTrusted: false,
      publicReleaseReady: false,
      externalDistributionAuthorised: false,
      deploymentAuthorised: false,
    },
  });
  run("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    join(root, "scripts", "sign-release-manifest.ps1"),
    "-ManifestPath",
    releaseManifestPath,
    "-PfxPath",
    pfxPath,
    "-Password",
    password,
    "-SignaturePath",
    `${releaseManifestPath}.p7s`,
  ]);

  writeJson(join(release, "release-build-summary.json"), {
    schemaVersion: 1,
    contract: "oracle.sprint-30-5.stage-2-release-build",
    contractVersion: 1,
    status: "local-qualification-artifacts-built",
    createdAt: new Date().toISOString(),
    sourceCommit: candidate.sourceCommit,
    packageIdentity: identity,
    publisher,
    packageVersion,
    runtimeCompositionManifestVersion: runtimeManifestVersion,
    localSigningOnly: true,
    productionTrusted: false,
    published: false,
    externallyDistributed: false,
    deployed: false,
    installed: false,
    sprint29PackageModified: false,
    limitation: permanentLimitation,
  });
} finally {
  rmSync(pfxPath, { force: true });
  if (generatedCer) rmSync(generatedCer, { force: true });
  rmSync(signing, { recursive: true, force: true });
}

assertNoSigningMaterial();
console.log(`Sprint 30.5 Stage 2 local release artifacts: ${release}`);
console.log("Temporary private key and exported certificate destroyed.");

function runBaseline() {
  runNpm(["run", "lint"]);
  runNpx(["tsc", "--noEmit"]);
  runNpm(["run", "architecture:audit"]);
  const certificationPath = join(
    root,
    "docs",
    "sprints",
    "evidence",
    "sprint-30",
    "phase-3",
    "generated",
    "platform-composition-certification.json"
  );
  const original = readFileSync(certificationPath);
  try {
    runNpm(["run", "platform-composition:verify"]);
  } finally {
    writeFileSync(certificationPath, original);
  }
}

function createCandidateRecord() {
  const productFiles = ["app", "components", "desktop", "desktop-native", "lib"]
    .flatMap(walk)
    .filter((file) => /\.(cs|csproj|json|ts|tsx|xml)$/iu.test(file))
    .sort();
  const migrations = readdirSync(join(root, "database"))
    .filter((name) => /^(009|010|011|012|013|014)_/u.test(name))
    .sort()
    .map((name) => `database/${name}`);
  const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  return {
    schemaVersion: 1,
    contract: "oracle.sprint-30-5.stage-2-qualification-candidate",
    contractVersion: 1,
    frozenAt: new Date().toISOString(),
    sourceCommit: git(["rev-parse", "HEAD"]),
    sourceTree: git(["rev-parse", "HEAD^{tree}"]),
    branch: git(["branch", "--show-current"]),
    commitsAheadOfRemote: Number(
      git(["rev-list", "--count", "@{upstream}..HEAD"])
    ),
    productSourceSha256: combinedHash(productFiles),
    runtimeManifest: {
      version: runtimeManifestVersion,
      webSourceSha256: fileHash(
        join(root, "lib", "oracle", "composition", "web-composition-root.ts")
      ),
      electronSourceSha256: fileHash(
        join(root, "desktop", "platform", "desktop-composition-root.ts")
      ),
      canonicalTargetsEqual: true,
    },
    dependencies: {
      packageLockSha256: fileHash(join(root, "package-lock.json")),
      node: process.version,
      npm: npmVersion(),
      next: packageJson.dependencies.next,
      electron: packageJson.devDependencies.electron,
      winAppCli: packageJson.devDependencies["@microsoft/winappcli"],
    },
    packaging: {
      templateSha256: fileHash(
        join(root, "packaging", "windows", "Package.appxmanifest.template")
      ),
      builderSha256: fileHash(import.meta.filename),
      architecture: "x64",
      packageVersion,
      signingClassification: "local-test-only",
    },
    migrations: Object.fromEntries(
      migrations.map((file) => [file, fileHash(join(root, file))])
    ),
    environment: {
      platform: process.platform,
      architecture: process.arch,
      osRelease: os.release(),
      osVersion: os.version(),
    },
    authority: {
      productionTrusted: false,
      published: false,
      externallyDistributed: false,
      deployed: false,
      remotePush: false,
      runtimePersistence: "disabled",
      gateC: "deferred",
      gate7: "not-authorised",
      stage3: "not-authorised",
    },
  };
}

function preparePackageManifest() {
  const template = readFileSync(
    join(root, "packaging", "windows", "Package.appxmanifest.template"),
    "utf8"
  );
  const manifest = template
    .replace("{{PACKAGE_VERSION}}", packageVersion)
    .replaceAll(
      "CN=Oracle Local Test Signing - NOT PRODUCTION",
      publisher
    );
  writeFileSync(join(layout, "Package.appxmanifest"), manifest);
  runWinApp([
    "manifest",
    "update-assets",
    join(root, "public", "images", "oracle-eye.png"),
    "--manifest",
    join(layout, "Package.appxmanifest"),
  ]);
}

function createSbom() {
  const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
  const components = Object.entries(lock.packages)
    .filter(([path, value]) => path.startsWith("node_modules/") && value?.version)
    .map(([path, value]) => ({
      type: "library",
      name: path.slice("node_modules/".length),
      version: value.version,
      purl: `pkg:npm/${encodeURIComponent(path.slice("node_modules/".length))}@${value.version}`,
      scope: value.dev ? "excluded" : "required",
    }))
    .sort((left, right) =>
      `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`)
    );
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    serialNumber: "urn:uuid:00000000-0000-4000-8000-000000000305",
    version: 1,
    metadata: {
      component: {
        type: "application",
        name: "Oracle Stage 2 Local Qualification",
        version: semanticVersion,
      },
      properties: [
        { name: "oracle:distribution-trust", value: "local-test-only" },
        { name: "oracle:external-distribution", value: "not-authorised" },
      ],
    },
    components,
  };
}

function createProvenance(msixPath, candidate) {
  return {
    _type: "https://in-toto.io/Statement/v1",
    subject: [
      {
        name: basename(msixPath),
        digest: { sha256: sha256(msixPath) },
      },
    ],
    predicateType: "https://slsa.dev/provenance/v1",
    predicate: {
      buildDefinition: {
        buildType: "https://oracle.local/build-types/windows-msix/v1",
        externalParameters: {
          channel: "beta",
          architecture: "x64",
          signingClassification: "local-test-only",
          runtimeManifestVersion,
        },
        internalParameters: {
          sourceCommit: candidate.sourceCommit,
          publicationAuthorised: false,
          deploymentAuthorised: false,
        },
        resolvedDependencies: [
          {
            uri: "file:package-lock.json",
            digest: { sha256: candidate.dependencies.packageLockSha256 },
          },
        ],
      },
      runDetails: {
        builder: { id: "oracle.local/sprint-30-5-stage-2-builder" },
        metadata: { invocationId: "local-only-not-published" },
      },
    },
  };
}

function artifact(kind, path, declaredPath = basename(path)) {
  return {
    kind,
    path: declaredPath,
    sha256: sha256(path),
    size: statSync(path).size,
  };
}

function assertNoSigningMaterial() {
  const forbidden = findFiles(work, (path) =>
    /\.(cer|key|pem|pfx)$/iu.test(path)
  ).concat(
    findFiles(artifactRoot, (path) => /\.(cer|key|pem|pfx)$/iu.test(path))
  );
  if (forbidden.length > 0) {
    throw new Error(`Signing material remains: ${forbidden.join(", ")}`);
  }
}

function requireCleanRepository() {
  const status = git(["status", "--porcelain"]);
  if (status !== "") {
    throw new Error("Stage 2 build requires a clean repository.");
  }
}

function npmVersion() {
  return run(process.execPath, [npmCliPath(), "--version"]).trim();
}

function walk(entry) {
  const absolute = resolve(root, entry);
  const stat = statSync(absolute);
  if (stat.isFile()) return [relative(root, absolute).replaceAll("\\", "/")];
  return readdirSync(absolute).flatMap((child) =>
    walk(join(entry, child))
  );
}

function combinedHash(files) {
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file);
    hash.update("\0");
    hash.update(readFileSync(join(root, file)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function findFiles(directory, predicate) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? findFiles(path, predicate)
      : predicate(path)
        ? [relative(root, path)]
        : [];
  });
}

function fileHash(path) {
  return sha256(path);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function copyRequired(source, destination) {
  if (!existsSync(source)) {
    throw new Error(`Required build output is missing: ${relative(root, source)}`);
  }
  cpSync(source, destination, { recursive: true });
}

function runWinApp(args) {
  runNpx(["winapp", ...args], { WINAPP_CLI_TELEMETRY_OPTOUT: "1" });
}

function runNpm(args, environment = {}) {
  return run(process.execPath, [npmCliPath(), ...args], environment);
}

function runNpx(args, environment = {}) {
  return run(
    process.execPath,
    [npmCliPath().replace(/npm-cli\.js$/iu, "npx-cli.js"), ...args],
    environment
  );
}

function npmCliPath() {
  const path = process.env.npm_execpath;
  if (!path || !path.toLowerCase().endsWith("npm-cli.js")) {
    throw new Error("npm CLI entry point is unavailable.");
  }
  return path;
}

function git(args) {
  return run("git", args).trim();
}

function run(command, args, environment = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...environment },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error(`${command} failed with exit code ${result.status}.`);
  }
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
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
