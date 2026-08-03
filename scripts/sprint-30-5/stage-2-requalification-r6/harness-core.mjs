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
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

export const repositoryRoot = resolve(import.meta.dirname, "..", "..", "..");
export const R6_GOVERNED_WRAPPER_PROTOCOL =
  "oracle-stage2-r6-governed-wrapper-v1";
export const contractPath = join(
  import.meta.dirname,
  "Oracle.Stage2RequalificationR6Contract.json"
);
export const contract = Object.freeze(
  JSON.parse(readFileSync(contractPath, "utf8").replace(/^\uFEFF/u, ""))
);

const commitPattern = /^[0-9a-f]{40}$/u;
const thumbprintPattern = /^[0-9A-F]{40}$/u;
const attemptPattern = /^r6-(\d{8}T\d{9}Z)-([0-9a-f]{8})$/u;
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
        `Refusing R6 output inside immutable historical root: ${protectedRoot}`
      );
    }
  }
  return resolved;
}

export function assertR6ArtifactPath(path, attemptId) {
  const resolved = assertOutsideHistoricalRoots(path);
  const base = canonicalPath(contract.output.artifactBase);
  const requiredAttemptRoot = join(base, attemptId);
  if (resolved !== requiredAttemptRoot) {
    throw new Error(
      `R6 output root must resolve exactly to ${relative(repositoryRoot, requiredAttemptRoot).replaceAll("\\", "/")}.`
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
    throw new Error("Governed R6 output must remain inside the repository.");
  }
  const segments = relative(repositoryRoot, resolved).split(sep).filter(Boolean);
  let current = repositoryRoot;
  for (const segment of segments) {
    current = join(current, segment);
    if (
      filesystem.existsSync(current) &&
      filesystem.lstatSync(current).isSymbolicLink()
    ) {
      throw new Error(`R6 output path traverses a symbolic link or junction: ${current}`);
    }
  }
}

export function validateGovernedWrapperInvocation({ observed, parentProcessId }) {
  if (!Number.isInteger(parentProcessId) || parentProcessId <= 0) {
    throw new Error("The governed wrapper parent process ID is invalid.");
  }
  const expected = `${R6_GOVERNED_WRAPPER_PROTOCOL}:${parentProcessId}`;
  if (observed !== expected) {
    throw new Error(
      "The R6 executor must be invoked by the governed invoke-attempt.ps1 wrapper."
    );
  }
  return Object.freeze({
    protocol: R6_GOVERNED_WRAPPER_PROTOCOL,
    parentProcessId,
  });
}

export function validateAttemptIdentity({ attemptId, timestampUtc }) {
  if (typeof attemptId !== "string" || typeof timestampUtc !== "string") {
    throw new Error("Attempt ID and UTC timestamp are mandatory.");
  }
  const match = attemptPattern.exec(attemptId);
  if (!match) {
    throw new Error("Attempt ID must use r6-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx.");
  }
  if (match[2] === "00000000") {
    throw new Error("Attempt ID uses the prohibited all-zero suffix.");
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
    throw new Error(`R6 candidate commit mismatch: expected ${contract.candidate.commit}, received ${binding.candidateCommit}.`);
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
    throw new Error("R6 requires a clean repository and index.");
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

export function approvedExecutable(name, filesystem = { existsSync, lstatSync, realpathSync }) {
  const configured = contract.toolchainExecutables?.[name];
  if (typeof configured !== "string" || configured === "") {
    throw new Error(`Approved executable path is absent for ${name}.`);
  }
  const path = resolve(configured);
  if (!filesystem.existsSync(path) || !filesystem.lstatSync(path).isFile()) {
    throw new Error(`Approved executable is not a regular file: ${path}`);
  }
  if (filesystem.realpathSync(path).toLowerCase() !== path.toLowerCase()) {
    throw new Error(`Approved executable traverses a reparse path: ${path}`);
  }
  return path;
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
  return runReadOnly(approvedExecutable("git"), args);
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

export function resolveApprovedNpmSurface({
  nodeExecutable = approvedExecutable("node"),
  filesystem = { existsSync, lstatSync, readFileSync, realpathSync },
} = {}) {
  const resolvedNode = resolve(nodeExecutable);
  if (basename(resolvedNode).toLowerCase() !== "node.exe") {
    throw new Error("The approved Node executable must be node.exe.");
  }
  const nodeRoot = dirname(resolvedNode);
  const npmPackageRoot = join(nodeRoot, "node_modules", "npm");
  const packageJsonPath = join(npmPackageRoot, "package.json");
  const npmCli = join(npmPackageRoot, "bin", "npm-cli.js");
  const npxCli = join(npmPackageRoot, "bin", "npx-cli.js");
  for (const path of [resolvedNode, packageJsonPath, npmCli, npxCli]) {
    if (!filesystem.existsSync(path) || !filesystem.lstatSync(path).isFile()) {
      throw new Error(`Approved npm surface is missing: ${path}`);
    }
    if (filesystem.realpathSync(path).toLowerCase() !== resolve(path).toLowerCase()) {
      throw new Error(`Approved npm surface traverses a reparse path: ${path}`);
    }
  }
  if (
    !isSameOrDescendant(packageJsonPath, npmPackageRoot) ||
    !isSameOrDescendant(npmCli, npmPackageRoot) ||
    !isSameOrDescendant(npxCli, npmPackageRoot)
  ) {
    throw new Error("Approved npm surface escaped its Node installation root.");
  }
  let packageIdentity;
  try {
    packageIdentity = JSON.parse(filesystem.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    throw new Error(`Approved npm package identity is unreadable: ${error.message}`, { cause: error });
  }
  if (
    packageIdentity.name !== "npm" ||
    packageIdentity.version !== contract.toolchain.npm
  ) {
    throw new Error(
      `Approved npm package identity mismatch: expected npm ${contract.toolchain.npm}.`
    );
  }
  return Object.freeze({
    nodeExecutable: resolvedNode,
    nodeRoot,
    npmPackageRoot,
    packageJsonPath,
    npmCli,
    npxCli,
    npmVersion: packageIdentity.version,
  });
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
    throw new Error(`R6 candidate tree mismatch: expected ${contract.candidate.tree}, found ${candidateTree}.`);
  }
  const productDifference = spawnSync(
    approvedExecutable("git"),
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
  const npmSurface = resolveApprovedNpmSurface();
  const versions = {
    git: requiredToolVersion(approvedExecutable("git"), ["--version"]).replace(/^git version /u, ""),
    node: requiredToolVersion(npmSurface.nodeExecutable, ["--version"]).replace(/^v/u, ""),
    npm: requiredToolVersion(npmSurface.nodeExecutable, [npmSurface.npmCli, "--version"]),
    powershell: requiredToolVersion(approvedExecutable("powershell"), [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "$PSVersionTable.PSVersion.ToString()",
    ]),
    dotnet: requiredToolVersion(approvedExecutable("dotnet"), ["--version"]),
    bsdtar:
      /^bsdtar\s+(\S+)/u.exec(requiredToolVersion(approvedExecutable("bsdtar"), ["--version"]))?.[1],
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
    approvedExecutable("git"),
    ["merge-base", "--is-ancestor", ancestor, descendant],
    { cwd: repositoryRoot, shell: false, windowsHide: true }
  );
  if (result.error || result.status !== 0) {
    throw new Error(
      `Required ${label} ancestry is not established: ${ancestor} -> ${descendant}.`
    );
  }
}

export function readMachineQualificationState() {
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
  return JSON.parse(
    runReadOnly(approvedExecutable("powershell"), [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      command,
    ])
  );
}

export function assertCleanMachineQualificationState() {
  validateMachineQualificationState(readMachineQualificationState());
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
      "An R6 temporary certificate identity already exists in a governed store."
    );
  }
}

export function createAttemptRecord(input) {
  validateAttemptIdentity(input);
  validateBinding(input);
  const outputRoot = assertR6ArtifactPath(input.outputRoot, input.attemptId);
  return {
    schemaVersion: "1.0.0",
    contract: "oracle.sprint-30-5.stage-2-requalification-r6-attempt",
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
    invocation: {
      surface: "invoke-attempt.ps1",
      protocol: input.wrapperProtocol,
      wrapperProcessId: input.wrapperProcessId,
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
      recordType: "immutable-attempt-creation-state",
      initialState: "prepared",
      eventLedger: "lifecycle/",
      terminalStateRecordedSeparately: true,
    },
    evidence: {
      initialManifest: null,
      initialFinalEvidenceHash: null,
      terminalOutcomeRecordedSeparately: true,
    },
    authority: {
      authorityId: input.authorityId,
      claimState: "consumed-for-this-attempt",
      attemptsAuthorised: 1,
      build: "founder-authorised-for-this-attempt",
      package: "founder-authorised-for-this-attempt",
      signing: "founder-authorised-local-test-only-for-this-attempt",
      qualificationExecution: "founder-authorised-for-this-attempt",
      stage3: "closed-not-authorised-by-r6",
      stage4: "closed-not-authorised-by-r6",
      productionRelease: "not-authorised",
    },
  };
}

export function createAttemptDirectory(record) {
  const outputRoot = assertR6ArtifactPath(record.outputRoot, record.attemptId);
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
    join(outputRoot, "Oracle.Stage2RequalificationR6Attempt.json"),
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
    join(import.meta.dirname, "execution-identity-core.ps1"),
    join(import.meta.dirname, "invoke-attempt.ps1"),
    join(import.meta.dirname, "remove-exact-certificate.ps1"),
    join(import.meta.dirname, "runtime-configuration-custody.mjs"),
    join(import.meta.dirname, "sign-release-manifest-exact.ps1"),
    join(import.meta.dirname, "verify-exact-signatures.ps1"),
    join(import.meta.dirname, "verify-execution-identity.ps1"),
    join(import.meta.dirname, "verify-harness-static.mjs"),
    join(import.meta.dirname, "verify-runtime-configuration-custody.mjs"),
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
