import {
  lstatSync,
  realpathSync,
} from "node:fs";
import {
  isAbsolute,
  join,
  normalize,
  resolve,
} from "node:path";
import type {
  InstalledRuntimeEnvironment,
} from "./installed-runtime-configuration.js";

const LOOPBACK_HOST = "127.0.0.1";
const RUNTIME_KEYS = [
  "ORACLE_SUPABASE_URL",
  "ORACLE_SUPABASE_ANON_KEY",
  "ORACLE_WEB_SESSION_SECRET",
  "SUPABASE_SECRET_KEY",
] as const;

type PackagedServerEnvironmentOptions = Readonly<{
  platform?: NodeJS.Platform;
  platformEnvironment?: Readonly<Record<string, string | undefined>>;
}>;

export function createPackagedServerEnvironment(
  runtime: InstalledRuntimeEnvironment,
  port: number,
  options: PackagedServerEnvironmentOptions = {}
): Readonly<Record<string, string>> {
  if (
    (options.platform ?? process.platform) !== "win32" ||
    !Number.isSafeInteger(port) ||
    port < 1 ||
    port > 65_535
  ) {
    throw new Error("Packaged server platform or port is invalid.");
  }
  assertExactRuntimeEnvironment(runtime);

  const systemRoot = resolveSystemRoot(
    options.platformEnvironment ?? process.env
  );
  return Object.freeze({
    ...runtime,
    SystemRoot: systemRoot,
    NODE_ENV: "production",
    HOSTNAME: LOOPBACK_HOST,
    PORT: String(port),
  });
}

function assertExactRuntimeEnvironment(
  runtime: InstalledRuntimeEnvironment
): void {
  const actual = Object.keys(runtime).sort();
  const expected = [...RUNTIME_KEYS].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index]) ||
    RUNTIME_KEYS.some((key) =>
      typeof runtime[key] !== "string" || runtime[key].length === 0
    )
  ) {
    throw new Error("Packaged server runtime environment is invalid.");
  }
}

function resolveSystemRoot(
  environment: Readonly<Record<string, string | undefined>>
): string {
  const value = environment.SystemRoot;
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\0") ||
    !isAbsolute(value)
  ) {
    throw new Error("Windows SystemRoot is unavailable.");
  }

  const root = resolve(value);
  const rootStat = lstatSync(root);
  const bcrypt = join(root, "System32", "bcrypt.dll");
  const bcryptStat = lstatSync(bcrypt);
  if (
    !rootStat.isDirectory() ||
    rootStat.isSymbolicLink() ||
    !bcryptStat.isFile() ||
    bcryptStat.isSymbolicLink() ||
    canonicalWindowsPath(realpathSync.native(root)) !==
      canonicalWindowsPath(root) ||
    canonicalWindowsPath(realpathSync.native(bcrypt)) !==
      canonicalWindowsPath(bcrypt)
  ) {
    throw new Error("Windows SystemRoot identity is invalid.");
  }
  return root;
}

function canonicalWindowsPath(value: string): string {
  const withoutDeviceNamespace = value.startsWith("\\\\?\\")
    ? value.slice(4)
    : value;
  return normalize(resolve(withoutDeviceNamespace)).toUpperCase();
}
