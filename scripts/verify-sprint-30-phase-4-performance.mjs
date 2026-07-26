import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { spawn, execFileSync } from "node:child_process";

const port = 4310;
const origin = `http://127.0.0.1:${port}`;
const output =
  process.env.ORACLE_PERFORMANCE_EVIDENCE_PATH ??
  "docs/sprints/evidence/sprint-30/phase-4/generated/web-performance.json";
const evidencePhase = Number(process.env.ORACLE_PERFORMANCE_PHASE ?? "4");
const routes = [
  "/oracle",
  "/companion",
  "/sessions",
  "/reports",
  "/intelligence",
  "/coach",
  "/progress",
  "/settings",
];
const budgets = Object.freeze({
  startupMilliseconds: 15_000,
  routeP95Milliseconds: 250,
  routeP99Milliseconds: 500,
  apiP95Milliseconds: 250,
  workingSetMiB: 768,
  cpuSecondsForMeasuredWorkload: 15,
  maximumHtmlBytes: 512 * 1024,
});

assert.ok(fs.existsSync(".next/BUILD_ID"), "A production Web build is required.");

const startedAt = performance.now();
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)],
  { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"], windowsHide: true }
);
let serverOutput = "";
server.stdout.on("data", (chunk) => (serverOutput += String(chunk)));
server.stderr.on("data", (chunk) => (serverOutput += String(chunk)));

try {
  await waitForReady();
  const startupMilliseconds = performance.now() - startedAt;
  assert.ok(startupMilliseconds <= budgets.startupMilliseconds);
  const before = processMetrics(server.pid);
  const publicAuthRoute = await measurePublicAuthRoute();
  const routeResults = [];
  for (const route of routes) {
    routeResults.push(await measureRoute(route));
  }
  const apiResults = [
    await measureApi("/api/oracle/analyze", { sessionId: "phase-4-synthetic" }),
    await measureApi("/api/oracle/conversation", {}),
  ];
  const after = processMetrics(server.pid);
  const maximumRouteP95 = Math.max(...routeResults.map((result) => result.p95Milliseconds));
  const maximumRouteP99 = Math.max(...routeResults.map((result) => result.p99Milliseconds));
  const maximumApiP95 = Math.max(...apiResults.map((result) => result.p95Milliseconds));
  const peakWorkingSetMiB = Math.max(before.workingSetMiB, after.workingSetMiB);
  const cpuSeconds = Math.max(0, after.cpuSeconds - before.cpuSeconds);

  assert.ok(maximumRouteP95 <= budgets.routeP95Milliseconds);
  assert.ok(maximumRouteP99 <= budgets.routeP99Milliseconds);
  assert.ok(maximumApiP95 <= budgets.apiP95Milliseconds);
  assert.ok(peakWorkingSetMiB <= budgets.workingSetMiB);
  assert.ok(cpuSeconds <= budgets.cpuSecondsForMeasuredWorkload);

  const evidence = {
    schemaVersion: 1,
    contract: "oracle.local-performance-qualification",
    contractVersion: 1,
    phase: evidencePhase,
    result: "passed",
    scope: "current-host-production-build-with-synthetic-requests",
    budgets,
    observed: {
      startupMilliseconds: round(startupMilliseconds),
      maximumRouteP95Milliseconds: round(maximumRouteP95),
      maximumRouteP99Milliseconds: round(maximumRouteP99),
      maximumApiP95Milliseconds: round(maximumApiP95),
      peakWorkingSetMiB: round(peakWorkingSetMiB),
      cpuSecondsForMeasuredWorkload: round(cpuSeconds),
    },
    routes: routeResults,
    publicAuthRoute,
    apiBoundaries: apiResults,
    protectedRenderedRoutes: {
      result: "unavailable",
      reason:
        "The approved environment has no live Supabase Auth provider; protected routes correctly redirect to authentication.",
      passClaimed: false,
    },
    gpu: {
      result: "unavailable",
      reason:
        "Installed clean-Windows Electron GPU-process measurement requires the deferred disposable Windows environment.",
      passClaimed: false,
    },
    limitations: [
      "Local loopback timings do not establish production network performance.",
      "Protected route and API measurements prove the authentication boundary only, not inner route rendering or active persisted consumers.",
      "GPU qualification is unavailable and is not represented as passed.",
    ],
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log("Sprint 30 Phase 4 local performance qualification passed.");
} finally {
  server.kill("SIGTERM");
}

async function waitForReady() {
  const deadline = Date.now() + budgets.startupMilliseconds;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next server exited before readiness.\n${serverOutput}`);
    }
    try {
      const response = await fetch(`${origin}/oracle`);
      if (response.status === 200) return;
    } catch {
      // Expected while the bounded loopback server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Next server did not become ready.\n${serverOutput}`);
}

