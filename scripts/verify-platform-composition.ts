import assert from "node:assert/strict";
import fs from "node:fs";
import { OracleExtensionRuntime } from "../lib/companion/extensions/extension-runtime";
import { createCoreOraclePlatformComposition } from "../lib/oracle/composition/core-platform-composition";
import {
  createOracleRuntimeCompositionManifest,
  OracleRuntimeCompositionDivergenceError,
  assertOracleCompositionMatchesManifest,
  type OraclePlatformComposition,
} from "../lib/oracle/platform/platform-composition";
import { OraclePlatformCompositionRoot } from "../lib/oracle/platform/platform-composition-root";
import {
  createOraclePlatformHealthSnapshot,
  isOraclePlatformHealthSnapshot,
} from "../lib/oracle/platform/platform-health";
import { OraclePlatformRuntime } from "../lib/oracle/platform/platform-runtime";
import { ORACLE_WEB_COMPOSITION_MANIFEST } from "../lib/oracle/composition/web-composition-root";
import {
  ORACLE_ELECTRON_COMPOSITION_MANIFEST,
  ORACLE_PLATFORM_DESKTOP_COMPANION_LIFECYCLE,
} from "../desktop/platform/desktop-composition-root";

function main(): void {
  verifyCanonicalManifests();
  verifyExactRuntimeEquality();
  verifyDivergenceFailsClosed();
  verifyOptionalFailureDegrades();
  verifyRequiredFailureFailsClosed();
  verifyFreshRecovery();
  verifyRendererSafeHealth();
  verifyLifecycleOwnership();
  verifyEntryPointWiringAndLegacySeam();
  writeCertificationEvidence();
  console.log("Sprint 22 Platform composition verification passed.");
}

function verifyCanonicalManifests(): void {
  assert.equal(Object.isFrozen(ORACLE_WEB_COMPOSITION_MANIFEST), true);
  assert.equal(Object.isFrozen(ORACLE_WEB_COMPOSITION_MANIFEST.services), true);
  assert.equal(ORACLE_WEB_COMPOSITION_MANIFEST.target, "web");
  assert.equal(ORACLE_ELECTRON_COMPOSITION_MANIFEST.target, "electron");
  assert.deepEqual(
    withoutTarget(ORACLE_WEB_COMPOSITION_MANIFEST),
    withoutTarget(ORACLE_ELECTRON_COMPOSITION_MANIFEST)
  );
}

function verifyExactRuntimeEquality(): void {
  for (const manifest of [
    ORACLE_WEB_COMPOSITION_MANIFEST,
    ORACLE_ELECTRON_COMPOSITION_MANIFEST,
  ]) {
    const composition = createCoreOraclePlatformComposition(manifest);
    assert.doesNotThrow(() =>
      assertOracleCompositionMatchesManifest(composition)
    );
    const state = new OraclePlatformRuntime(composition).start();
    assert.equal(state.manifestVerified, true);
    assert.equal(state.status, "ready");
    assert.deepEqual(
      state.services.map(({ id }) => id),
      manifest.services
    );
    assert.deepEqual(
      state.applications.map(({ id }) => id),
      manifest.applications
    );
    assert.deepEqual(
      composition.sessionLifecycle.declaration,
      manifest.sessionLifecycle
    );
    assert.equal(
      state.subsystems.find(({ id }) => id === "session-lifecycle")?.status,
      "ready"
    );
    assert.deepEqual(state.gameIntegrations, manifest.gameIntegrations);
    assert.deepEqual(state.guidanceProviders, manifest.guidanceProviders);
  }
}

function verifyDivergenceFailsClosed(): void {
  const divergentManifest = createOracleRuntimeCompositionManifest({
    ...ORACLE_WEB_COMPOSITION_MANIFEST,
    manifestVersion: "1.0.1",
    services: [...ORACLE_WEB_COMPOSITION_MANIFEST.services, "undeclared-test"],
  });
  const composition = createCoreOraclePlatformComposition(divergentManifest);
  assert.throws(
    () => assertOracleCompositionMatchesManifest(composition),
    OracleRuntimeCompositionDivergenceError
  );
  const state = new OraclePlatformRuntime(composition).start();
  assert.equal(state.manifestVerified, false);
  assert.equal(state.status, "failed");
  assert.equal(
    state.subsystems.find(({ id }) => id === "composition")?.status,
    "failed"
  );
}

