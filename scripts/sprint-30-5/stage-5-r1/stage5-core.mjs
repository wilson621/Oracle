import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const harnessRoot = dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = resolve(harnessRoot, "../../..");
export const contractPath = join(harnessRoot, "Oracle.Stage5R1Contract.json");
export const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const stage4Contract = JSON.parse(readFileSync(
  join(repositoryRoot, "scripts/sprint-30-5/stage-4-r4/Oracle.Stage4R4Contract.json"),
  "utf8",
));

export function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function percentile(values, percentileValue) {
  assert.ok(Array.isArray(values) && values.length > 0, "Percentile input is empty.");
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil((percentileValue / 100) * sorted.length) - 1)];
}

export function validateAuthorityBoundary() {
  const boundary = contract.authorityBoundary;
  assert.equal(contract.status, "engineering-preparation-qualification-barred");
  assert.equal(boundary.protocolFreezeAuthorised, true);
  assert.equal(boundary.engineeringPreparationAuthorised, true);
  assert.equal(boundary.productModificationPermitted, false);
  assert.equal(boundary.transferPreparationPermitted, false);
  assert.equal(boundary.transferCreationPermitted, false);
  assert.equal(boundary.authorityCreationPermitted, false);
  assert.equal(boundary.qualificationAttemptPermitted, false);
  assert.equal(boundary.qualificationExecutionPermitted, false);
  assert.equal(boundary.maximumTransfers, 0);
  assert.equal(boundary.maximumAuthorities, 0);
  assert.equal(boundary.maximumAttempts, 0);
  assert.equal(boundary.retryPermitted, false);
}

export function validateAcceptedBindings() {
  validateAuthorityBoundary();
  for (const stage of Object.values(contract.acceptedChain)) {
    const path = join(repositoryRoot, stage.acceptedEvidenceIndexPath);
    assert.equal(statSync(path).isFile(), true, "Accepted index is not a file: " + stage.acceptedEvidenceIndexPath);
    assert.equal(sha256(path), stage.acceptedEvidenceIndexSha256, "Accepted index differs: " + stage.acceptedEvidenceIndexPath);
  }
  for (const binding of contract.historicalBindings) {
    const path = join(repositoryRoot, binding.path);
    assert.equal(statSync(path).isFile(), true, "Historical binding is not a file: " + binding.path);
    assert.equal(sha256(path), binding.sha256, "Historical binding differs: " + binding.path);
  }
  const packagePath = join(repositoryRoot, contract.package.artifactPath);
  assert.equal(statSync(packagePath).isFile(), true, "Exact R6 MSIX is absent.");
  assert.equal(sha256(packagePath), contract.package.sha256, "Exact R6 MSIX hash differs.");
}

export function validateProductBoundary() {
  const git = validateApprovedTool("git");
  const result = spawnSync(git.path, [
    "diff", "--name-only",
    contract.repository.acceptedCandidateCommit,
    "HEAD", "--",
    ...contract.repository.productPaths,
  ], { cwd: repositoryRoot, encoding: "utf8", shell: false });
  validateProcessEnvelope(result);
  const drift = result.stdout.split(/\r?\n/u).filter(Boolean);
  assert.deepEqual(drift, contract.repository.permittedPostCandidateProductDrift.paths);

  const accepted = JSON.parse(runGitShow(git.path, contract.repository.acceptedCandidateCommit + ":package.json"));
  const current = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8"));
  for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies", "engines"]) {
    assert.deepEqual(current[key] ?? null, accepted[key] ?? null, "package.json " + key + " changed after accepted R6.");
  }
  const acceptedWithoutScripts = { ...accepted, scripts: undefined };
  const currentWithoutScripts = { ...current, scripts: undefined };
  assert.deepEqual(currentWithoutScripts, acceptedWithoutScripts, "package.json drift exceeds convenience scripts.");
  return drift;
}

export function validateApprovedTool(name) {
  const tool = stage4Contract.toolchain.approvedTools[name];
  assert.ok(tool, "Approved tool is absent: " + name);
  assert.equal(statSync(tool.path).isFile(), true, "Approved tool is not a file: " + name);
  assert.equal(sha256(tool.path), tool.sha256, "Approved tool hash differs: " + name);
  return tool;
}

