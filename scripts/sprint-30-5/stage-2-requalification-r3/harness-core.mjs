import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

export const repositoryRoot = resolve(import.meta.dirname, "..", "..", "..");
export const contractPath = join(
  import.meta.dirname,
  "Oracle.Stage2RequalificationR3Contract.json"
);
export const contract = Object.freeze(
  JSON.parse(readFileSync(contractPath, "utf8").replace(/^\uFEFF/u, ""))
);

const commitPattern = /^[0-9a-f]{40}$/u;
const thumbprintPattern = /^[0-9A-F]{40}$/u;
const attemptPattern = /^r3-(\d{8}T\d{9}Z)-([0-9a-f]{8})$/u;
const packageVersionPattern = /^\d+\.\d+\.\d+\.\d+$/u;

export function canonicalPath(path) {
  return resolve(repositoryRoot, path);
}

export function isSameOrDescendant(path, root) {
  const candidate = resolve(path);
  const boundary = resolve(root);
  const relation = relative(boundary, candidate);
  return (
    relation === "" ||
    (!relation.startsWith(`..${sep}`) && relation !== ".." && !isAbsolute(relation))
  );
}

export function assertOutsideHistoricalRoots(path) {
  const resolved = resolve(path);
  for (const protectedRoot of contract.historicalProtectedRoots) {
    const historical = canonicalPath(protectedRoot);
    if (isSameOrDescendant(resolved, historical)) {
      throw new Error(
        `Refusing R3 output inside immutable historical root: ${protectedRoot}`
      );
    }
  }
  return resolved;
}

export function assertR3ArtifactPath(path, attemptId) {
  const resolved = assertOutsideHistoricalRoots(path);
  const base = canonicalPath(contract.output.artifactBase);
  const requiredAttemptRoot = join(base, attemptId);
  if (resolved !== requiredAttemptRoot) {
    throw new Error(
      `R3 output root must resolve exactly to ${relative(repositoryRoot, requiredAttemptRoot).replaceAll("\\", "/")}.`
    );
  }
  return resolved;
}

export function assertNoReparseTraversal(
  path,
  filesystem = { existsSync, lstatSync }
) {
  const resolved = resolve(path);
  if (!isSameOrDescendant(resolved, repositoryRoot)) {
    throw new Error("Governed R3 output must remain inside the repository.");
  }
  const segments = relative(repositoryRoot, resolved).split(sep).filter(Boolean);
  let current = repositoryRoot;
  for (const segment of segments) {
    current = join(current, segment);
    if (
      filesystem.existsSync(current) &&
      filesystem.lstatSync(current).isSymbolicLink()
    ) {
      throw new Error(`R3 output path traverses a symbolic link or junction: ${current}`);
    }
  }
}

export function validateAttemptIdentity({ attemptId, timestampUtc }) {
  if (typeof attemptId !== "string" || typeof timestampUtc !== "string") {
    throw new Error("Attempt ID and UTC timestamp are mandatory.");
  }
  const match = attemptPattern.exec(attemptId);
  if (!match) {
    throw new Error("Attempt ID must use r3-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx.");
  }
  const parsed = new Date(timestampUtc);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== timestampUtc) {
    throw new Error("UTC timestamp must be a canonical ISO-8601 UTC value.");
  }
  const compact = timestampUtc
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "");
  if (match[1] !== compact) {
    throw new Error("Attempt ID timestamp does not match timestampUtc.");
  }
}

