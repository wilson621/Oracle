import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
} from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
} from "node:path";

const CONTRACT_NAME = "oracle.installed-runtime-configuration";
const CONFIGURATION_FILE = "runtime.json";
const PACKAGE_IDENTITY = "Oracle.Platform.LocalCertification";
const MAXIMUM_FILE_BYTES = 32_768;
const MAXIMUM_LIFETIME_MS = 15 * 60 * 1000;
const CONFIGURATION_ID = /^runtime-(stage[0-9]+-r[0-9]+-[0-9]{8}T[0-9]{9}Z-[0-9a-f]{8})$/u;
const AUTHORITY_ID = /^authority-(stage[0-9]+-r[0-9]+-[0-9]{8}T[0-9]{9}Z-[0-9a-f]{8})$/u;
const ATTEMPT_ID = /^(stage[0-9]+-r[0-9]+-[0-9]{8}T[0-9]{9}Z-[0-9a-f]{8})$/u;
const FOUNDER_GRANT_ID = /^founder-(stage[0-9]+-r[0-9]+)-grant-([0-9]{8}T[0-9]{9}Z-[0-9a-f]{8})$/u;
const GIT_ID = /^[0-9a-f]{40}$/u;
const SHA256 = /^[0-9a-f]{64}$/u;
const PACKAGE_FAMILY = /^Oracle\.Platform\.LocalCertification_[a-z0-9]{13}$/u;

export type InstalledRuntimeEnvironment = Readonly<{
  ORACLE_SUPABASE_URL: string;
  ORACLE_SUPABASE_ANON_KEY: string;
  ORACLE_WEB_SESSION_SECRET: string;
  SUPABASE_SECRET_KEY: string;
}>;

export type ConsumedInstalledRuntimeConfiguration = Readonly<{
  configurationId: string;
  authorityId: string;
  attemptId: string;
  packageFamilyName: string;
  candidateCommit: string;
  candidateTree: string;
  msixSha256: string;
  expiresAtUtc: string;
  environment: InstalledRuntimeEnvironment;
}>;

type ConsumeOptions = Readonly<{
  localAppData?: string;
  now?: Date;
}>;

export function consumeInstalledRuntimeConfiguration(
  argv: readonly string[],
  options: ConsumeOptions = {}
): ConsumedInstalledRuntimeConfiguration {
  const activation = parseActivationArguments(argv);
  const localAppData = resolveLocalAppData(options.localAppData);
  const originalPath = resolve(activation.path);
  assertInitialPath(originalPath, localAppData);

  const consumingPath = `${originalPath}.consuming-${process.pid}`;
  if (existsSync(consumingPath)) reject("consuming-path-exists");
  try {
    renameSync(originalPath, consumingPath);
  } catch {
    reject("atomic-consume-failed");
  }

  try {
    assertRegularUnredirectedFile(consumingPath, localAppData);
    const size = statSync(consumingPath).size;
    if (size <= 0 || size > MAXIMUM_FILE_BYTES) {
      reject("file-size-invalid");
    }
    const bytes = readFileSync(consumingPath);
    const observedSha256 = createHash("sha256").update(bytes).digest("hex");
    if (observedSha256 !== activation.sha256) reject("digest-mismatch");
    return validateConfiguration(
      parseObjectJson(bytes),
      originalPath,
      localAppData,
      options.now ?? new Date()
    );
  } finally {
    try {
      if (existsSync(consumingPath)) unlinkSync(consumingPath);
    } catch {
      reject("consumed-file-removal-failed");
    }
  }
}

function parseActivationArguments(argv: readonly string[]) {
  const pathPrefix = "--oracle-runtime-configuration=";
  const hashPrefix = "--oracle-runtime-configuration-sha256=";
  const paths = argv
    .filter((value) => value.startsWith(pathPrefix))
    .map((value) => value.slice(pathPrefix.length));
  const hashes = argv
    .filter((value) => value.startsWith(hashPrefix))
    .map((value) => value.slice(hashPrefix.length));
  const unknown = argv.filter(
    (value) =>
      value.startsWith("--oracle-") &&
      !value.startsWith(pathPrefix) &&
      !value.startsWith(hashPrefix)
  );
  if (
    paths.length !== 1 ||
    hashes.length !== 1 ||
    unknown.length !== 0 ||
    !isAbsolute(paths[0]) ||
    !SHA256.test(hashes[0])
  ) {
    reject("activation-arguments-invalid");
  }
  return { path: paths[0], sha256: hashes[0] };
}

