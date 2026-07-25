import assert from "node:assert/strict";
import fs from "node:fs";
import {
  ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE,
  ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE_VERSION,
  createOracleGameIntegrationCompatibilityCertificate,
  resolveOracleGameIntegrationCompatibility,
  type OracleGameIntegrationCompatibilityCertificate,
} from "../lib/oracle/game-integrations/compatibility";
import {
  MINECRAFT_JAVA_COMPATIBILITY_CERTIFICATE,
  MinecraftJavaIntegration,
  createMinecraftJavaDiamondGuidanceProvider,
} from "../lib/oracle/game-integrations/minecraft-java";
import {
  createOracleCompanionGuidanceRequest,
} from "../lib/companion/guidance";
import {
  OracleCompanionScreenObservationCoordinator,
  type OracleCompanionRawFrame,
} from "../desktop/companion/companion-screen-observation-coordinator";
import type {
  OracleCompanionSession,
} from "../desktop/companion/companion-session";
import type {
  OracleDesktopAttachmentTarget,
} from "../desktop/overlay/attachment-state";

const NOW = "2026-07-25T12:00:00.000Z";

async function main(): Promise<void> {
  const cases = [
    verifyCertificateLifecycle(),
    verifyExactMinecraftDetection(),
    await verifyGuidanceJourney(),
    await verifyEphemeralObservation(),
    verifyStaticBoundaries(),
  ];
  const directory = "docs/sprints/evidence/sprint-27/generated";
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    `${directory}/sprint-27-certification.json`,
    `${JSON.stringify({
      sprint: 27,
      generatedAt: new Date().toISOString(),
      result: "passed",
      cases: cases.flat(),
      migrationIntroduced: false,
      persistenceActivated: false,
      rawFrameRetention: false,
      externalProcessing: false,
      multiplayerSupport: false,
      automatedInput: false,
    }, null, 2)}\n`,
    "utf8"
  );
  console.log("Sprint 27 bounded Minecraft certification passed.");
}

function verifyCertificateLifecycle(): string[] {
  const exact = exactRuntimeProfile();
  const certified = resolveOracleGameIntegrationCompatibility(
    MINECRAFT_JAVA_COMPATIBILITY_CERTIFICATE,
    exact,
    NOW
  );
  assert.equal(certified.effectiveState, "certified");
  assert.equal(certified.exactProfileMatch, true);
  assert.ok(certified.eligibleCapabilities.includes("observation"));

  const provisional = createCertificate({
    state: "provisionally-certified",
    verifiedCapabilities: ["detection", "context"],
    uncertainCapabilities: ["observation", "guidance", "transient-progress"],
    stateReason: "Observation and Guidance await re-verification.",
  });
  const provisionalResolution = resolveOracleGameIntegrationCompatibility(
    provisional,
    exact,
    NOW
  );
  assert.deepEqual(
    provisionalResolution.eligibleCapabilities,
    ["detection", "context"]
  );
  assert.ok(provisionalResolution.disabledCapabilities.includes("observation"));

  const expired = resolveOracleGameIntegrationCompatibility(
    MINECRAFT_JAVA_COMPATIBILITY_CERTIFICATE,
    exact,
    "2026-10-23T00:00:00.000Z"
  );
  assert.equal(expired.effectiveState, "expired");
  assert.equal(expired.eligibleCapabilities.length, 0);

  const revoked = createCertificate({
    state: "revoked",
    verifiedCapabilities: [],
    uncertainCapabilities: [],
    stateReason: "Publisher policy materially changed.",
  });
  assert.equal(
    resolveOracleGameIntegrationCompatibility(revoked, exact, NOW)
      .eligibleCapabilities.length,
    0
  );

  const mismatch = resolveOracleGameIntegrationCompatibility(
    MINECRAFT_JAVA_COMPATIBILITY_CERTIFICATE,
    { ...exact, playerMode: "multiplayer" },
    NOW
  );
  assert.equal(mismatch.exactProfileMatch, false);
  assert.equal(mismatch.eligibleCapabilities.length, 0);

  assert.throws(
    () => createCertificate({
      expiresAt: "2026-10-24T00:00:00.000Z",
    }),
    /90-day/u
  );
  return [
    "certified-lifecycle",
    "provisional-uncertainty-fails-closed",
    "expiry-fails-closed",
    "revocation-fails-closed",
    "exact-profile-required",
    "ninety-day-review-maximum",
  ];
}

