import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  consumeInstalledRuntimeConfiguration,
} from "../desktop/runtime/installed-runtime-configuration";
import {
  createPackagedRequestOrigins,
  isAllowedPackagedRequestUrl,
} from "../desktop/runtime/packaged-request-origins";
import {
  validatePublicRuntimeConfiguration,
} from "../lib/oracle/runtime/public-runtime-configuration";
import {
  getBrowserPublicRuntimeConfiguration,
} from "../lib/oracle/runtime/browser-runtime-configuration";
import {
  resolvePublicRuntimeConfiguration,
} from "../lib/oracle/runtime/runtime-environment-policy";

const now = new Date("2026-08-03T12:05:00.000Z");
let negativeCases = 0;
const execution = "stage5-r1-20260803T120000000Z-a1b2c3d4";
const family = "Oracle.Platform.LocalCertification_fw69ec0wxwzn4";
const localAppData = mkdtempSync(join(tmpdir(), "oracle-runtime-config-"));
const configurationPath = join(
  localAppData,
  "Packages",
  family,
  "LocalState",
  "Oracle",
  "QualificationRuntime",
  `runtime-${execution}`,
  "runtime.json"
);

try {
  const valid = fixture();
  const success = writeFixture(valid);
  const consumed = consumeInstalledRuntimeConfiguration(success.argv, {
    localAppData,
    now,
  });
  assert.equal(consumed.configurationId, `runtime-${execution}`);
  assert.equal(consumed.authorityId, `authority-${execution}`);
  assert.equal(consumed.attemptId, execution);
  assert.equal(consumed.packageFamilyName, family);
  assert.equal(consumed.environment.ORACLE_SUPABASE_URL, "http://127.0.0.1:54321");
  assert.equal(consumed.environment.ORACLE_WEB_SESSION_SECRET, "s".repeat(48));
  assert.equal(consumed.environment.SUPABASE_SECRET_KEY, "k".repeat(96));
  assert.equal(existsSync(configurationPath), false);

  expectRejected([], "activation-arguments-invalid");
  expectRejected([
    "--oracle-runtime-configuration=C:\\wrong.json",
    `--oracle-runtime-configuration-sha256=${"0".repeat(64)}`,
    `--oracle-runtime-configuration-sha256=${"1".repeat(64)}`,
  ], "activation-arguments-invalid");

  writeFixture(valid);
  expectRejected(
    [
      `--oracle-runtime-configuration=${configurationPath}`,
      `--oracle-runtime-configuration-sha256=${"0".repeat(64)}`,
    ],
    "digest-mismatch"
  );
  assert.equal(existsSync(configurationPath), false);

  const mutations: ReadonlyArray<
    readonly [
      string,
      (value: ConfigurationFixture) => unknown,
      string,
    ]
  > = [
    ["malformed-json", () => "{", "json-invalid"],
    [
      "extra-member",
      (value) => ({ ...value, unexpected: true }),
      "members-invalid",
    ],
    [
      "stale",
      (value) => ({
        ...value,
        expiresAtUtc: "2026-08-03T12:04:59.999Z",
      }),
      "validity-window-invalid",
    ],
    [
      "long-lived",
      (value) => ({
        ...value,
        expiresAtUtc: "2026-08-03T12:16:00.001Z",
      }),
      "validity-window-invalid",
    ],
    [
      "wrong-provider",
      (value) => ({
        ...value,
        provider: {
          ...value.provider,
          url: "http://localhost:54321",
        },
      }),
      "provider-url-invalid",
    ],
    [
      "missing-service-key",
      (value) => ({
        ...value,
        provider: {
          url: value.provider.url,
          anonKey: value.provider.anonKey,
        },
      }),
      "members-invalid",
    ],
    [
      "identity-mismatch",
      (value) => ({
        ...value,
        attemptId: "stage5-r1-20260803T120000000Z-deadbeef",
      }),
      "execution-identity-mismatch",
    ],
    [
      "missing-session-secret",
      (value) => ({ ...value, session: {} }),
      "members-invalid",
    ],
  ];
  for (const [name, mutate, code] of mutations) {
    const prepared = writeFixture(mutate(fixture()));
    expectRejected(prepared.argv, code, name);
    assert.equal(existsSync(configurationPath), false);
  }
  const wrongDirectory = writeFixture(valid, "runtime-stage5-r1-20260803T120000000Z-deadbeef");
  expectRejected(wrongDirectory.argv, "path-binding-mismatch");

  assert.deepEqual(
    validatePublicRuntimeConfiguration(
      "http://127.0.0.1:54321",
      "a".repeat(32)
    ),
    {
      supabaseUrl: "http://127.0.0.1:54321",
      supabaseAnonKey: "a".repeat(32),
    }
  );
  assert.deepEqual(
    validatePublicRuntimeConfiguration(
      "https://provider.example",
      "a".repeat(32)
    ).supabaseUrl,
    "https://provider.example"
  );
  assert.throws(
    () => validatePublicRuntimeConfiguration("http://provider.example", "a".repeat(32)),
    /unavailable/u
  );

  withRuntimeEnvironment(
    {
      ORACLE_SUPABASE_URL: "http://127.0.0.1:54321",
      ORACLE_SUPABASE_ANON_KEY: "a".repeat(32),
    },
    () => assert.equal(
      resolvePublicRuntimeConfiguration(process.env).supabaseUrl,
      "http://127.0.0.1:54321"
    )
  );
  withRuntimeEnvironment(
    {
      NEXT_PUBLIC_SUPABASE_URL: "https://source.example",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "b".repeat(32),
    },
    () => assert.equal(
      resolvePublicRuntimeConfiguration(process.env).supabaseUrl,
      "https://source.example"
    )
  );
  withRuntimeEnvironment(
    {
      ORACLE_SUPABASE_URL: "http://127.0.0.1:54321",
      ORACLE_SUPABASE_ANON_KEY: "a".repeat(32),
      NEXT_PUBLIC_SUPABASE_URL: "https://conflict.example",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "b".repeat(32),
    },
    () => assert.throws(
      () => resolvePublicRuntimeConfiguration(process.env),
      /ambiguous/u
    )
  );
  withRuntimeEnvironment(
    { ORACLE_SUPABASE_URL: "http://127.0.0.1:54321" },
    () => assert.throws(
      () => resolvePublicRuntimeConfiguration(process.env),
      /incomplete/u
    )
  );

  const publicMeta = new Map([
    ["oracle-runtime-supabase-url", "http://127.0.0.1:54321"],
    ["oracle-runtime-supabase-anon-key", "a".repeat(32)],
  ]);
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelectorAll(selector: string) {
        const name = selector.match(/^meta\[name="([^"]+)"\]$/u)?.[1];
        const value = name ? publicMeta.get(name) : undefined;
        return value === undefined ? [] : [{ content: value }];
      },
    },
  });
  assert.deepEqual(getBrowserPublicRuntimeConfiguration(), {
    supabaseUrl: "http://127.0.0.1:54321",
    supabaseAnonKey: "a".repeat(32),
  });
  publicMeta.delete("oracle-runtime-supabase-url");
  assert.throws(() => getBrowserPublicRuntimeConfiguration(), /unavailable/u);
  delete (globalThis as { document?: unknown }).document;

  const localOrigins = createPackagedRequestOrigins(
    "http://127.0.0.1:41000",
    "http://127.0.0.1:54321"
  );
  assert.deepEqual([...localOrigins].sort(), [
    "http://127.0.0.1:41000",
    "http://127.0.0.1:54321",
    "ws://127.0.0.1:54321",
  ]);
  assert.equal(
    isAllowedPackagedRequestUrl(
      "http://127.0.0.1:54321/auth/v1/user",
      localOrigins
    ),
    true
  );
  assert.equal(
    isAllowedPackagedRequestUrl(
      "ws://127.0.0.1:54321/realtime/v1/websocket",
      localOrigins
    ),
    true
  );
  assert.equal(
    isAllowedPackagedRequestUrl(
      "http://127.0.0.1:54322/auth/v1/user",
      localOrigins
    ),
    false
  );
  assert.deepEqual(
    [...createPackagedRequestOrigins(
      "https://renderer.example",
      "https://provider.example"
    )].sort(),
    [
      "https://provider.example",
      "https://renderer.example",
      "wss://provider.example",
    ]
  );
  for (const invalidOrigin of [
    "http://provider.example",
    "http://localhost:54321",
    "http://127.0.0.1:54321/path",
    "http://user:password@127.0.0.1:54321",
  ]) {
    assert.throws(
      () => createPackagedRequestOrigins(
        "http://127.0.0.1:41000",
        invalidOrigin
      ),
      /origin is invalid/u
    );
  }

  const packagedServer = readFileSync(
    "desktop/runtime/packaged-next-server.ts",
    "utf8"
  );
  const browserClient = readFileSync("lib/supabase-client.ts", "utf8");
  const layout = readFileSync("app/layout.tsx", "utf8");
  const serverRuntime = readFileSync(
    "lib/oracle/runtime/server-runtime-configuration.ts",
    "utf8"
  );
  const environmentPolicy = readFileSync(
    "lib/oracle/runtime/runtime-environment-policy.ts",
    "utf8"
  );
  assert.doesNotMatch(packagedServer, /startUnavailableServer|fallbackServer/u);
  assert.match(packagedServer, /\.\.\.environment/u);
  assert.doesNotMatch(browserClient, /SUPABASE_SECRET_KEY|ORACLE_WEB_SESSION_SECRET/u);
  assert.doesNotMatch(layout, /SUPABASE_SECRET_KEY|ORACLE_WEB_SESSION_SECRET/u);
  assert.match(packagedServer, /ORACLE_WEB_SESSION_SECRET|\.\.\.environment/u);
  assert.doesNotMatch(browserClient, /process\.env/u);
  assert.match(layout, /oracle\/services\/runtime-configuration/u);
  assert.match(serverRuntime, /resolvePublicRuntimeConfiguration\(process\.env\)/u);
  assert.match(environmentPolicy, /environment\["ORACLE_SUPABASE_URL"\]/u);
  assert.match(environmentPolicy, /environment\["NEXT_PUBLIC_SUPABASE_URL"\]/u);
  assert.doesNotMatch(environmentPolicy, /process\.env\.NEXT_PUBLIC_/u);

  process.stdout.write(JSON.stringify({
    contract: "oracle.installed-runtime-configuration",
    contractVersion: 1,
    positiveConsumption: "pass",
    oneTimeDeletion: "pass",
    negativeCases,
    publicProjection: "url-and-anon-key-only",
    privilegedProviderCredentialInPackageBytes: false,
    result: "pass",
  }, null, 2) + "\n");
} finally {
  rmSync(localAppData, { recursive: true, force: true });
}

