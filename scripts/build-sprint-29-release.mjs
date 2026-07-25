import { randomBytes } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { basename, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { packager } from "@electron/packager";

const root = resolve(import.meta.dirname, "..");
const work = join(root, ".tmp-sprint-29");
const stage = join(work, "app-source");
const electronOut = join(work, "electron");
const layouts = join(work, "layouts");
const release = join(work, "release");
const publisher = "CN=Oracle Local Test Signing - NOT PRODUCTION";
const identity = "Oracle.Platform.LocalCertification";
const baselinePackageVersion = "0.0.9.0";
const candidatePackageVersion = "0.1.0.0";
const semanticVersion = "0.1.0";
const runtimeManifestVersion = "1.6.0";
const permanentLimitation =
  "Local test signing proves packaging and distribution mechanics only. It must never be interpreted as production publisher trust, public release readiness, operational certification, deployment authority or permission to distribute Oracle externally.";

assertWorkspacePath(work);
rmSync(work, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
mkdirSync(release, { recursive: true });

runNpm(["run", "build"]);
runNpm(["run", "native:build"]);
runNpm(["run", "desktop:compile"]);

copyRequired(join(root, "dist-electron"), join(stage, "dist-electron"));
copyRequired(join(root, "dist-native"), join(stage, "dist-native"));
copyRequired(join(root, ".next", "standalone"), join(stage, "next"));
copyRequired(join(root, ".next", "static"), join(stage, "next", ".next", "static"));
copyRequired(join(root, "public"), join(stage, "next", "public"));
writeJson(join(stage, "package.json"), {
  name: "oracle-local-certification",
  productName: "Oracle Local Certification",
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

const baselineLayout = join(layouts, "baseline");
const candidateLayout = join(layouts, "candidate");
cpSync(packagedPaths[0], baselineLayout, { recursive: true });
cpSync(packagedPaths[0], candidateLayout, { recursive: true });
prepareManifest(baselineLayout, baselinePackageVersion);
prepareManifest(candidateLayout, candidatePackageVersion);

const pfxPath = join(work, "oracle-local-test-signing.pfx");
const cerPath = join(release, "oracle-local-test-signing.cer");
const password = randomBytes(32).toString("base64url");
runWinApp([
  "cert",
  "generate",
  "--manifest",
  join(candidateLayout, "Package.appxmanifest"),
  "--output",
  pfxPath,
  "--password",
  password,
  "--valid-days",
  "2",
  "--export-cer",
]);
const generatedCer = pfxPath.replace(/\.pfx$/i, ".cer");
cpSync(generatedCer, cerPath);

for (const layout of [baselineLayout, candidateLayout]) {
  for (const executable of [
    join(layout, "Oracle.exe"),
    join(layout, "resources", "app", "dist-native", "Oracle.WindowDiscovery.exe"),
    join(layout, "resources", "app", "dist-native", "Oracle.WindowObserver.exe"),
  ]) {
    runWinApp(["sign", executable, pfxPath, "--password", password]);
  }
}

const baselineMsix = join(release, "Oracle_0.0.9.0_x64_LOCAL_TEST_ONLY.msix");
const candidateMsix = join(release, "Oracle_0.1.0.0_x64_LOCAL_TEST_ONLY.msix");
packageLayout(baselineLayout, baselineMsix, pfxPath, password);
packageLayout(candidateLayout, candidateMsix, pfxPath, password);

const sbomPath = join(release, "oracle-0.1.0.cdx.json");
writeJson(sbomPath, createSbom());
const provenancePath = join(release, "oracle-0.1.0.provenance.json");
writeJson(provenancePath, createProvenance(candidateMsix));

const artifacts = [
  artifact("msix", candidateMsix),
  artifact(
    "native-helper",
    join(candidateLayout, "resources", "app", "dist-native", "Oracle.WindowDiscovery.exe"),
    "package:/resources/app/dist-native/Oracle.WindowDiscovery.exe"
  ),
  artifact(
    "native-helper",
    join(candidateLayout, "resources", "app", "dist-native", "Oracle.WindowObserver.exe"),
    "package:/resources/app/dist-native/Oracle.WindowObserver.exe"
  ),
  artifact("sbom", sbomPath),
  artifact("provenance", provenancePath),
];
const releaseManifestPath = join(release, "oracle-release-manifest.json");
writeJson(releaseManifestPath, {
  contract: { name: "oracle.release-manifest", version: 1 },
  releaseId: "oracle-desktop-beta-0.1.0-local-certification",
  version: semanticVersion,
  packageVersion: candidatePackageVersion,
  channel: "beta",
  architecture: "x64",
  packageIdentity: { name: identity, publisher },
  runtimeCompositionManifestVersion: runtimeManifestVersion,
  artifacts,
  rollback: {
    allowedTargets: [baselinePackageVersion],
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
const signaturePath = `${releaseManifestPath}.p7s`;
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
  signaturePath,
]);

writeJson(join(release, "release-build-summary.json"), {
  status: "local-certification-artifacts-built",
  createdAt: new Date().toISOString(),
  packageIdentity: identity,
  publisher,
  baselinePackageVersion,
  candidatePackageVersion,
  runtimeCompositionManifestVersion: runtimeManifestVersion,
  localSigningOnly: true,
  productionTrusted: false,
  published: false,
  distributed: false,
  deployed: false,
  limitation: permanentLimitation,
  files: [
    basename(baselineMsix),
    basename(candidateMsix),
    basename(sbomPath),
    basename(provenancePath),
    basename(releaseManifestPath),
    basename(signaturePath),
    basename(cerPath),
  ],
});

rmSync(pfxPath, { force: true });
rmSync(generatedCer, { force: true });
console.log(`Sprint 29 local release artifacts: ${release}`);
console.log("Exported private test-signing material destroyed.");

function prepareManifest(layout, packageVersion) {
  const template = readFileSync(
    join(root, "packaging", "windows", "Package.appxmanifest.template"),
    "utf8"
  );
  const manifest = join(layout, "Package.appxmanifest");
  writeFileSync(manifest, template.replace("{{PACKAGE_VERSION}}", packageVersion));
  runWinApp([
    "manifest",
    "update-assets",
    join(root, "public", "images", "oracle-eye.png"),
    "--manifest",
    manifest,
  ]);
}

function packageLayout(layout, output, certificate, certificatePassword) {
  runWinApp([
    "package",
    layout,
    "--output",
    output,
    "--manifest",
    join(layout, "Package.appxmanifest"),
    "--cert",
    certificate,
    "--cert-password",
    certificatePassword,
    "--exe",
    "Oracle.exe",
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
    serialNumber: "urn:uuid:00000000-0000-4000-8000-000000000029",
    version: 1,
    metadata: {
      component: {
        type: "application",
        name: "Oracle Local Certification",
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

function createProvenance(msixPath) {
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
        },
        internalParameters: {
          publicationAuthorised: false,
          deploymentAuthorised: false,
        },
        resolvedDependencies: [
          {
            uri: "file:package-lock.json",
            digest: { sha256: sha256(join(root, "package-lock.json")) },
          },
        ],
      },
      runDetails: {
        builder: { id: "oracle.local/sprint-29-builder" },
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
  runNpx(["winapp", ...args], {
    WINAPP_CLI_TELEMETRY_OPTOUT: "1",
  });
}

function runNpm(args, environment = {}) {
  run(process.execPath, [npmCliPath(), ...args], environment);
}

function runNpx(args, environment = {}) {
  run(
    process.execPath,
    [npmCliPath().replace(/npm-cli\.js$/i, "npx-cli.js"), ...args],
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

function run(command, args, environment = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...environment },
    encoding: "utf8",
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status}.`);
  }
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