function validateConfiguration(
  value: Record<string, unknown>,
  originalPath: string,
  localAppData: string,
  now: Date
): ConsumedInstalledRuntimeConfiguration {
  requireExactKeys(value, [
    "contract", "configurationId", "purpose", "issuedAtUtc", "expiresAtUtc",
    "founderGrantId", "authorityId", "attemptId", "package", "candidate",
    "provider", "session",
  ]);
  const contract = requireObject(value.contract);
  requireExactKeys(contract, ["name", "version"]);
  if (contract.name !== CONTRACT_NAME || contract.version !== 1) {
    reject("contract-invalid");
  }
  if (value.purpose !== "local-qualification") reject("purpose-invalid");

  const configurationMatch = requireMatch(value.configurationId, CONFIGURATION_ID);
  const authorityMatch = requireMatch(value.authorityId, AUTHORITY_ID);
  const attemptMatch = requireMatch(value.attemptId, ATTEMPT_ID);
  const grantMatch = requireMatch(value.founderGrantId, FOUNDER_GRANT_ID);
  const executionIdentity = attemptMatch[1];
  if (
    configurationMatch[1] !== executionIdentity ||
    authorityMatch[1] !== executionIdentity ||
    `${grantMatch[1]}-${grantMatch[2]}` !== executionIdentity
  ) {
    reject("execution-identity-mismatch");
  }

  const issuedAtUtc = requireUtcTimestamp(value.issuedAtUtc);
  const expiresAtUtc = requireUtcTimestamp(value.expiresAtUtc);
  const issuedAt = Date.parse(issuedAtUtc);
  const expiresAt = Date.parse(expiresAtUtc);
  const current = now.getTime();
  if (
    !Number.isFinite(current) ||
    expiresAt <= issuedAt ||
    expiresAt - issuedAt > MAXIMUM_LIFETIME_MS ||
    current < issuedAt ||
    current >= expiresAt
  ) {
    reject("validity-window-invalid");
  }

  const packageBinding = requireObject(value.package);
  requireExactKeys(packageBinding, ["identity", "familyName"]);
  if (packageBinding.identity !== PACKAGE_IDENTITY) reject("package-identity-invalid");
  const packageFamilyName = requireStringPattern(
    packageBinding.familyName,
    PACKAGE_FAMILY
  );

  const candidate = requireObject(value.candidate);
  requireExactKeys(candidate, ["commit", "tree", "msixSha256"]);
  const candidateCommit = requireStringPattern(candidate.commit, GIT_ID);
  const candidateTree = requireStringPattern(candidate.tree, GIT_ID);
  const msixSha256 = requireStringPattern(candidate.msixSha256, SHA256);

  const provider = requireObject(value.provider);
  requireExactKeys(provider, ["url", "anonKey", "serviceKey"]);
  const providerUrl = requireProviderUrl(provider.url);
  const anonKey = requireCredential(provider.anonKey, 20, 4096);
  const serviceKey = requireCredential(provider.serviceKey, 20, 4096);

  const session = requireObject(value.session);
  requireExactKeys(session, ["secret"]);
  const sessionSecret = requireCredential(session.secret, 32, 256);

  const configurationId = String(value.configurationId);
  const expectedPath = join(
    localAppData,
    "Packages",
    packageFamilyName,
    "LocalState",
    "Oracle",
    "QualificationRuntime",
    configurationId,
    CONFIGURATION_FILE
  );
  if (!sameWindowsPath(originalPath, expectedPath)) {
    reject("path-binding-mismatch");
  }

  return Object.freeze({
    configurationId,
    authorityId: String(value.authorityId),
    attemptId: String(value.attemptId),
    packageFamilyName,
    candidateCommit,
    candidateTree,
    msixSha256,
    expiresAtUtc,
    environment: Object.freeze({
      ORACLE_SUPABASE_URL: providerUrl,
      ORACLE_SUPABASE_ANON_KEY: anonKey,
      ORACLE_WEB_SESSION_SECRET: sessionSecret,
      SUPABASE_SECRET_KEY: serviceKey,
    }),
  });
}

