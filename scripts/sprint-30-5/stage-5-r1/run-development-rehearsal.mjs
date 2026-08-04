import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  contract,
  evaluateRun,
  repositoryRoot,
  validateAcceptedBindings,
  validateApprovedTool,
  validateAuthorityBoundary,
  validateProcessEnvelope,
  validateProductBoundary,
} from "./stage5-core.mjs";

validateAuthorityBoundary();
validateAcceptedBindings();
const drift = validateProductBoundary();
const git = validateApprovedTool("git");

const css = show("app/globals.css");
assert.match(css, /:focus-visible\s*\{[\s\S]*outline:\s*2px solid #67e8f9;[\s\S]*outline-offset:\s*3px;/u);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation-duration:\s*0\.01ms !important;[\s\S]*transition-duration:\s*0\.01ms !important;/u);
const layout = show("app/layout.tsx");
assert.match(layout, /<html lang="en"/u);
const appLayout = show("components/layout/AppLayout.tsx");
assert.match(appLayout, /href="#oracle-main-content"/u);
assert.match(appLayout, /id="oracle-main-content"/u);
assert.match(appLayout, /tabIndex=\{-1\}/u);
const liveRegionSources = [
  "components/companion/guidance/CompanionGuidanceStatePanel.tsx",
  "components/companion/guidance/CompanionGuidanceLive.tsx",
  "components/companion/guidance/CompanionGuidanceDiagnostics.tsx",
  "components/companion/CompanionTitleBar.tsx",
].map(show);
assert.ok(liveRegionSources.every(source => /aria-live="polite"/u.test(source)));

const samples = Array.from({ length: 8 }, (_, index) => ({
  observedAtUtc: new Date(1_787_000_000_000 + index * 500).toISOString(),
  processId: 5252,
  processType: "gpu",
  commandLine: "Oracle.exe --type=gpu-process --use-angle=d3d11",
  privateWorkingSetMiB: 72 + index,
  totalProcessTreeWorkingSetMiB: 230 + index,
  processTreeCpuPercent: 3,
  gpuEngineUtilizationPercent: index === 4 ? 2 : 0.5,
}));
const evaluation = evaluateRun({
  packageSha256: contract.package.sha256,
  configurationSha256: "b".repeat(64),
  hostIdentity: contract.host.requiredIdentity,
  productionEndpointUsed: false,
  productionCredentialUsed: false,
  stage4InstalledLifecyclePassed: true,
  zeroResidue: true,
  nonzeroExitCount: 0,
  unavailableMeasurements: [],
  unexplainedWarnings: [],
  samples,
  startupMilliseconds: 1200,
  measuredActiveWorkloadCpuSeconds: 4,
  routeP95Milliseconds: 40,
  routeP99Milliseconds: 80,
  apiP95Milliseconds: 45,
  maximumHtmlBytes: 120000,
  guidanceP95Milliseconds: 1,
  guidanceP99Milliseconds: 2,
  events: {
    gpuProcessCrashes: 0,
    gpuProcessUnexplainedRestarts: 0,
    rendererHangs: 0,
    mainOrRendererCrashes: 0,
    softwareFallbackEvents: 0,
  },
  accessibility: {
    windowsUiaAvailable: true,
    installedWindowRoots: 1,
    namedEnabledFocusables: 4,
    unnamedEnabledFocusables: 0,
    frozenSourceContractPassed: true,
  },
}, "development-rehearsal");

console.log(JSON.stringify({
  result: "passed",
  classification: contract.classification,
  rehearsalSurface: "deterministic-policy-and-exact-r6-source-contract",
  qualificationEvidence: false,
  productModified: false,
  transferCreated: false,
  authorityCreated: false,
  attemptCreated: false,
  acceptedR6MsixSha256: contract.package.sha256,
  permittedProductDrift: drift,
  frozenSourceChecks: {
    documentLanguage: true,
    focusIndicator: true,
    reducedMotion: true,
    skipTarget: true,
    mainContentTarget: true,
    liveRegions: liveRegionSources.length,
  },
  evaluation,
}, null, 2));

function show(path) {
  const result = spawnSync(git.path, ["show", contract.repository.acceptedCandidateCommit + ":" + path], {
    cwd: repositoryRoot,
    encoding: "utf8",
    shell: false,
    maxBuffer: 4 * 1024 * 1024,
  });
  validateProcessEnvelope(result, "git show " + path);
  return result.stdout;
}
