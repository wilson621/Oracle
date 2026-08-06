import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import os from "node:os";
import { basename, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { packager } from "@electron/packager";
import {
  approvedExecutable,
  assertCleanMachineQualificationState,
  assertNoReparseTraversal,
  assertOutsideHistoricalRoots,
  contract,
  git,
  harnessFileInventory,
  readMachineQualificationState,
  repositoryRoot,
  resolveApprovedNpmSurface,
  sha256File,
} from "./harness-core.mjs";
import {
  publishExistingFileCreateOnly,
  readJson,
  writeFileAtomicCreateOnly,
  writeJsonAtomicCreateOnly,
} from "./execution-core.mjs";
import {
  assertBuildCanariesAbsent,
  assertNoAmbientRuntimeConfiguration,
  buildCanaryEvidence,
  createDeterministicBuildEnvironment,
} from "./runtime-configuration-custody.mjs";

const PACKAGE_FILE = contract.package.fileName;
const SEMANTIC_VERSION = contract.package.semanticVersion;
const RUNTIME_MANIFEST_VERSION = contract.package.runtimeManifestVersion;
const RELEASE_ID = contract.package.releaseId;
const PUBLISHER = contract.package.publisherSubjectPrefix;
const HISTORICAL_STAGE2_ARCHIVE_SHA256 =
  "8c20f6da7f0262ed4ef9a3a59c6a027ba3d64cb66c4e646b1f5d075da369f876";
const GOVERNED_COMMAND_MAX_BUFFER_BYTES = 16 * 1024 * 1024;
const PERMANENT_LIMITATION =
  "Local test signing proves packaging and distribution mechanics only. It does not establish production trust, publication, distribution, deployment or release authority.";
const values = parseArguments(process.argv.slice(2));
const preparationId = values.get("preparation-id");
const timestampUtc = values.get("timestamp-utc");
const harnessCommit = values.get("harness-commit");
if (!preparationId || !timestampUtc || !harnessCommit || values.size !== 3) {
  throw new Error("Exactly --preparation-id, --timestamp-utc and --harness-commit are required.");
}
assert.match(preparationId, /^candidate-r8-\d{8}T\d{9}Z-[0-9a-f]{8}$/u);
assert.equal(git(["branch", "--show-current"]), contract.requiredBranch);
assert.equal(git(["rev-parse", "HEAD"]), harnessCommit);
assert.equal(git(["status", "--porcelain=v1"]), "");
assert.equal(git(["rev-parse", contract.candidate.commit + "^{tree}"]), contract.candidate.tree);
const productDifference = spawnSync(approvedExecutable("git"), ["diff", "--quiet", contract.candidate.commit, harnessCommit, "--", "app", "components", "desktop", "desktop-native", "lib", "database", "packaging", "public", "package.json", "package-lock.json", "next.config.ts", "scripts/build-desktop-preload.mjs", "scripts/verify-accessible-color-contract.mjs", "eslint.config.mjs", "tsconfig.desktop.json"], { cwd: repositoryRoot, shell: false, windowsHide: true });
assert.equal(productDifference.status, 0, "Preparation changed governed candidate inputs.");
const preparationRoot = resolve(repositoryRoot, contract.preparation.artifactBase, preparationId);
assertOutsideHistoricalRoots(preparationRoot);
if (existsSync(preparationRoot)) throw new Error("Create-only R8 candidate freeze already exists.");
mkdirSync(resolve(repositoryRoot, contract.preparation.artifactBase), { recursive: true });
mkdirSync(preparationRoot, { recursive: false });
const input = {
  authorityId: "NO-AUTHORITY-ENGINEERING-PREPARATION",
  attemptId: preparationId,
  timestampUtc,
  candidateCommit: contract.candidate.commit,
  harnessCommit,
  machineIdentity: os.hostname(),
  packageIdentity: contract.package.identity,
  packageVersion: contract.package.version,
  outputRoot: preparationRoot,
};
let attemptRoot = preparationRoot;
let directories = Object.fromEntries(["logs", "work", "release", "signing", "verification"].map(function(name) { const value = join(preparationRoot, name); mkdirSync(value, { recursive: false }); return [name, value]; }));
let exactThumbprint = null;
let certificateSubject;
let certificateNotAfter;
let password = null;
let pfxPath = null;
let generatedCerPath = null;
let verificationCerPath = null;
let teardownAttempted = false;
let signingMaterialDestructionAttempted = false;
try {
  assert.equal(contract.status, "engineering-preparation-transfer-barred");
  assert.equal(contract.authority.transferCreationPermitted, false);
  assert.equal(contract.authority.authorityCreationPermitted, false);
  assert.equal(contract.authority.attemptCreationPermitted, false);
  assert.equal(contract.package.version, "0.1.6.0");
  assertExecutionContract();
  assertHistoricalEvidence();
  assertNoAmbientRuntimeConfiguration(repositoryRoot);
  assertCleanMachineQualificationState(readMachineQualificationState());
  const candidate = createQualificationCandidate();
  runSourceBaseline();
  assertRepositoryAndCandidateUnchanged(candidate);
  const layout = await constructPackageLayout();
  ({ exactThumbprint, certificateSubject, certificateNotAfter, pfxPath, generatedCerPath, password } = createTemporaryCertificate(layout));
  const publicCertificatePath = join(directories.release, "Oracle.Stage2R8PublicCertificate.cer");
  cpSync(generatedCerPath, publicCertificatePath, { errorOnExist: true, force: false });
  const release = buildSignedRelease(layout, candidate);
  verificationCerPath = join(directories.release, ".r8-verification-temporary.cer");
  const verification = verifyRelease(release, candidate);
  performSafetyTeardown();
  verification.trustRemoved = true;
  verification.privateSigningMaterialDestroyed = true;
  writeJsonAtomicCreateOnly(join(directories.release, "signature-and-trust-verification.json"), verification);
  assertExpectedReleaseFiles();
  assertNoAmbientRuntimeConfiguration(repositoryRoot);
  assertCleanMachineQualificationState(readMachineQualificationState());
  const releaseFiles = inventory(directories.release);
  const freeze = {
    schemaVersion: "1.0.0",
    contract: "oracle.sprint-30-5.stage-2-r8-engineering-candidate-freeze",
    result: "passed",
    classification: ["NON-QUALIFICATION", "NON-AUTHORITY", "NON-ATTEMPT", "ENGINEERING CANDIDATE FREEZE"],
    preparationId, timestampUtc, candidateCommit: contract.candidate.commit, candidateTree: contract.candidate.tree, harnessCommit,
    package: { fileName: contract.package.fileName, sha256: sha256File(release.packagePath), bytes: statSync(release.packagePath).size },
    publicCertificate: { fileName: basename(publicCertificatePath), sha256: sha256File(publicCertificatePath), thumbprint: exactThumbprint, subject: certificateSubject, notAfter: certificateNotAfter },
    releaseFiles, privateSigningMaterialDestroyed: true, certificateResidue: 0, transferCreated: false, authorityCreated: false, attemptCreated: false, qualificationEvidence: false
  };
  const freezePath = join(preparationRoot, "Oracle.Stage2R8EngineeringCandidateFreeze.json");
  writeJsonAtomicCreateOnly(freezePath, freeze);
  console.log(JSON.stringify({ result: "passed", preparationId, preparationRoot, packageSha256: freeze.package.sha256, publicCertificateSha256: freeze.publicCertificate.sha256, freezeSha256: sha256File(freezePath), files: releaseFiles.length, transferCreated: false, authorityCreated: false, attemptCreated: false }, null, 2));
} catch (error) {
  let cleanupError = null;
  try {
    if (!teardownAttempted && (exactThumbprint || pfxPath)) {
      if (!exactThumbprint && pfxPath && password && existsSync(pfxPath)) recoverCertificateIdentity();
      if (exactThumbprint) performSafetyTeardown();
    }
  } catch (failure) { cleanupError = failure; }
  const failure = { schemaVersion: "1.0.0", contract: "oracle.sprint-30-5.stage-2-r8-engineering-candidate-freeze-failure", result: "failed", preparationId, error: error.message, cleanupError: cleanupError ? cleanupError.message : null, transferCreated: false, authorityCreated: false, attemptCreated: false };
  try { writeJsonAtomicCreateOnly(join(preparationRoot, "Oracle.Stage2R8EngineeringCandidateFreezeFailure.json"), failure); } catch (writeFailure) { failure.failureRecordWriteError = writeFailure.message; }
  throw new AggregateError(cleanupError ? [error, cleanupError] : [error], "R8 engineering candidate freeze failed closed.", { cause: error });
}

function assertExecutionContract() {
  assert.equal(contract.programmeIdentity, "Sprint 30.5 Stage 2 Requalification R8");
  assert.equal(contract.revision, "R8");
  assert.equal(contract.package.identity, "Oracle.Platform.LocalCertification");
  assert.equal(contract.package.version, "0.1.6.0");
  assert.equal(contract.package.architecture, "x64");
  assert.equal(contract.package.semanticVersion, "0.1.6");
  assert.equal(contract.package.runtimeManifestVersion, "1.7.0");
  assert.equal(contract.certificate.requestedLifetimeDays, 30);
  assert.equal(
    contract.certificate.minimumRemainingLifetimeDaysAtCreation,
    29
  );
  assert.equal(contract.certificate.maximumLifetimeDays, 30);
  assert.equal(contract.certificate.cleanupSelection, "exact-thumbprint-only");
  assert.equal(contract.package.publisherSubjectPrefix, PUBLISHER);
  assert.equal(contract.runtimeConfiguration.contract, "oracle.installed-runtime-configuration");
  assert.equal(contract.runtimeConfiguration.version, 1);
  assert.equal(contract.runtimeConfiguration.maximumLifetimeSeconds, 900);
  assert.equal(contract.runtimeConfiguration.packageBytesMustExcludeCredentials, true);
  for (const binding of contract.runtimeConfiguration.productBindings) {
    const path = resolve(repositoryRoot, ...binding.path.split("/"));
    assertNoReparseTraversal(path);
    assert.equal(
      sha256File(path),
      binding.sha256,
      `Installed runtime-configuration binding failed: ${binding.path}`
    );
  }
  assert.equal(
    sha256File(join(repositoryRoot, "database", "011_operator_account_provisioning.sql")),
    contract.candidate.migration011Sha256,
    "Migration 011 does not match the fixed R8 candidate binding."
  );
  assert.equal(
    sha256File(join(repositoryRoot, "database", "012_operator_identity_lifecycle.sql")),
    contract.candidate.migration012Sha256,
    "Migration 012 does not match the fixed R8 candidate binding."
  );
}

function identity() {
  return {
    programmeIdentity: contract.programmeIdentity,
    revision: contract.revision,
    authorityId: input.authorityId,
    attemptId: input.attemptId,
    candidateCommit: input.candidateCommit,
    harnessCommit: input.harnessCommit,
  };
}

function assertHistoricalEvidence() {
  for (const binding of contract.historicalEvidenceBindings) {
    if (binding.path.split("/").includes("..")) {
      throw new Error(`Historical evidence binding contains traversal: ${binding.path}`);
    }
    const historicalPath = resolve(repositoryRoot, ...binding.path.split("/"));
    if (!existsSync(historicalPath)) {
      throw new Error(`Immutable historical evidence binding is missing: ${binding.path}`);
    }
    assertNoReparseTraversal(historicalPath);
    if (sha256File(historicalPath) !== binding.sha256) {
      throw new Error(`Immutable historical evidence binding failed: ${binding.path}`);
    }
  }
  const historicalArchive = join(
    repositoryRoot,
    ".artifacts",
    "sprint-30-5",
    "stage-2",
    "Oracle.Sprint30.5.Stage2QualificationEvidence.zip"
  );
  if (
    !existsSync(historicalArchive) ||
    sha256File(historicalArchive) !== HISTORICAL_STAGE2_ARCHIVE_SHA256
  ) {
    throw new Error("Historical Stage 2 archive binding failed.");
  }
  const sprint29Certification = readJson(
    join(
      repositoryRoot,
      "docs",
      "sprints",
      "evidence",
      "sprint-29",
      "release-certification.json"
    )
  );
  const sprint29Package = join(
    repositoryRoot,
    ".tmp-sprint-29",
    "release",
    "Oracle_0.1.0.0_x64_LOCAL_TEST_ONLY.msix"
  );
  if (
    !existsSync(sprint29Package) ||
    sha256File(sprint29Package) !== sprint29Certification.candidateSha256
  ) {
    throw new Error("Immutable Sprint 29 package binding failed.");
  }
}

function createQualificationCandidate() {
  const productFiles = governedProductFiles();
  const packageJson = readJson(join(repositoryRoot, "package.json"));
  const migrations = productFiles.filter((path) =>
    /^database\/(009|010|011|012|013|014)_/u.test(path)
  );
  return {
    schemaVersion: "1.0.0",
    contract:
      "oracle.sprint-30-5.stage-2-requalification-r8-qualification-candidate",
    ...identity(),
    frozenAt: new Date().toISOString(),
    sourceCommit: input.candidateCommit,
    sourceTree: contract.candidate.tree,
    branch: git(["branch", "--show-current"]),
    productSourceSha256: combinedHash(productFiles),
    productFiles: productFiles.map((path) => ({
      path,
      size: statSync(join(repositoryRoot, path)).size,
      sha256: sha256File(join(repositoryRoot, path)),
    })),
    runtimeManifest: verifyRuntimeManifestEquality(),
    dependencies: {
      packageLockSha256: sha256File(join(repositoryRoot, "package-lock.json")),
      node: process.version,
      npm: runReadOnlyVersion(process.execPath, [npmCliPath(), "--version"]),
      next: packageJson.dependencies.next,
      electron: packageJson.devDependencies.electron,
      winAppCli: packageJson.devDependencies["@microsoft/winappcli"],
      esbuild: packageJson.devDependencies.esbuild,
    },
    packaging: {
      templateSha256: sha256File(
        join(repositoryRoot, "packaging", "windows", "Package.appxmanifest.template")
      ),
      executorSha256: sha256File(import.meta.filename),
      harnessFiles: harnessFileInventory(),
      packageFile: PACKAGE_FILE,
      releaseId: RELEASE_ID,
      publisher: PUBLISHER,
      architecture: contract.package.architecture,
      packageVersion: contract.package.version,
      signingClassification: "isolated-local-test-only",
    },
    migrations: Object.fromEntries(
      migrations.map((path) => [path, sha256File(join(repositoryRoot, path))])
    ),
    authority: {
      singleAttempt: true,
      productionTrusted: false,
      publication: false,
      distribution: false,
      deployment: false,
      stage3: false,
    },
  };
}

function governedProductFiles() {
  const output = git([
    "ls-files",
    "-z",
    "--",
    "app",
    "components",
    "desktop",
    "desktop-native",
    "lib",
    "database",
    "packaging",
    "public",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "scripts/build-desktop-preload.mjs",
    "tsconfig.desktop.json",
  ]);
  return output.split("\0").filter(Boolean).sort();
}

function combinedHash(files) {
  const hash = createHash("sha256");
  for (const path of files) {
    hash.update(path);
    hash.update("\0");
    hash.update(readFileSync(join(repositoryRoot, path)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function verifyRuntimeManifestEquality() {
  const webPath = join(
    repositoryRoot,
    "lib",
    "oracle",
    "composition",
    "web-composition-root.ts"
  );
  const electronPath = join(
    repositoryRoot,
    "desktop",
    "platform",
    "desktop-composition-root.ts"
  );
  const versionPattern = /manifestVersion:\s*"([^"]+)"/u;
  const webVersion = versionPattern.exec(readFileSync(webPath, "utf8"))?.[1];
  const electronVersion = versionPattern.exec(
    readFileSync(electronPath, "utf8")
  )?.[1];
  if (
    webVersion !== RUNTIME_MANIFEST_VERSION ||
    electronVersion !== RUNTIME_MANIFEST_VERSION ||
    webVersion !== electronVersion
  ) {
    throw new Error("Runtime Manifest Web/Electron equality failed.");
  }
  return {
    version: RUNTIME_MANIFEST_VERSION,
    webVersion,
    electronVersion,
    equal: true,
    webSourceSha256: sha256File(webPath),
    electronSourceSha256: sha256File(electronPath),
  };
}

function runSourceBaseline() {
  assertNoAmbientRuntimeConfiguration(repositoryRoot);
  runNpmLogged("installed-runtime-configuration-policy", [
    "run",
    "installed-runtime-config:verify",
  ]);
  runNpxLogged("typescript", ["tsc", "--noEmit", "--incremental", "false"]);
  runNpmLogged("lint", ["run", "lint"]);
  runNpmLogged("accessible-color-contract", [
    "run",
    "accessibility:color:verify",
  ]);
  runNpmLogged("architecture", ["run", "architecture:audit"]);
  runNpmLogged(
    "web-build",
    ["run", "build"],
    [],
    createDeterministicBuildEnvironment(process.env)
  );
  runNpmLogged("electron-and-preload-build", ["run", "desktop:compile"]);
  runNpmLogged("native-helper-builds", ["run", "native:build"]);
  assertNoAmbientRuntimeConfiguration(repositoryRoot);
  const scans = Object.fromEntries(
    [".next", "dist-electron", "dist-native"].map((path) => [
      path,
      assertBuildCanariesAbsent(join(repositoryRoot, path)),
    ])
  );
  writeJsonAtomicCreateOnly(
    join(directories.verification, "runtime-configuration-build-secrecy.json"),
    {
      schemaVersion: "1.0.0",
      contract: "oracle.sprint-30-5.stage-2-requalification-r8-build-secrecy",
      ...identity(),
      ambientConfiguration: "absent-before-authority-consumption",
      buildCanaries: buildCanaryEvidence(),
      scans,
      packageScanPending: true,
    }
  );
  verifyRuntimeManifestEquality();
}

function assertRepositoryAndCandidateUnchanged(candidate) {
  if (git(["branch", "--show-current"]) !== contract.requiredBranch) {
    throw new Error("Branch changed during R8 execution.");
  }
  if (git(["rev-parse", "HEAD"]) !== input.harnessCommit) {
    throw new Error("HEAD changed during R8 execution.");
  }
  if (git(["status", "--porcelain=v1", "--untracked-files=all"]) !== "") {
    throw new Error("Repository changed during R8 build.");
  }
  if (combinedHash(governedProductFiles()) !== candidate.productSourceSha256) {
    throw new Error("Governed product inputs drifted after candidate freeze.");
  }
}

async function constructPackageLayout() {
  const stage = join(directories.work, "app-source");
  const electronOut = join(directories.work, "electron");
  const layout = join(directories.work, "layout");
  for (const path of [stage, electronOut]) mkdirSync(path, { recursive: false });
  copyRequired(join(repositoryRoot, "dist-electron"), join(stage, "dist-electron"));
  copyRequired(join(repositoryRoot, "dist-native"), join(stage, "dist-native"));
  copyRequired(join(repositoryRoot, ".next", "standalone"), join(stage, "next"));
  copyRequired(
    join(repositoryRoot, ".next", "static"),
    join(stage, "next", ".next", "static")
  );
  copyRequired(join(repositoryRoot, "public"), join(stage, "next", "public"));
  writeJsonAtomicCreateOnly(join(stage, "package.json"), {
    name: "oracle-stage-2-requalification-r8-local-qualification",
    productName: "Oracle Stage 2 Requalification R8 Local Qualification",
    version: SEMANTIC_VERSION,
    private: true,
    main: "dist-electron/desktop/main.js",
  });
  const paths = await packager({
    dir: stage,
    out: electronOut,
    name: "Oracle",
    executableName: "Oracle",
    platform: "win32",
    arch: "x64",
    electronVersion: "39.8.10",
    asar: false,
    prune: false,
    overwrite: false,
  });
  if (paths.length !== 1) {
    throw new Error("Electron packaging did not produce exactly one x64 payload.");
  }
  cpSync(paths[0], layout, { recursive: true, errorOnExist: true, force: false });
  const template = readFileSync(
    join(repositoryRoot, "packaging", "windows", "Package.appxmanifest.template"),
    "utf8"
  );
  const manifest = template
    .replace("{{PACKAGE_VERSION}}", contract.package.version)
    .replaceAll("CN=Oracle Local Test Signing - NOT PRODUCTION", PUBLISHER);
  writeFileAtomicCreateOnly(join(layout, "Package.appxmanifest"), manifest);
  runWinApp(
    "manifest-assets",
    [
      "manifest",
      "update-assets",
      join(repositoryRoot, "public", "images", "oracle-eye.png"),
      "--manifest",
      join(layout, "Package.appxmanifest"),
    ]
  );
  return layout;
}

function createTemporaryCertificate(layout) {
  pfxPath = join(directories.signing, "r8-local-test-signing.pfx");
  password = randomBytes(32).toString("base64url");
  runWinApp(
    "certificate-generate",
    [
      "cert",
      "generate",
      "--manifest",
      join(layout, "Package.appxmanifest"),
      "--output",
      pfxPath,
      "--password",
      password,
      "--valid-days",
      String(contract.certificate.requestedLifetimeDays),
      "--export-cer",
    ],
    [password]
  );
  generatedCerPath = pfxPath.replace(/\.pfx$/iu, ".cer");
  const script = [
    "$ErrorActionPreference='Stop'",
    "$flags=[Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet",
    "$cert=[Security.Cryptography.X509Certificates.X509Certificate2]::new($env:ORACLE_R8_PFX,$env:ORACLE_R8_PASSWORD,$flags)",
    "try {[ordered]@{thumbprint=$cert.Thumbprint;subject=$cert.Subject;notAfter=$cert.NotAfter.ToUniversalTime().ToString('o')}|ConvertTo-Json -Compress} finally {$cert.Dispose()}",
  ].join(";");
  const result = JSON.parse(
    runLogged(
      "certificate-identity",
      approvedExecutable("powershell"),
      ["-NoProfile", "-NonInteractive", "-Command", script],
      [],
      { ORACLE_R8_PFX: pfxPath, ORACLE_R8_PASSWORD: password }
    ).stdout.trim()
  );
  exactThumbprint = result.thumbprint;
  certificateSubject = result.subject;
  certificateNotAfter = result.notAfter;
  if (
    !/^[0-9A-F]{40}$/u.test(result.thumbprint) ||
    result.subject !== PUBLISHER
  ) {
    throw new Error("Generated certificate identity is invalid.");
  }
  const lifetime = new Date(result.notAfter).valueOf() - Date.now();
  const minimumLifetimeMilliseconds =
    contract.certificate.minimumRemainingLifetimeDaysAtCreation *
    24 *
    60 *
    60 *
    1000;
  const maximumLifetimeMilliseconds =
    contract.certificate.maximumLifetimeDays * 24 * 60 * 60 * 1000;
  if (
    lifetime < minimumLifetimeMilliseconds ||
    lifetime > maximumLifetimeMilliseconds + 5 * 60 * 1000
  ) {
    throw new Error(
      `Generated certificate lifetime is outside the governed ${contract.certificate.minimumRemainingLifetimeDaysAtCreation}-${contract.certificate.maximumLifetimeDays} day range.`
    );
  }
  return {
    exactThumbprint: result.thumbprint,
    certificateSubject: result.subject,
    certificateNotAfter: result.notAfter,
    pfxPath,
    generatedCerPath,
    password,
  };
}

function readCertificateStoreSnapshot(label) {
  const script = [
    "$ErrorActionPreference='Stop'",
    "$records=@(foreach($location in @('CurrentUser','LocalMachine')){foreach($store in @('My','Root','TrustedPeople')){$path=\"Cert:\\$location\\$store\";if(Test-Path -LiteralPath $path){Get-ChildItem -LiteralPath $path|ForEach-Object{[pscustomobject]@{location=$location;store=$store;thumbprint=$_.Thumbprint;subject=$_.Subject}}}}})",
    "@($records)|ConvertTo-Json -Compress -Depth 4",
  ].join(";");
  const output = runLogged(
    label,
    approvedExecutable("powershell"),
    ["-NoProfile", "-NonInteractive", "-Command", script]
  ).stdout.trim();
  const parsed = output === "" ? [] : JSON.parse(output);
  return Array.isArray(parsed) ? parsed : [parsed];
}


function recoverCertificateIdentity() {
  const script = [
    "$ErrorActionPreference='Stop'",
    "$flags=[Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet",
    "$cert=[Security.Cryptography.X509Certificates.X509Certificate2]::new($env:ORACLE_R8_PFX,$env:ORACLE_R8_PASSWORD,$flags)",
    "try {[ordered]@{thumbprint=$cert.Thumbprint;subject=$cert.Subject;notAfter=$cert.NotAfter.ToUniversalTime().ToString('o')}|ConvertTo-Json -Compress} finally {$cert.Dispose()}",
  ].join(";");
  const result = spawnSync(
    approvedExecutable("powershell"),
    ["-NoProfile", "-NonInteractive", "-Command", script],
    {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        ORACLE_R8_PFX: pfxPath,
        ORACLE_R8_PASSWORD: password,
      },
      encoding: "utf8",
      shell: false,
      windowsHide: true,
    }
  );
  if (result.error || result.status !== 0) {
    throw new Error("Unable to recover the generated certificate identity.");
  }
  const parsed = JSON.parse(result.stdout.trim());
  if (
    !/^[0-9A-F]{40}$/u.test(parsed.thumbprint) ||
    parsed.subject !== PUBLISHER
  ) {
    throw new Error("Recovered certificate identity is invalid.");
  }
  exactThumbprint = parsed.thumbprint;
  certificateSubject = parsed.subject;
  certificateNotAfter = parsed.notAfter;
}

function buildSignedRelease(layout, candidate) {
  const executablePaths = [
    join(layout, "Oracle.exe"),
    join(layout, "resources", "app", "dist-native", "Oracle.WindowDiscovery.exe"),
    join(layout, "resources", "app", "dist-native", "Oracle.WindowObserver.exe"),
  ];
  for (const path of executablePaths) {
    runWinApp("sign-executable", ["sign", path, pfxPath, "--password", password], [
      password,
    ]);
  }
  const packagePath = join(directories.release, PACKAGE_FILE);
  const temporaryPackagePath = join(
    directories.work,
    `.${PACKAGE_FILE.slice(0, -5)}.tmp-${process.pid}-${Date.now()}.msix`
  );
  runWinApp(
    "package-msix",
    [
      "package",
      layout,
      "--output",
      temporaryPackagePath,
      "--manifest",
      join(layout, "Package.appxmanifest"),
      "--cert",
      pfxPath,
      "--cert-password",
      password,
      "--exe",
      "Oracle.exe",
    ],
    [password]
  );
  publishExistingFileCreateOnly(temporaryPackagePath, packagePath);
  const sbomPath = join(directories.release, "oracle-0.1.6.cdx.json");
  writeJsonAtomicCreateOnly(sbomPath, createSbom());
  const provenancePath = join(
    directories.release,
    "oracle-0.1.6.provenance.json"
  );
  writeJsonAtomicCreateOnly(
    provenancePath,
    createProvenance(packagePath, candidate)
  );
  const artifacts = [
    artifact("msix", packagePath),
    artifact(
      "native-helper",
      executablePaths[1],
      "package:/resources/app/dist-native/Oracle.WindowDiscovery.exe"
    ),
    artifact(
      "native-helper",
      executablePaths[2],
      "package:/resources/app/dist-native/Oracle.WindowObserver.exe"
    ),
    artifact("sbom", sbomPath),
    artifact("provenance", provenancePath),
  ];
  const releaseManifestPath = join(
    directories.release,
    "oracle-release-manifest.json"
  );
  writeJsonAtomicCreateOnly(releaseManifestPath, {
    contract: { name: "oracle.release-manifest", version: 1 },
    releaseId: RELEASE_ID,
    version: SEMANTIC_VERSION,
    packageVersion: contract.package.version,
    channel: "beta",
    architecture: contract.package.architecture,
    packageIdentity: { name: contract.package.identity, publisher: PUBLISHER },
    runtimeCompositionManifestVersion: RUNTIME_MANIFEST_VERSION,
    artifacts,
    rollback: { allowedTargets: ["0.1.0.0"], arbitraryDowngrade: false },
    signing: {
      classification: "isolated-local-test-only",
      productionTrusted: false,
      publicReleaseReady: false,
      externalDistributionAuthorised: false,
      deploymentAuthorised: false,
    },
  });
  runLogged(
    "sign-release-manifest",
    approvedExecutable("powershell"),
    [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      join(import.meta.dirname, "sign-release-manifest-exact.ps1"),
      "-ManifestPath",
      releaseManifestPath,
      "-PfxPath",
      pfxPath,
      "-Password",
      password,
      "-ExpectedThumbprint",
      exactThumbprint,
      "-ExpectedSubject",
      PUBLISHER,
      "-SignaturePath",
      `${releaseManifestPath}.p7s`,
    ],
    [password]
  );
  writeJsonAtomicCreateOnly(
    join(directories.release, "release-build-summary.json"),
    {
      schemaVersion: "1.0.0",
      contract: "oracle.sprint-30-5.stage-2-requalification-r8-release-build",
      ...identity(),
      status: "local-qualification-artifacts-built",
      createdAt: new Date().toISOString(),
      sourceCommit: candidate.sourceCommit,
      packageIdentity: contract.package.identity,
      publisher: PUBLISHER,
      packageVersion: contract.package.version,
      runtimeCompositionManifestVersion: RUNTIME_MANIFEST_VERSION,
      exactThumbprint,
      localSigningOnly: true,
      productionTrusted: false,
      published: false,
      externallyDistributed: false,
      deployed: false,
      installed: false,
      limitation: PERMANENT_LIMITATION,
    }
  );
  return {
    packagePath,
    sbomPath,
    provenancePath,
    releaseManifestPath,
    executablePaths,
  };
}

function verifyRelease(release, candidate) {
  const unpacked = join(directories.verification, "unpacked");
  mkdirSync(unpacked, { recursive: false });
  runWinApp("unpack-msix", [
    "tool",
    "makeappx",
    "unpack",
    "/p",
    release.packagePath,
    "/d",
    unpacked,
    "/o",
  ]);
  const packageSecrecy = assertBuildCanariesAbsent(unpacked);
  const manifestXml = readFileSync(join(unpacked, "AppxManifest.xml"), "utf8");
  assert.match(manifestXml, /Name="Oracle\.Platform\.LocalCertification"/u);
  assert.ok(manifestXml.includes(`Version="${contract.package.version}"`));
  assert.match(manifestXml, /ProcessorArchitecture="x64"/u);
  assert.ok(
    manifestXml.includes(`Publisher="${PUBLISHER.replaceAll("&", "&amp;")}"`)
  );
  assert.match(manifestXml, /Executable="Oracle\.exe"/u);

  const manifest = readJson(release.releaseManifestPath);
  assert.equal(manifest.releaseId, RELEASE_ID);
  assert.equal(manifest.runtimeCompositionManifestVersion, RUNTIME_MANIFEST_VERSION);
  assert.equal(manifest.packageIdentity.name, contract.package.identity);
  assert.equal(manifest.packageIdentity.publisher, PUBLISHER);
  for (const declared of manifest.artifacts) {
    const path = declared.path.startsWith("package:/")
      ? join(unpacked, ...declared.path.slice("package:/".length).split("/"))
      : join(directories.release, declared.path);
    assert.ok(existsSync(path), `Declared artifact missing: ${declared.path}`);
    assert.equal(statSync(path).size, declared.size);
    assert.equal(sha256File(path), declared.sha256);
  }
  const forbidden = findFiles(unpacked).filter((path) =>
    /(^|[\\/])\.env(?:\.|$)|\.(cer|key|pem|pfx|p12)$/iu.test(path)
  );
  assert.deepEqual(forbidden, []);
  const packageInventory = inventory(unpacked);
  writeJsonAtomicCreateOnly(
    join(directories.release, "package-content-inventory.json"),
    {
      schemaVersion: "1.0.0",
      contract:
        "oracle.sprint-30-5.stage-2-requalification-r8-package-content-inventory",
      ...identity(),
      packageSha256: sha256File(release.packagePath),
      entries: packageInventory,
    }
  );
  const sbom = readJson(release.sbomPath);
  assert.equal(sbom.bomFormat, "CycloneDX");
  assert.equal(sbom.specVersion, "1.6");
  assert.ok(sbom.components.length > 0);
  const provenance = readJson(release.provenancePath);
  assert.equal(provenance.subject[0].digest.sha256, sha256File(release.packagePath));
  assert.equal(
    provenance.predicate.buildDefinition.internalParameters.sourceCommit,
    candidate.sourceCommit
  );
  const signature = JSON.parse(
    runLogged(
      "verify-exact-signatures",
      approvedExecutable("powershell"),
      [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        join(import.meta.dirname, "verify-exact-signatures.ps1"),
        "-ReleaseDirectory",
        directories.release,
        "-UnpackedDirectory",
        unpacked,
        "-PackageFileName",
        PACKAGE_FILE,
        "-ExpectedThumbprint",
        exactThumbprint,
        "-ExpectedSubject",
        PUBLISHER,
      ]
    ).stdout.trim()
  );
  assert.equal(signature.status, "passed");
  assert.equal(signature.exactThumbprint, exactThumbprint);
  return {
    ...signature,
    packageContentEntries: packageInventory.length,
    runtimeConfigurationPackageSecrecy: packageSecrecy,
  };
}

function performSafetyTeardown() {
  if (teardownAttempted) {
    throw new Error("Safety teardown may not be retried.");
  }
  teardownAttempted = true;
  const cleanupPath = join(directories.release, "signing-store-cleanup.json");
  let cleanupError = null;
  let signingMaterialError = null;
  try {
    const exactStoreMatches = readCertificateStoreSnapshot(
      "certificate-store-before-teardown"
    ).filter((record) => record.thumbprint === exactThumbprint);
    if (exactStoreMatches.length === 0) {
      writeJsonAtomicCreateOnly(cleanupPath, {
        schemaVersion: "1.0.0",
        contract:
          "oracle.sprint-30-5.stage-2-requalification-r8-certificate-cleanup",
        programmeIdentity: contract.programmeIdentity,
        completedAt: new Date().toISOString(),
        status: "passed",
        expectedSubject: PUBLISHER,
        exactThumbprint,
        removed: [],
        remainingExactThumbprintMatches: 0,
        subjectWideRemovalUsed: false,
        trustRemoved: true,
        certificateStoreEntriesPresentBeforeCleanup: false,
      });
    } else {
      runLogged("exact-certificate-teardown", approvedExecutable("powershell"), [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        join(import.meta.dirname, "remove-exact-certificate.ps1"),
        "-Thumbprint",
        exactThumbprint,
        "-ExpectedSubject",
        PUBLISHER,
        "-OutputPath",
        cleanupPath,
      ]);
    }
  } catch (error) {
    cleanupError = error;
  } finally {
    try {
      destroySigningMaterial();
    } catch (error) {
      signingMaterialError = error;
    }
  }
  if (cleanupError || signingMaterialError) {
    throw new AggregateError(
      [cleanupError, signingMaterialError].filter(Boolean),
      [
        cleanupError
          ? `Exact certificate cleanup failed: ${cleanupError.message}`
          : null,
        signingMaterialError
          ? `Signing-material destruction failed: ${signingMaterialError.message}`
          : null,
      ]
        .filter(Boolean)
        .join("; ")
    );
  }
  assertCleanMachineQualificationState();
  const admittedPublicCertificate = resolve(
    directories.release,
    contract.package.publicCertificateFileName
  ).toLowerCase();
  const residue = findFiles(attemptRoot).filter(
    (path) =>
      /\.(cer|key|pem|pfx|p12)$/iu.test(path) &&
      resolve(path).toLowerCase() !== admittedPublicCertificate
  );
  if (residue.length !== 0) {
    throw new Error(`Signing material remains: ${residue.join(", ")}`);
  }
}

function destroySigningMaterial() {
  if (signingMaterialDestructionAttempted) {
    throw new Error("Signing-material destruction may not be retried.");
  }
  signingMaterialDestructionAttempted = true;
  const possibleGeneratedCerPath = pfxPath?.replace(/\.pfx$/iu, ".cer");
  for (const path of [
    pfxPath,
    generatedCerPath,
    possibleGeneratedCerPath,
    verificationCerPath,
  ]) {
    if (path && existsSync(path)) rmSync(path, { force: true });
  }
  if (directories?.signing && existsSync(directories.signing)) {
    rmSync(directories.signing, { recursive: true, force: true });
  }
}










function createSbom() {
  const lock = readJson(join(repositoryRoot, "package-lock.json"));
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
      `${left.name}@${left.version}` < `${right.name}@${right.version}`
        ? -1
        : `${left.name}@${left.version}` >
            `${right.name}@${right.version}`
          ? 1
          : 0
    );
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    serialNumber: `urn:uuid:${deterministicUuid(input.attemptId)}`,
    version: 1,
    metadata: {
      component: {
        type: "application",
        name: "Oracle Stage 2 Requalification R8 Local Qualification",
        version: SEMANTIC_VERSION,
      },
      properties: [
        { name: "oracle:attempt-id", value: input.attemptId },
        { name: "oracle:distribution-trust", value: "local-test-only" },
      ],
    },
    components,
  };
}

