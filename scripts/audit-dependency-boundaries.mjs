import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import ts from "typescript";

const repositoryRoot = process.cwd();
const baselinePath = path.join(
  repositoryRoot,
  "scripts",
  "dependency-boundary-baseline.json"
);

const sourceRoots = [
  "app",
  "components",
  "desktop",
  "lib",
];

const sourceFiles = sourceRoots.flatMap((root) =>
  collectSourceFiles(
    path.join(repositoryRoot, root)
  )
);

const sourceFileSet = new Set(
  sourceFiles.map((file) =>
    path.resolve(file)
  )
);

const dependencies = new Map();

for (const sourceFile of sourceFiles) {
  dependencies.set(
    path.resolve(sourceFile),
    readDependencies(sourceFile)
  );
}

const boundaryViolations = [
  ...findImportBoundaryViolations(),
  ...findGameKnowledgeLeaks(),
].sort(compareById);

const allCycles = findCircularGroups(
  () => true
);

const runtimeCycles = findCircularGroups(
  (dependency) => !dependency.typeOnly
);

if (
  process.argv.includes(
    "--print-baseline"
  )
) {
  const baseline = {
    schemaVersion: 1,
    allowedBoundaryViolations:
      boundaryViolations.map(
        (violation) =>
          violation.id
      ),
    allowedCircularGroups: {
      source: allCycles.map(
        (members) => members
      ),
      runtime: runtimeCycles.map(
        (members) => members
      ),
    },
  };

  process.stdout.write(
    `${JSON.stringify(
      baseline,
      null,
      2
    )}\n`
  );

  process.exit(0);
}

if (!fs.existsSync(baselinePath)) {
  console.error(
    "Oracle dependency audit baseline is missing."
  );

  process.exit(1);
}

const baseline = JSON.parse(
  fs.readFileSync(
    baselinePath,
    "utf8"
  )
);

assertValidBaseline(baseline);

const allowedViolationIds = new Set(
  baseline.allowedBoundaryViolations
);

const newBoundaryViolations =
  boundaryViolations.filter(
    (violation) =>
      !allowedViolationIds.has(
        violation.id
      )
  );

const newSourceCycles = findNewCircularGroups(
  allCycles,
  baseline.allowedCircularGroups.source
);

const newRuntimeCycles = findNewCircularGroups(
  runtimeCycles,
  baseline.allowedCircularGroups.runtime
);

printAuditSummary({
  boundaryViolations,
  allCycles,
  runtimeCycles,
  newBoundaryViolations,
  newSourceCycles,
  newRuntimeCycles,
});

if (
  newBoundaryViolations.length > 0 ||
  newSourceCycles.length > 0 ||
  newRuntimeCycles.length > 0
) {
  process.exit(1);
}

function collectSourceFiles(
  directory
) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(
      directory,
      { withFileTypes: true }
    )
    .flatMap((entry) => {
      const entryPath = path.join(
        directory,
        entry.name
      );

      if (entry.isDirectory()) {
        return collectSourceFiles(
          entryPath
        );
      }

      return /\.(ts|tsx)$/.test(
        entry.name
      )
        ? [entryPath]
        : [];
    });
}