function verifyExactMinecraftDetection(): string[] {
  const integration = new MinecraftJavaIntegration();
  const exact = {
    processId: 27,
    processName: "javaw.exe",
    title: "Minecraft 26.1.1 - Singleplayer",
    bounds: { x: 10, y: 10, width: 1280, height: 720 },
    isForeground: true,
  };
  assert.equal(integration.detect(exact).detected, true);
  assert.equal(
    integration.detect({ ...exact, title: "Minecraft 26.2 - Singleplayer" })
      .detected,
    false
  );
  assert.equal(
    integration.detect({ ...exact, title: "Minecraft 26.1.1 - Multiplayer" })
      .detected,
    false
  );
  assert.equal(
    integration.detect({ ...exact, processName: "MinecraftLauncher.exe" })
      .detected,
    false
  );
  return [
    "exact-version-single-player-detection",
    "additional-version-rejected",
    "multiplayer-rejected",
    "launcher-rejected",
  ];
}

async function verifyGuidanceJourney(): Promise<string[]> {
  const provider = createMinecraftJavaDiamondGuidanceProvider();
  const none = await provider.provideGuidance(guidanceRequest("none"));
  const full = await provider.provideGuidance(guidanceRequest("full"));
  assert.equal(none.length, 1);
  assert.equal(full.length, 4);
  assert.equal(
    full.every(
      (value) =>
        typeof value === "object" &&
        value !== null &&
        (value as { delivery?: unknown }).delivery === "advisory"
    ),
    true
  );
  const multiplayer = guidanceRequest("full");
  const unsafeRequest = {
    ...multiplayer,
    session: {
      ...multiplayer.session,
      game: {
        ...multiplayer.session.game!,
        context: {
          ...multiplayer.session.game!.context,
          playerMode: "multiplayer",
        },
      },
    },
  };
  assert.equal((await provider.provideGuidance(unsafeRequest)).length, 0);
  return [
    "original-text-only-diamond-journey",
    "spoiler-bounded-progressive-disclosure",
    "non-single-player-guidance-rejected",
  ];
}

async function verifyEphemeralObservation(): Promise<string[]> {
  const pixels = Buffer.from(Array.from({ length: 1_024 }, (_, i) => i % 251));
  const capture = {
    async captureAllowlistedRegion(): Promise<OracleCompanionRawFrame> {
      return { pixels, width: 16, height: 16 };
    },
  };
  const coordinator =
    new OracleCompanionScreenObservationCoordinator(capture, () => NOW);
  coordinator.synchronise(attachedSession(), attachment());
  assert.equal(coordinator.getState().consented, false);
  assert.equal(coordinator.getState().status, "ready");
  await coordinator.applyControl(
    observationControl("observe"),
    attachedSession(),
    attachment()
  );
  assert.equal(coordinator.getState().consented, false);
  assert.equal(coordinator.getState().status, "disabled");
  const state = await coordinator.applyControl(
    observationControl("enable"),
    attachedSession(),
    attachment()
  );
  assert.equal(state.latestObservation?.kind, "visible-game-frame");
  assert.equal(state.latestObservation?.authoritative, false);
  assert.equal(pixels.every((value) => value === 0), true);
  const serialized = JSON.stringify(state);
  assert.doesNotMatch(serialized, /pixels|handle|screenshot|clip/u);
  await coordinator.applyControl(
    observationControl("pause"),
    attachedSession(),
    attachment()
  );
  assert.equal(coordinator.getState().latestObservation, null);
  await coordinator.applyControl(
    observationControl("revoke"),
    attachedSession(),
    attachment()
  );
  assert.equal(coordinator.getState().consented, false);
  assert.equal(coordinator.getState().gameIntegrationId, null);
  return [
    "explicit-consent-required",
    "observe-without-consent-rejected",
    "allowlisted-local-frame-derived",
    "raw-buffer-zeroed",
    "renderer-safe-projection",
    "pause-clears-observation",
    "revocation-clears-consent",
  ];
}

