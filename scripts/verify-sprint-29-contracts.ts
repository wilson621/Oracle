import assert from "node:assert/strict";
import {
  isOracleDesktopReleaseState,
} from "../desktop/release/desktop-release-contract.js";
import {
  OracleDesktopUpdateCoordinator,
} from "../desktop/release/desktop-update-coordinator.js";
import {
  requireOracleReleaseManifest,
  type OracleReleaseManifest,
} from "../desktop/release/release-manifest-contract.js";

const permanentPrinciple =
  "Local test signing proves packaging and distribution mechanics only.";
const baseManifest:
  OracleReleaseManifest = {
    contract: {
      name: "oracle.release-manifest",
      version: 1,
    },
    releaseId:
      "oracle-desktop-beta-0.1.0-local-certification",
    version: "0.1.0",
    packageVersion: "0.1.0.0",
    channel: "beta",
    architecture: "x64",
    packageIdentity: {
      name:
        "Oracle.Platform.LocalCertification",
      publisher:
        "CN=Oracle Local Test Signing - NOT PRODUCTION",
    },
    runtimeCompositionManifestVersion:
      "1.6.0",
    artifacts: [
      {
        kind: "msix",
        path:
          "Oracle_0.1.0.0_x64_LOCAL_TEST_ONLY.msix",
        sha256: "0".repeat(64),
        size: 1,
      },
      {
        kind: "sbom",
        path:
          "oracle-0.1.0.cdx.json",
        sha256: "1".repeat(64),
        size: 1,
      },
      {
        kind: "provenance",
        path:
          "oracle-0.1.0.provenance.json",
        sha256: "2".repeat(64),
        size: 1,
      },
    ],
    rollback: {
      allowedTargets: ["0.0.9.0"],
      arbitraryDowngrade: false,
    },
    signing: {
      classification:
        "local-test-only",
      productionTrusted: false,
      publicReleaseReady: false,
      externalDistributionAuthorised:
        false,
      deploymentAuthorised: false,
    },
  };

const immutableManifest =
  requireOracleReleaseManifest(
    baseManifest
  );
assert.deepEqual(
  immutableManifest,
  baseManifest
);
assert.notEqual(
  immutableManifest,
  baseManifest
);
assert.ok(
  Object.isFrozen(
    immutableManifest
  )
);
assert.ok(
  Object.isFrozen(
    immutableManifest.artifacts
  )
);

for (
  const altered of [
    {
      ...baseManifest,
      signing: {
        ...baseManifest.signing,
        productionTrusted: true,
      },
    },
    {
      ...baseManifest,
      rollback: {
        ...baseManifest.rollback,
        arbitraryDowngrade: true,
      },
    },
  ]
) {
  assert.throws(() =>
    requireOracleReleaseManifest(
      altered
    )
  );
}

async function verify(): Promise<void> {
const unavailable =
  new OracleDesktopUpdateCoordinator({
    currentVersion: "0.1.0",
    manifestProvider: null,
    now: () =>
      new Date(
        "2026-07-25T00:00:00.000Z"
      ),
  });
const unavailableState =
  await unavailable
    .checkForUpdates();
assert.equal(
  unavailableState.status,
  "inactive"
);
assert.equal(
  unavailableState.errorCode,
  "release-hosting-not-authorised"
);
assert.equal(
  unavailableState.productionTrusted,
  false
);
assert.match(
  unavailableState.limitation,
  new RegExp(permanentPrinciple)
);
assert.ok(
  isOracleDesktopReleaseState(
    unavailableState
  )
);

const available =
  new OracleDesktopUpdateCoordinator({
    currentVersion: "0.0.9",
    manifestProvider: async () =>
      baseManifest,
  });
assert.equal(
  (
    await available
      .checkForUpdates()
  ).status,
  "available"
);

const rejected =
  new OracleDesktopUpdateCoordinator({
    currentVersion: "0.0.9",
    manifestProvider: async () => ({
      ...baseManifest,
      channel: "stable",
    }),
  });
assert.equal(
  (
    await rejected
      .checkForUpdates()
  ).status,
  "failed"
);

const lifecycle: string[] = [];
const replacement =
  new OracleDesktopUpdateCoordinator({
    currentVersion: "0.1.0",
    manifestProvider: null,
    replacementBoundary: {
      invalidateObservation: () => {
        lifecycle.push(
          "observation-invalidated"
        );
      },
      detachCompanion: () => {
        lifecycle.push(
          "companion-detached"
        );
      },
      stopRuntime: () => {
        lifecycle.push(
          "runtime-stopped"
        );
      },
    },
  });
await replacement
  .prepareForReplacement();
assert.deepEqual(lifecycle, [
  "observation-invalidated",
  "companion-detached",
  "runtime-stopped",
]);

console.log(
  "Sprint 29 release contracts, fail-closed eligibility, renderer-safe state and replacement ordering verified."
);
}

void verify();