function readDependencies(
  sourceFile
) {
  const sourceText = fs.readFileSync(
    sourceFile,
    "utf8"
  );

  const source = ts.createSourceFile(
    sourceFile,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  const found = [];

  for (const statement of source.statements) {
    if (
      ts.isImportDeclaration(
        statement
      ) &&
      ts.isStringLiteral(
        statement.moduleSpecifier
      )
    ) {
      addDependency(
        found,
        sourceFile,
        statement.moduleSpecifier.text,
        isTypeOnlyImport(statement)
      );
    }

    if (
      ts.isExportDeclaration(
        statement
      ) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(
        statement.moduleSpecifier
      )
    ) {
      addDependency(
        found,
        sourceFile,
        statement.moduleSpecifier.text,
        statement.isTypeOnly
      );
    }
  }

  return deduplicateDependencies(
    found
  );
}

function isTypeOnlyImport(
  declaration
) {
  const clause =
    declaration.importClause;

  if (!clause) {
    return false;
  }

  if (clause.isTypeOnly) {
    return true;
  }

  if (
    clause.name ||
    !clause.namedBindings
  ) {
    return false;
  }

  if (
    ts.isNamespaceImport(
      clause.namedBindings
    )
  ) {
    return false;
  }

  return clause.namedBindings.elements
    .every(
      (element) =>
        element.isTypeOnly
    );
}

function addDependency(
  found,
  sourceFile,
  specifier,
  typeOnly
) {
  const targetFile = resolveImport(
    sourceFile,
    specifier
  );

  if (!targetFile) {
    return;
  }

  found.push({
    source:
      toRepositoryPath(sourceFile),
    target:
      toRepositoryPath(targetFile),
    specifier,
    typeOnly,
  });
}

function resolveImport(
  sourceFile,
  specifier
) {
  let unresolved;

  if (specifier.startsWith("@/")) {
    unresolved = path.join(
      repositoryRoot,
      specifier.slice(2)
    );
  } else if (
    specifier.startsWith(".")
  ) {
    unresolved = path.resolve(
      path.dirname(sourceFile),
      specifier
    );
  } else {
    return null;
  }

  unresolved = unresolved.replace(
    /\.js$/,
    ""
  );

  const candidates = [
    unresolved,
    `${unresolved}.ts`,
    `${unresolved}.tsx`,
    path.join(unresolved, "index.ts"),
    path.join(unresolved, "index.tsx"),
  ];

  return candidates
    .map((candidate) =>
      path.resolve(candidate)
    )
    .find((candidate) =>
      sourceFileSet.has(candidate)
    ) ?? null;
}

function deduplicateDependencies(
  found
) {
  const dependenciesByTarget =
    new Map();

  for (const dependency of found) {
    const existing =
      dependenciesByTarget.get(
        dependency.target
      );

    if (
      !existing ||
      (
        existing.typeOnly &&
        !dependency.typeOnly
      )
    ) {
      dependenciesByTarget.set(
        dependency.target,
        dependency
      );
    }
  }

  return [
    ...dependenciesByTarget.values(),
  ];
}

function findImportBoundaryViolations() {
  const violations = [];

  for (const sourceDependencies of
    dependencies.values()) {
    for (const dependency of
      sourceDependencies) {
      const sourceLayer = classifyLayer(
        dependency.source
      );

      const targetLayer = classifyLayer(
        dependency.target
      );

      if (
        sourceLayer ===
          "platform-coordination" &&
        (
          targetLayer === "service" ||
          targetLayer === "application" ||
          targetLayer === "game-integration"
        )
      ) {
        violations.push(
          createImportViolation(
            "platform-lower-layer-import",
            dependency
          )
        );
      }

      if (
        sourceLayer === "service" &&
        (
          targetLayer === "application" ||
          targetLayer === "game-integration" ||
          targetLayer === "desktop-internal"
        )
      ) {
        violations.push(
          createImportViolation(
            "service-lower-layer-import",
            dependency
          )
        );
      }

      if (
        sourceLayer === "application" &&
        (
          dependency.source.startsWith(
            "app/"
          ) ||
          dependency.source.startsWith(
            "components/"
          )
        ) &&
        dependency.target.startsWith(
          "lib/"
        ) &&
        targetLayer !== "service" &&
        dependency.target !==
          "lib/oracle/platform/index.ts"
      ) {
        violations.push(
          createImportViolation(
            "application-service-bypass",
            dependency
          )
        );
      }

      if (
        sourceLayer ===
          "game-integration" &&
        (
          targetLayer === "service" ||
          targetLayer === "application" ||
          targetLayer === "desktop-internal"
        )
      ) {
        violations.push(
          createImportViolation(
            "game-integration-upward-import",
            dependency
          )
        );
      }

      if (
        !dependency.source.startsWith(
          "desktop/"
        ) &&
        dependency.target.startsWith(
          "desktop/platform/"
        ) &&
        dependency.target !==
          "desktop/platform/index.ts"
      ) {
        violations.push(
          createImportViolation(
            "desktop-public-leaf-import",
            dependency
          )
        );
      }
    }
  }

  return violations;
}

function findGameKnowledgeLeaks() {
  const terms = [
    "call of duty",
    "warzone",
    "cod.exe",
  ];

  const leaks = [];

  for (const sourceFile of sourceFiles) {
    const source =
      toRepositoryPath(sourceFile);

    if (
      source.startsWith(
        "lib/oracle/game-integrations/"
      )
    ) {
      continue;
    }

    const sourceText = fs
      .readFileSync(
        sourceFile,
        "utf8"
      )
      .toLowerCase();

    for (const term of terms) {
      if (sourceText.includes(term)) {
        leaks.push({
          id:
            `game-knowledge-outside-integration:${source}:${term}`,
          rule:
            "game-knowledge-outside-integration",
          source,
          target: term,
          typeOnly: false,
        });
      }
    }
  }

  return leaks;
}

function createImportViolation(
  rule,
  dependency
) {
  return {
    id:
      `${rule}:${dependency.source}->${dependency.target}`,
    rule,
    source: dependency.source,
    target: dependency.target,
    typeOnly: dependency.typeOnly,
  };
}

function classifyLayer(file) {
  if (
    file.startsWith(
      "lib/oracle/platform/"
    )
  ) {
    return "platform-coordination";
  }

  if (
    file.startsWith(
      "lib/oracle/services/"
    )
  ) {
    return "service";
  }

  if (
    file.startsWith("app/") ||
    file.startsWith("components/") ||
    file.startsWith(
      "lib/oracle/applications/"
    )
  ) {
    return "application";
  }

  if (
    file.startsWith(
      "lib/oracle/game-integrations/"
    )
  ) {
    return "game-integration";
  }

  if (
    file.startsWith(
      "desktop/platform/"
    )
  ) {
    return "desktop-platform";
  }

  if (file.startsWith("desktop/")) {
    return "desktop-internal";
  }

  return "shared-platform";
}

function findCircularGroups(
  includeDependency
) {
  const graph = new Map();

  for (const [sourceFile, found] of
    dependencies.entries()) {
    graph.set(
      toRepositoryPath(sourceFile),
      found
        .filter(includeDependency)
        .map(
          (dependency) =>
            dependency.target
        )
    );
  }

  return stronglyConnectedComponents(
    graph
  )
    .filter(
      (members) => members.length > 1
    )
    .map((members) =>
      [...members].sort()
    )
    .sort(compareArrays);
}

function stronglyConnectedComponents(
  graph
) {
  let nextIndex = 0;
  const stack = [];
  const onStack = new Set();
  const indices = new Map();
  const lowLinks = new Map();
  const components = [];

  const visit = (node) => {
    indices.set(node, nextIndex);
    lowLinks.set(node, nextIndex);
    nextIndex += 1;
    stack.push(node);
    onStack.add(node);

    for (const target of
      graph.get(node) ?? []) {
      if (!indices.has(target)) {
        visit(target);
        lowLinks.set(
          node,
          Math.min(
            lowLinks.get(node),
            lowLinks.get(target)
          )
        );
      } else if (
        onStack.has(target)
      ) {
        lowLinks.set(
          node,
          Math.min(
            lowLinks.get(node),
            indices.get(target)
          )
        );
      }
    }

    if (
      lowLinks.get(node) !==
      indices.get(node)
    ) {
      return;
    }

    const component = [];
    let current;

    do {
      current = stack.pop();
      onStack.delete(current);
      component.push(current);
    } while (current !== node);

    components.push(component);
  };

  for (const node of graph.keys()) {
    if (!indices.has(node)) {
      visit(node);
    }
  }

  return components;
}

function findNewCircularGroups(
  currentGroups,
  allowedGroups
) {
  return currentGroups.filter(
    (members) =>
      !allowedGroups.some(
        (allowed) => {
          const allowedMembers =
            new Set(allowed);

          return members.every(
            (member) =>
              allowedMembers.has(member)
          );
        }
      )
  );
}

function assertValidBaseline(
  baseline
) {
  if (
    baseline?.schemaVersion !== 1 ||
    !Array.isArray(
      baseline.allowedBoundaryViolations
    ) ||
    !Array.isArray(
      baseline.allowedCircularGroups
        ?.source
    ) ||
    !Array.isArray(
      baseline.allowedCircularGroups
        ?.runtime
    )
  ) {
    throw new Error(
      "Oracle dependency audit baseline is invalid."
    );
  }
}

function printAuditSummary({
  boundaryViolations: violations,
  allCycles: sourceCycles,
  runtimeCycles: executableCycles,
  newBoundaryViolations,
  newSourceCycles,
  newRuntimeCycles,
}) {
  console.log(
    "Oracle dependency boundary audit"
  );

  console.log(
    `Scanned ${sourceFiles.length} TypeScript files.`
  );

  console.log(
    `Documented legacy boundary exceptions: ${violations.length}.`
  );

  console.log(
    `Documented source cycle groups: ${sourceCycles.length}.`
  );

  console.log(
    `Documented runtime cycle groups: ${executableCycles.length}.`
  );

  if (newBoundaryViolations.length) {
    console.error(
      "New dependency boundary violations:"
    );

    for (const violation of
      newBoundaryViolations) {
      console.error(
        `- ${violation.id}`
      );
    }
  }

  if (newSourceCycles.length) {
    console.error(
      "New source dependency cycles:"
    );

    for (const members of
      newSourceCycles) {
      console.error(
        `- ${members.join(" -> ")}`
      );
    }
  }

  if (newRuntimeCycles.length) {
    console.error(
      "New runtime dependency cycles:"
    );

    for (const members of
      newRuntimeCycles) {
      console.error(
        `- ${members.join(" -> ")}`
      );
    }
  }

  if (
    newBoundaryViolations.length === 0 &&
    newSourceCycles.length === 0 &&
    newRuntimeCycles.length === 0
  ) {
    console.log(
      "No new or unexpected dependency boundary violations were found."
    );
  }
}

function toRepositoryPath(file) {
  return path
    .relative(
      repositoryRoot,
      path.resolve(file)
    )
    .split(path.sep)
    .join("/");
}

function compareById(left, right) {
  return left.id.localeCompare(
    right.id
  );
}

function compareArrays(left, right) {
  return left.join("\n").localeCompare(
    right.join("\n")
  );
}