function verifyStaticBoundaries(): string[] {
  const coordinator = fs.readFileSync(
    "desktop/companion/companion-screen-observation-coordinator.ts",
    "utf8"
  );
  const capture = fs.readFileSync(
    "desktop/companion/electron-local-window-capture.ts",
    "utf8"
  );
  const combined = `${coordinator}\n${capture}`;
  assert.doesNotMatch(
    combined,
    /fetch\s*\(|https?:\/\/|writeFile|appendFile|localStorage|indexedDB|WebSocket/u
  );
  assert.doesNotMatch(
    combined,
    /mouse|keyboard|sendInput|keyPress|click\s*\(/ui
  );
  assert.match(capture, /target\.minimized/u);
  assert.match(capture, /!target\.visible/u);
  return [
    "no-upload-or-external-processing-path",
    "no-retention-path",
    "no-automated-input-path",
  ];
}

function createCertificate(
  overrides: Partial<OracleGameIntegrationCompatibilityCertificate>
) {
  return createOracleGameIntegrationCompatibilityCertificate({
    ...MINECRAFT_JAVA_COMPATIBILITY_CERTIFICATE,
    ...overrides,
    contract: {
      name: ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE,
      version: ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE_VERSION,
    },
  });
}

function exactRuntimeProfile() {
  return {
    gameId: "minecraft",
    edition: "java",
    gameVersion: "26.1.1",
    operatingSystem: "win32" as const,
    executableName: "javaw.exe",
    locale: "en-US",
    displayMode: "windowed",
    windowBounds: { width: 1280, height: 720 },
    uiScale: 3,
    playerMode: "single-player",
    observationMethod: "attached-window-local-pixels",
  };
}

function guidanceRequest(
  maximumSpoilerLevel: "none" | "minor" | "major" | "full"
) {
  return createOracleCompanionGuidanceRequest({
    contract: { name: "oracle.companion-guidance-request", version: 1 },
    requestId: `minecraft-${maximumSpoilerLevel}`,
    requestedAt: NOW,
    session: {
      contract: {
        name: "oracle.companion-guidance-session-projection",
        version: 1,
      },
      sessionId: "minecraft-session",
      capturedAt: NOW,
      context: {},
      game: {
        integrationId: "minecraft-java",
        gameName: "Minecraft: Java Edition",
        integrationVersion: "1.0.0",
        context: {
          detectedGameVersion: "26.1.1",
          playerMode: "single-player",
        },
      },
    },
    category: "discovery",
    type: "diamond-advancement-journey",
    operatorPrompt: null,
    maximumSpoilerLevel,
  });
}

function attachedSession(): OracleCompanionSession {
  return {
    id: "desktop-minecraft-session",
    status: "attached",
    startedAt: NOW,
    updatedAt: NOW,
    endedAt: null,
    durableCorrelation: null,
    currentContext: {
      desktop: null,
      game: {
        integrationId: "minecraft-java",
        gameName: "Minecraft: Java Edition",
        version: "1.0.0",
        state: {
          detectedGameVersion: "26.1.1",
          playerMode: "single-player",
        },
      },
      capturedAt: NOW,
    },
  };
}

function attachment(): OracleDesktopAttachmentTarget {
  return {
    id: "window-minecraft",
    handle: "1234",
    title: "Minecraft 26.1.1 - Singleplayer",
    processId: 27,
    processName: "javaw.exe",
    visible: true,
    minimized: false,
    bounds: { x: 0, y: 0, width: 1280, height: 720 },
    discoveredAt: NOW,
  };
}

function observationControl(action: "enable" | "observe" | "pause" | "revoke") {
  return {
    action,
    locale: "en-US",
    uiScale: 3,
    displayMode: "windowed",
    playerMode: "single-player",
  };
}

void main();