export function validateBinding(binding) {
  for (const name of [
    "candidateCommit",
    "harnessCommit",
    "machineIdentity",
    "packageIdentity",
    "packageVersion",
  ]) {
    if (typeof binding[name] !== "string" || binding[name].trim() === "") {
      throw new Error(`${name} is mandatory.`);
    }
  }
  if (!commitPattern.test(binding.candidateCommit)) {
    throw new Error("candidateCommit must be a lowercase full Git SHA.");
  }
  if (!commitPattern.test(binding.harnessCommit)) {
    throw new Error("harnessCommit must be a lowercase full Git SHA.");
  }
  if (binding.candidateCommit !== contract.candidate.commit) {
    throw new Error(`R3 candidate commit mismatch: expected ${contract.candidate.commit}, received ${binding.candidateCommit}.`);
  }
  if (
    os.hostname().toUpperCase() !==
      contract.executionMachine.identity.toUpperCase() ||
    binding.machineIdentity.toUpperCase() !==
      contract.executionMachine.identity.toUpperCase()
  ) {
    throw new Error(
      `Machine identity mismatch: expected ${contract.executionMachine.identity}, received ${binding.machineIdentity}.`
    );
  }
  if (
    process.platform !== contract.executionMachine.operatingSystem ||
    os.release() !== contract.executionMachine.osRelease ||
    process.arch !== contract.executionMachine.architecture
  ) {
    throw new Error("Execution operating-system or architecture identity differs.");
  }
  if (binding.packageIdentity !== contract.package.identity) {
    throw new Error("Unexpected package identity.");
  }
  if (
    !packageVersionPattern.test(binding.packageVersion) ||
    binding.packageVersion !== contract.package.version
  ) {
    throw new Error("Unexpected package version.");
  }
}

export function validateRepositorySnapshot(snapshot, binding) {
  if (snapshot.branch !== contract.requiredBranch) {
    throw new Error(
      `Wrong branch: expected ${contract.requiredBranch}, found ${snapshot.branch}.`
    );
  }
  if (snapshot.head !== binding.harnessCommit) {
    throw new Error(
      `Unexpected HEAD: expected harness commit ${binding.harnessCommit}, found ${snapshot.head}.`
    );
  }
  if (snapshot.status !== "") {
    throw new Error("R3 requires a clean repository and index.");
  }
}

export function validateCertificateThumbprint(thumbprint) {
  if (!thumbprintPattern.test(thumbprint ?? "")) {
    throw new Error(
      "Certificate thumbprint must be the exact 40-character uppercase SHA-1 thumbprint."
    );
  }
  return thumbprint;
}

export function runReadOnly(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    shell: false,
    windowsHide: true,
    ...options,
  });
  if (result.error) {
    throw new Error(`${command} could not be started: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with exit code ${result.status}: ${(result.stderr ?? result.stdout ?? "").trim()}`
    );
  }
  return (result.stdout ?? "").trim();
}

export function git(args) {
  return runReadOnly("git", args);
}

