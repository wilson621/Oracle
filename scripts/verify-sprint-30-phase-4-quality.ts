import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import type { OracleCompanionGuidanceRequest } from "../lib/companion/guidance/index.js";
import { createCallOfDutyCuratedGuidanceProvider } from "../lib/oracle/game-integrations/call-of-duty/guidance/index.js";
import { OracleCompanionGuidanceProviderService } from "../lib/oracle/services/companion-guidance/index.js";

const root = process.cwd();
const output =
  "docs/sprints/evidence/sprint-30/phase-4/generated/quality-contract.json";
const guidanceBudget = Object.freeze({
  samples: 1_000,
  warmupSamples: 50,
  p95Milliseconds: 5,
  p99Milliseconds: 10,
});

void verify();

async function verify(): Promise<void> {
  verifyAccessibilityFoundations();
  verifySupportGovernance();
  const guidance = await verifyGuidanceLatency();

  const evidence = {
    schemaVersion: 1,
    contract: "oracle.production-quality-contract",
    contractVersion: 1,
    phase: 4,
    result: "passed",
    scope: "local-source-and-synthetic-qualification",
    accessibility: {
      keyboardSkipTarget: "passed",
      globalFocusIndicator: "passed",
      reducedMotionOverride: "passed",
      documentLanguage: "passed",
      labelledNavigation: "passed",
      publicAuthenticationRenderedReview:
        "passed-with-method-limitations-in-browser-evidence",
      protectedCanonicalRouteRenderedReview:
        "unavailable-without-live-auth",
    },
    guidance,
    compatibility: {
      currentWindowsHost: "qualified-locally",
      cleanDisposableWindows: "deferred",
      liveSupabaseAuth: "unavailable",
      minecraftObservation: "disabled-provisional",
    },
    authority: {
      production: "unchanged",
      externalDiagnostics: "disabled",
      runtimePersistence: "disabled",
      signing: "not-authorised",
      publication: "not-authorised",
      distribution: "not-authorised",
      remotePush: "not-authorised",
      gate7: "not-authorised",
    },
  };

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log("Sprint 30 Phase 4 quality contract verification passed.");
}

function verifyAccessibilityFoundations(): void {
  const css = read("app/globals.css");
  const layout = read("app/layout.tsx");
  const appLayout = read("components/layout/AppLayout.tsx");
  const navigation = read("components/navigation/Sidebar.tsx");

  assert.match(css, /:focus-visible\s*\{/u);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/u);
  assert.match(css, /animation-duration:\s*0\.01ms\s*!important/u);
  assert.match(css, /transition-duration:\s*0\.01ms\s*!important/u);
  assert.match(layout, /<html\s+lang="en"/u);
  assert.match(appLayout, /href="#oracle-main-content"/u);
  assert.match(appLayout, /id="oracle-main-content"/u);
  assert.match(navigation, /<nav/u);
  assert.match(navigation, /aria-label=\{section\.section\}/u);
  assert.match(navigation, /aria-current=\{active\s*\?\s*"page"/u);
}

function verifySupportGovernance(): void {
  const matrix = read("docs/sprints/SPRINT_30_PHASE_4_COMPATIBILITY_MATRIX.md");
  const runbook = read("docs/runbooks/SPRINT_30_LOCAL_SUPPORT_AND_TRIAGE.md");
  const warnings = read("docs/sprints/SPRINT_30_PHASE_4_WARNING_REGISTER.md");

  for (const required of [
    "Clean-Machine Certification Deferred",
    "Live Supabase Auth",
    "provisionally-certified",
    "`1.7.0`",
    "Release Manifest",
  ]) {
    assert.ok(matrix.includes(required), `Compatibility matrix is missing ${required}.`);
  }
  for (const required of [
    "Never request",
    "Severity 1",
    "diagnostic",
    "escalat",
    "non-authoritative",
  ]) {
    assert.ok(
      runbook.toLowerCase().includes(required.toLowerCase()),
      `Support runbook is missing ${required}.`
    );
  }
  assert.match(warnings, /\|\s*W-[0-9]{3}\s*\|/u);
  assert.match(warnings, /No open critical or high-severity source finding/u);
}

async function verifyGuidanceLatency() {
  const service = new OracleCompanionGuidanceProviderService([
    createCallOfDutyCuratedGuidanceProvider(),
  ]);
  const request = createGuidanceRequest();

  for (let index = 0; index < guidanceBudget.warmupSamples; index += 1) {
    await service.execute(request);
  }
  const durations: number[] = [];
  for (let index = 0; index < guidanceBudget.samples; index += 1) {
    const started = performance.now();
    const result = await service.execute(request);
    durations.push(performance.now() - started);
    assert.equal(result.guidance.length, 4);
    assert.equal(result.failures.length, 0);
  }
  durations.sort((left, right) => left - right);
  const p95 = percentile(durations, 95);
  const p99 = percentile(durations, 99);
  assert.ok(p95 <= guidanceBudget.p95Milliseconds, `Guidance p95 ${p95}ms exceeded budget.`);
  assert.ok(p99 <= guidanceBudget.p99Milliseconds, `Guidance p99 ${p99}ms exceeded budget.`);
  return {
    result: "passed",
    budget: guidanceBudget,
    observed: {
      p50Milliseconds: round(percentile(durations, 50)),
      p95Milliseconds: round(p95),
      p99Milliseconds: round(p99),
      maximumMilliseconds: round(durations.at(-1) ?? 0),
    },
    workload: "deterministic-curated-warzone-provider",
    retained: false,
  };
}

function createGuidanceRequest(): OracleCompanionGuidanceRequest {
  const timestamp = "2026-07-26T09:00:00.000Z";
  const request: OracleCompanionGuidanceRequest = {
    contract: { name: "oracle.companion-guidance-request", version: 1 },
    requestId: "sprint-30-phase-4-guidance-latency",
    requestedAt: timestamp,
    session: {
      contract: {
        name: "oracle.companion-guidance-session-projection",
        version: 1,
      },
      sessionId: "sprint-30-phase-4-session",
      capturedAt: timestamp,
      context: {},
      game: {
        integrationId: "call-of-duty",
        gameName: "Call of Duty",
        integrationVersion: "1.0.0",
        context: {
          supportedExperience: "warzone",
          detectedExperience: "warzone",
        },
      },
    },
    category: null,
    type: null,
    operatorPrompt: null,
    maximumSpoilerLevel: "none",
  };
  return Object.freeze(request);
}

function percentile(values: readonly number[], percentage: number): number {
  return values[Math.max(0, Math.ceil((percentage / 100) * values.length) - 1)] ?? 0;
}

function round(value: number): number {
  return Number(value.toFixed(3));
}

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}
