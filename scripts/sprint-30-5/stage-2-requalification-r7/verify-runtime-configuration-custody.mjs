import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  RUNTIME_CONFIGURATION_ENVIRONMENT_NAMES,
  assertBuildCanariesAbsent,
  assertNoAmbientRuntimeConfiguration,
  buildCanaryEvidence,
  createDeterministicBuildEnvironment,
} from "./runtime-configuration-custody.mjs";

const root = mkdtempSync(join(tmpdir(), "oracle-r7-runtime-custody-"));
try {
  assert.doesNotThrow(() => assertNoAmbientRuntimeConfiguration(root, {}));
  for (const name of RUNTIME_CONFIGURATION_ENVIRONMENT_NAMES) {
    assert.throws(
      () => assertNoAmbientRuntimeConfiguration(root, { [name.toLowerCase()]: "value" }),
      /Ambient runtime configuration is prohibited/u
    );
  }
  writeFileSync(join(root, ".env.local"), "SECRET=fixture\n", "utf8");
  assert.throws(
    () => assertNoAmbientRuntimeConfiguration(root, {}),
    /Ambient environment files are prohibited/u
  );
  rmSync(join(root, ".env.local"));

  const built = createDeterministicBuildEnvironment({ Path: "fixture-path", oracle_supabase_url: "hostile" });
  assert.equal(built.Path, "fixture-path");
  assert.equal(built.oracle_supabase_url, undefined);
  assert.equal(built.ORACLE_SUPABASE_URL, "https://r7-build-canary.invalid");
  assert.equal(buildCanaryEvidence().length, 6);
  assert.ok(buildCanaryEvidence().every((entry) => /^[0-9a-f]{64}$/u.test(entry.sha256)));

  const output = join(root, "output");
  mkdirSync(output);
  writeFileSync(join(output, "safe.bin"), Buffer.from([0, 1, 2, 3]));
  assert.deepEqual(assertBuildCanariesAbsent(output), {
    filesScanned: 1,
    canariesAbsent: true,
  });
  writeFileSync(join(output, "leak.txt"), "oracle-r7-service-canary-not-a-secret", "utf8");
  assert.throws(
    () => assertBuildCanariesAbsent(output),
    /build canary leaked/u
  );
  console.log(
    JSON.stringify({
      contract: "oracle.sprint-30-5.stage-2-requalification-r7-runtime-custody-regression",
      status: "PASS",
      cases: 12,
    })
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}
