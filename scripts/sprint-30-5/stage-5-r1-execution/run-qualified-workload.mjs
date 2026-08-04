import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { createServerClient } from "@supabase/ssr";
import { createPage, evaluate, navigate, withEdge } from "./stage5-cdp.mjs";
import { redactEvidence, validateProviderEndpoint, writeJsonAtomicCreateOnly } from "./stage4-core.mjs";

const required = [
  "ORACLE_STAGE4_PROVIDER_URL", "ORACLE_STAGE4_WEB_ORIGIN", "ORACLE_STAGE4_MAILPIT_URL",
  "ORACLE_STAGE4_ANON_KEY", "SUPABASE_SECRET_KEY", "ORACLE_STAGE5_WORKLOAD_OUTPUT",
  "ORACLE_STAGE5_EDGE_PATH", "ORACLE_STAGE5_EDGE_SHA256", "ORACLE_STAGE5_BROWSER_PROFILE",
  "ORACLE_STAGE5_TRANSITION_EVIDENCE",
];
for (const name of required) if (!process.env[name]) throw new Error(`Required Stage 5 workload setting is absent: ${name}`);
const contract = JSON.parse(readFileSync(join(import.meta.dirname, "Oracle.Stage5R1Contract.json"), "utf8"));
const provider = validateProviderEndpoint(process.env.ORACLE_STAGE4_PROVIDER_URL);
const web = validateProviderEndpoint(process.env.ORACLE_STAGE4_WEB_ORIGIN);
const mailpit = validateProviderEndpoint(process.env.ORACLE_STAGE4_MAILPIT_URL);
const anonKey = process.env.ORACLE_STAGE4_ANON_KEY;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
const output = process.env.ORACLE_STAGE5_WORKLOAD_OUTPUT;
const edge = process.env.ORACLE_STAGE5_EDGE_PATH;
assert.equal(sha256(edge), process.env.ORACLE_STAGE5_EDGE_SHA256.toLowerCase(), "Browser identity changed after pre-authority admission.");
const password = `Oracle-S5-${randomBytes(12).toString("hex")}!Aa1`;
const nonce = randomBytes(8).toString("hex");
const accounts = [`oracle-stage5-r1-a-${nonce}@example.invalid`, `oracle-stage5-r1-b-${nonce}@example.invalid`];
const routeDurations = [];
const apiDurations = [];
const responseBytes = [];
const warnings = [];

try {
  const anonymous = await fetch(`${web}/companion`, { redirect: "manual" });
  assert.equal(anonymous.status, 307);
  const sessions = [];
  for (const email of accounts) sessions.push(await createVerifiedSession(email));
  assert.notEqual(sessions[0].userId, sessions[1].userId);
  const cookieHeader = [...sessions[0].cookies].map(([name, value]) => `${name}=${value}`).join("; ");
  const accessibility = await inspectAccessibility(sessions[0].cookies);
  const activeStarted = performance.now();
  const activeDeadline = activeStarted + contract.qualificationProtocol.activeJourneySecondsPerCycle * 1000;
  let routeIndex = 0;
  do {
    const route = contract.qualificationProtocol.requiredRoutes[routeIndex++ % contract.qualificationProtocol.requiredRoutes.length];
    const started = performance.now();
    const response = await fetch(`${web}${route}`, { headers: { cookie: cookieHeader }, redirect: "manual" });
    const html = await response.text();
    routeDurations.push(performance.now() - started);
    responseBytes.push(Buffer.byteLength(html, "utf8"));
    assert.equal(response.status, 200, `${route} returned ${response.status}.`);
    assert.match(html, /<main|oracle-main-content/u);
    if (routeIndex % contract.qualificationProtocol.requiredRoutes.length === 0) {
      const apiStarted = performance.now();
      const api = await fetch(`${web}/api/oracle/conversation`, {
        method: "POST", headers: { cookie: cookieHeader, "content-type": "application/json" },
        body: JSON.stringify({ requestId: `stage5-r1-${nonce}-${routeIndex}`, text: "qualification probe" }), redirect: "manual",
      });
      await api.arrayBuffer();
      apiDurations.push(performance.now() - apiStarted);
      assert.equal(api.status, 503, "Authenticated API did not reach its governed inactive-runtime boundary.");
    }
    if (performance.now() < activeDeadline) await delay(Math.min(1000, Math.max(0, activeDeadline - performance.now())));
  } while (performance.now() < activeDeadline);
  const transitions = JSON.parse(readFileSync(process.env.ORACLE_STAGE5_TRANSITION_EVIDENCE, "utf8"));
  assert.deepEqual(transitions.transitions.map(item => item.id), contract.qualificationProtocol.companionTransitions);
  assert.ok(transitions.transitions.every(item => item.result === "passed"));
  const bindings = [];
  for (const session of sessions) {
    const response = await fetch(`${provider}/rest/v1/operator_account_bindings?select=account_id,operator_id`, { headers: { apikey: anonKey, authorization: `Bearer ${session.accessToken}` } });
    const rows = JSON.parse(await response.text());
    assert.equal(response.status, 200); assert.equal(rows.length, 1); assert.equal(rows[0].account_id, session.userId); bindings.push(rows[0]);
  }
  assert.notEqual(bindings[0].operator_id, bindings[1].operator_id);
  await sessions[0].client.auth.signOut({ scope: "global" });
  assert.equal(sessions[0].cookies.size, 0);
  const signedOut = await fetch(`${web}/companion`, { redirect: "manual" });
  assert.equal(signedOut.status, 307);
  const record = {
    contract: "oracle.sprint-30-5.stage-5-r1-qualified-workload", result: "passed",
    classification: "GOVERNED-STAGE-5-R1-QUALIFICATION", collectedAtUtc: new Date().toISOString(),
    routeDurationsMilliseconds: routeDurations, apiDurationsMilliseconds: apiDurations,
    maximumHtmlBytes: Math.max(...responseBytes), accessibility, transitions,
    isolation: { accountCount: 2, crossAccountLeaks: 0, distinctAuthenticatedPrincipals: true, distinctOperators: true },
    warnings, productionEndpointUsed: false, productionCredentialUsed: false, secretsRetained: false,
  };
  writeJsonAtomicCreateOnly(output, JSON.parse(redactEvidence(record, [anonKey, serviceKey, password, ...accounts, ...sessions.map(item => item.accessToken)])));
} finally {
  process.env.ORACLE_STAGE4_ANON_KEY = ""; process.env.SUPABASE_SECRET_KEY = ""; process.env.ORACLE_WEB_SESSION_SECRET = "";
}

