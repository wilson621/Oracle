import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { constants, copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { admitAttemptDirectoryLayout, assertNoLinkTraversal, assertSupabaseOfflineEnvironment, buildSupabaseJsonArguments, contract, createGovernedEnvironment, parseSupabaseJsonObject, redactEvidence, repositoryRoot, validateApprovedTool, validateProcessEnvelope, validateSupabaseOfflinePolicy, writeJsonAtomicCreateOnly } from "./stage4-core.mjs";

const teardownOnly = process.argv.length === 3 && process.argv[2] === "--teardown-only";
if (process.argv.length > (teardownOnly ? 3 : 2)) throw new Error("Unexpected live-environment arguments.");
const mode = process.env.ORACLE_STAGE4_EXECUTION_MODE;
if (mode !== "qualification" && mode !== "development-rehearsal") throw new Error("Explicit Stage 4 execution mode is absent.");
const installedDevelopmentRehearsal = mode === "development-rehearsal" && process.env.ORACLE_STAGE4_INSTALLED_DEVELOPMENT_REHEARSAL === "1";
const attemptRoot = resolve(process.env.ORACLE_STAGE4_ATTEMPT_ROOT ?? "");
const output = resolve(process.env.ORACLE_STAGE4_JOURNEY_OUTPUT ?? "");
const transferRoot = mode === "qualification" ? resolve(process.env.ORACLE_STAGE4_TRANSFER_ROOT ?? "") : null;
if (mode === "qualification") assertNoLinkTraversal(transferRoot, resolve(repositoryRoot, contract.paths.transferRoot));
const migrationSourceRoot = mode === "qualification" ? join(transferRoot, contract.transfer.migrationsRelativePath) : join(repositoryRoot, "database");
const artifactBoundary = resolve(repositoryRoot, mode === "qualification" ? contract.paths.artifactRoot : contract.paths.rehearsalRoot);
assertNoLinkTraversal(attemptRoot, artifactBoundary);
if (mode === "qualification") {
  const qualificationAttemptId = process.env.ORACLE_STAGE5_QUALIFICATION_ATTEMPT_ID ?? "";
  assert.match(qualificationAttemptId, new RegExp(contract.identity.attemptPattern, "u"));
  const expectedCycleRoot = resolve(repositoryRoot, contract.paths.artifactRoot, qualificationAttemptId, "cycles", `cycle-${process.env.ORACLE_STAGE5_QUALIFICATION_CYCLE_INDEX ?? ""}`);
  assert.equal(attemptRoot.toLowerCase(), expectedCycleRoot.toLowerCase(), "Stage 5 cycle root differs from its authority-bound identity.");
  const authorityPath = process.env.ORACLE_STAGE4_AUTHORITY_RECORD;
  if (!authorityPath || !existsSync(authorityPath)) throw new Error("Qualification controller authority record is absent.");
  const authority = JSON.parse(readFileSync(authorityPath, "utf8"));
  if (authority.attemptId !== qualificationAttemptId || authority.consumed !== true) throw new Error("Qualification controller authority binding failed.");
} else if (process.env.ORACLE_STAGE4_DEVELOPMENT_REHEARSAL !== "1") {
  throw new Error("Development rehearsal classification is absent.");
}
const expectedOutput = join(attemptRoot, "evidence", "live-journey.json");
if (output !== expectedOutput || (!teardownOnly && existsSync(output))) throw new Error("Attempt-scoped live-environment output is invalid.");
const admission = mode === "qualification"
  ? contract.attemptDirectoryOwnership.stage5CycleControllerAdmission
  : contract.attemptDirectoryOwnership.rehearsalControllerAdmission;
const { providerRoot, logsRoot } = admitAttemptDirectoryLayout({
  attemptRoot,
  artifactBoundary,
  teardownOnly,
  expectedRootEntries: admission.rootEntries,
  expectedLogFiles: admission.logFiles,
});
const approvedTools = Object.fromEntries(["git", "node", "npmCli", "supabaseCli", "supabaseBinary", "docker", "powershell", "taskkill"].map(name => [name, validateApprovedTool(name)]));
const supabaseOfflinePolicy = validateSupabaseOfflinePolicy();
const supabaseCli = approvedTools.supabaseCli.path;
const supabaseBinary = approvedTools.supabaseBinary.path;
const docker = process.env.ORACLE_STAGE4_DOCKER_PATH;
const npmCli = process.env.ORACLE_STAGE4_NPM_CLI_PATH;
const node = process.env.ORACLE_STAGE4_NODE_PATH;
const powershell = process.env.ORACLE_STAGE4_POWERSHELL_PATH;
const taskkill = process.env.ORACLE_STAGE4_TASKKILL_PATH;
for (const [name, path] of Object.entries({ supabaseCli, docker, npmCli, node, powershell, taskkill })) {
  if (!path || !existsSync(path) || resolve(path).toLowerCase() !== resolve(approvedTools[name].path).toLowerCase()) throw new Error(`Bound ${name} identity differs from the contract-approved tool.`);
}
if (resolve(node).toLowerCase() !== resolve(process.execPath).toLowerCase()) throw new Error("Controller Node executable differs from the contract-bound Node executable.");
const governedPath = [...new Set(Object.values(approvedTools).map(tool => dirname(tool.path).toLowerCase()))].join(";");
const governedEnvironment = createGovernedEnvironment(process.env, governedPath, supabaseBinary);
const exclude = "edge-runtime,imgproxy,logflare,postgres-meta,realtime,storage-api,studio,supavisor,vector";
let server;
let serverText = "";
let serverError = null;
let providerStarted = false;
let installedControllerPassed = false;
let secrets = [];
let primaryFailure = null;
const cleanupFailures = [];
const records = [];
const phaseEvents = [];
const mark = (phase, details = {}) => phaseEvents.push({ phase, observedAtUtc: new Date().toISOString(), details });


try {
  if (teardownOnly) {
    await performCleanup();
  } else {
    run("provider-init", node, [supabaseCli, "init", "--workdir", providerRoot]); mark("provider-initialized");
    const configPath = join(providerRoot, "supabase", "config.toml");
    let config = readFileSync(configPath, "utf8");
    config = config.replace(/project_id = ".*"/u, 'project_id = "oracle-stage5-r1-disposable"')
      .replace('site_url = "http://127.0.0.1:3000"', 'site_url = "http://127.0.0.1:4314"')
      .replace('additional_redirect_urls = ["https://127.0.0.1:3000"]', 'additional_redirect_urls = ["http://127.0.0.1:4314/auth/callback"]')
      .replace("enable_confirmations = false", "enable_confirmations = true")
      .replace("minimum_password_length = 6", "minimum_password_length = 8");
    for (const expected of ['project_id = "oracle-stage5-r1-disposable"', 'site_url = "http://127.0.0.1:4314"', 'additional_redirect_urls = ["http://127.0.0.1:4314/auth/callback"]', "enable_confirmations = true", "minimum_password_length = 8"]) if (!config.includes(expected)) throw new Error(`Supabase configuration binding is absent: ${expected}`);
    writeFileSync(configPath, config);
    const migrations = join(providerRoot, "supabase", "migrations"); mkdirSync(migrations, { recursive: false });
    const migrationNames = readdirSync(migrationSourceRoot).filter(name => /^\d{3}_.+\.sql$/u.test(name)).sort(codePointCompare);
    assert.deepEqual(migrationNames, contract.provider.requiredMigrations, "Accepted migration chain differs from the contract.");
    migrationNames.forEach((name, index) => copyFileSync(join(migrationSourceRoot, name), join(migrations, `20260731${String(index + 1).padStart(6, "0")}_${name}`), constants.COPYFILE_EXCL));
    mark("migration-chain-frozen", { files: migrationNames });
    const startArguments = buildSupabaseJsonArguments("start", ["--workdir", providerRoot, "--exclude", exclude]);
    const started = run("provider-start", node, [supabaseCli, ...startArguments], true); providerStarted = true;
    const bootstrap = parseSupabaseJsonObject(started.stdout, "Supabase start"); secrets = [...new Set(Object.values(bootstrap).filter(value => typeof value === "string" && value.length > 0))]; mark("provider-started");
    const route = verifyProviderImagesAndRoute(); mark("provider-route-admitted", route);
    const statusArguments = buildSupabaseJsonArguments("status", ["--workdir", providerRoot]);
    const status = run("provider-status", node, [supabaseCli, ...statusArguments], true);
    const provider = parseSupabaseJsonObject(status.stdout, "Supabase status"); const api = provider.API_URL ?? provider.apiUrl; const anon = provider.ANON_KEY ?? provider.anonKey; const service = provider.SERVICE_ROLE_KEY ?? provider.serviceRoleKey; const mail = provider.INBUCKET_URL ?? provider.inbucketUrl;
    for (const [name, value] of Object.entries({ api, anon, service, mail })) if (typeof value !== "string" || !value) throw new Error(`Supabase status omitted ${name}.`);
    secrets = [...new Set([...secrets, anon, service])];
    const webSessionSecret = randomBytes(48).toString("hex"); secrets.push(webSessionSecret);
    const sharedEnvironment = { ...governedEnvironment, SUPABASE_SECRET_KEY: service, ORACLE_WEB_SESSION_SECRET: webSessionSecret, NODE_ENV: "production", ORACLE_STAGE4_EXECUTION_MODE: mode, ORACLE_STAGE4_PROVIDER_URL: api, ORACLE_STAGE4_MAILPIT_URL: mail, ORACLE_STAGE4_ANON_KEY: anon, ORACLE_STAGE4_OUTPUT: output, ORACLE_STAGE4_JOURNEY_OUTPUT: output, ORACLE_STAGE4_ATTEMPT_ROOT: attemptRoot, ORACLE_STAGE4_NODE_PATH: node, ...(transferRoot ? { ORACLE_STAGE4_TRANSFER_ROOT: transferRoot } : {}) };
    if (mode === "qualification" || installedDevelopmentRehearsal) {
      for (const forbidden of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]) delete sharedEnvironment[forbidden];
      const installedController = join(import.meta.dirname, "Invoke-OracleStage5R1ObservedInstalledPackageJourney.ps1");
      const installedArguments = ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", installedController];
      const installed = run("installed-package-journey", powershell, installedArguments, true, sharedEnvironment);
      const installedResult = JSON.parse(installed.stdout);
      assert.equal(installedResult.result, "passed");
      assert.equal(installedResult.zeroResidue, true);
      installedControllerPassed = true;
      mark("installed-package-journey-passed", { packageSha256: contract.stage2.msixSha256 });
    } else {
      const env = { ...sharedEnvironment, NEXT_PUBLIC_SUPABASE_URL: api, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon };
      run("web-build", node, [npmCli, "run", "build"], false, env, repositoryRoot); mark("source-equivalent-built");
      const standalone = join(repositoryRoot, ".next", "standalone");
      cpSync(join(repositoryRoot, ".next", "static"), join(standalone, ".next", "static"), { recursive: true, errorOnExist: true, force: false });
      if (existsSync(join(repositoryRoot, "public"))) cpSync(join(repositoryRoot, "public"), join(standalone, "public"), { recursive: true, errorOnExist: true, force: false });
      const serverArgs = [join(standalone, "server.js")];
      server = spawn(node, serverArgs, { cwd: standalone, env: { ...env, HOSTNAME: "127.0.0.1", PORT: "4314" }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
      server.once("error", error => { serverError = error; }); server.stdout.on("data", chunk => serverText += chunk); server.stderr.on("data", chunk => serverText += chunk);
      if (!Number.isInteger(server.pid)) throw new Error("Web server PID is absent.");
      writeJsonAtomicCreateOnly(join(logsRoot, "web-server-process.json"), { pid: server.pid, executable: node, arguments: serverArgs, startedAtUtc: new Date().toISOString() });
      await waitForUrl("http://127.0.0.1:4314/auth", server); mark("source-equivalent-server-ready", { endpoint: "http://127.0.0.1:4314" });
      const journeyArgs = [join(import.meta.dirname, "run-live-journey.mjs")];
      const journey = spawnSync(node, journeyArgs, { cwd: repositoryRoot, encoding: "utf8", shell: false, maxBuffer: 64 * 1024 * 1024, env: { ...env, ORACLE_STAGE4_WEB_ORIGIN: "http://127.0.0.1:4314" } });
      records.push(envelope("live-journey", node, journeyArgs, journey)); validateProcessEnvelope(journey); assert.ok(existsSync(output)); mark("live-journey-passed");
    }
    await performCleanup();
  }
} catch (error) {
  primaryFailure = error;
  if (!teardownOnly) await performCleanup();
} finally {
  if (serverText) records.push({ label: "web-server-output", executable: node, arguments: [], startedAtUtc: null, completedAtUtc: new Date().toISOString(), exitCode: server?.exitCode ?? null, signal: server?.signalCode ?? null, processError: serverError?.message ?? null, stdout: serverText, stderr: "" });
  const safeRecords = JSON.parse(redactEvidence(records, secrets));
  const safeFailure = primaryFailure ? JSON.parse(redactEvidence({ name: primaryFailure.name, message: primaryFailure.message }, secrets)) : null;
  const summary = { mode, result: primaryFailure || cleanupFailures.length ? "failed" : "passed", primaryFailure: safeFailure, cleanupFailures, providerStarted, phaseEvents, zeroResidue: cleanupFailures.length === 0 && !existsSync(providerRoot) && !existsSync(join(repositoryRoot, ".next")) };
  const recordName = teardownOnly ? "safety-teardown-result.json" : "environment-result.json";
  const processName = teardownOnly ? "safety-teardown-process-summary.json" : "process-summary.json";
  if (!existsSync(join(logsRoot, processName))) writeJsonAtomicCreateOnly(join(logsRoot, processName), safeRecords);
  if (!existsSync(join(logsRoot, recordName))) writeJsonAtomicCreateOnly(join(logsRoot, recordName), summary);
}
if (primaryFailure || cleanupFailures.length) throw new AggregateError([...(primaryFailure ? [primaryFailure] : []), ...cleanupFailures.map(message => new Error(message))], "Stage 4 live environment failed; teardown result is preserved.");

async function performCleanup() {
  if ((mode === "qualification" || installedDevelopmentRehearsal) && !installedControllerPassed) {
    try {
      const installedController = join(import.meta.dirname, "Invoke-OracleStage5R1ObservedInstalledPackageJourney.ps1");
      run("installed-package-safety-teardown", powershell, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", installedController, "-TeardownOnly"], true, governedEnvironment);
    } catch (error) { cleanupFailures.push(`installed-package-teardown: ${error.message}`); }
  }
  try { if (server && server.exitCode === null) await stopWebServer(server); else await stopRecordedWebServer(); } catch (error) { cleanupFailures.push(`web-server-stop: ${error.message}`); }
  try {
    const current = run("provider-presence-before-stop", docker, ["ps", "-a", "--filter", "name=oracle-stage5-r1-disposable", "--format", "{{.ID}}"]);
    if (current.stdout.trim() && existsSync(join(providerRoot, "supabase", "config.toml"))) run("provider-stop", node, [supabaseCli, "stop", "--workdir", providerRoot, "--no-backup"]);
  } catch (error) { cleanupFailures.push(`provider-stop: ${error.message}`); }
  for (const [label, args] of [["container-residue", ["ps", "-a", "--filter", "name=oracle-stage5-r1-disposable", "--format", "{{.ID}}"]], ["volume-residue", ["volume", "ls", "--filter", "name=oracle-stage5-r1-disposable", "--format", "{{.Name}}"]], ["network-residue", ["network", "ls", "--filter", "name=oracle-stage5-r1-disposable", "--format", "{{.Name}}"]]]) {
    try { const checked = run(label, docker, args); if (checked.stdout.trim()) cleanupFailures.push(`${label} remains: ${checked.stdout.trim()}`); } catch (error) { cleanupFailures.push(`${label}: ${error.message}`); }
  }
  try { if (existsSync(providerRoot)) rmSync(providerRoot, { recursive: true, force: false }); if (existsSync(join(repositoryRoot, ".next"))) rmSync(join(repositoryRoot, ".next"), { recursive: true, force: false }); } catch (error) { cleanupFailures.push(`work-root-cleanup: ${error.message}`); }
  if (cleanupFailures.length === 0) mark("zero-residue-verified");
}
function run(label, executable, args, sensitive = false, env = governedEnvironment, cwd = repositoryRoot) {
  if (executable === node && args[0] === supabaseCli) {
    assert.ok(supabaseOfflinePolicy.commands.includes(args[1]), `Uncontracted Supabase CLI command: ${args[1]}`);
    assertSupabaseOfflineEnvironment(env, supabaseBinary);
  }
  const startedAtUtc = new Date().toISOString(); const result = spawnSync(executable, args, { cwd, env, encoding: "utf8", shell: false, maxBuffer: 64 * 1024 * 1024 }); result.startedAtUtc = startedAtUtc; result.completedAtUtc = new Date().toISOString();
  if (!sensitive) records.push(envelope(label, executable, args, result));
  else records.push({ ...envelope(label, executable, args, result), stdout: sensitiveDigest(result.stdout), stderr: sensitiveDigest(result.stderr) });
  validateProcessEnvelope(result);
  return result;
}
function envelope(label, executable, args, result) { return { label, executable, arguments: args, startedAtUtc: result.startedAtUtc ?? null, completedAtUtc: result.completedAtUtc ?? new Date().toISOString(), exitCode: result.status, signal: result.signal ?? null, processError: result.error?.message ?? null, stdout: result.stdout ?? "", stderr: result.stderr ?? "" }; }
function sensitiveDigest(value) { const text = value ?? ""; return { classification: "SENSITIVE-CONTENT-WITHHELD", bytes: Buffer.byteLength(text, "utf8"), sha256: createHash("sha256").update(text).digest("hex") }; }
function codePointCompare(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
async function waitForUrl(url, child) { const deadline = Date.now() + 30_000; while (Date.now() < deadline) { if (serverError) throw new Error(`Web server startup failed: ${serverError.message}`); if (child.exitCode !== null) throw new Error(`Web server exited early: ${serverText}`); try { const response = await fetch(url); if (response.ok) return; } catch (error) { if (!(error instanceof TypeError)) throw error; } await new Promise(resolvePromise => setTimeout(resolvePromise, 100)); } throw new Error("Web server readiness timed out."); }
function verifyProviderImagesAndRoute() {
  const ids = run("provider-container-list", docker, ["ps", "--filter", "name=oracle-stage5-r1-disposable", "--format", "{{.ID}}"] ).stdout.trim().split(/\r?\n/u).filter(Boolean);
  assert.equal(ids.length, Object.keys(contract.provider.services).length, "Disposable provider container count mismatch.");
  const expectedImageIds = new Map();
  for (const service of Object.values(contract.provider.services)) {
    const inspected = run(`image-inspect-${service.image}`, docker, ["image", "inspect", "--format", "{{json .}}", service.image]);
    const image = JSON.parse(inspected.stdout); assert.equal(image.Id, service.digest, `Provider image ID mismatch: ${service.image}`); const repository = service.image.replace(/:[^/:]+$/u, ""); assert.ok(Array.isArray(image.RepoDigests) && image.RepoDigests.includes(`${repository}@${service.digest}`), `Provider image digest mismatch: ${service.image}`); expectedImageIds.set(image.Id, service.image);
  }
  const observedImages = new Set(); const publishedPorts = new Set();
  for (const id of ids) {
    const inspected = run(`container-inspect-${id}`, docker, ["container", "inspect", "--format", "{{json .}}", id]); const item = JSON.parse(inspected.stdout); assert.equal(item.Id.startsWith(id), true, "Container inspect identity mismatch.");
    assert.ok(expectedImageIds.has(item.Image), `Unexpected provider container image: ${item.Image}`); observedImages.add(item.Image);
    for (const bindings of Object.values(item.NetworkSettings.Ports ?? {})) for (const binding of bindings ?? []) { const loopback = binding.HostIp === "127.0.0.1" || binding.HostIp === "::1"; if (!loopback && mode === "qualification" && process.env.ORACLE_STAGE4_NETWORK_ISOLATION_ADMITTED !== "1") throw new Error(`Non-loopback provider publication lacks pre-authority host isolation: ${binding.HostIp}:${binding.HostPort}`); publishedPorts.add(Number(binding.HostPort)); }
  }
  assert.equal(observedImages.size, expectedImageIds.size, "Expected provider image set was not running.");
  for (const service of Object.values(contract.provider.services)) if (service.port) assert.ok(publishedPorts.has(service.port), `Required provider port was not published: ${service.port}`);
}
async function stopWebServer(child) { child.kill("SIGTERM"); let deadline = Date.now() + 3000; while (child.exitCode === null && Date.now() < deadline) await new Promise(resolvePromise => setTimeout(resolvePromise, 50)); if (child.exitCode !== null) { mark("web-server-stopped", { pid: child.pid }); return; } await forceStopPid(child.pid); }
async function stopRecordedWebServer() { const recordPath = join(logsRoot, "web-server-process.json"); if (!existsSync(recordPath)) return; const record = JSON.parse(readFileSync(recordPath, "utf8")); if (!Number.isInteger(record.pid) || resolve(record.executable) !== resolve(node)) throw new Error("Recorded Web server identity is invalid."); const query = queryProcess(record.pid); if (query === null) return; if (resolve(query.ExecutablePath) !== resolve(node) || !String(query.CommandLine).includes(join(repositoryRoot, ".next", "standalone", "server.js"))) throw new Error("Recorded PID is live but no longer owned by the governed Web server."); await forceStopPid(record.pid); }
function queryProcess(pid) {
  const args = ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", `$p=Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}' -ErrorAction Stop;if($null -eq $p){exit 3};$p|Select-Object ProcessId,ExecutablePath,CommandLine|ConvertTo-Json -Compress`];
  const result = spawnSync(powershell, args, { cwd: repositoryRoot, encoding: "utf8", shell: false, maxBuffer: 1024 * 1024 }); records.push(envelope("web-server-ownership-query", powershell, args, result));
  if (result.error) throw new Error(`Process query startup failed: ${result.error.message}`); if (result.signal) throw new Error(`Process query terminated by signal ${result.signal}.`); if (!Number.isInteger(result.status)) throw new Error("Process query status is null or undefined.");
  if (result.status === 3 && !result.stdout.trim()) return null; if (result.status !== 0) throw new Error(`Process query failed with status ${result.status}: ${result.stderr}`); return JSON.parse(result.stdout);
}
async function forceStopPid(pid) {
  const args = ["/PID", String(pid), "/T", "/F"];
  const stopped = spawnSync(taskkill, args, { cwd: repositoryRoot, encoding: "utf8", shell: false, maxBuffer: 1024 * 1024 }); records.push(envelope("web-server-taskkill", taskkill, args, stopped));
  if (stopped.error) throw new Error(`taskkill startup failed: ${stopped.error.message}`); if (stopped.signal) throw new Error(`taskkill terminated by signal ${stopped.signal}.`); if (!Number.isInteger(stopped.status)) throw new Error("taskkill status is null or undefined.");
  if (stopped.status !== 0) { const observed = queryProcess(pid); if (observed === null) { mark("web-server-stopped", { pid, classification: "exited-before-taskkill" }); return; } throw new Error(`taskkill failed for a live governed process with status ${stopped.status}: ${stopped.stderr}`); }
  const deadline = Date.now() + 3000; while (Date.now() < deadline) { const observed = queryProcess(pid); if (observed === null) { mark("web-server-stopped", { pid }); return; } await new Promise(resolvePromise => setTimeout(resolvePromise, 50)); } throw new Error("Exact-PID Web server teardown was not affirmatively observed.");
}