function assertInitialPath(path: string, localAppData: string): void {
  if (basename(path) !== CONFIGURATION_FILE) reject("file-name-invalid");
  const packagesRoot = join(localAppData, "Packages");
  const child = relative(packagesRoot, path);
  if (child === "" || child.startsWith("..") || isAbsolute(child)) {
    reject("path-outside-package-state");
  }
}

function assertRegularUnredirectedFile(path: string, localAppData: string): void {
  const root = lstatSync(join(localAppData, "Packages"));
  if (!root.isDirectory() || root.isSymbolicLink()) {
    reject("reparse-redirection-detected");
  }
  const file = lstatSync(path);
  if (!file.isFile() || file.isSymbolicLink()) reject("file-type-invalid");

  const packagesRoot = join(localAppData, "Packages");
  let cursor = dirname(path);
  while (!sameWindowsPath(cursor, packagesRoot)) {
    const stat = lstatSync(cursor);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      reject("reparse-redirection-detected");
    }
    const parent = dirname(cursor);
    if (sameWindowsPath(parent, cursor)) reject("path-outside-package-state");
    cursor = parent;
  }
  const physicalPackagesRoot = realpathSync.native(packagesRoot);
  const physicalPath = realpathSync.native(path);
  const physicalChild = relative(physicalPackagesRoot, physicalPath);
  if (
    physicalChild === "" ||
    physicalChild.startsWith("..") ||
    isAbsolute(physicalChild)
  ) {
    reject("real-path-mismatch");
  }
}

function parseObjectJson(bytes: Buffer): Record<string, unknown> {
  try {
    return requireObject(JSON.parse(bytes.toString("utf8")) as unknown);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Installed runtime")) {
      throw error;
    }
    return reject("json-invalid");
  }
}

function requireObject(value: unknown): Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    reject("object-shape-invalid");
  }
  return value as Record<string, unknown>;
}

function requireExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[]
): void {
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  if (
    actual.length !== required.length ||
    actual.some((key, index) => key !== required[index])
  ) {
    reject("members-invalid");
  }
}

function requireMatch(value: unknown, pattern: RegExp): RegExpMatchArray {
  if (typeof value !== "string") reject("identity-invalid");
  const match = value.match(pattern);
  if (!match) reject("identity-invalid");
  return match;
}

function requireStringPattern(value: unknown, pattern: RegExp): string {
  if (typeof value !== "string" || !pattern.test(value)) {
    reject("identity-invalid");
  }
  return value;
}

function requireUtcTimestamp(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/u.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    reject("timestamp-invalid");
  }
  return value;
}

function requireProviderUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 2048) {
    reject("provider-url-invalid");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return reject("provider-url-invalid");
  }
  if (
    url.protocol !== "http:" ||
    url.hostname !== "127.0.0.1" ||
    !url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.origin !== value
  ) {
    reject("provider-url-invalid");
  }
  return value;
}

function requireCredential(
  value: unknown,
  minimum: number,
  maximum: number
): string {
  if (
    typeof value !== "string" ||
    value.length < minimum ||
    value.length > maximum ||
    /\s/u.test(value)
  ) {
    reject("credential-shape-invalid");
  }
  return value;
}

function resolveLocalAppData(override: string | undefined): string {
  const value = override ?? process.env.LOCALAPPDATA;
  if (!value || !isAbsolute(value)) reject("local-app-data-unavailable");
  return resolve(value);
}

function sameWindowsPath(left: string, right: string): boolean {
  return canonicalWindowsPath(left) === canonicalWindowsPath(right);
}

function canonicalWindowsPath(value: string): string {
  const withoutDeviceNamespace = value.startsWith("\\\\?\\")
    ? value.slice(4)
    : value;
  return normalize(resolve(withoutDeviceNamespace)).toUpperCase();
}

function reject(code: string): never {
  throw new Error(`Installed runtime configuration rejected: ${code}.`);
}