type ConfigurationFixture = ReturnType<typeof fixture>;

function fixture() {
  return {
    contract: {
      name: "oracle.installed-runtime-configuration",
      version: 1,
    },
    configurationId: `runtime-${execution}`,
    purpose: "local-qualification",
    issuedAtUtc: "2026-08-03T12:00:00.000Z",
    expiresAtUtc: "2026-08-03T12:10:00.000Z",
    founderGrantId: "founder-stage5-r1-grant-20260803T120000000Z-a1b2c3d4",
    authorityId: `authority-${execution}`,
    attemptId: execution,
    package: {
      identity: "Oracle.Platform.LocalCertification",
      familyName: family,
    },
    candidate: {
      commit: "a".repeat(40),
      tree: "b".repeat(40),
      msixSha256: "c".repeat(64),
    },
    provider: {
      url: "http://127.0.0.1:54321",
      anonKey: "a".repeat(96),
      serviceKey: "k".repeat(96),
    },
    session: {
      secret: "s".repeat(48),
    },
  };
}

function writeFixture(
  value: unknown,
  directory = `runtime-${execution}`
) {
  const path = directory === `runtime-${execution}`
    ? configurationPath
    : join(
        localAppData,
        "Packages",
        family,
        "LocalState",
        "Oracle",
        "QualificationRuntime",
        directory,
        "runtime.json"
      );
  mkdirSync(join(path, ".."), { recursive: true });
  const text = typeof value === "string" ? value : JSON.stringify(value);
  writeFileSync(path, text, { encoding: "utf8", flag: "wx" });
  const sha256 = createHash("sha256").update(text).digest("hex");
  return {
    argv: [
      `--oracle-runtime-configuration=${path}`,
      `--oracle-runtime-configuration-sha256=${sha256}`,
    ],
  };
}

function withRuntimeEnvironment(
  values: Readonly<Record<string, string>>,
  action: () => void
): void {
  const names = [
    "ORACLE_SUPABASE_URL",
    "ORACLE_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;
  const previous = new Map(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    Object.assign(process.env, values);
    action();
  } finally {
    for (const name of names) {
      const value = previous.get(name);
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

function expectRejected(
  argv: string[],
  code: string,
  name = code
): void {
  assert.throws(
    () => consumeInstalledRuntimeConfiguration(argv, { localAppData, now }),
    new RegExp(`${code}\\.`, "u"),
    name
  );
  negativeCases += 1;
}
