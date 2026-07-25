import assert from "node:assert/strict";
import fs from "node:fs";
import {
  OracleCompanionGuidanceDeliveryCoordinator,
} from "../desktop/companion/companion-guidance-delivery-coordinator";
import type {
  OracleCompanionSession,
} from "../desktop/companion/companion-session";
import {
  createCallOfDutyCuratedGuidanceProvider,
} from "../lib/oracle/game-integrations/call-of-duty/guidance";
import {
  isCompanionGuidanceApplicationState,
} from "../lib/oracle/applications/companion";
import {
  OracleCompanionGuidanceProviderService,
  type OracleCompanionGuidanceServiceResult,
} from "../lib/oracle/services/companion-guidance";

const NOW = "2026-07-25T12:00:00.000Z";

async function main(): Promise<void> {
  const cases = [];
  cases.push(await verifyAttachedOfflineGuidance());
  cases.push(await verifyBoundedControls());
  cases.push(await verifyDetachInvalidation());
  cases.push(await verifyStaleAsyncSuppression());
  cases.push(await verifyRecoveryAndFreshConstruction());
  cases.push(await verifySourceFreshness());
  cases.push(await verifyProviderFailure());
  cases.push(verifyRendererValidation());
  cases.push(verifyRestrictedDeliveryWiring());
  writeEvidence(cases);
  console.log("Sprint 26 Companion Guidance delivery verification passed.");
}

async function verifyAttachedOfflineGuidance() {
  const coordinator = createCoordinator();
  coordinator.synchronise(attachedSession("desktop-session-1"));
  assert.equal(coordinator.getState().status, "loading");
  await settle();
  const state = coordinator.getState();
  assert.equal(state.status, "ready");
  assert.ok(state.cards.length > 0);
  assert.equal(Object.isFrozen(state), true);
  assert.equal(state.cards.every(({ spoiler }) => spoiler.id === "none"), true);
  return "attached-offline-curated-guidance";
}

async function verifyBoundedControls() {
  const coordinator = createCoordinator();
  coordinator.synchronise(attachedSession("desktop-session-2"));
  await settle();
  const state = await coordinator.request({
    category: "performance",
    maximumSpoilerLevel: "none",
  });
  assert.equal(state.status, "ready");
  assert.equal(
    state.cards.every(({ category }) => category.id === "performance"),
    true
  );
  await assert.rejects(
    coordinator.request({
      category: "performance",
      maximumSpoilerLevel: "none",
      controller: "forbidden",
    }),
    /shape is invalid/u
  );
  return "bounded-transient-controls";
}

async function verifyDetachInvalidation() {
  const coordinator = createCoordinator();
  coordinator.synchronise(attachedSession("desktop-session-3"));
  await settle();
  assert.equal(coordinator.getState().status, "ready");
  coordinator.synchronise(readySession("desktop-session-3"));
  assert.equal(coordinator.getState().status, "unavailable");
  assert.equal(coordinator.getState().cards.length, 0);
  return "detach-clears-guidance";
}

async function verifyStaleAsyncSuppression() {
  let resolve!: (result: OracleCompanionGuidanceServiceResult) => void;
  const delayed = new Promise<OracleCompanionGuidanceServiceResult>(
    (done) => { resolve = done; }
  );
  const coordinator = new OracleCompanionGuidanceDeliveryCoordinator(
    { execute: async () => delayed },
    () => NOW
  );
  coordinator.synchronise(attachedSession("desktop-session-4"));
  assert.equal(coordinator.getState().status, "loading");
  coordinator.synchronise(readySession("desktop-session-4"));
  resolve(Object.freeze({
    guidance: Object.freeze([]),
    failures: Object.freeze([]),
    providers: Object.freeze([]),
  }));
  await settle();
  assert.equal(coordinator.getState().status, "unavailable");
  return "stale-async-result-suppressed";
}

async function verifyProviderFailure() {
  const coordinator = new OracleCompanionGuidanceDeliveryCoordinator(
    { execute: async () => { throw new Error("provider secret"); } },
    () => NOW
  );
  coordinator.synchronise(attachedSession("desktop-session-5"));
  await settle();
  const state = coordinator.getState();
  assert.equal(state.status, "unavailable");
  assert.doesNotMatch(JSON.stringify(state), /provider secret/u);
  return "provider-failure-unavailable";
}

