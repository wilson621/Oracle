import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const productRoots = ["app", "components"];
const sourceFiles = productRoots
  .flatMap((root) => walk(join(repository, root)))
  .filter((path) => /\.(css|ts|tsx)$/u.test(path));

const prohibited = [];
let correctedForegroundUses = 0;
let correctedLiteralForegroundUses = 0;
for (const path of sourceFiles) {
  const source = readFileSync(path, "utf8");
  const repositoryPath = relative(repository, path).replaceAll("\\", "/");
  if (source.includes("text-slate-500") || /color:\s*rgb\(100\s+116\s+139\)/u.test(source)) {
    prohibited.push(repositoryPath);
  }
  correctedForegroundUses += source.match(/text-slate-400/gu)?.length ?? 0;
  if (repositoryPath === "components/companion/guidance/companion-guidance.module.css") {
    correctedLiteralForegroundUses +=
      source.match(/color:\s*rgb\(148\s+163\s+184\)/gu)?.length ?? 0;
  }
}

assert.deepEqual(
  prohibited,
  [],
  "Low-contrast slate-500 remains in a product text or placeholder utility."
);
assert.ok(
  correctedForegroundUses === 168,
  "The bounded accessibility correction inventory is incomplete."
);

assert.equal(
  correctedLiteralForegroundUses,
  11,
  "The validated Companion CSS accessible-foreground inventory is incomplete."
);

const tailwindTheme = readFileSync(
  join(repository, "node_modules", "tailwindcss", "theme.css"),
  "utf8"
);
assert.match(
  tailwindTheme,
  /--color-slate-400:\s*oklch\(70\.4%\s+0\.04\s+256\.788\)/u,
  "The validated Tailwind slate-400 token changed."
);

console.log(
  JSON.stringify({
    result: "passed",
    contract: "oracle.product.accessible-color-foregrounds",
    productFiles: sourceFiles.length,
    correctedForegroundUses,
    correctedLiteralForegroundUses,
    prohibitedLowContrastUses: prohibited.length,
  })
);

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}