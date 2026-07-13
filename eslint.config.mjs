import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Next.js
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Generated Electron output
    "dist-electron/**",
  ]),
]);