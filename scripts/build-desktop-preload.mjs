import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  ".."
);

const outputPath = resolve(
  root,
  "dist-electron",
  "desktop",
  "preload.js"
);

await build({
  absWorkingDir: root,
  entryPoints: [
    resolve(root, "desktop", "preload.ts"),
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
    "The sandboxed Electron preload contains a runtime-relative require()."
  );
}

console.log(
  "Sandbox-compatible Electron preload bundle created: " +
    outputPath
);