function verifyOptionalFailureDegrades(): void {
  const composition = createCoreOraclePlatformComposition(
    ORACLE_WEB_COMPOSITION_MANIFEST
  );
  const failingExtensions = new OracleExtensionRuntime();
  failingExtensions.getStates = () => {
    throw new Error("optional extension password=do-not-project");
  };
  const state = new OraclePlatformRuntime(
    Object.freeze({ ...composition, extensions: failingExtensions })
  ).start();
  assert.equal(state.status, "degraded");
  assert.equal(
    state.subsystems.find(({ id }) => id === "extensions")?.required,
    false
  );
  assert.equal(
    state.subsystems.find(({ id }) => id === "extensions")?.status,
    "failed"
  );
  const health = createOraclePlatformHealthSnapshot(state, 1);
  assert.doesNotMatch(JSON.stringify(health), /do-not-project/u);
  assert.match(JSON.stringify(health), /password=\[redacted\]/u);
}

function verifyRequiredFailureFailsClosed(): void {
  const composition = createCoreOraclePlatformComposition(
    ORACLE_WEB_COMPOSITION_MANIFEST
  );
  const failingGuidance: OraclePlatformComposition["guidance"] = {
    getProviderManifests() {
      throw new Error("required guidance test failure");
    },
  };
  const state = new OraclePlatformRuntime(
    Object.freeze({ ...composition, guidance: failingGuidance })
  ).start();
  assert.equal(state.status, "failed");
  assert.equal(
    state.subsystems.find(({ id }) => id === "guidance")?.required,
    true
  );
}

function verifyFreshRecovery(): void {
  const compositions: OraclePlatformComposition[] = [];
  let attempt = 0;
  const root = new OraclePlatformCompositionRoot(() => {
    attempt += 1;
    const composition = createCoreOraclePlatformComposition(
      ORACLE_WEB_COMPOSITION_MANIFEST
    );
    const result =
      attempt === 1
        ? Object.freeze({
            ...composition,
            guidance: createFailingGuidance(),
          })
        : composition;
    compositions.push(result);
    return result;
  });

  const failed = root.start();
  const recovered = root.recover();
  assert.equal(failed.status, "failed");
  assert.equal(failed.attempt, 1);
  assert.equal(recovered.status, "ready");
  assert.equal(recovered.attempt, 2);
  assert.notEqual(compositions[0], compositions[1]);
  assert.notEqual(compositions[0].services, compositions[1].services);
  assert.notEqual(
    compositions[0].sessionLifecycle.service,
    compositions[1].sessionLifecycle.service
  );
  assert.notEqual(compositions[0].companion, compositions[1].companion);
}

function verifyRendererSafeHealth(): void {
  const root = new OraclePlatformCompositionRoot(() =>
    createCoreOraclePlatformComposition(ORACLE_WEB_COMPOSITION_MANIFEST)
  );
  const health = root.start();
  assert.equal(isOraclePlatformHealthSnapshot(health), true);
  assert.equal(Object.isFrozen(health), true);
  assert.equal(Object.isFrozen(health.capabilities.services), true);
  assert.doesNotThrow(() => JSON.stringify(health));
  const serialized = JSON.stringify(health);
  assert.doesNotMatch(
    serialized,
    /password|refresh.?token|secret.?key|process\.env/iu
  );
}

function verifyLifecycleOwnership(): void {
  assert.deepEqual(ORACLE_PLATFORM_DESKTOP_COMPANION_LIFECYCLE, {
    contract: "oracle.platform-desktop-companion-lifecycle",
    version: 1,
    platformOwner: "platform-companion-capability-readiness",
    desktopOwner: "desktop-companion-session-and-context",
    authorityMerged: false,
  });
  for (const manifest of [
    ORACLE_WEB_COMPOSITION_MANIFEST,
    ORACLE_ELECTRON_COMPOSITION_MANIFEST,
  ]) {
    assert.deepEqual(manifest.sessionLifecycle, {
      contract: "oracle.session-lifecycle",
      contractVersion: 1,
      authority: "session-service",
      persistence: "disabled",
    });
    assert.equal(manifest.manifestVersion, "1.2.0");
  }
}

