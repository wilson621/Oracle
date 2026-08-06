import {
  closeSync,
  constants,
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import {
  assertNoReparseTraversal,
  assertOutsideHistoricalRoots,
  assertR7ArtifactPath,
  contract,
  repositoryRoot,
  validateAttemptIdentity,
} from "./harness-core.mjs";

export const FOUNDER_EXECUTION_AUTHORITY =
  "FOUNDER-AUTHORISED-STAGE-2-R7-SINGLE-ATTEMPT";

export const executionPhases = Object.freeze([
  "attempt-prepared",
  "candidate-frozen",
  "source-baseline-passed",
  "inputs-reverified",
  "package-layout-constructed",
  "certificate-bound",
  "package-and-manifests-signed",
  "mechanical-verification-passed",
  "safety-teardown-passed",
  "evidence-inventoried",
  "evidence-frozen",
  "complete-awaiting-founder-review",
]);

export function validatePhaseTransition(currentIndex, phase) {
  const nextIndex = executionPhases.indexOf(phase);
  if (nextIndex !== currentIndex + 1) {
    throw new Error(
      `Invalid lifecycle transition from ${currentIndex < 0 ? "none" : executionPhases[currentIndex]} to ${phase}.`
    );
  }
  return nextIndex;
}

export function assertFounderExecutionAuthority(value) {
  if (value !== FOUNDER_EXECUTION_AUTHORITY) {
    throw new Error(
      "The exact single-attempt Founder execution authority token is required."
    );
  }
}

export function claimSingleAttemptAuthority({
  authority,
  authorityId,
  attemptId,
  timestampUtc,
  candidateCommit,
  harnessCommit,
  outputRoot,
}) {
  assertFounderExecutionAuthority(authority);
  validateAttemptIdentity({ attemptId, timestampUtc });
  validateAuthorityIdentity({ authorityId, attemptId });
  const attemptRoot = assertR7ArtifactPath(outputRoot, attemptId);
  const base = dirname(attemptRoot);
  const repositoryEvidenceBase = resolve(
    repositoryRoot,
    contract.output.repositoryEvidenceBase
  );
  assertOutsideHistoricalRoots(base);
  assertOutsideHistoricalRoots(repositoryEvidenceBase);
  assertNoReparseTraversal(dirname(base));
  assertNoReparseTraversal(dirname(repositoryEvidenceBase));
  if (existsSync(base)) {
    assertNoReparseTraversal(base);
  } else {
    mkdirSync(base, { recursive: true });
    assertNoReparseTraversal(base);
  }
  if (existsSync(repositoryEvidenceBase)) {
    assertNoReparseTraversal(repositoryEvidenceBase);
  }
  const authorityRoot = join(base, "authorities");
  if (existsSync(authorityRoot)) {
    assertNoReparseTraversal(authorityRoot);
  }
  const existingAuthorityIds = existsSync(authorityRoot)
    ? readdirSync(authorityRoot)
        .filter((name) => name.endsWith(".json"))
        .map((name) => name.slice(0, -".json".length))
    : [];
  assertSingleAttemptAuthorityAvailable({
    authorityId,
    attemptId,
    existingAuthorityIds,
    existingAttemptIds: [
      ...readdirSync(base),
      ...(existsSync(repositoryEvidenceBase)
        ? readdirSync(repositoryEvidenceBase)
        : []),
    ],
  });
  if (!existsSync(authorityRoot)) {
    mkdirSync(authorityRoot, { recursive: false });
    assertNoReparseTraversal(authorityRoot);
  }
  const recordPath = join(authorityRoot, `${authorityId}.json`);
  writeJsonAtomicCreateOnly(recordPath, {
    schemaVersion: "1.0.0",
    contract:
      "oracle.sprint-30-5.stage-2-requalification-r7-single-attempt-authority",
    programmeIdentity: "Sprint 30.5 Stage 2 Requalification R7",
    revision: "R7",
    authorityId,
    attemptId,
    timestampUtc,
    candidateCommit,
    harnessCommit,
    claimedAt: new Date().toISOString(),
    attemptsAuthorised: 1,
    authorityConsumed: true,
  });
  return recordPath;
}

export function validateAuthorityIdentity({ authorityId, attemptId }) {
  if (
    typeof authorityId !== "string" ||
    authorityId !== `authority-${attemptId}`
  ) {
    throw new Error(
      "Authority ID must exactly equal authority-<attempt-id>."
    );
  }
}

export function assertSingleAttemptAuthorityAvailable({
  authorityId,
  attemptId,
  existingAuthorityIds,
  existingAttemptIds,
}) {
  validateAuthorityIdentity({ authorityId, attemptId });
  if (
    !Array.isArray(existingAuthorityIds) ||
    !Array.isArray(existingAttemptIds)
  ) {
    throw new Error("R7 authority-consumption state is invalid.");
  }
  const equals = (left, right) =>
    String(left).toLowerCase() === String(right).toLowerCase();
  if (existingAuthorityIds.some((value) => equals(value, authorityId))) {
    throw new Error("The Founder authority identity is already consumed.");
  }
  if (existingAttemptIds.some((value) => equals(value, attemptId))) {
    throw new Error("The immutable R7 attempt identity already exists.");
  }
}

export function createAttemptSubdirectory(attemptRoot, relativePath) {
  const root = resolve(attemptRoot);
  const target = resolve(root, relativePath);
  assertR7ArtifactPath(root, root.split(sep).at(-1));
  if (
    relative(root, target).startsWith(`..${sep}`) ||
    relative(root, target) === ".."
  ) {
    throw new Error("Attempt subdirectory escapes the governed attempt root.");
  }
  assertOutsideHistoricalRoots(target);
  assertNoReparseTraversal(dirname(target));
  if (existsSync(target)) {
    throw new Error(`Create-only directory already exists: ${target}`);
  }
  mkdirSync(target, { recursive: false });
  assertNoReparseTraversal(target);
  return target;
}

export function createAttemptDirectories(attemptRoot, names) {
  return Object.fromEntries(
    names.map((name) => [name, createAttemptSubdirectory(attemptRoot, name)])
  );
}

export function writeFileAtomicCreateOnly(path, content) {
  const target = assertOutsideHistoricalRoots(path);
  const parent = dirname(target);
  assertNoReparseTraversal(parent);
  if (!existsSync(parent)) {
    throw new Error(`Create-only parent does not exist: ${parent}`);
  }
  if (existsSync(target)) {
    throw new Error(`Create-only target already exists: ${target}`);
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
    writeFileSync(descriptor, content);
    closeSync(descriptor);
    descriptor = undefined;
    linkSync(temporary, target);
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    if (existsSync(temporary)) unlinkSync(temporary);
  }
}

export function publishExistingFileCreateOnly(temporary, destination) {
  const source = resolve(temporary);
  const target = assertOutsideHistoricalRoots(destination);
  if (!existsSync(source) || !lstatSync(source).isFile()) {
    throw new Error(`Publication source is missing: ${source}`);
  }
  assertNoReparseTraversal(dirname(target));
  if (existsSync(target)) {
    throw new Error(`Create-only target already exists: ${target}`);
  }
  linkSync(source, target);
  unlinkSync(source);
}

export function writeJsonAtomicCreateOnly(path, value) {
  writeFileAtomicCreateOnly(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function createLifecycle(attemptRoot, identity, clock = () => new Date()) {
  const lifecycleRoot = createAttemptSubdirectory(attemptRoot, "lifecycle");
  let phaseIndex = -1;
  let terminal = false;

  return Object.freeze({
    transition(phase, details = {}) {
      if (terminal) throw new Error("Lifecycle is already terminal.");
      const nextIndex = validatePhaseTransition(phaseIndex, phase);
      phaseIndex = nextIndex;
      const record = {
        schemaVersion: "1.0.0",
        contract:
          "oracle.sprint-30-5.stage-2-requalification-r7-lifecycle-event",
        ...identity,
        sequence: phaseIndex + 1,
        phase,
        status:
          phase === "complete-awaiting-founder-review"
            ? "complete-awaiting-founder-review"
            : "passed",
        recordedAt: clock().toISOString(),
        details,
      };
      writeJsonAtomicCreateOnly(
        join(
          lifecycleRoot,
          `${String(record.sequence).padStart(3, "0")}-${phase}.json`
        ),
        record
      );
      if (phase === "complete-awaiting-founder-review") terminal = true;
      return record;
    },

    fail(error, details = {}) {
      if (terminal) throw new Error("Lifecycle is already terminal.");
      terminal = true;
      const failure = {
        schemaVersion: "1.0.0",
        contract:
          "oracle.sprint-30-5.stage-2-requalification-r7-lifecycle-failure",
        ...identity,
        sequence: phaseIndex + 2,
        phase:
          phaseIndex < 0 ? "attempt-preparation" : executionPhases[phaseIndex],
        status: "failed",
        recordedAt: clock().toISOString(),
        stopReason: error instanceof Error ? error.message : String(error),
        details,
      };
      writeJsonAtomicCreateOnly(
        join(lifecycleRoot, "999-failed.json"),
        failure
      );
      return failure;
    },

    get currentPhase() {
      return phaseIndex < 0 ? null : executionPhases[phaseIndex];
    },

    get isTerminal() {
      return terminal;
    },
  });
}

export function selectExactCertificateMatches(
  records,
  thumbprint,
  expectedSubject
) {
  if (!/^[0-9A-F]{40}$/u.test(thumbprint ?? "")) {
    throw new Error("An exact uppercase 40-character thumbprint is required.");
  }
  if (!Array.isArray(records)) {
    throw new Error("Certificate records must be an array.");
  }
  const exact = records.filter((record) => record.thumbprint === thumbprint);
  if (exact.length === 0) {
    throw new Error("The exact generated certificate was not found.");
  }
  for (const record of exact) {
    if (record.subject !== expectedSubject) {
      throw new Error("The exact certificate has an unexpected subject.");
    }
  }
  return exact;
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/u, ""));
}

export { repositoryRoot };
