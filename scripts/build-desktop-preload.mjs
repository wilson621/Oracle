import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  ".."
);

const desktopDistDir = resolve(
  root,
  "dist-electron",
  "desktop"
);

// Every sandboxed Electron preload the app loads: contextIsolation +
// sandbox means each one must be a single self-contained file (no runtime
// require() of sibling project modules), so each gets bundled here the
// same way, overwriting tsc's plain NodeNext output at the same path.
const preloadEntries = [
  { name: "preload", source: "preload.ts" },
  {
    name: "video-recorder-preload",
    source: "video-recorder-preload.ts",
  },
];

for (const entry of preloadEntries) {
  const outputPath = resolve(
    desktopDistDir,
    `${entry.name}.js`
  );

  await build({
    absWorkingDir: root,
    entryPoints: [
      resolve(root, "desktop", entry.source),
    ],
    outfile: outputPath,
    bundle: true,
    platform: "browser",
    format: "cjs",
    target: "es2022",
    external: ["electron"],
    sourcemap: true,
    sourcesContent: true,
    treeShaking: true,
    legalComments: "none",
    logLevel: "silent",
  });

  const output = readFileSync(outputPath, "utf8");

  if (
    /\brequire\(\s*["']\.\.?[\\/]/u.test(output)
  ) {
    throw new Error(
      `The sandboxed Electron preload "${entry.name}" contains a runtime-relative require().`
    );
  }

  console.log(
    "Sandbox-compatible Electron preload bundle created: " +
      outputPath
  );
}