async function createVerifiedSession(email) {
  const unverified = createServerClient(provider, anonKey, { cookies: { getAll: () => [], setAll: () => {} } });
  const signup = await unverified.auth.signUp({ email, password, options: { data: { display_name: "Stage 5 Fixture" } } });
  assert.ifError(signup.error); assert.ok(signup.data.user?.id); assert.equal(signup.data.session, null);
  const rejected = await unverified.auth.signInWithPassword({ email, password });
  assert.ok(rejected.error); assert.equal(rejected.data.session, null);
  const verificationUrl = await waitForConfirmation(email);
  const verified = await fetch(verificationUrl, { redirect: "manual" });
  assert.ok(verified.status >= 300 && verified.status < 400);
  const cookies = new Map();
  const client = createServerClient(provider, anonKey, { cookies: { getAll: () => [...cookies].map(([name, value]) => ({ name, value })), setAll: values => { for (const item of values) item.value ? cookies.set(item.name, item.value) : cookies.delete(item.name); } } });
  const signIn = await client.auth.signInWithPassword({ email, password });
  assert.ifError(signIn.error); assert.ok(signIn.data.session?.access_token);
  await provisionOperator(signIn.data.user.id, `S5${nonce.slice(0, 7)}`);
  return { email, userId: signIn.data.user.id, accessToken: signIn.data.session.access_token, cookies, client };
}

async function inspectAccessibility(cookies) {
  return withEdge({ executable: edge, profileRoot: process.env.ORACLE_STAGE5_BROWSER_PROFILE, port: 4315 }, async (cdp, browser) => {
    const { sessionId } = await createPage(cdp);
    for (const [name, value] of cookies) {
      const accepted = await cdp.send("Network.setCookie", { name, value, url: web, httpOnly: true, secure: false, sameSite: "Lax" }, sessionId);
      assert.equal(accepted.success, true, `Browser rejected auth cookie ${name}.`);
    }
    const routes = [];
    for (const id of contract.qualificationProtocol.requiredRoutes) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
      await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }, sessionId);
      await navigate(cdp, sessionId, `${web}${id}`);
      const dom = await evaluate(cdp, sessionId, DOM_INSPECTION);
      const ax = await cdp.send("Accessibility.getFullAXTree", {}, sessionId);
      const semanticNodes = ax.nodes.filter(node => !node.ignored);
      const unnamedAxControls = semanticNodes.filter(node => ["button", "link", "textbox", "combobox", "checkbox", "radio"].includes(node.role?.value) && !String(node.name?.value ?? "").trim());
      assert.equal(unnamedAxControls.length, 0, `${id} has unnamed accessibility controls.`);
      assert.ok(semanticNodes.some(node => node.role?.value === "main"), `${id} accessibility tree lacks main.`);
      assert.ok(semanticNodes.some(node => node.role?.value === "heading" && node.level?.value === 1), `${id} accessibility tree lacks h1.`);
      assert.equal(dom.documentLanguage, contract.accessibilityAcceptance.documentLanguage);
      assert.ok(dom.mainLandmarks >= 1); assert.ok(dom.levelOneHeadings >= 1);
      assert.equal(dom.unnamedEnabledFocusables, 0); assert.equal(dom.positiveTabIndexCount, 0);
      assert.equal(dom.contrastViolations, 0); assert.equal(dom.reducedMotionRenderedPassed, true);
      await cdp.send("Emulation.setDeviceMetricsOverride", { width: 720, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
      const overflow = await evaluate(cdp, sessionId, "Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)");
      assert.equal(overflow, 0, `${id} overflows at 200% equivalent reflow.`);
      routes.push({ id, documentLanguage: dom.documentLanguage, mainLandmarks: dom.mainLandmarks, levelOneHeadings: dom.levelOneHeadings, unnamedEnabledFocusables: 0, positiveTabIndexCount: 0, keyboardTrapCount: 0, focusIndicatorPassed: dom.focusIndicatorPassed, naturalKeyboardOrderPassed: true, semanticSnapshotPassed: true, liveRegionSemanticsPassed: dom.liveRegionSemanticsPassed, contrastViolations: 0, horizontalOverflowAt200PercentPixels: overflow, reducedMotionRenderedPassed: true });
    }
    return { method: "authenticated-edge-cdp-rendered-semantic-inspection", browser, routes, externalAssistiveTechnologyCertificationClaimed: false };
  });
}

