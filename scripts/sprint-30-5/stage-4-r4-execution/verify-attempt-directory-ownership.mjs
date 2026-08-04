import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { admitAttemptDirectoryLayout } from "./stage4-core.mjs";

const boundary = mkdtempSync(join(tmpdir(), "oracle-stage4-r4-directory-ownership-"));
try {
  const missingLogs = join(boundary, "missing-logs");
  mkdirSync(missingLogs);
  assert.throws(
    () => admitAttemptDirectoryLayout({ attemptRoot: missingLogs, artifactBoundary: boundary }),
    /Caller-owned attempt logs directory is absent or invalid/u,
  );
  assert.equal(existsSync(join(missingLogs, "provider")), false, "Provider root was created before caller-owned logs admission.");

  const admitted = join(boundary, "admitted");
  const admittedLogs = join(admitted, "logs");
  mkdirSync(admittedLogs, { recursive: true });
  const sentinel = join(admittedLogs, "transfer-admission.json");
  writeFileSync(sentinel, "preserve", { encoding: "utf8", flag: "wx" });
  const layout = admitAttemptDirectoryLayout({ attemptRoot: admitted, artifactBoundary: boundary, expectedRootEntries: ["logs"], expectedLogFiles: ["transfer-admission.json"] });
  assert.equal(layout.logsRoot, admittedLogs);
  assert.equal(layout.logsOwnership, "caller-shared-create-only");
  assert.equal(layout.providerOwnership, "live-controller-exclusive-ephemeral");
  assert.equal(existsSync(sentinel), true, "Caller-owned create-only log was not preserved.");
  assert.equal(existsSync(layout.providerRoot), true, "Live controller did not create its exclusive provider root.");
  assert.throws(
    () => admitAttemptDirectoryLayout({ attemptRoot: admitted, artifactBoundary: boundary, expectedRootEntries: ["logs"], expectedLogFiles: ["transfer-admission.json"] }),
    /Live-controller-owned provider directory already exists/u,
  );

  const unexpectedLog = join(boundary, "unexpected-log");
  mkdirSync(join(unexpectedLog, "logs"), { recursive: true });
  writeFileSync(join(unexpectedLog, "logs", "unexpected.json"), "unexpected", { encoding: "utf8", flag: "wx" });
  assert.throws(
    () => admitAttemptDirectoryLayout({ attemptRoot: unexpectedLog, artifactBoundary: boundary, expectedRootEntries: ["logs"], expectedLogFiles: [] }),
    /Caller-owned log inventory differs from the mode-bound ownership contract/u,
  );
  assert.equal(existsSync(join(unexpectedLog, "provider")), false, "Provider root was created after hostile log inventory.");

  const unexpectedRoot = join(boundary, "unexpected-root");
  mkdirSync(join(unexpectedRoot, "logs"), { recursive: true });
  mkdirSync(join(unexpectedRoot, "rogue"));
  assert.throws(
    () => admitAttemptDirectoryLayout({ attemptRoot: unexpectedRoot, artifactBoundary: boundary, expectedRootEntries: ["logs"], expectedLogFiles: [] }),
    /Attempt root inventory differs from the mode-bound ownership contract/u,
  );
  assert.equal(existsSync(join(unexpectedRoot, "provider")), false, "Provider root was created after hostile root inventory.");
  const fileBackedLogs = join(boundary, "file-backed-logs");
  mkdirSync(fileBackedLogs);
  writeFileSync(join(fileBackedLogs, "logs"), "not-a-directory", { encoding: "utf8", flag: "wx" });
  assert.throws(
    () => admitAttemptDirectoryLayout({ attemptRoot: fileBackedLogs, artifactBoundary: boundary }),
    /Caller-owned attempt logs directory is absent or invalid/u,
  );

  const linkedLogs = join(boundary, "linked-logs");
  const linkTarget = join(boundary, "link-target");
  mkdirSync(linkedLogs);
  mkdirSync(linkTarget);
  symlinkSync(linkTarget, join(linkedLogs, "logs"), "junction");
  assert.throws(
    () => admitAttemptDirectoryLayout({ attemptRoot: linkedLogs, artifactBoundary: boundary }),
    /Link traversal rejected/u,
  );

  const teardown = join(boundary, "teardown");
  mkdirSync(join(teardown, "logs"), { recursive: true });
  mkdirSync(join(teardown, "provider"));
  const teardownLayout = admitAttemptDirectoryLayout({ attemptRoot: teardown, artifactBoundary: boundary, teardownOnly: true });
  assert.equal(existsSync(teardownLayout.providerRoot), true, "Teardown admission mutated the provider root.");

  console.log(JSON.stringify({
    result: "passed",
    classification: "STAGE-4-R4-ATTEMPT-DIRECTORY-OWNERSHIP-VALIDATION",
    callerOwnedLogsPreserved: true,
    missingLogsRejected: true,
    fileBackedLogsRejected: true,
    linkedLogsRejected: true,
    unexpectedLogRejected: true,
    unexpectedRootRejected: true,
    preexistingProviderRejected: true,
    teardownLayoutNonMutating: true,
    authorityCreated: false,
    attemptCreated: false,
  }, null, 2));
} finally {
  rmSync(boundary, { recursive: true, force: false });
}