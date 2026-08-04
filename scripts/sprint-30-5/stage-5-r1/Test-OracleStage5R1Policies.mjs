import assert from "node:assert/strict";
import { contract, evaluateMission, evaluateRun } from "./stage5-core.mjs";

const valid = makeRun("qualification");
assert.equal(evaluateRun(valid, "qualification").result, "passed");
const second = structuredClone(valid);
second.configurationSha256 = valid.configurationSha256;
assert.equal(evaluateMission({ cycles: [
  { ...valid, freshPackageAndTrustLifecycle: true },
  { ...second, freshPackageAndTrustLifecycle: true },
] }).result, "passed");

const adversarial = [
  ["wrong package hash", run => { run.packageSha256 = "0".repeat(64); }],
  ["wrong host", run => { run.hostIdentity = "Other-Host"; }],
  ["production endpoint", run => { run.productionEndpointUsed = true; }],
  ["production credential", run => { run.productionCredentialUsed = true; }],
  ["stage4 lifecycle absent", run => { run.stage4InstalledLifecyclePassed = false; }],
  ["residue", run => { run.zeroResidue = false; }],
  ["nonzero exit", run => { run.nonzeroExitCount = 1; }],
  ["unavailable metric", run => { run.unavailableMeasurements.push("gpu-engine"); }],
  ["unexplained warning", run => { run.unexplainedWarnings.push("gpu warning"); }],
  ["insufficient samples", run => { run.samples.length = 10; }],
  ["gpu restart", run => { run.samples[1].processId = 9999; }],
  ["software fallback", run => { run.samples[0].commandLine += " --use-angle=swiftshader"; }],
  ["process-tree memory", run => { run.samples[0].totalProcessTreeWorkingSetMiB = 769; }],
  ["gpu p95 memory", run => { for (const sample of run.samples) sample.privateWorkingSetMiB = 257; }],
  ["gpu peak memory", run => { run.samples[0].privateWorkingSetMiB = 385; }],
  ["cpu p95", run => { for (const sample of run.samples) sample.processTreeCpuPercent = 16; }],
  ["no GPU engine activity", run => { for (const sample of run.samples) sample.gpuEngineUtilizationPercent = 0; }],
  ["startup", run => { run.startupMilliseconds = 15001; }],
  ["active CPU", run => { run.measuredActiveWorkloadCpuSeconds = 15.001; }],
  ["route p95", run => { run.routeP95Milliseconds = 251; }],
  ["route p99", run => { run.routeP99Milliseconds = 501; }],
  ["api p95", run => { run.apiP95Milliseconds = 251; }],
  ["response size", run => { run.maximumHtmlBytes = 524289; }],
  ["guidance p95", run => { run.guidanceP95Milliseconds = 5.001; }],
  ["guidance p99", run => { run.guidanceP99Milliseconds = 10.001; }],
  ["gpu crash", run => { run.events.gpuProcessCrashes = 1; }],
  ["gpu restart event", run => { run.events.gpuProcessUnexplainedRestarts = 1; }],
  ["renderer hang", run => { run.events.rendererHangs = 1; }],
  ["renderer crash", run => { run.events.mainOrRendererCrashes = 1; }],
  ["fallback event", run => { run.events.softwareFallbackEvents = 1; }],
  ["hardware acceleration absent", run => { run.gpuFeatureProof.hardwareAccelerationEnabled = false; }],
  ["forced acceleration flag", run => { run.gpuFeatureProof.forcedAccelerationFlagsUsed = true; }],
  ["wrong hardware proof", run => { run.gpuFeatureProof.method = "host-capability-inference"; }],
  ["false webgl claim", run => { run.gpuFeatureProof.webglClaimed = true; }],
  ["route omitted", run => { run.accessibility.routes.pop(); }],
  ["wrong document language", run => { run.accessibility.routes[0].documentLanguage = "fr"; }],
  ["main landmark absent", run => { run.accessibility.routes[0].mainLandmarks = 0; }],
  ["heading absent", run => { run.accessibility.routes[0].levelOneHeadings = 0; }],
  ["unnamed focusable", run => { run.accessibility.routes[0].unnamedEnabledFocusables = 1; }],
  ["positive tabindex", run => { run.accessibility.routes[0].positiveTabIndexCount = 1; }],
  ["keyboard trap", run => { run.accessibility.routes[0].keyboardTrapCount = 1; }],
  ["focus invisible", run => { run.accessibility.routes[0].focusIndicatorPassed = false; }],
  ["unnatural keyboard order", run => { run.accessibility.routes[0].naturalKeyboardOrderPassed = false; }],
  ["semantic snapshot absent", run => { run.accessibility.routes[0].semanticSnapshotPassed = false; }],
  ["live region failure", run => { run.accessibility.routes[0].liveRegionSemanticsPassed = false; }],
  ["contrast failure", run => { run.accessibility.routes[0].contrastViolations = 1; }],
  ["reflow overflow", run => { run.accessibility.routes[0].horizontalOverflowAt200PercentPixels = 1; }],
  ["reduced motion failure", run => { run.accessibility.routes[0].reducedMotionRenderedPassed = false; }],
  ["false assistive technology claim", run => { run.accessibility.externalAssistiveTechnologyCertificationClaimed = true; }],
];

