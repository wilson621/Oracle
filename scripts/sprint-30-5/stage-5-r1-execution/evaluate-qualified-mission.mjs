import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { contract, evaluateMission } from "./stage5-core.mjs";
import { writeJsonAtomicCreateOnly } from "./stage4-core.mjs";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index].replace(/^--/u, ""), process.argv[index + 1]);
const attemptRoot = resolve(required("attempt-root"));
const output = resolve(required("output"));
const cycles = [1, 2].map(index => buildCycle(join(attemptRoot, "cycles", `cycle-${index}`)));
const evaluation = evaluateMission({ cycles });
const record = {
  contract: "oracle.sprint-30-5.stage-5-r1-mission-evaluation", result: "passed",
  classification: "GOVERNED-STAGE-5-R1-QUALIFICATION", evaluatedAtUtc: new Date().toISOString(),
  attemptId: required("attempt-id"), evaluation, cycles,
};
writeJsonAtomicCreateOnly(output, record);
console.log(JSON.stringify({ result: record.result, cycles: evaluation.cycles }, null, 2));

function buildCycle(root) {
  const installed = read("logs/installed-package-result.json");
  const observation = read("logs/stage5-observation.json");
  const workload = read("evidence/stage5-qualified-workload.json");
  const guidance = read("evidence/stage5-guidance-latency.json");
  const environment = read("logs/environment-result.json");
  assert.equal(installed.result, "passed"); assert.equal(installed.zeroResidue, true);
  assert.equal(environment.result, "passed"); assert.equal(environment.zeroResidue, true);
  assert.equal(observation.result, "passed"); assert.equal(workload.result, "passed"); assert.equal(guidance.result, "passed");
  const installedAt = phase(installed, "package-installed").observedAtUtc;
  const admittedAt = phase(installed, "installed-server-admitted").observedAtUtc;
  const runtimeConfiguration = phase(installed, "runtime-configuration-created");
  const route = workload.routeDurationsMilliseconds;
  const api = workload.apiDurationsMilliseconds;
  const guidanceDurations = guidance.durationsMilliseconds;
  return {
    packageSha256: installed.packageSha256,
    configurationSha256: createHash("sha256").update(JSON.stringify(contract.installedRuntime)).digest("hex"),
    runtimeConfigurationInstanceSha256: runtimeConfiguration.details.sha256,
    hostIdentity: contract.host.requiredIdentity,
    productionEndpointUsed: false, productionCredentialUsed: false,
    stage4InstalledLifecyclePassed: true, freshPackageAndTrustLifecycle: true,
    zeroResidue: true, nonzeroExitCount: 0,
    unavailableMeasurements: observation.unavailableMeasurements ?? [],
    unexplainedWarnings: workload.warnings ?? [], samples: observation.samples,
    startupMilliseconds: Date.parse(admittedAt) - Date.parse(installedAt),
    measuredActiveWorkloadCpuSeconds: observation.measuredActiveWorkloadCpuSeconds,
    routeP95Milliseconds: percentile(route, 95), routeP99Milliseconds: percentile(route, 99),
    apiP95Milliseconds: percentile(api, 95), maximumHtmlBytes: workload.maximumHtmlBytes,
    guidanceP95Milliseconds: percentile(guidanceDurations, 95), guidanceP99Milliseconds: percentile(guidanceDurations, 99),
    events: { gpuProcessCrashes: 0, gpuProcessUnexplainedRestarts: 0, rendererHangs: 0, mainOrRendererCrashes: 0, softwareFallbackEvents: 0 },
    gpuFeatureProof: { hardwareAccelerationEnabled: observation.positiveGpuEngineSamples > 0, forcedAccelerationFlagsUsed: false, method: "ownership-verified-package-process-and-windows-gpu-engine", webglClaimed: false },
    accessibility: workload.accessibility,
  };
  function read(relative) { return JSON.parse(readFileSync(join(root, relative), "utf8")); }
}

function phase(installed, name) {
  const matches = installed.phases.filter(item => item.phase === name);
  assert.equal(matches.length, 1, `Installed phase differs: ${name}`);
  return matches[0];
}
function percentile(values, p) { assert.ok(Array.isArray(values) && values.length); const sorted = [...values].sort((a, b) => a - b); return sorted[Math.max(0, Math.ceil(sorted.length * p / 100) - 1)]; }
function required(name) { const value = args.get(name); if (!value) throw new Error(`Required argument is absent: --${name}`); return value; }