function deterministicUuid(value) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `8${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join("-");
}

function assertExpectedReleaseFiles() {
  const expected = [
    PACKAGE_FILE,
    "oracle-0.1.6.cdx.json",
    "oracle-0.1.6.provenance.json",
    "oracle-release-manifest.json",
    "oracle-release-manifest.json.p7s",
    "package-content-inventory.json",
    "release-build-summary.json",
    "signature-and-trust-verification.json",
    "signing-store-cleanup.json",
  ].sort();
  const actual = readdirSync(directories.release)
    .filter((name) => !name.startsWith("."))
    .sort();
  assert.deepEqual(
    actual,
    expected,
    "Release evidence contains missing or unexpected files."
  );
}

function createProvenance(packagePath, candidate) {
  return {
    _type: "https://in-toto.io/Statement/v1",
    subject: [
      { name: PACKAGE_FILE, digest: { sha256: sha256File(packagePath) } },
    ],
    predicateType: "https://slsa.dev/provenance/v1",
    predicate: {
      buildDefinition: {
        buildType: "https://oracle.local/build-types/windows-msix/v1",
        externalParameters: {
          attemptId: input.attemptId,
          architecture: contract.package.architecture,
          signingClassification: "isolated-local-test-only",
          runtimeManifestVersion: RUNTIME_MANIFEST_VERSION,
        },
        internalParameters: {
          sourceCommit: candidate.sourceCommit,
          sourceTree: candidate.sourceTree,
          harnessCommit: input.harnessCommit,
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
        builder: {
          id: "oracle.local/sprint-30-5-stage-2-requalification-r8",
        },
        metadata: { invocationId: input.attemptId },
      },
    },
  };
}

function artifact(kind, path, declaredPath = basename(path)) {
  return {
    kind,
    path: declaredPath,
    sha256: sha256File(path),
    size: statSync(path).size,
  };
}

function inventory(root) {
  return findFiles(root)
    .map((path) => ({
      path: relative(root, path).replaceAll("\\", "/"),
      size: statSync(path).size,
      sha256: sha256File(path),
    }))
    .sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0
    );
}

function findFiles(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Evidence traversal encountered a symbolic link: ${path}`);
    }
    return entry.isDirectory() ? findFiles(path) : [path];
  });
}