for (const [name, mutate] of adversarial) {
  const candidate = structuredClone(valid);
  mutate(candidate);
  assert.throws(() => evaluateRun(candidate, "qualification"), undefined, name);
}

const rehearsal = makeRun("development-rehearsal");
rehearsal.samples.length = contract.developmentRehearsalProfile.minimumInstalledSamples;
delete rehearsal.gpuFeatureProof;
rehearsal.accessibility = {
  windowsUiaAvailable: true,
  installedWindowRoots: 1,
  namedEnabledFocusables: 4,
  unnamedEnabledFocusables: 0,
  frozenSourceContractPassed: true,
};
assert.equal(evaluateRun(rehearsal, "development-rehearsal").result, "passed");
for (const [name, mutate] of [
  ["UIA unavailable", run => { run.accessibility.windowsUiaAvailable = false; }],
  ["no installed window", run => { run.accessibility.installedWindowRoots = 0; }],
  ["no named focusable", run => { run.accessibility.namedEnabledFocusables = 0; }],
  ["unnamed installed focusable", run => { run.accessibility.unnamedEnabledFocusables = 1; }],
  ["source accessibility contract absent", run => { run.accessibility.frozenSourceContractPassed = false; }],
]) {
  const candidate = structuredClone(rehearsal);
  mutate(candidate);
  assert.throws(() => evaluateRun(candidate, "development-rehearsal"), undefined, name);
}

assert.throws(() => evaluateMission({ cycles: [{ ...valid, freshPackageAndTrustLifecycle: true }] }));
const mismatched = structuredClone(second);
mismatched.configurationSha256 = "f".repeat(64);
assert.throws(() => evaluateMission({ cycles: [
  { ...valid, freshPackageAndTrustLifecycle: true },
  { ...mismatched, freshPackageAndTrustLifecycle: true },
] }));

console.log(JSON.stringify({
  result: "passed",
  qualificationPositiveCases: 2,
  qualificationAdversarialCases: adversarial.length + 2,
  rehearsalPositiveCases: 1,
  rehearsalAdversarialCases: 5,
  unavailableFailsClosed: true,
  productModificationExercised: false,
  authorityCreated: false,
  transferCreated: false,
  attemptCreated: false
}, null, 2));

function makeRun(profile) {
  const sampleCount = profile === "qualification" ? 5400 : 8;
  const samples = Array.from({ length: sampleCount }, (_, index) => ({
    observedAtUtc: new Date(1_787_000_000_000 + index * 1000).toISOString(),
    processId: 4242,
    processType: "gpu",
    commandLine: "Oracle.exe --type=gpu-process --use-angle=d3d11",
    privateWorkingSetMiB: 80 + (index % 10),
    totalProcessTreeWorkingSetMiB: 240 + (index % 20),
    processTreeCpuPercent: 2 + (index % 3),
    gpuEngineUtilizationPercent: index % 5 === 0 ? 1.5 : 0.5
  }));
  const routes = contract.qualificationProtocol.requiredRoutes.map(id => ({
    id,
    documentLanguage: "en",
    mainLandmarks: 1,
    levelOneHeadings: 1,
    unnamedEnabledFocusables: 0,
    positiveTabIndexCount: 0,
    keyboardTrapCount: 0,
    focusIndicatorPassed: true,
    naturalKeyboardOrderPassed: true,
    semanticSnapshotPassed: true,
    liveRegionSemanticsPassed: true,
    contrastViolations: 0,
    horizontalOverflowAt200PercentPixels: 0,
    reducedMotionRenderedPassed: true
  }));
  return {
    packageSha256: contract.package.sha256,
    configurationSha256: "a".repeat(64),
    hostIdentity: profile === "qualification" ? contract.host.requiredIdentity : contract.developmentRehearsalProfile.requiredHostIdentity,
    productionEndpointUsed: false,
    productionCredentialUsed: false,
    stage4InstalledLifecyclePassed: true,
    zeroResidue: true,
    nonzeroExitCount: 0,
    unavailableMeasurements: [],
    unexplainedWarnings: [],
    samples,
    startupMilliseconds: 1000,
    measuredActiveWorkloadCpuSeconds: 5,
    routeP95Milliseconds: 50,
    routeP99Milliseconds: 100,
    apiP95Milliseconds: 50,
    maximumHtmlBytes: 100000,
    guidanceP95Milliseconds: 1,
    guidanceP99Milliseconds: 2,
    events: {
      gpuProcessCrashes: 0,
      gpuProcessUnexplainedRestarts: 0,
      rendererHangs: 0,
      mainOrRendererCrashes: 0,
      softwareFallbackEvents: 0
    },
    gpuFeatureProof: {
      hardwareAccelerationEnabled: true,
      forcedAccelerationFlagsUsed: false,
      method: "ownership-verified-package-process-and-windows-gpu-engine",
      webglClaimed: false
    },
    accessibility: {
      routes,
      externalAssistiveTechnologyCertificationClaimed: false
    }
  };
}
