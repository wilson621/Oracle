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
import { basename, dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { packager } from "@electron/packager";
import {
  approvedExecutable,
  assertCleanMachineQualificationState,
  assertNoReparseTraversal,
  assertOutsideHistoricalRoots,
  assertRepositoryPreflight,
  contract,
  createAttemptDirectory,
  createAttemptRecord,
  git,
  harnessFileInventory,
  readMachineQualificationState,
  repositoryRoot,
  resolveApprovedNpmSurface,
  validateGovernedWrapperInvocation,
  sha256File,
  validateFinalIdentity,
} from "./harness-core.mjs";
import {
  assertFounderExecutionAuthority,
  claimSingleAttemptAuthority,
  createAttemptDirectories,
  createLifecycle,
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
const ARCHIVE_FILE = contract.output.archiveFileName;
const SEMANTIC_VERSION = contract.package.semanticVersion;
const RUNTIME_MANIFEST_VERSION = contract.package.runtimeManifestVersion;
const RELEASE_ID = contract.package.releaseId;
const PUBLISHER = contract.package.publisherSubjectPrefix;
const HISTORICAL_STAGE2_ARCHIVE_SHA256 =
  "8c20f6da7f0262ed4ef9a3a59c6a027ba3d64cb66c4e646b1f5d075da369f876";
const GOVERNED_COMMAND_MAX_BUFFER_BYTES = 16 * 1024 * 1024;
const PERMANENT_LIMITATION =
  "Local test signing proves packaging and distribution mechanics only. It does not establish production trust, publication, distribution, deployment or release authority.";
const wrapperInvocation = assertGovernedWrapperInvocation();

const values = parseArguments(process.argv.slice(2));
assertFounderExecutionAuthority(values.get("founder-authority"));
const required = [
  "founder-authority",
  "authority-id",
  "attempt-id",
  "timestamp-utc",
  "candidate-commit",
  "harness-commit",
  "machine-identity",
  "package-identity",
  "package-version",
  "output-root",
];
for (const name of required) {
  if (!values.has(name)) throw new Error(`Missing mandatory argument: --${name}`);
}
if (values.size !== required.length) {
  throw new Error(
    `Unexpected argument(s): ${[...values.keys()]
      .filter((name) => !required.includes(name))
      .join(", ")}`
  );
}

const input = {
  authorityId: values.get("authority-id"),
  attemptId: values.get("attempt-id"),
  timestampUtc: values.get("timestamp-utc"),
  candidateCommit: values.get("candidate-commit"),
  harnessCommit: values.get("harness-commit"),
  machineIdentity: values.get("machine-identity"),
  packageIdentity: values.get("package-identity"),
  packageVersion: values.get("package-version"),
  outputRoot: resolve(repositoryRoot, values.get("output-root")),
  wrapperProtocol: wrapperInvocation.protocol,
  wrapperProcessId: wrapperInvocation.parentProcessId,
};

let attemptRoot = null;
let lifecycle = null;
let directories = null;
let exactThumbprint = null;
let certificateSubject;
let certificateNotAfter;
let password = null;
let pfxPath = null;
let generatedCerPath = null;
let verificationCerPath = null;
let certificateStoreBaseline = [];
let certificateStoreBaselineCaptured = false;
let teardownAttempted = false;
let teardownPassed = false;
let signingMaterialDestructionAttempted = false;
let currentCommand = null;
let lifecycleFailureRecord = null;

try {
  assertExecutionContract();
  assertRepositoryPreflight(input);
  assertHistoricalEvidence();

  assertNoAmbientRuntimeConfiguration(repositoryRoot);

  const authorityClaimPath = claimSingleAttemptAuthority({
    authority: values.get("founder-authority"),
    ...input,
  });
  const record = createAttemptRecord(input);
  attemptRoot = createAttemptDirectory(record);
  directories = createAttemptDirectories(attemptRoot, [
    "logs",
    "work",
    "release",
    "evidence",
    "signing",
    "verification",
  ]);
  writeFileAtomicCreateOnly(
    join(directories.evidence, "single-attempt-authority.json"),
    readFileSync(authorityClaimPath)
  );
  lifecycle = createLifecycle(attemptRoot, identity());
  lifecycle.transition("attempt-prepared", {
    authorityClaimSha256: sha256File(authorityClaimPath),
    qualificationExecuted: false,
  });

  const candidate = createQualificationCandidate();
  writeJsonAtomicCreateOnly(
    join(directories.evidence, "qualification-candidate.json"),
    candidate
  );
  lifecycle.transition("candidate-frozen", {
    candidateCommit: candidate.sourceCommit,
    candidateTree: candidate.sourceTree,
    productSourceSha256: candidate.productSourceSha256,
  });

  runSourceBaseline();
  lifecycle.transition("source-baseline-passed", {
    runtimeManifestVersion: RUNTIME_MANIFEST_VERSION,
  });

  assertRepositoryAndCandidateUnchanged(candidate);
  lifecycle.transition("inputs-reverified", {
    repositoryClean: true,
    productSourceSha256: candidate.productSourceSha256,
  });

  const layout = await constructPackageLayout();
  lifecycle.transition("package-layout-constructed", {
    layout: relative(repositoryRoot, layout).replaceAll("\\", "/"),
  });

  ({ exactThumbprint, certificateSubject, certificateNotAfter, pfxPath,
    generatedCerPath, password } = createTemporaryCertificate(layout));
  lifecycle.transition("certificate-bound", {
    exactThumbprint,
    subject: certificateSubject,
    notAfter: certificateNotAfter,
    requestedLifetimeDays: contract.certificate.requestedLifetimeDays,
    minimumRemainingLifetimeDaysAtCreation:
      contract.certificate.minimumRemainingLifetimeDaysAtCreation,
    maximumLifetimeDays: contract.certificate.maximumLifetimeDays,
  });

  const release = buildSignedRelease(layout, candidate);
  lifecycle.transition("package-and-manifests-signed", {
    package: PACKAGE_FILE,
    packageSha256: sha256File(release.packagePath),
    exactThumbprint,
  });

  verificationCerPath = join(
    directories.release,
    ".r4-verification-temporary.cer"
  );
  const verification = verifyRelease(release, candidate);
  lifecycle.transition("mechanical-verification-passed", {
    packageEntries: verification.packageContentEntries,
    exactThumbprint,
  });
  performSafetyTeardown();
  verification.trustRemoved = true;
  verification.privateSigningMaterialDestroyed = true;
  writeJsonAtomicCreateOnly(
    join(directories.release, "signature-and-trust-verification.json"),
    verification
  );
  assertExpectedReleaseFiles();
  lifecycle.transition("safety-teardown-passed", {
    exactThumbprint,
    certificateStoreMatches: 0,
    signingMaterialRemaining: 0,
  });

  const certification = createCertification(release, candidate, verification);
  writeJsonAtomicCreateOnly(
    join(directories.evidence, "stage-2-requalification-r4-certification.json"),
    certification
  );
  const evidenceIndex = createEvidenceIndex();
  writeJsonAtomicCreateOnly(
    join(directories.evidence, "stage-2-requalification-r4-evidence-index.json"),
    evidenceIndex
  );
  lifecycle.transition("evidence-inventoried", {
    files: evidenceIndex.files.length,
  });

  const archive = freezeEvidence(release, certification, evidenceIndex);
  lifecycle.transition("evidence-frozen", {
    archive: basename(archive.path),
    sha256: archive.sha256,
    size: archive.size,
  });

  createFinalMachineCheckpoint();
  writeJsonAtomicCreateOnly(
    join(
      directories.evidence,
      "stage-2-requalification-r4-completion.json"
    ),
    {
      schemaVersion: "1.0.0",
      contract:
        "oracle.sprint-30-5.stage-2-requalification-r4-execution-completion",
      ...identity(),
      completedAt: new Date().toISOString(),
      status: "execution-passed-awaiting-founder-review",
      archive: {
        filename: archive.filename,
        size: archive.size,
        sha256: archive.sha256,
      },
      exactCertificateThumbprint: exactThumbprint,
      certificateTeardownPassed: true,
      repositoryEvidencePublicationPending: true,
      founderAcceptance: false,
      stage2Closed: false,
      stage3Authorised: false,
      productionAuthority: false,
    }
  );
  const repositoryEvidenceTarget = publishRepositoryEvidence();
  createFinalRepositoryCheckpoint(repositoryEvidenceTarget);
  const finalManifest = createFinalEvidenceManifest(archive);
  const finalManifestPath = join(
    directories.evidence,
    "Oracle.Stage2RequalificationR4EvidenceManifest.json"
  );
  writeJsonAtomicCreateOnly(finalManifestPath, finalManifest);
  const finalEvidenceHash = sha256File(finalManifestPath);
  writeFileAtomicCreateOnly(
    join(directories.evidence, "Oracle.Stage2RequalificationR4FinalEvidenceHash.sha256.txt"),
    `${finalEvidenceHash} *${basename(finalManifestPath)}\n`
  );
  validateFinalIdentity({
    certificate: {
      state: "generated-for-this-attempt",
      thumbprint: exactThumbprint,
    },
    evidence: {
      manifest: basename(finalManifestPath),
      finalEvidenceHash,
    },
  });

  publishFinalRepositoryEvidence(repositoryEvidenceTarget);
  assertFinalRepositoryState();
  lifecycle.transition("complete-awaiting-founder-review", {
    finalEvidenceManifest: basename(finalManifestPath),
    finalEvidenceHash,
    stage3Authorised: false,
  });

  console.log(
    JSON.stringify(
      {
        result: "EXECUTION PASS",
        programmeIdentity: contract.programmeIdentity,
        authorityId: input.authorityId,
        attemptId: input.attemptId,
        candidateCommit: input.candidateCommit,
        harnessCommit: input.harnessCommit,
        exactThumbprint,
        archive,
        finalEvidenceHash,
        stage3Executed: false,
      },
      null,
      2
    )
  );
} catch (error) {
  let teardownError = null;
  if (!exactThumbprint && pfxPath && password && existsSync(pfxPath)) {
    try {
      recoverCertificateIdentity();
    } catch (identityError) {
      process.stderr.write(
        `Generated certificate identity recovery failed: ${identityError.message}\n`
      );
    }
  }
  if (!exactThumbprint && certificateStoreBaselineCaptured) {
    try {
      recoverCertificateIdentityFromStoreDelta();
    } catch (identityError) {
      process.stderr.write(
        `Certificate-store delta recovery failed: ${identityError.message}\n`
      );
    }
  }
  if (exactThumbprint && !teardownAttempted) {
    try {
      performSafetyTeardown();
    } catch (caught) {
      teardownError = caught;
    }
  }
  if (!exactThumbprint && !signingMaterialDestructionAttempted) {
    try {
      destroySigningMaterial();
    } catch (caught) {
      teardownError ??= caught;
    }
  }
  if (lifecycle && !lifecycle.isTerminal) {
    try {
      lifecycleFailureRecord = lifecycle.fail(error, {
        command: currentCommand,
        exactThumbprint,
        teardownAttempted,
        teardownPassed,
        teardownError:
          teardownError instanceof Error ? teardownError.message : null,
      });
    } catch (lifecycleError) {
      process.stderr.write(
        `Lifecycle failure publication also failed: ${lifecycleError.message}\n`
      );
    }
  }
  if (attemptRoot && directories) {
    try {
      publishFailureOutcome(error, lifecycleFailureRecord, teardownError);
    } catch (outcomeError) {
      process.stderr.write(
        `Failure outcome publication also failed: ${outcomeError.message}\n`
      );
    }
  }
  if (teardownError) {
    process.stderr.write(`Safety teardown failed: ${teardownError.message}\n`);
  }
  throw error;
} finally {
  password = null;
}

function assertGovernedWrapperInvocation() {
  const environmentName = "ORACLE_STAGE2_R4_GOVERNED_WRAPPER";
  const observed = process.env[environmentName];
  delete process.env[environmentName];
  return validateGovernedWrapperInvocation({
    observed,
    parentProcessId: process.ppid,
  });
}

function publishFailureOutcome(error, failureRecord, teardownError) {
  const attemptRecordPath = join(
    attemptRoot,
    "Oracle.Stage2RequalificationR4Attempt.json"
  );
  const authorityEvidencePath = join(
    directories.evidence,
    "single-attempt-authority.json"
  );
  const failureRecordPath = join(attemptRoot, "lifecycle", "999-failed.json");
  let machineState = null;
  let residueCheckError = null;
  try {
    machineState = readMachineQualificationState();
  } catch (caught) {
    residueCheckError = caught instanceof Error ? caught.message : String(caught);
  }
  const privateMaterial = findFiles(attemptRoot).filter((path) =>
    /(?:password|\.(?:cer|key|pem|pfx|p12)$)/iu.test(path)
  );
  const repositoryStatus = git([
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ]);
  const packagesRemaining = machineState?.packages ?? null;
  const certificatesRemaining = Array.isArray(machineState?.certificates)
    ? machineState.certificates
    : null;
  const residueShapeValid =
    Number.isInteger(packagesRemaining) &&
    packagesRemaining >= 0 &&
    certificatesRemaining !== null;
  if (residueCheckError === null && !residueShapeValid) {
    residueCheckError = "Machine residue verification returned an invalid shape.";
  }
  const residuePassed =
    residueCheckError === null &&
    packagesRemaining === 0 &&
    certificatesRemaining?.length === 0 &&
    privateMaterial.length === 0;
  writeJsonAtomicCreateOnly(
    join(directories.evidence, "stage-2-requalification-r4-failure-outcome.json"),
    {
      schemaVersion: "1.0.0",
      contract:
        "oracle.sprint-30-5.stage-2-requalification-r4-failure-outcome",
      ...identity(),
      recordedAt: new Date().toISOString(),
      status: "failed",
      failedPhase: failureRecord?.phase ?? lifecycle?.currentPhase ?? "unknown",
      stopReason: error instanceof Error ? error.message : String(error),
      command: currentCommand,
      authorityConsumed: true,
      attemptCreationRecordSha256: existsSync(attemptRecordPath)
        ? sha256File(attemptRecordPath)
        : null,
      authorityRecordSha256: existsSync(authorityEvidencePath)
        ? sha256File(authorityEvidencePath)
        : null,
      lifecycleFailureRecordSha256:
        failureRecord && existsSync(failureRecordPath)
          ? sha256File(failureRecordPath)
          : null,
      certificate: {
        exactThumbprint,
        created: exactThumbprint !== null,
      },
      teardown: {
        required: exactThumbprint !== null,
        attempted: teardownAttempted,
        passed: teardownPassed,
        error: teardownError instanceof Error ? teardownError.message : null,
        signingMaterialDestructionAttempted,
      },
      residue: {
        verification: residueCheckError === null ? "completed" : "failed",
        verificationError: residueCheckError,
        packagesRemaining,
        certificatesRemaining,
        privateMaterial,
        passed: residuePassed,
      },
      repository: {
        status: repositoryStatus === "" ? [] : repositoryStatus.split(/\r?\n/u),
        indexClean: git(["diff", "--cached", "--name-only"]) === "",
      },
      residualStateRequiresFounderAction: !residuePassed,
    }
  );
}

function assertExecutionContract() {
  assert.equal(contract.programmeIdentity, "Sprint 30.5 Stage 2 Requalification R4");
  assert.equal(contract.revision, "R4");
  assert.equal(contract.package.identity, "Oracle.Platform.LocalCertification");
  assert.equal(contract.package.version, "0.1.2.0");
  assert.equal(contract.package.architecture, "x64");
  assert.equal(contract.package.semanticVersion, "0.1.2");
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
    "Migration 011 does not match the fixed R4 candidate binding."
  );
  assert.equal(
    sha256File(join(repositoryRoot, "database", "012_operator_identity_lifecycle.sql")),
    contract.candidate.migration012Sha256,
    "Migration 012 does not match the fixed R4 candidate binding."
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
      "oracle.sprint-30-5.stage-2-requalification-r4-qualification-candidate",
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
    join(directories.evidence, "runtime-configuration-build-secrecy.json"),
    {
      schemaVersion: "1.0.0",
      contract: "oracle.sprint-30-5.stage-2-requalification-r4-build-secrecy",
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
    throw new Error("Branch changed during R4 execution.");
  }
  if (git(["rev-parse", "HEAD"]) !== input.harnessCommit) {
    throw new Error("HEAD changed during R4 execution.");
  }
  if (git(["status", "--porcelain=v1", "--untracked-files=all"]) !== "") {
    throw new Error("Repository changed during R4 build.");
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
    name: "oracle-stage-2-requalification-r4-local-qualification",
    productName: "Oracle Stage 2 Requalification R4 Local Qualification",
    version: SEMANTIC_VERSION,
    private: true,
    main: "dist-electron/desktop/main.js",
  });
  currentCommand = "@electron/packager";
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
  pfxPath = join(directories.signing, "r4-local-test-signing.pfx");
  password = randomBytes(32).toString("base64url");
  certificateStoreBaseline = readCertificateStoreSnapshot(
    "certificate-store-before-generation"
  );
  certificateStoreBaselineCaptured = true;
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
    "$cert=[Security.Cryptography.X509Certificates.X509Certificate2]::new($env:ORACLE_R4_PFX,$env:ORACLE_R4_PASSWORD,$flags)",
    "try {[ordered]@{thumbprint=$cert.Thumbprint;subject=$cert.Subject;notAfter=$cert.NotAfter.ToUniversalTime().ToString('o')}|ConvertTo-Json -Compress} finally {$cert.Dispose()}",
  ].join(";");
  const result = JSON.parse(
    runLogged(
      "certificate-identity",
      approvedExecutable("powershell"),
      ["-NoProfile", "-NonInteractive", "-Command", script],
      [],
      { ORACLE_R4_PFX: pfxPath, ORACLE_R4_PASSWORD: password }
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

function recoverCertificateIdentityFromStoreDelta() {
  const after = readCertificateStoreSnapshot(
    "certificate-store-after-generation-failure"
  );
  const existing = new Set(
    certificateStoreBaseline.map(
      (record) => `${record.location}/${record.store}/${record.thumbprint}`
    )
  );
  const added = after.filter(
    (record) =>
      !existing.has(`${record.location}/${record.store}/${record.thumbprint}`)
  );
  const thumbprints = [...new Set(added.map((record) => record.thumbprint))];
  if (thumbprints.length !== 1) {
    throw new Error(
      `Certificate generation produced ${thumbprints.length} unambiguous new thumbprints.`
    );
  }
  if (
    !/^[0-9A-F]{40}$/u.test(thumbprints[0]) ||
    added.some((record) => record.subject !== PUBLISHER)
  ) {
    throw new Error("New certificate-store entries do not match the R4 identity.");
  }
  exactThumbprint = thumbprints[0];
  certificateSubject = PUBLISHER;
}

function recoverCertificateIdentity() {
  const script = [
    "$ErrorActionPreference='Stop'",
    "$flags=[Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet",
    "$cert=[Security.Cryptography.X509Certificates.X509Certificate2]::new($env:ORACLE_R4_PFX,$env:ORACLE_R4_PASSWORD,$flags)",
    "try {[ordered]@{thumbprint=$cert.Thumbprint;subject=$cert.Subject;notAfter=$cert.NotAfter.ToUniversalTime().ToString('o')}|ConvertTo-Json -Compress} finally {$cert.Dispose()}",
  ].join(";");
  const result = spawnSync(
    approvedExecutable("powershell"),
    ["-NoProfile", "-NonInteractive", "-Command", script],
    {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        ORACLE_R4_PFX: pfxPath,
        ORACLE_R4_PASSWORD: password,
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
  const sbomPath = join(directories.release, "oracle-0.1.2.cdx.json");
  writeJsonAtomicCreateOnly(sbomPath, createSbom());
  const provenancePath = join(
    directories.release,
    "oracle-0.1.2.provenance.json"
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
      contract: "oracle.sprint-30-5.stage-2-requalification-r4-release-build",
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
  assert.match(manifestXml, /Version="0\.1\.2\.0"/u);
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
        "oracle.sprint-30-5.stage-2-requalification-r4-package-content-inventory",
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
          "oracle.sprint-30-5.stage-2-requalification-r4-certificate-cleanup",
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
  const residue = findFiles(attemptRoot).filter((path) =>
    /\.(cer|key|pem|pfx|p12)$/iu.test(path)
  );
  if (residue.length !== 0) {
    throw new Error(`Signing material remains: ${residue.join(", ")}`);
  }
  teardownPassed = true;
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

function createCertification(release, candidate, verification) {
  return {
    schemaVersion: "1.0.0",
    contract: "oracle.sprint-30-5.stage-2-requalification-r4-certification",
    ...identity(),
    verifiedAt: new Date().toISOString(),
    status: "execution-passed-awaiting-founder-review",
    sourceCommit: candidate.sourceCommit,
    sourceTree: candidate.sourceTree,
    runtimeManifest: candidate.runtimeManifest,
    package: {
      filename: PACKAGE_FILE,
      packageVersion: contract.package.version,
      sha256: sha256File(release.packagePath),
      size: statSync(release.packagePath).size,
      contentEntries: verification.packageContentEntries,
      installed: false,
    },
    releaseManifest: {
      sha256: sha256File(release.releaseManifestPath),
      exactThumbprint,
      detachedSignature: "verified",
    },
    sbom: "cyclonedx-1.6-verified",
    provenance: "slsa-shaped-verified",
    teardown: {
      exactThumbprint,
      certificateStoreMatches: 0,
      trustRemoved: true,
      privateSigningMaterialDestroyed: true,
    },
    authority: {
      founderAcceptance: false,
      stage2Closed: false,
      stage3: false,
      production: false,
    },
  };
}

function createEvidenceIndex() {
  const files = [
    ...inventory(directories.release).map((entry) => ({
      ...entry,
      path: `release/${entry.path}`,
    })),
    ...inventory(directories.evidence).map((entry) => ({
      ...entry,
      path: `evidence/${entry.path}`,
    })),
    ...inventory(directories.logs).map((entry) => ({
      ...entry,
      path: `logs/${entry.path}`,
    })),
    ...inventory(join(attemptRoot, "lifecycle")).map((entry) => ({
      ...entry,
      path: `lifecycle/${entry.path}`,
    })),
  ].sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0
  );
  return {
    schemaVersion: "1.0.0",
    contract: "oracle.sprint-30-5.stage-2-requalification-r4-evidence-index",
    ...identity(),
    createdAt: new Date().toISOString(),
    status: "complete-awaiting-freeze",
    files: files.filter(
      (entry) => !entry.path.endsWith("stage-2-requalification-r4-evidence-index.json")
    ),
  };
}

function freezeEvidence(release, certification, evidenceIndex) {
  const temporaryArchive = join(
    attemptRoot,
    `.${ARCHIVE_FILE}.tmp-${process.pid}-${Date.now()}`
  );
  const archivePath = join(attemptRoot, ARCHIVE_FILE);
  runLogged("evidence-archive", approvedExecutable("bsdtar"), [
    "-a",
    "-c",
    "-f",
    temporaryArchive,
    "-C",
    attemptRoot,
    "release",
    "evidence",
    "lifecycle",
    "logs",
  ]);
  publishExistingFileCreateOnly(temporaryArchive, archivePath);
  const archive = {
    path: archivePath,
    filename: ARCHIVE_FILE,
    sha256: sha256File(archivePath),
    size: statSync(archivePath).size,
  };
  writeFileAtomicCreateOnly(
    `${archivePath}.sha256.txt`,
    `${archive.sha256} *${ARCHIVE_FILE}\n`
  );
  const sidecarHash = readFileSync(`${archivePath}.sha256.txt`, "utf8")
    .trim()
    .split(/\s+/u)[0];
  if (sidecarHash !== archive.sha256) {
    throw new Error("Evidence archive sidecar verification failed.");
  }
  writeJsonAtomicCreateOnly(
    join(directories.evidence, "stage-2-requalification-r4-frozen-evidence.json"),
    {
      schemaVersion: "1.0.0",
      contract: "oracle.sprint-30-5.stage-2-requalification-r4-frozen-evidence",
      ...identity(),
      frozenAt: new Date().toISOString(),
      status: "complete-awaiting-founder-review",
      archive: {
        filename: ARCHIVE_FILE,
        sha256: archive.sha256,
        size: archive.size,
        storage: "workspace-local-ignored-attempt-artifact",
      },
      releaseManifestSha256: certification.releaseManifest.sha256,
      packageSha256: certification.package.sha256,
      indexedFiles: evidenceIndex.files.length,
      privateSigningMaterialDestroyed: true,
      certificateTrustRemoved: true,
      stage3Started: false,
    }
  );
  return archive;
}

function createFinalEvidenceManifest(archive) {
  return {
    schemaVersion: "1.0.0",
    contract: "oracle.sprint-30-5.stage-2-requalification-r4-final-evidence",
    ...identity(),
    createdAt: new Date().toISOString(),
    status: "execution-passed-awaiting-founder-review",
    archive: {
      filename: archive.filename,
      size: archive.size,
      sha256: archive.sha256,
      sidecar: `${archive.filename}.sha256.txt`,
    },
    evidenceFiles: inventory(directories.evidence),
    releaseFiles: inventory(directories.release),
    lifecycleFiles: inventory(join(attemptRoot, "lifecycle")),
    historicalStage2ArchiveSha256: HISTORICAL_STAGE2_ARCHIVE_SHA256,
    exactCertificateThumbprint: exactThumbprint,
    teardownPassed,
    repositoryCommit: input.harnessCommit,
    repositoryTree: git(["rev-parse", "HEAD^{tree}"]),
    stage3Executed: false,
    productionAuthority: false,
  };
}

function publishRepositoryEvidence() {
  const base = assertOutsideHistoricalRoots(
    join(
      repositoryRoot,
      contract.output.repositoryEvidenceBase
    )
  );
  const target = join(base, input.attemptId);
  assertNoReparseTraversal(dirname(base));
  if (existsSync(base)) {
    assertNoReparseTraversal(base);
  } else {
    mkdirSync(base, { recursive: false });
  }
  if (existsSync(target)) {
    throw new Error("Repository evidence attempt namespace already exists.");
  }
  mkdirSync(target, { recursive: false });
  assertNoReparseTraversal(target);
  for (const name of [
    "qualification-candidate.json",
    "single-attempt-authority.json",
    "stage-2-requalification-r4-certification.json",
    "stage-2-requalification-r4-evidence-index.json",
    "stage-2-requalification-r4-frozen-evidence.json",
    "stage-2-requalification-r4-completion.json",
    "final-machine-checkpoint.json",
  ]) {
    const source = join(directories.evidence, name);
    const destination = join(target, name);
    writeFileAtomicCreateOnly(destination, readFileSync(source));
  }
  writeFileAtomicCreateOnly(
    join(target, `${ARCHIVE_FILE}.sha256.txt`),
    readFileSync(join(attemptRoot, `${ARCHIVE_FILE}.sha256.txt`))
  );
  return target;
}

function publishFinalRepositoryEvidence(target) {
  for (const name of [
    "final-repository-checkpoint.json",
    "Oracle.Stage2RequalificationR4EvidenceManifest.json",
    "Oracle.Stage2RequalificationR4FinalEvidenceHash.sha256.txt",
  ]) {
    writeFileAtomicCreateOnly(
      join(target, name),
      readFileSync(join(directories.evidence, name))
    );
  }
}

function createFinalMachineCheckpoint() {
  assertCleanMachineQualificationState();
  assertHistoricalEvidence();
  const status = git([
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ]);
  if (status !== "") {
    throw new Error("Repository changed before evidence publication.");
  }
  if (git(["diff", "--cached", "--name-only"]) !== "") {
    throw new Error("The repository index changed during R4 execution.");
  }
  const machineCheckpoint = {
    schemaVersion: "1.0.0",
    contract:
      "oracle.sprint-30-5.stage-2-requalification-r4-machine-checkpoint",
    ...identity(),
    recordedAt: new Date().toISOString(),
    machineIdentity: os.hostname(),
    platform: process.platform,
    architecture: process.arch,
    osRelease: os.release(),
    governedPackageInstalled: false,
    exactCertificateMatches: 0,
    temporaryTrustRemaining: false,
    privateSigningMaterialRemaining: false,
  };
  writeJsonAtomicCreateOnly(
    join(directories.evidence, "final-machine-checkpoint.json"),
    machineCheckpoint
  );
}

function createFinalRepositoryCheckpoint(repositoryEvidenceTarget) {
  const repositoryEvidenceRelative = relative(
    repositoryRoot,
    repositoryEvidenceTarget
  ).replaceAll("\\", "/");
  const status = git([
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ]);
  const statusLines = status === "" ? [] : status.split(/\r?\n/u);
  const unexpected = statusLines.filter(
    (line) => !line.startsWith(`?? ${repositoryEvidenceRelative}/`)
  );
  if (unexpected.length !== 0 || statusLines.length === 0) {
    throw new Error(
      `Unexpected repository state after bounded evidence publication: ${unexpected.join(", ")}`
    );
  }
  if (git(["diff", "--cached", "--name-only"]) !== "") {
    throw new Error("The repository index changed during R4 execution.");
  }
  writeJsonAtomicCreateOnly(
    join(directories.evidence, "final-repository-checkpoint.json"),
    {
      schemaVersion: "1.0.0",
      contract:
        "oracle.sprint-30-5.stage-2-requalification-r4-repository-checkpoint",
      ...identity(),
      recordedAt: new Date().toISOString(),
      branch: git(["branch", "--show-current"]),
      head: git(["rev-parse", "HEAD"]),
      tree: git(["rev-parse", "HEAD^{tree}"]),
      trackedFilesModified: false,
      indexClean: true,
      repositoryVisibleEvidenceOnly: true,
      repositoryEvidencePublicationPending: false,
      repositoryEvidenceNamespace: repositoryEvidenceRelative,
      publishedFiles: inventory(repositoryEvidenceTarget),
    }
  );
}

function assertFinalRepositoryState() {
  const repositoryEvidenceRelative = relative(
    repositoryRoot,
    join(repositoryRoot, contract.output.repositoryEvidenceBase, input.attemptId)
  ).replaceAll("\\", "/");
  const status = git([
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ]);
  const statusLines = status === "" ? [] : status.split(/\r?\n/u);
  const unexpected = statusLines.filter(
    (line) => !line.startsWith(`?? ${repositoryEvidenceRelative}/`)
  );
  if (unexpected.length !== 0 || statusLines.length === 0) {
    throw new Error(
      `Unexpected final repository state: ${unexpected.join(", ")}`
    );
  }
  if (git(["diff", "--cached", "--name-only"]) !== "") {
    throw new Error("The repository index changed during R4 execution.");
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
        name: "Oracle Stage 2 Requalification R4 Local Qualification",
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
    "oracle-0.1.2.cdx.json",
    "oracle-0.1.2.provenance.json",
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
          id: "oracle.local/sprint-30-5-stage-2-requalification-r4",
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
  currentCommand = `${command} ${args.map((value) => redact(value, redactions)).join(" ")}`;
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
    contract: "oracle.sprint-30-5.stage-2-requalification-r4-command",
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
