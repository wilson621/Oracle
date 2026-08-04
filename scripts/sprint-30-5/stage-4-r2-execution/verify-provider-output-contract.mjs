import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import {
  assertSupabaseOfflineEnvironment,
  buildSupabaseJsonArguments,
  createGovernedEnvironment,
  parseSupabaseJsonObject,
  validateApprovedTool,
  validateProcessEnvelope,
  validateSupabaseMachineReadableOutputPolicy,
} from "./stage4-core.mjs";

const approvedTools = Object.fromEntries(["node", "supabaseCli", "supabaseBinary"].map(name => [name, validateApprovedTool(name)]));
assert.equal(process.execPath.toLowerCase(), approvedTools.node.path.toLowerCase(), "Provider-output validator was not launched by the approved Node executable.");

const policy = validateSupabaseMachineReadableOutputPolicy();
assert.deepEqual(policy.commands, ["start", "status"]);
assert.deepEqual(buildSupabaseJsonArguments("start", ["--workdir", "C:\\governed path", "--exclude", "studio"]), ["start", "--workdir", "C:\\governed path", "--exclude", "studio", "--output", "json"]);
assert.deepEqual(buildSupabaseJsonArguments("status", ["--workdir", "C:\\governed path"]), ["status", "--workdir", "C:\\governed path", "--output", "json"]);
for (const args of [["--output", "yaml"], ["-o", "json"], ["--output=json"]]) assert.throws(() => buildSupabaseJsonArguments("start", args), /governed policy/u);
assert.throws(() => buildSupabaseJsonArguments("stop", []), /not approved/u);
assert.throws(() => buildSupabaseJsonArguments("start", [null]), /arguments are invalid/u);

assert.deepEqual(parseSupabaseJsonObject('{"API_URL":"http://127.0.0.1:54321"}\n', "fixture"), { API_URL: "http://127.0.0.1:54321" });
for (const fixture of ["", "   ", "Finished supabase start.\n", "╭────────────╮\n", "[]", "null", '"value"', "42", "true"]) assert.throws(() => parseSupabaseJsonObject(fixture, "fixture"));
for (const fixture of ["{", '{"API_URL":}', '{"API_URL":"ok"} trailing']) assert.throws(() => parseSupabaseJsonObject(fixture, "fixture"), /malformed JSON/u);

const governedPath = [...new Set(Object.values(approvedTools).map(tool => dirname(tool.path).toLowerCase()))].join(";");
const hostileEnvironment = {
  ...process.env,
  Path: "C:\\hostile",
  SUPABASE_TELEMETRY_DISABLED: "0",
  supabase_telemetry_disabled: "false",
  SUPABASE_CLI_BINARY_OVERRIDE: "C:\\hostile.exe",
  supabase_cli_binary_override: "C:\\other.exe",
};
const governedEnvironment = createGovernedEnvironment(hostileEnvironment, governedPath, approvedTools.supabaseBinary.path);
assertSupabaseOfflineEnvironment(governedEnvironment, approvedTools.supabaseBinary.path);
assert.equal(governedEnvironment.Path, governedPath);

const help = spawnSync(approvedTools.node.path, [approvedTools.supabaseCli.path, "start", "--help"], {
  encoding: "utf8",
  env: governedEnvironment,
  maxBuffer: 4 * 1024 * 1024,
  shell: false,
});
validateProcessEnvelope(help);
assert.match(help.stdout, /--output, -o choice\s+Output format of status variables\. \(choices: env, pretty, json, toml, yaml, table, csv\)/u, "Locked Supabase CLI does not expose the contracted JSON output option for start.");

console.log(JSON.stringify({
  result: "passed",
  classification: "STAGE-4-R2-SUPABASE-OUTPUT-CONTRACT-VALIDATION",
  supabaseCliVersion: "2.109.1",
  jsonCommands: policy.commands,
  hostileEnvironmentRejected: true,
  humanReadableOutputRejected: true,
  malformedJsonRejected: true,
}, null, 2));