export function validateProcessEnvelope(result, label = "governed process") {
  if (result.error) throw new Error(label + " startup failed: " + result.error.message);
  if (result.signal) throw new Error(label + " terminated by signal " + result.signal + ".");
  if (!Number.isInteger(result.status)) throw new Error(label + " exit status is unavailable.");
  if (result.status !== 0) {
    throw new Error(label + " exited " + result.status + ".\nstdout:\n" + result.stdout + "\nstderr:\n" + result.stderr);
  }
}

export function evaluateRun(run, profile = "qualification") {
  assert.ok(profile === "qualification" || profile === "development-rehearsal");
  assert.equal(run.packageSha256, contract.package.sha256);
  assert.equal(run.hostIdentity, contract.host.requiredIdentity);
  assert.equal(run.productionEndpointUsed, false);
  assert.equal(run.productionCredentialUsed, false);
  assert.equal(run.stage4InstalledLifecyclePassed, true);
  assert.equal(run.zeroResidue, true);
  assert.equal(run.nonzeroExitCount, 0);
  assert.equal(run.unavailableMeasurements.length, 0);
  assert.equal(run.unexplainedWarnings.length, 0);
  assert.ok(Array.isArray(run.samples));

  const minimumSamples = profile === "qualification"
    ? Math.ceil(
        ((contract.qualificationProtocol.activeJourneySecondsPerCycle +
          contract.qualificationProtocol.soakSecondsPerCycle) * 1000 /
          contract.qualificationProtocol.sampleCadenceMilliseconds) *
        contract.qualificationProtocol.minimumSampleCompleteness
      )
    : contract.developmentRehearsalProfile.minimumInstalledSamples;
  assert.ok(run.samples.length >= minimumSamples, "Sample count " + run.samples.length + " is below " + minimumSamples + ".");

  const gpuSamples = run.samples.filter(sample => sample.processType === "gpu");
  assert.ok(gpuSamples.length > 0, "No package-owned GPU-process samples were observed.");
  const gpuPids = new Set(gpuSamples.map(sample => sample.processId));
  assert.equal(gpuPids.size, 1, "GPU process identity was not stable.");
  const allCommandLines = run.samples.map(sample => String(sample.commandLine ?? "").toLowerCase()).join("\n");
  for (const indicator of contract.gpuAcceptance.prohibitedIndicators) {
    assert.equal(allCommandLines.includes(indicator), false, "Software/fallback indicator observed: " + indicator);
  }

  const totalPeak = Math.max(...run.samples.map(sample => sample.totalProcessTreeWorkingSetMiB));
  const gpuPrivate = gpuSamples.map(sample => sample.privateWorkingSetMiB);
  const gpuP95 = percentile(gpuPrivate, 95);
  const gpuPeak = Math.max(...gpuPrivate);
  const cpuP95 = percentile(run.samples.map(sample => sample.processTreeCpuPercent), 95);
  const positiveGpuEngineSamples = run.samples.filter(sample => sample.gpuEngineUtilizationPercent > 0).length;

  const t = contract.thresholds;
  assert.ok(totalPeak <= t.totalProcessTreePeakWorkingSetMiBMaximum);
  assert.ok(gpuP95 <= t.gpuPrivateWorkingSetMiBP95Maximum);
  assert.ok(gpuPeak <= t.gpuPrivateWorkingSetMiBPeakMaximum);
  assert.ok(cpuP95 <= t.soakProcessTreeCpuPercentP95Maximum);
  assert.ok(positiveGpuEngineSamples >= t.minimumHardwareGpuEnginePositiveSamplesPerCycle);
  assert.ok(run.startupMilliseconds <= t.startupMillisecondsMaximum);
  assert.ok(run.measuredActiveWorkloadCpuSeconds <= t.measuredActiveWorkloadCpuSecondsMaximum);
  assert.ok(run.routeP95Milliseconds <= t.routeP95MillisecondsMaximum);
  assert.ok(run.routeP99Milliseconds <= t.routeP99MillisecondsMaximum);
  assert.ok(run.apiP95Milliseconds <= t.apiP95MillisecondsMaximum);
  assert.ok(run.maximumHtmlBytes <= t.htmlResponseBytesMaximum);
  assert.ok(run.guidanceP95Milliseconds <= t.guidanceP95MillisecondsMaximum);
  assert.ok(run.guidanceP99Milliseconds <= t.guidanceP99MillisecondsMaximum);
  assert.equal(run.events.gpuProcessCrashes, 0);
  assert.equal(run.events.gpuProcessUnexplainedRestarts, 0);
  assert.equal(run.events.rendererHangs, 0);
  assert.equal(run.events.mainOrRendererCrashes, 0);
  assert.equal(run.events.softwareFallbackEvents, 0);

  if (profile === "qualification") {
    assert.equal(run.gpuFeatureProof.hardwareAccelerationEnabled, true);
    assert.equal(run.gpuFeatureProof.forcedAccelerationFlagsUsed, false);
    assert.equal(run.gpuFeatureProof.method, "ownership-verified-package-process-and-windows-gpu-engine");
    assert.equal(run.gpuFeatureProof.webglClaimed, false);
    evaluateFullAccessibility(run.accessibility);
  } else {
    assert.equal(run.accessibility.windowsUiaAvailable, true);
    assert.ok(run.accessibility.installedWindowRoots >= 1);
    assert.ok(run.accessibility.namedEnabledFocusables >= 1);
    assert.equal(run.accessibility.unnamedEnabledFocusables, 0);
    assert.equal(run.accessibility.frozenSourceContractPassed, true);
  }

  return {
    result: "passed",
    profile,
    samples: run.samples.length,
    gpuSamples: gpuSamples.length,
    totalProcessTreePeakWorkingSetMiB: round(totalPeak),
    gpuPrivateWorkingSetMiBP95: round(gpuP95),
    gpuPrivateWorkingSetMiBPeak: round(gpuPeak),
    processTreeCpuPercentP95: round(cpuP95),
    positiveGpuEngineSamples,
  };
}

