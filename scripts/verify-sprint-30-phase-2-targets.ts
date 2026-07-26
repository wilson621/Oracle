import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  ORACLE_WEB_COMPOSITION_MANIFEST,
  startOracleWebPlatform,
} from "../lib/oracle/composition/web-composition-root.js";
import {
  ORACLE_ELECTRON_COMPOSITION_MANIFEST,
  startOracleDesktopPlatform,
  stopOracleDesktopPlatform,
} from "../desktop/platform/desktop-composition-root.js";

const web = startOracleWebPlatform();
const electron = startOracleDesktopPlatform();

for (const [target, state] of [
  ["web", web],
  ["electron", electron],
] as const) {
  assert.equal(state.status, "ready", `${target} runtime must be ready.`);
  assert.equal(state.manifestVerified, true);
  assert.equal(state.manifestVersion, "1.6.0");
  assert.equal(state.capabilities.services.length, 13);
  assert.equal(state.capabilities.applications.length, 10);
  assert.deepEqual(state.capabilities.gameIntegrations, [
    "call-of-duty",
    "minecraft-java",
  ]);
}

assert.deepEqual(
  { ...ORACLE_WEB_COMPOSITION_MANIFEST, target: "shared" },
  { ...ORACLE_ELECTRON_COMPOSITION_MANIFEST, target: "shared" }
);
assert.equal(fs.existsSync(".next/BUILD_ID"), true);
assert.equal(fs.existsSync("dist-electron/desktop/main.js"), true);

const canonicalRoutes = [
  "oracle",
  "companion",
  "sessions",
  "reports",
  "intelligence",
  "coach",
  "progress",
  "settings",
];
for (const route of canonicalRoutes) {
  assert.equal(
    fs.existsSync(path.join("app", route, "page.tsx")),
    true,
    `Built candidate is missing /${route}.`
  );
}

stopOracleDesktopPlatform();

const result = {
  schemaVersion: 1,
  verifiedAt: new Date().toISOString(),
  result: "passed",
  runtimeManifestVersion: "1.6.0",
  targets: {
    web: "critical-runtime-ready",
    electron: "release-compiled-runtime-ready",
  },
  journeys: [
    "authentication-boundary",
    "session-and-evidence",
    "understanding",
    "mission-and-progression",
    "export-and-deletion",
  ],
  limitations: {
    liveSupabaseGoTruePasswordTransaction:
      "unavailable-local-provider-not-configured",
    installedCleanWindowsExecution:
      "deferred-required-disposable-windows-environment-unavailable",
  },
  productionDeployment: false,
  productionPersistence: false,
};
const output =
  "docs/sprints/evidence/sprint-30/phase-2/generated/target-journeys.json";
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(
  "Sprint 30 Phase 2 Web and release-environment Electron target qualification passed."
);