function verifyEntryPointWiringAndLegacySeam(): void {
  const instrumentation = fs.readFileSync("instrumentation.ts", "utf8");
  const desktopMain = fs.readFileSync("desktop/main.ts", "utf8");
  const runtime = fs.readFileSync(
    "lib/oracle/platform/platform-runtime.ts",
    "utf8"
  );
  const serviceRegistry = fs.readFileSync(
    "lib/oracle/services/service-registry.ts",
    "utf8"
  );
  const applicationRegistry = fs.readFileSync(
    "lib/oracle/applications/application-registry.ts",
    "utf8"
  );
  assert.match(instrumentation, /startOracleWebPlatform\(\)/u);
  assert.match(desktopMain, /startOracleDesktopPlatform\(\)/u);
  assert.match(desktopMain, /stopOracleDesktopPlatform\(\)/u);
  assert.doesNotMatch(
    runtime,
    /registerCoreOracle|getOracleServices|getOracleApplications/u
  );
  assert.doesNotMatch(serviceRegistry, /legacyServices|getOracleServices/u);
  assert.doesNotMatch(
    applicationRegistry,
    /legacyApplications|getOracleApplications/u
  );
}

function createFailingGuidance(): OraclePlatformComposition["guidance"] {
  const guidance: OraclePlatformComposition["guidance"] = {
    getProviderManifests() {
      throw new Error("first-attempt guidance failure");
    },
  };
  return guidance;
}

function withoutTarget(manifest: typeof ORACLE_WEB_COMPOSITION_MANIFEST) {
  return {
    contract: manifest.contract,
    contractVersion: manifest.contractVersion,
    manifestVersion: manifest.manifestVersion,
    subsystems: manifest.subsystems,
    services: manifest.services,
    sessionLifecycle: manifest.sessionLifecycle,
    applications: manifest.applications,
    gameIntegrations: manifest.gameIntegrations,
    guidanceProviders: manifest.guidanceProviders,
  };
}

function writeCertificationEvidence(): void {
  const targets = [
    ORACLE_WEB_COMPOSITION_MANIFEST,
    ORACLE_ELECTRON_COMPOSITION_MANIFEST,
  ].map((manifest) => {
    const composition = createCoreOraclePlatformComposition(manifest);
    const state = new OraclePlatformRuntime(composition).start();
    return {
      target: manifest.target,
      manifestVersion: manifest.manifestVersion,
      declared: {
        subsystems: manifest.subsystems,
        services: manifest.services,
        sessionLifecycle: manifest.sessionLifecycle,
        applications: manifest.applications,
        gameIntegrations: manifest.gameIntegrations,
        guidanceProviders: manifest.guidanceProviders,
      },
      constructed: {
        subsystems: state.subsystems.map(({ id, required }) => ({
          id,
          required,
        })),
        services: composition.services.getAll().map(({ id }) => id),
        sessionLifecycle: composition.sessionLifecycle.declaration,
        applications: composition.applications.getAll().map(({ id }) => id),
        gameIntegrations:
          composition.gameIntegrations.getAll().map(({ id }) => id),
        guidanceProviders:
          composition.guidance.getProviderManifests().map(({ id }) => id),
      },
      exactMatch: state.manifestVerified && state.status === "ready",
    };
  });
  const path =
    "docs/sprints/evidence/sprint-22/generated/platform-composition-certification.json";
  fs.mkdirSync("docs/sprints/evidence/sprint-22/generated", {
    recursive: true,
  });
  fs.writeFileSync(
    path,
    `${JSON.stringify({
      schemaVersion: 1,
      verifiedAt: new Date().toISOString(),
      contract: "oracle.runtime-composition",
      contractVersion: 1,
      targets,
      requiredFailure: "pass-failed-closed",
      optionalFailure: "pass-observable-degraded",
      recovery: "pass-fresh-runtime",
      rendererSafety: "pass-redacted-serializable",
      lifecycleOwnership: "pass-not-merged",
      runtimePersistence: "disabled",
      deployment: "not-authorised",
      migrationsExecuted: false,
      result: "pass",
    }, null, 2)}\n`,
    "utf8"
  );
}

main();