async function verifyRecoveryAndFreshConstruction() {
  const coordinator = createCoordinator();
  const session = attachedSession("desktop-session-recovery");
  coordinator.synchronise(session);
  await settle();
  assert.equal(coordinator.getState().status, "ready");
  coordinator.invalidate();
  assert.equal(coordinator.getState().status, "unavailable");
  coordinator.synchronise(session);
  assert.equal(coordinator.getState().status, "loading");
  await settle();
  assert.equal(coordinator.getState().status, "ready");
  return "recovery-builds-fresh-delivery";
}

async function verifySourceFreshness() {
  const coordinator = new OracleCompanionGuidanceDeliveryCoordinator(
    new OracleCompanionGuidanceProviderService([
      createCallOfDutyCuratedGuidanceProvider(),
    ]),
    () => "2027-02-01T12:00:00.000Z"
  );
  coordinator.synchronise(attachedSession("desktop-session-stale-source"));
  await settle();
  assert.equal(coordinator.getState().status, "empty");
  assert.equal(coordinator.getState().cards.length, 0);
  return "stale-reviewed-source-omitted";
}

function verifyRendererValidation() {
  const state = createCoordinator().getState();
  assert.equal(isCompanionGuidanceApplicationState(state), true);
  assert.equal(
    isCompanionGuidanceApplicationState({
      ...state,
      controller: { nativeHandle: "forbidden" },
    }),
    false
  );
  return "renderer-state-validation";
}

function verifyRestrictedDeliveryWiring() {
  const main = fs.readFileSync("desktop/main.ts", "utf8");
  const preload = fs.readFileSync("desktop/preload.ts", "utf8");
  const shell = fs.readFileSync("desktop/main.ts", "utf8");
  const coordinator = fs.readFileSync(
    "desktop/companion/companion-guidance-delivery-coordinator.ts",
    "utf8"
  );
  assert.match(main, /requireAuthorizedController/u);
  assert.match(preload, /isCompanionGuidanceApplicationState/u);
  assert.match(shell, /localhost:3000\/companion/u);
  assert.doesNotMatch(
    coordinator,
    /Repository|persist|history|nativeHandle|processId/iu
  );
  return "restricted-renderer-and-no-retention";
}

function createCoordinator() {
  return new OracleCompanionGuidanceDeliveryCoordinator(
    new OracleCompanionGuidanceProviderService([
      createCallOfDutyCuratedGuidanceProvider(),
    ]),
    () => NOW
  );
}

function attachedSession(id: string): OracleCompanionSession {
  return {
    id,
    status: "attached",
    startedAt: NOW,
    updatedAt: NOW,
    endedAt: null,
    durableCorrelation: null,
    currentContext: {
      capturedAt: NOW,
      desktop: null,
      game: {
        integrationId: "call-of-duty",
        gameName: "Call of Duty",
        version: "1.0.0",
        state: {
          supportedExperience: "warzone",
          detectedExperience: "warzone",
        },
      },
    },
  };
}

function readySession(id: string): OracleCompanionSession {
  return {
    ...attachedSession(id),
    status: "ready",
    currentContext: {
      capturedAt: NOW,
      desktop: null,
      game: null,
    },
  };
}

function settle(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

function writeEvidence(cases: readonly string[]): void {
  const directory = "docs/sprints/evidence/sprint-26/generated";
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    `${directory}/companion-guidance-delivery-certification.json`,
    `${JSON.stringify({
      schemaVersion: 1,
      verifiedAt: new Date().toISOString(),
      contract: "oracle.companion-guidance-delivery",
      contractVersion: 1,
      cases,
      guidanceContractVersion: 1,
      desktopPlatformApiVersion: 1,
      persistence: "disabled",
      retention: "none",
      migrationCreated: false,
      deployment: "not-authorised",
      result: "pass",
    }, null, 2)}\n`,
    "utf8"
  );
}

void main();