export function assertRequiredTool(command, args = ["--version"]) {
  const executable =
    process.platform === "win32" && command.toLowerCase().endsWith(".cmd")
      ? process.env.ComSpec ?? "cmd.exe"
      : command;
  const executableArguments =
    executable === command
      ? args
      : ["/d", "/s", "/c", [command, ...args].join(" ")];
  const result = spawnSync(executable, executableArguments, {
    cwd: repositoryRoot,
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Required tool is unavailable: ${command}`);
  }
}

export function requiredToolVersion(command, args = ["--version"]) {
  const executable =
    process.platform === "win32" && command.toLowerCase().endsWith(".cmd")
      ? process.env.ComSpec ?? "cmd.exe"
      : command;
  const executableArguments =
    executable === command
      ? args
      : ["/d", "/s", "/c", [command, ...args].join(" ")];
  const result = spawnSync(executable, executableArguments, {
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

export function validateToolchainVersions(versions) {
  for (const [name, expected] of Object.entries(contract.toolchain)) {
    if (versions[name] !== expected) {
      throw new Error(
        `Toolchain identity mismatch for ${name}: expected ${expected}, found ${versions[name] ?? "missing"}.`
      );
    }
  }
}

export function assertRepositoryPreflight(binding) {
  validateBinding(binding);
  validateRepositorySnapshot(
    {
      branch: git(["branch", "--show-current"]),
      head: git(["rev-parse", "HEAD"]),
      status: git(["status", "--porcelain=v1", "--untracked-files=all"]),
    },
    binding
  );
  for (const commit of [
    contract.governanceActivationCommit,
    contract.qualifiedImplementationCommit,
    binding.candidateCommit,
    binding.harnessCommit,
  ]) {
    git(["cat-file", "-e", `${commit}^{commit}`]);
  }
  assertGitAncestor(
    contract.governanceActivationCommit,
    binding.candidateCommit,
    "governance-to-candidate"
  );
  assertGitAncestor(
    contract.governanceActivationCommit,
    binding.harnessCommit,
    "governance activation"
  );
  assertGitAncestor(
    contract.qualifiedImplementationCommit,
    binding.candidateCommit,
    "qualified implementation"
  );
  assertGitAncestor(
    binding.candidateCommit,
    binding.harnessCommit,
    "candidate-to-harness"
  );
  const candidateTree = git(["rev-parse", `${binding.candidateCommit}^{tree}`]);
  if (candidateTree !== contract.candidate.tree) {
    throw new Error(`R3 candidate tree mismatch: expected ${contract.candidate.tree}, found ${candidateTree}.`);
  }
  const productDifference = spawnSync(
    "git",
    [
      "diff",
      "--quiet",
      binding.candidateCommit,
      binding.harnessCommit,
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
    ],
    { cwd: repositoryRoot, shell: false, windowsHide: true }
  );
  if (productDifference.status !== 0) {
    throw new Error(
      "Candidate and harness commits do not bind the same governed product and packaging inputs."
    );
  }
  const versions = {
    git: requiredToolVersion("git", ["--version"]).replace(/^git version /u, ""),
    node: requiredToolVersion("node", ["--version"]).replace(/^v/u, ""),
    npm: requiredToolVersion("npm.cmd", ["--version"]),
    powershell: requiredToolVersion("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "$PSVersionTable.PSVersion.ToString()",
    ]),
    dotnet: requiredToolVersion("dotnet", ["--version"]),
    bsdtar:
      /^bsdtar\s+(\S+)/u.exec(requiredToolVersion("tar.exe", ["--version"]))?.[1],
  };
  for (const requiredPath of [
    contractPath,
    join(repositoryRoot, "package.json"),
    join(repositoryRoot, "package-lock.json"),
    join(repositoryRoot, "node_modules", "@microsoft", "winappcli"),
    join(repositoryRoot, "node_modules", "electron"),
    join(repositoryRoot, "node_modules", "next"),
    join(repositoryRoot, "packaging", "windows", "Package.appxmanifest.template"),
    join(repositoryRoot, "scripts", "build-sprint-30-5-stage-2-release.mjs"),
    join(repositoryRoot, "scripts", "verify-sprint-30-5-stage-2.mjs"),
    join(
      repositoryRoot,
      "desktop-native",
      "Oracle.WindowDiscovery",
      "Oracle.WindowDiscovery.csproj"
    ),
    join(
      repositoryRoot,
      "desktop-native",
      "Oracle.WindowObserver",
      "Oracle.WindowObserver.csproj"
    ),
  ]) {
    if (!existsSync(requiredPath)) {
      throw new Error(`Required prerequisite is missing: ${requiredPath}`);
    }
  }
  const packageJson = JSON.parse(
    readFileSync(join(repositoryRoot, "package.json"), "utf8")
  );
  const installedVersion = (name) =>
    JSON.parse(
      readFileSync(join(repositoryRoot, "node_modules", name, "package.json"), "utf8")
    ).version;
  Object.assign(versions, {
    electron: installedVersion("electron"),
    electronPackager: installedVersion("@electron/packager"),
    winAppCli: installedVersion("@microsoft/winappcli"),
    next: installedVersion("next"),
    esbuild: installedVersion("esbuild"),
    typescript: installedVersion("typescript"),
  });
  validateToolchainVersions(versions);
  if (
    packageJson.devDependencies?.electron !== "39.8.10" ||
    packageJson.devDependencies?.["@microsoft/winappcli"] !== "0.5.0"
  ) {
    throw new Error("Governed packaging dependency identity is unexpected.");
  }
  const packageTemplate = readFileSync(
    join(repositoryRoot, "packaging", "windows", "Package.appxmanifest.template"),
    "utf8"
  );
  if (
    !packageTemplate.includes(`Name="${contract.package.identity}"`) ||
    !packageTemplate.includes('Version="{{PACKAGE_VERSION}}"') ||
    !packageTemplate.includes(
      `ProcessorArchitecture="${contract.package.architecture}"`
    )
  ) {
    throw new Error("Package manifest template identity is unexpected.");
  }
  assertCleanMachineQualificationState();
}

export function assertGitAncestor(ancestor, descendant, label) {
  const result = spawnSync(
    "git",
    ["merge-base", "--is-ancestor", ancestor, descendant],
    { cwd: repositoryRoot, shell: false, windowsHide: true }
  );
  if (result.error || result.status !== 0) {
    throw new Error(
      `Required ${label} ancestry is not established: ${ancestor} -> ${descendant}.`
    );
  }
}

export function assertCleanMachineQualificationState() {
  const command = [
    "$ErrorActionPreference = 'Stop'",
    `$packageName = '${contract.package.identity}'`,
    `$subjectPrefix = '${contract.package.publisherSubjectPrefix}'`,
    "$packages = @(Get-AppxPackage -Name $packageName -ErrorAction SilentlyContinue)",
    "$certificates = @(",
    "  foreach ($location in @('CurrentUser', 'LocalMachine')) {",
    "    foreach ($store in @('My', 'Root', 'TrustedPeople')) {",
    "      $storePath = \"Cert:\\$location\\$store\"",
    "      if (Test-Path -LiteralPath $storePath) {",
    "        Get-ChildItem -LiteralPath $storePath |",
    "          Where-Object { $_.Subject.StartsWith($subjectPrefix, [StringComparison]::Ordinal) } |",
    "          ForEach-Object { [pscustomobject]@{ location=$location; store=$store; thumbprint=$_.Thumbprint } }",
    "      }",
    "    }",
    "  }",
    ")",
    "[pscustomobject]@{ packages=@($packages).Count; certificates=@($certificates) } | ConvertTo-Json -Compress -Depth 5",
  ].join("\n");
  const result = JSON.parse(
    runReadOnly("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      command,
    ])
  );
  validateMachineQualificationState(result);
}

export function validateMachineQualificationState(result) {
  if (!Number.isInteger(result?.packages) || result.packages !== 0) {
    throw new Error("The governed Oracle package is already installed.");
  }
  if (!Array.isArray(result?.certificates)) {
    throw new Error("Certificate-store preflight returned an invalid result.");
  }
  if (result.certificates.length !== 0) {
    throw new Error(
      "An R3 temporary certificate identity already exists in a governed store."
    );
  }
}

export function createAttemptRecord(input) {
  validateAttemptIdentity(input);
  validateBinding(input);
  const outputRoot = assertR3ArtifactPath(input.outputRoot, input.attemptId);
  return {
    schemaVersion: "1.0.0",
    contract: "oracle.sprint-30-5.stage-2-requalification-r3-attempt",
    programmeIdentity: contract.programmeIdentity,
    requalificationRevision: contract.revision,
    attemptId: input.attemptId,
    timestampUtc: input.timestampUtc,
    candidate: {
      commit: input.candidateCommit,
      tree: git(["rev-parse", `${input.candidateCommit}^{tree}`]),
    },
    harness: {
      commit: input.harnessCommit,
      tree: git(["rev-parse", `${input.harnessCommit}^{tree}`]),
      contractSha256: sha256File(contractPath),
      files: harnessFileInventory(),
    },
    machine: {
      identity: input.machineIdentity,
      platform: process.platform,
      architecture: process.arch,
      osRelease: os.release(),
    },
    package: {
      identity: input.packageIdentity,
      version: input.packageVersion,
      architecture: contract.package.architecture,
    },
    certificate: {
      state: "not-created",
      thumbprint: null,
    },
    outputRoot: relative(repositoryRoot, outputRoot).replaceAll("\\", "/"),
    lifecycle: {
      state: "prepared",
      stopReason: null,
    },
    evidence: {
      manifest: null,
      finalEvidenceHash: null,
    },
    authority: {
      build: "not-authorised-by-preparation",
      package: "not-authorised-by-preparation",
      signing: "not-authorised-by-preparation",
      qualificationExecution: "not-authorised-by-preparation",
      stage3: "not-authorised",
      stage4: "not-authorised",
      productionRelease: "not-authorised",
    },
  };
}

export function createAttemptDirectory(record) {
  const outputRoot = assertR3ArtifactPath(record.outputRoot, record.attemptId);
  const base = dirname(outputRoot);
  assertNoReparseTraversal(base);
  assertAttemptOutputAvailable(outputRoot);
  mkdirSync(base, { recursive: true });
  assertNoReparseTraversal(base);
  mkdirSync(outputRoot, { recursive: false });
  assertNoReparseTraversal(outputRoot);
  // If the atomic record write fails, retain the fresh empty directory as an
  // immutable collision tombstone; future attempts must not reuse it.
  writeJsonAtomicCreateOnly(
    join(outputRoot, "Oracle.Stage2RequalificationR3Attempt.json"),
    record
  );
  return outputRoot;
}

export function assertAttemptOutputAvailable(
  outputRoot,
  pathExists = existsSync
) {
  if (pathExists(outputRoot)) {
    throw new Error(`Attempt output already exists: ${outputRoot}`);
  }
}

export function writeJsonAtomicCreateOnly(path, value) {
  const target = assertOutsideHistoricalRoots(path);
  if (existsSync(target)) {
    throw new Error(`Create-only target already exists: ${target}`);
  }
  const parent = dirname(target);
  if (!existsSync(parent)) {
    throw new Error(`Create-only parent does not exist: ${parent}`);
  }
  const temporary = join(
    parent,
    `.${target.split(sep).at(-1)}.tmp-${process.pid}-${Date.now()}`
  );
  let descriptor;
  try {
    descriptor = openSync(
      temporary,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
      0o600
    );
    writeFileSync(
      descriptor,
      `${JSON.stringify(value, null, 2)}\n`,
      "utf8"
    );
    closeSync(descriptor);
    descriptor = undefined;
    // Publishing by hard link is atomic and create-only: linkSync fails if the
    // destination already exists, so no pre-check/rename race can replace it.
    linkSync(temporary, target);
  } finally {
    if (descriptor !== undefined) {
      closeSync(descriptor);
    }
    if (existsSync(temporary)) {
      unlinkSync(temporary);
    }
  }
}

export function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function harnessFileInventory() {
  return [
    contractPath,
    import.meta.filename,
    join(import.meta.dirname, "execution-core.mjs"),
    join(import.meta.dirname, "execute-attempt.mjs"),
    join(import.meta.dirname, "remove-exact-certificate.ps1"),
    join(import.meta.dirname, "sign-release-manifest-exact.ps1"),
    join(import.meta.dirname, "verify-exact-signatures.ps1"),
    join(import.meta.dirname, "verify-harness-static.mjs"),
  ]
    .map((path) => ({
      path: relative(repositoryRoot, path).replaceAll("\\", "/"),
      sha256: sha256File(path),
    }))
    .sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0
    );
}

export function bindCertificate(record, thumbprint) {
  validateCertificateThumbprint(thumbprint);
  if (record.certificate?.state !== "not-created") {
    throw new Error("Certificate identity has already been bound.");
  }
  return {
    ...record,
    certificate: {
      state: "generated-for-this-attempt",
      thumbprint,
    },
  };
}

export function validateFinalIdentity(record) {
  validateCertificateThumbprint(record.certificate?.thumbprint);
  if (
    typeof record.evidence?.manifest !== "string" ||
    record.evidence.manifest === "" ||
    !/^[0-9a-f]{64}$/u.test(record.evidence?.finalEvidenceHash ?? "")
  ) {
    throw new Error("Final evidence manifest and SHA-256 binding are mandatory.");
  }
}