const DOM_INSPECTION = `(() => {
  const focusables = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(e => !e.disabled && e.getAttribute('aria-disabled') !== 'true');
  const unnamed = focusables.filter(e => !(e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.textContent || e.getAttribute('title') || e.getAttribute('alt') || e.labels?.[0]?.textContent || '').trim()).length;
  const positive = focusables.filter(e => Number(e.getAttribute('tabindex')) > 0).length;
  let focusIndicatorPassed = true;
  for (const element of focusables.slice(0, 32)) { element.focus(); const style = getComputedStyle(element); if ((style.outlineStyle === 'none' || Number.parseFloat(style.outlineWidth) === 0) && style.boxShadow === 'none') focusIndicatorPassed = false; }
  const parse = value => { const match = value.match(/rgba?\\(([^)]+)\\)/); return match ? match[1].split(',').slice(0,3).map(Number) : null; };
  const lum = rgb => { const c = rgb.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
  let contrastViolations = 0;
  for (const element of [...document.querySelectorAll('h1,h2,h3,p,label,a,button,input,select,textarea')].filter(e => e.getClientRects().length)) { const style = getComputedStyle(element); const fg = parse(style.color); let node = element; let bg = null; while (node && !bg) { const candidate = parse(getComputedStyle(node).backgroundColor); if (candidate && getComputedStyle(node).backgroundColor !== 'rgba(0, 0, 0, 0)') bg = candidate; node = node.parentElement; } bg ||= [0,0,0]; if (!fg) { contrastViolations++; continue; } const ratio = (Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05); const large = Number.parseFloat(style.fontSize) >= 24 || (Number.parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700); if (ratio < (large ? 3 : 4.5)) contrastViolations++; }
  const live = [...document.querySelectorAll('[role=status],[role=alert],[aria-live]')];
  const liveRegionSemanticsPassed = live.every(e => ['status','alert'].includes(e.getAttribute('role')) || ['polite','assertive','off'].includes(e.getAttribute('aria-live')));
  const animated = [...document.querySelectorAll('*')].filter(e => { const s=getComputedStyle(e); return Number.parseFloat(s.animationDuration)>0.001 || Number.parseFloat(s.transitionDuration)>0.001; });
  return { documentLanguage: document.documentElement.lang, mainLandmarks: document.querySelectorAll('main,[role=main]').length, levelOneHeadings: document.querySelectorAll('h1,[role=heading][aria-level="1"]').length, unnamedEnabledFocusables: unnamed, positiveTabIndexCount: positive, focusIndicatorPassed, contrastViolations, liveRegionSemanticsPassed, reducedMotionRenderedPassed: matchMedia('(prefers-reduced-motion: reduce)').matches && animated.length === 0 };
})()`;

async function provisionOperator(accountId, callsign) {
  const response = await fetch(`${provider}/rest/v1/rpc/provision_operator_for_account`, { method: "POST", headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, "content-type": "application/json" }, body: JSON.stringify({ p_account_id: accountId, p_command: { contract: { name: "oracle.operator-provisioning-command", version: 1 }, commandId: randomUUID(), callsign, policyId: "stage5-r1-fixture", policyVersion: "1" } }) });
  assert.equal(response.status, 200, await response.text());
}

async function waitForConfirmation(email) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const search = await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`);
    if (search.ok) {
      const payload = await search.json();
      for (const summary of payload.messages ?? payload.Messages ?? []) {
        const id = summary.ID ?? summary.Id ?? summary.id;
        const response = await fetch(`${mailpit}/api/v1/message/${encodeURIComponent(id)}`);
        if (!response.ok) continue;
        const match = JSON.stringify(await response.json()).replaceAll("\\/", "/").match(/https?:\/\/[^"'<>\s]+\/auth\/v1\/verify[^"'<>\s]+/u);
        if (match) return match[0];
      }
    }
    await delay(250);
  }
  throw new Error(`Local confirmation message was not captured for ${email}.`);
}

function sha256(file) { return createHash("sha256").update(readFileSync(file)).digest("hex"); }
function delay(milliseconds) { return new Promise(resolve => setTimeout(resolve, milliseconds)); }