async function measureRoute(route) {
  await fetch(`${origin}${route}`, { redirect: "manual" });
  const durations = [];
  let bytes = 0;
  let location = "";
  for (let index = 0; index < 15; index += 1) {
    const started = performance.now();
    const response = await fetch(`${origin}${route}`, { redirect: "manual" });
    const body = await response.arrayBuffer();
    durations.push(performance.now() - started);
    bytes = body.byteLength;
    location = response.headers.get("location") ?? "";
    assert.equal(response.status, 307, `${route} did not enforce authentication.`);
    assert.match(location, /^\/auth\?next=/u);
    assert.ok(bytes <= budgets.maximumHtmlBytes, `${route} exceeded the HTML budget.`);
  }
  return summarize(route, durations, {
    status: 307,
    bytes,
    result: "authentication-boundary-passed",
    location,
  });
}

async function measurePublicAuthRoute() {
  const durations = [];
  let bytes = 0;
  for (let index = 0; index < 15; index += 1) {
    const started = performance.now();
    const response = await fetch(`${origin}/auth`);
    const body = await response.arrayBuffer();
    durations.push(performance.now() - started);
    bytes = body.byteLength;
    assert.equal(response.status, 200);
    assert.ok(bytes <= budgets.maximumHtmlBytes);
  }
  return summarize("/auth", durations, { status: 200, bytes, result: "passed" });
}

async function measureApi(route, body) {
  const durations = [];
  for (let index = 0; index < 15; index += 1) {
    const started = performance.now();
    const response = await fetch(`${origin}${route}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      redirect: "manual",
    });
    await response.arrayBuffer();
    durations.push(performance.now() - started);
    assert.equal(response.status, 307);
    assert.match(response.headers.get("location") ?? "", /^\/auth\?next=/u);
  }
  return summarize(route, durations, {
    status: 307,
    result: "authentication-boundary-passed",
    innerHandler: "unavailable-without-live-auth",
  });
}

function summarize(id, durations, detail) {
  durations.sort((left, right) => left - right);
  return {
    id,
    ...detail,
    samples: durations.length,
    p50Milliseconds: round(percentile(durations, 50)),
    p95Milliseconds: round(percentile(durations, 95)),
    p99Milliseconds: round(percentile(durations, 99)),
    maximumMilliseconds: round(durations.at(-1) ?? 0),
  };
}

function processMetrics(pid) {
  const script =
    `(Get-Process -Id ${pid} | Select-Object CPU,WorkingSet64 | ConvertTo-Json -Compress)`;
  const value = JSON.parse(
    execFileSync("powershell", ["-NoProfile", "-Command", script], {
      encoding: "utf8",
    })
  );
  return {
    cpuSeconds: Number(value.CPU ?? 0),
    workingSetMiB: Number(value.WorkingSet64 ?? 0) / 1024 / 1024,
  };
}

function percentile(values, percentage) {
  return values[Math.max(0, Math.ceil((percentage / 100) * values.length) - 1)] ?? 0;
}

function round(value) {
  return Number(value.toFixed(3));
}