export function evaluateMission(mission) {
  assert.equal(mission.cycles.length, contract.qualificationProtocol.independentCycles);
  assert.ok(mission.cycles.every(cycle => cycle.freshPackageAndTrustLifecycle === true));
  assert.equal(new Set(mission.cycles.map(cycle => cycle.packageSha256)).size, 1);
  assert.equal(new Set(mission.cycles.map(cycle => cycle.configurationSha256)).size, 1);
  const cycles = mission.cycles.map(cycle => evaluateRun(cycle, "qualification"));
  return { result: "passed", cycles };
}

function evaluateFullAccessibility(accessibility) {
  const a = contract.accessibilityAcceptance;
  assert.deepEqual(accessibility.routes.map(route => route.id), contract.qualificationProtocol.requiredRoutes);
  for (const route of accessibility.routes) {
    assert.equal(route.documentLanguage, a.documentLanguage);
    assert.ok(route.mainLandmarks >= a.mainLandmarksMinimumPerRoute);
    assert.ok(route.levelOneHeadings >= a.levelOneHeadingsMinimumPerRoute);
    assert.equal(route.unnamedEnabledFocusables, 0);
    assert.equal(route.positiveTabIndexCount, 0);
    assert.equal(route.keyboardTrapCount, 0);
    assert.equal(route.focusIndicatorPassed, true);
    assert.equal(route.naturalKeyboardOrderPassed, true);
    assert.equal(route.semanticSnapshotPassed, true);
    assert.equal(route.liveRegionSemanticsPassed, true);
    assert.equal(route.contrastViolations, 0);
    assert.equal(route.horizontalOverflowAt200PercentPixels, 0);
    assert.equal(route.reducedMotionRenderedPassed, true);
  }
  assert.equal(accessibility.externalAssistiveTechnologyCertificationClaimed, false);
}

function runGitShow(gitPath, objectName) {
  const result = spawnSync(gitPath, ["show", objectName], {
    cwd: repositoryRoot,
    encoding: "utf8",
    shell: false,
    maxBuffer: 8 * 1024 * 1024,
  });
  validateProcessEnvelope(result, "git show");
  return result.stdout;
}

function round(value) {
  return Number(value.toFixed(3));
}
