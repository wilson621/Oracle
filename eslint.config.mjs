import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooks.configs.flat.recommended.rules,
    },
  },

  globalIgnores([
    // Next.js
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Generated Electron output
    "dist-electron/**",

    // Focused Companion Guidance verification output
    ".tmp-guidance-verification/**",
    ".tmp-operator-intelligence-scale-verification/**",
    ".tmp-operator-intelligence-persistence-verification/**",
    ".tmp-postgres-sprint17/**",
    ".tmp-sprint-29/**",
    ".tmp-sprint-29-verification/**",
    ".tmp-sprint-30-5-stage-2/**",
    ".tmp-tools/**",
  ]),
]);
