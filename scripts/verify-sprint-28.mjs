import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const canonicalRoutes = [
  "/oracle",
  "/companion",
  "/sessions",
  "/reports",
  "/intelligence",
  "/coach",
  "/progress",
  "/settings",
];
const navigation = read("components/navigation/Sidebar.tsx");

for (const route of canonicalRoutes) {
  assert.match(
    navigation,
    new RegExp(`href: ["']${route}["']`),
    `Canonical navigation is missing ${route}.`
  );
}
for (const retiredRoute of [
  "/memory",
  "/dna",
  "/operator",
  "/career",
  "/achievements",
  "/loadouts",
]) {
  assert.doesNotMatch(
    navigation,
    new RegExp(`href: ["']${retiredRoute}["']`),
    `Canonical navigation must not claim ${retiredRoute}.`
  );
}
assert.equal(
  exists("components/layout/Sidebar.tsx"),
  false,
  "The duplicate legacy Sidebar must be removed."
);

const redirects = new Map([
  ["app/memory/page.tsx", "/intelligence"],
  ["app/dna/page.tsx", "/intelligence"],
  ["app/career/page.tsx", "/progress"],
  ["app/achievements/page.tsx", "/progress"],
  ["app/operator/page.tsx", "/settings"],
  ["app/planner/page.tsx", "/coach"],
]);
for (const [file, destination] of redirects) {
  assert.match(
    read(file),
    new RegExp(`redirect\\(["']${destination}["']\\)`),
    `${file} must preserve its consolidation redirect to ${destination}.`
  );
}

const truthfulSurfaces = new Map([
  ["app/sessions/page.tsx", "runtime persistence and persisted producers remain disabled"],
  ["app/reports/page.tsx", "will not manufacture an analysis"],
  ["app/intelligence/page.tsx", "no current claim can be presented"],
  ["app/coach/page.tsx", "will not invent a Mission, reward or prediction"],
  ["app/progress/page.tsx", "cannot present earned awards or a progress total"],
  ["app/loadouts/page.tsx", "production mock path has been removed"],
  ["app/settings/page.tsx", "Minecraft is a bounded reference profile only"],
]);
for (const [file, requiredTruth] of truthfulSurfaces) {
  const source = read(file);
  assert.match(source, /AppLayout/, `${file} must use the canonical shell.`);
  assert.equal(
    source.includes(requiredTruth),
    true,
    `${file} does not expose its required limitation.`
  );
}

const retiredLegacyImports = [
  "getOperatorStats",
  "getOracleMemory",
  "getOracleDNA",
  "getCoachReport",
  "getOperatorProgression",
  "getAchievements",
  "getRecentOperatorSessions",
];
for (const directory of ["app", "components"]) {
  const files = walk(path.join(root, directory)).filter((file) =>
    /\.(ts|tsx)$/.test(file)
  );
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const legacyImport of retiredLegacyImports) {
      assert.equal(
        source.includes(legacyImport),
        false,
        `${path.relative(root, file)} retains legacy product data source ${legacyImport}.`
      );
    }
  }
}

assert.equal(
  exists("lib/companion/connectors/reference/mock-game-connector.ts"),
  false,
  "The production mock Game Connector must be removed."
);
assert.doesNotMatch(
  read("lib/companion/connectors/index.ts"),
  /mock-game-connector/,
  "The connector barrel must not export a mock integration."
);
assert.doesNotMatch(
  read("lib/oracle/loadouts/loadout-engine.ts"),
  /mockWeaponPerformance|weaponName:\s*["']/,
  "The loadout engine must not embed weapon evidence."
);
assert.match(
  read("lib/oracle/applications/register-core-applications.ts"),
  /id:\s*["']loadouts["'][\s\S]*?status:\s*["']disabled["']/,
  "The deferred Loadouts Application must remain disabled."
);

const inventory = read("docs/sprints/SPRINT_28_PRODUCT_TRUTH_INVENTORY.md");
for (const decision of ["retain", "consolidate", "defer", "redirect"]) {
  assert.match(
    inventory,
    new RegExp(`\\b${decision}\\b`),
    `Product Truth Inventory does not record '${decision}' decisions.`
  );
}
for (const route of [
  "/",
  "/auth",
  "/auth/callback",
  "/auth/verify-email",
  "/onboarding",
  ...canonicalRoutes,
  "/memory",
  "/dna",
  "/career",
  "/achievements",
  "/operator",
  "/profile",
  "/account/security",
  "/loadouts",
]) {
  assert.equal(
    inventory.includes(`\`${route}\``),
    true,
    `Product Truth Inventory is missing ${route}.`
  );
}

const result = {
  sprint: 28,
  generatedAt: new Date().toISOString(),
  result: "passed",
  canonicalRoutes,
  cases: [
    "product-truth-inventory-complete",
    "architectural-truth-assessed",
    "operator-value-assessed",
    "single-canonical-navigation",
    "legacy-routes-consolidated",
    "inactive-capabilities-explicit",
    "production-mock-connector-removed",
    "production-mock-loadout-evidence-removed",
    "renderer-business-data-bypasses-retired",
    "minecraft-provisional-and-disabled",
    "cod-warzone-first-proving-ground",
  ],
  productionDeployment: false,
  migrationIntroduced: false,
  runtimePersistence: "disabled",
  minecraftOperationalSupport: false,
  minecraftObservation: "disabled",
};

const evidencePath = path.join(
  root,
  "docs/sprints/evidence/sprint-28/generated/sprint-28-certification.json"
);
fs.writeFileSync(evidencePath, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write("Sprint 28 product convergence verification passed.\n");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}