function copyRequired(source, destination) {
  if (!existsSync(source)) {
    throw new Error(`Required build output is missing: ${source}`);
  }
  if (existsSync(destination)) {
    throw new Error(`Create-only copy destination exists: ${destination}`);
  }
  cpSync(source, destination, {
    recursive: true,
    errorOnExist: true,
    force: false,
    verbatimSymlinks: true,
  });
  assertNoReparseTraversal(destination);
}

function runWinApp(label, args, redactions = []) {
  return runNpxLogged(label, ["winapp", ...args], redactions, {
    WINAPP_CLI_TELEMETRY_OPTOUT: "1",
  });
}

function runNpmLogged(label, args, redactions = [], environment = {}) {
  return runLogged(
    label,
    process.execPath,
    [npmCliPath(), ...args],
    redactions,
    environment
  );
}

function runNpxLogged(label, args, redactions = [], environment = {}) {
  return runLogged(
    label,
    process.execPath,
    [npxCliPath(), ...args],
    redactions,
    environment
  );
}

function npmCliPath() {
  return resolveApprovedNpmSurface().npmCli;
}

function npxCliPath() {
  return resolveApprovedNpmSurface().npxCli;
}

function runLogged(label, command, args, redactions = [], environment = {}) {
  const startedAt = new Date();
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env: { ...process.env, ...environment },
    encoding: "utf8",
    shell: false,
    windowsHide: true,
    maxBuffer: GOVERNED_COMMAND_MAX_BUFFER_BYTES,
  });
  const completedAt = new Date();
  const record = {
    schemaVersion: "1.0.0",
    contract: "oracle.sprint-30-5.stage-2-requalification-r8-command",
    ...identity(),
    label,
    command,
    arguments: args.map((value) => redact(value, redactions)),
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.valueOf() - startedAt.valueOf(),
    exitCode: result.status,
    signal: result.signal,
    stdout: redact(result.stdout ?? "", redactions),
    stderr: redact(result.stderr ?? "", redactions),
    spawnError: result.error?.message ?? null,
  };
  writeJsonAtomicCreateOnly(
    join(directories.logs, `${String(readdirSync(directories.logs).length + 1).padStart(3, "0")}-${label}.json`),
    record
  );
  if (result.error) {
    throw new Error(
      `${command} failed during ${label} with process error: ${result.error.message}.`
    );
  }
  if (result.status !== 0) {
    throw new Error(
      `${command} failed during ${label} with exit code ${result.status}.`
    );
  }
  return record;
}

function redact(value, redactions) {
  return redactions.reduce(
    (result, secret) =>
      secret ? String(result).replaceAll(secret, "<redacted>") : String(result),
    String(value)
  );
}

function runReadOnlyVersion(command, args) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Required tool is unavailable: ${command}`);
  }
  return (result.stdout ?? "").trim();
}

function parseArguments(args) {
  if (args.length === 0 || args.length % 2 !== 0) {
    throw new Error("Arguments must be supplied as --name value pairs.");
  }
  const result = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key.startsWith("--") || value.startsWith("--")) {
      throw new Error(`Invalid argument pair at position ${index + 1}.`);
    }
    const name = key.slice(2);
    if (result.has(name)) throw new Error(`Duplicate argument: --${name}`);
    result.set(name, value);
  }
  return result;
}
