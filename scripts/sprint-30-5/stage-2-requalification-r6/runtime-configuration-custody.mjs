import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

export const RUNTIME_CONFIGURATION_ENVIRONMENT_NAMES = Object.freeze([
  "ORACLE_SUPABASE_URL",
  "ORACLE_SUPABASE_ANON_KEY",
  "ORACLE_SUPABASE_SERVICE_ROLE_KEY",
  "ORACLE_WEB_SESSION_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]);

export const PROHIBITED_ENVIRONMENT_FILES = Object.freeze([
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
]);

const BUILD_CANARIES = Object.freeze({
  ORACLE_SUPABASE_URL: "https://r6-build-canary.invalid",
  ORACLE_SUPABASE_ANON_KEY: "oracle-r6-anon-canary-not-a-secret",
  ORACLE_SUPABASE_SERVICE_ROLE_KEY: "oracle-r6-service-canary-not-a-secret",
  ORACLE_WEB_SESSION_SECRET: "oracle-r6-session-canary-not-a-secret-32-bytes",
  NEXT_PUBLIC_SUPABASE_URL: "https://r6-build-canary.invalid",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "oracle-r6-anon-canary-not-a-secret",
});

export function assertNoAmbientRuntimeConfiguration(root, environment = process.env) {
  const environmentKeys = new Map(
    Object.keys(environment).map((name) => [name.toUpperCase(), name])
  );
  const populated = RUNTIME_CONFIGURATION_ENVIRONMENT_NAMES.filter((name) => {
    const actual = environmentKeys.get(name);
    return actual !== undefined && String(environment[actual] ?? "").trim() !== "";
  });
  if (populated.length !== 0) {
    throw new Error(
      `Ambient runtime configuration is prohibited during R6 qualification: ${populated.join(", ")}`
    );
  }
  const presentFiles = PROHIBITED_ENVIRONMENT_FILES.filter((name) =>
    existsSync(join(root, name))
  );
  if (presentFiles.length !== 0) {
    throw new Error(
      `Ambient environment files are prohibited during R6 qualification: ${presentFiles.join(", ")}`
    );
  }
}

export function createDeterministicBuildEnvironment(environment = process.env) {
  const result = { ...environment };
  for (const existingName of Object.keys(result)) {
    if (
      RUNTIME_CONFIGURATION_ENVIRONMENT_NAMES.includes(existingName.toUpperCase())
    ) {
      delete result[existingName];
    }
  }
  return { ...result, ...BUILD_CANARIES };
}

export function buildCanaryEvidence() {
  return Object.entries(BUILD_CANARIES)
    .map(([name, value]) => ({
      name,
      sha256: createHash("sha256").update(value, "utf8").digest("hex"),
    }))
    .sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
}

export function assertBuildCanariesAbsent(root) {
  const files = listRegularFiles(root);
  const matches = [];
  const uniqueCanaries = [...new Set(Object.values(BUILD_CANARIES))];
  for (const path of files) {
    const bytes = readFileSync(path);
    for (const canary of uniqueCanaries) {
      if (bytes.includes(Buffer.from(canary, "utf8"))) {
        matches.push(relative(root, path).replaceAll("\\", "/"));
        break;
      }
    }
  }
  if (matches.length !== 0) {
    throw new Error(
      `Runtime-configuration build canary leaked into governed output: ${matches.sort().join(", ")}`
    );
  }
  return Object.freeze({ filesScanned: files.length, canariesAbsent: true });
}

function listRegularFiles(root) {
  if (!existsSync(root) || !lstatSync(root).isDirectory()) {
    throw new Error(`Required governed output directory is absent: ${root}`);
  }
  const output = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      const stats = lstatSync(path);
      if (stats.isSymbolicLink()) {
        throw new Error(`Governed output contains a reparse point: ${path}`);
      }
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) output.push(path);
      else throw new Error(`Governed output contains a non-regular entry: ${path}`);
    }
  };
  visit(root);
  return output.sort();
}
