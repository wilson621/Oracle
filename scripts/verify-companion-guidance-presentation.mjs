import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const presentationFiles = [
  "app/companion/companion-page-state.ts",
  "app/companion/page.tsx",
  "components/companion/guidance/CompanionGuidanceDashboard.tsx",
  "components/companion/guidance/CompanionGuidanceCard.tsx",
  "components/companion/guidance/CompanionGuidanceDiagnostics.tsx",
  "components/companion/guidance/CompanionGuidanceStatePanel.tsx",
];

const sources = new Map(
  presentationFiles.map((relativePath) => {
    const absolutePath = path.join(
      root,
      relativePath
    );

    assert.equal(
      fs.existsSync(absolutePath),
      true,
      `Missing Companion presentation file: ${relativePath}`
    );

    return [
      relativePath,
      fs.readFileSync(
        absolutePath,
        "utf8"
      ),
    ];
  })
);

for (const [relativePath, source] of sources) {
  const sourceFile =
    ts.createSourceFile(
      relativePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue;
    }

    const specifier =
      statement.moduleSpecifier.text;

    if (specifier.startsWith("@/lib/")) {
      assert.equal(
        specifier,
        "@/lib/oracle/applications/companion",
        `${relativePath} imports a non-Application Oracle runtime boundary: ${specifier}`
      );
    }
  }

  assert.equal(
    source.includes(".sort("),
    false,
    `${relativePath} must not rank Guidance Cards.`
  );
  assert.equal(
    source.includes(".filter("),
    false,
    `${relativePath} must not filter Guidance Cards.`
  );
  assert.equal(
    source.includes('"use client"') ||
      source.includes("'use client'"),
    false,
    `${relativePath} must remain a state-only Server Component in this commit.`
  );
}

const dashboard = sources.get(
  "components/companion/guidance/CompanionGuidanceDashboard.tsx"
);

for (
  const status
  of [
    "loading",
    "ready",
    "empty",
    "partial-success",
    "unavailable",
  ]
) {
  assert.match(
    dashboard,
    new RegExp(
      `case ["']${status}["']`
    ),
    `Companion presentation does not explicitly render '${status}'.`
  );
}

const card = sources.get(
  "components/companion/guidance/CompanionGuidanceCard.tsx"
);

for (
  const field
  of [
    "card.category",
    "card.type",
    "card.recommendation",
    "card.confidence",
    "card.priority",
    "card.spoiler",
    "card.rationale",
    "card.evidence",
    "card.sources",
    "card.reassessmentTrigger",
    "card.createdAt",
  ]
) {
  assert.equal(
    card.includes(field),
    true,
    `Companion Guidance Card does not render ${field}.`
  );
}

const initialState =
  fs.readFileSync(
    path.join(
      root,
      "app/companion/companion-page-state.ts"
    ),
    "utf8"
  );

assert.equal(
  initialState.includes(
    "createCompanionGuidanceUnavailableState"
  ),
  true,
  "The route must use an honest unavailable state until authoritative runtime delivery exists."
);
assert.equal(
  initialState.includes(
    "oracle.companion-guidance"
  ),
  false,
  "The route must not fabricate raw Guidance contracts."
);

process.stdout.write(
  "Companion Guidance presentation boundary verification passed.\n"
);
