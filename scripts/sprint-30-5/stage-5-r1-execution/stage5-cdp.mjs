import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

export async function withEdge({ executable, profileRoot, port }, operation) {
  mkdirSync(profileRoot, { recursive: false });
  const args = [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileRoot}`,
    "--no-first-run",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-sync",
    "--metrics-recording-only",
    "about:blank",
  ];
  const child = spawn(executable, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let output = "";
  child.stdout.on("data", chunk => { output += chunk; });
  child.stderr.on("data", chunk => { output += chunk; });
  try {
    const version = await waitForJson(`http://127.0.0.1:${port}/json/version`, child, () => output);
    assert.equal(typeof version.webSocketDebuggerUrl, "string");
    const cdp = await Cdp.connect(version.webSocketDebuggerUrl);
    try { return await operation(cdp, { browser: version.Browser, protocolVersion: version["Protocol-Version"] }); }
    finally { cdp.close(); }
  } finally {
    if (child.exitCode === null) child.kill("SIGTERM");
    const deadline = Date.now() + 5_000;
    while (child.exitCode === null && Date.now() < deadline) await delay(50);
    if (child.exitCode === null) child.kill("SIGKILL");
    rmSync(profileRoot, { recursive: true, force: false });
  }
}

export async function createPage(cdp) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  for (const method of ["Page.enable", "Runtime.enable", "Network.enable", "Accessibility.enable", "Log.enable"]) {
    await cdp.send(method, {}, sessionId);
  }
  return { targetId, sessionId };
}

export async function navigate(cdp, sessionId, url) {
  const loaded = cdp.waitFor("Page.loadEventFired", sessionId, 30_000);
  const result = await cdp.send("Page.navigate", { url }, sessionId);
  assert.equal(result.errorText, undefined, `Browser navigation failed: ${result.errorText}`);
  await loaded;
}

export async function evaluate(cdp, sessionId, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, sessionId);
  if (result.exceptionDetails) throw new Error(`Browser evaluation failed: ${JSON.stringify(result.exceptionDetails)}`);
  return result.result.value;
}

class Cdp {
  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", () => reject(new Error("CDP WebSocket connection failed.")), { once: true });
    });
    return new Cdp(socket);
  }

  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = [];
    socket.addEventListener("message", event => this.receive(JSON.parse(String(event.data))));
    socket.addEventListener("close", () => {
      for (const pending of this.pending.values()) pending.reject(new Error("CDP connection closed."));
      this.pending.clear();
    });
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    const message = { id, method, params, ...(sessionId ? { sessionId } : {}) };
    const promise = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify(message));
    return promise;
  }

  waitFor(method, sessionId, timeout) {
    return new Promise((resolve, reject) => {
      const waiter = { method, sessionId, resolve, reject };
      this.waiters.push(waiter);
      const timer = setTimeout(() => {
        this.waiters = this.waiters.filter(item => item !== waiter);
        reject(new Error(`CDP event timed out: ${method}`));
      }, timeout);
      waiter.resolve = value => { clearTimeout(timer); resolve(value); };
    });
  }

  receive(message) {
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${message.error.code}: ${message.error.message}`));
      else pending.resolve(message.result ?? {});
      return;
    }
    const index = this.waiters.findIndex(item => item.method === message.method && item.sessionId === message.sessionId);
    if (index >= 0) this.waiters.splice(index, 1)[0].resolve(message.params ?? {});
  }

  close() { this.socket.close(); }
}

async function waitForJson(url, child, output) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Edge exited before CDP admission: ${output()}`);
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
    await delay(100);
  }
  throw new Error("Edge CDP admission timed out.");
}

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
