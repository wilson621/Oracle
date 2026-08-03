import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { join } from "node:path";

const host = "127.0.0.1";
const publicKey = "fixture-public-runtime-key-RUNTIME-ONLY-20260803";
const serviceKey = "fixture-service-secret-MUST-NOT-ENTER-HTML-20260803";
const sessionSecret = "fixture-session-secret-MUST-NOT-ENTER-HTML-20260803";
const provider = createServer((_request, response) => {
  response.writeHead(401, {
    "content-type": "application/json",
    connection: "close",
  });
  response.end('{"message":"development rehearsal: no authenticated user"}');
});
const providerPort = await listen(provider);
const rendererPort = await reservePort();
const standaloneRoot = join(process.cwd(), ".next", "standalone");
const server = spawn(process.execPath, [join(standaloneRoot, "server.js")], {
  cwd: standaloneRoot,
  env: {
    NODE_ENV: "production",
    HOSTNAME: host,
    PORT: String(rendererPort),
    ORACLE_SUPABASE_URL: `http://${host}:${providerPort}`,
    ORACLE_SUPABASE_ANON_KEY: publicKey,
    SUPABASE_SECRET_KEY: serviceKey,
    ORACLE_WEB_SESSION_SECRET: sessionSecret,
  },
  shell: false,
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
});
let outputBytes = 0;
let outputExceeded = false;
let privilegedValueInOutput = false;
for (const stream of [server.stdout, server.stderr]) {
  stream.on("data", (chunk) => {
    const text = String(chunk);
    outputBytes += Buffer.byteLength(text);
    outputExceeded ||= outputBytes > 1024 * 1024;
    privilegedValueInOutput ||=
      text.includes(serviceKey) || text.includes(sessionSecret);
  });
}

try {
  const html = await fetchUntilReady(`http://${host}:${rendererPort}/auth`);
  assert.match(html, /name="oracle-runtime-supabase-url"/u);
  assert.match(html, new RegExp(`http://${host}:${providerPort}`, "u"));
  assert.match(html, new RegExp(publicKey, "u"));
  assert.doesNotMatch(html, new RegExp(serviceKey, "u"));
  assert.doesNotMatch(html, new RegExp(sessionSecret, "u"));
  assert.equal(outputExceeded, false);
  assert.equal(privilegedValueInOutput, false);
  process.stdout.write(`${JSON.stringify({
    classification: [
      "NON-QUALIFICATION",
      "NON-AUTHORITY",
      "NON-EVIDENCE",
      "DEVELOPMENT REHEARSAL",
    ],
    realStandaloneServer: true,
    loopbackProviderFixture: true,
    publicProjection: "url-and-anon-key-only",
    privilegedValueInHtmlOrProcessOutput: false,
    result: "pass",
  }, null, 2)}\n`);
} finally {
  await close(provider);
  if (server.exitCode === null && server.signalCode === null) {
    server.kill();
  }
  await waitForExit(server);
}

async function fetchUntilReady(url) {
  const deadline = Date.now() + 15_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      const text = await response.text();
      if (response.status >= 200 && response.status < 400) return text;
      lastError = new Error(`Standalone server returned ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Standalone server did not become ready: ${String(lastError)}`);
}

async function reservePort() {
  const server = createNetServer();
  const port = await listen(server);
  await close(server);
  return port;
}

async function listen(server) {
  return await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, host, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Loopback fixture did not expose a TCP port."));
        return;
      }
      resolve(address.port);
    });
  });
}

async function close(server) {
  if (!server.listening) return;
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

async function waitForExit(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  await new Promise((resolve) => child.once("exit", resolve));
}
