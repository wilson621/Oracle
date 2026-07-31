import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { redactEvidence, validateProviderEndpoint, writeJsonAtomicCreateOnly } from "./stage4-core.mjs";

const required = ["ORACLE_STAGE4_EXECUTION_MODE","ORACLE_STAGE4_PROVIDER_URL","ORACLE_STAGE4_WEB_ORIGIN","ORACLE_STAGE4_MAILPIT_URL","ORACLE_STAGE4_ANON_KEY","ORACLE_STAGE4_OUTPUT"];
for (const name of required) if (!process.env[name]) throw new Error(`Required Stage 4 journey setting is absent: ${name}`);
const provider = validateProviderEndpoint(process.env.ORACLE_STAGE4_PROVIDER_URL);
const web = validateProviderEndpoint(process.env.ORACLE_STAGE4_WEB_ORIGIN);
const mailpit = validateProviderEndpoint(process.env.ORACLE_STAGE4_MAILPIT_URL);
const anonKey = process.env.ORACLE_STAGE4_ANON_KEY;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
if(!serviceKey) throw new Error("Server-only fixture provisioning credential is absent.");
const output = process.env.ORACLE_STAGE4_OUTPUT;
const password = `Oracle-R1-${randomBytes(12).toString("hex")}!Aa1`;
const nonce = randomBytes(8).toString("hex");
const accounts = [`oracle-stage4-a-${nonce}@example.invalid`,`oracle-stage4-b-${nonce}@example.invalid`];
const journeys = [];
const mode = process.env.ORACLE_STAGE4_EXECUTION_MODE;
if (mode !== "qualification" && mode !== "development-rehearsal") throw new Error("Explicit Stage 4 journey mode is invalid.");
const developmentRehearsal = mode === "development-rehearsal";
if (developmentRehearsal !== (process.env.ORACLE_STAGE4_DEVELOPMENT_REHEARSAL === "1")) throw new Error("Stage 4 rehearsal classification mismatch.");

try {
  const anonymous = await fetch(`${web}/companion`, { redirect: "manual" });
  assert.equal(anonymous.status, 307); assert.match(anonymous.headers.get("location") ?? "", /^\/auth\?next=/u);
  journeys.push(pass("anonymous-protected-route-rejected"));
  const sessions = [];
  for (const email of accounts) {
    const unverified = createServerClient(provider, anonKey, { cookies: { getAll:()=>[], setAll:()=>{} } });
    const signup = await unverified.auth.signUp({ email, password, options:{data:{display_name:"Stage 4 Fixture"}} });
    assert.ifError(signup.error); assert.ok(signup.data.user?.id); assert.ok(!signup.data.session,"Unverified Account received a signup session.");
    const rejected = await unverified.auth.signInWithPassword({ email, password });
    assert.ok(rejected.error); assert.ok(!rejected.data.session, "Unverified Account received a session.");
    if (sessions.length === 0) journeys.push(pass("unverified-account-rejected"));
    if (sessions.length === 0) journeys.push(pass("account-created-without-session"));
    const verificationUrl = await waitForConfirmation(email);
    if (sessions.length === 0) journeys.push(pass("confirmation-mail-captured-locally"));
    const verifyResponse = await fetch(verificationUrl, { redirect: "manual" });
    assert.ok(verifyResponse.status >= 300 && verifyResponse.status < 400, "Email verification did not redirect.");
    const cookies = new Map();
    const client = createServerClient(provider, anonKey, { cookies: { getAll:()=>[...cookies].map(([name,value])=>({name,value})), setAll:values=>{for(const item of values){if(item.value)cookies.set(item.name,item.value);else cookies.delete(item.name);}} } });
    const signIn = await client.auth.signInWithPassword({ email, password });
    assert.ifError(signIn.error); assert.ok(signIn.data.user?.email_confirmed_at); assert.ok(signIn.data.session?.access_token);
    await provisionOperator(signIn.data.user.id,`S4${sessions.length}${nonce.slice(0,6)}`);
    sessions.push({ email, userId: signIn.data.user.id, accessToken: signIn.data.session.access_token, cookies, client });
  }
  journeys.push(pass("email-verified"),pass("verified-password-sign-in-passed"));
  assert.notEqual(sessions[0].userId, sessions[1].userId);
  const cookieHeader = [...sessions[0].cookies].map(([name,value])=>`${name}=${value}`).join("; ");
  const protectedResponse = await fetch(`${web}/companion`, { headers: { cookie: cookieHeader }, redirect: "manual" });
  const html = await protectedResponse.text(); assert.equal(protectedResponse.status,200,html); assert.match(html, /<main|oracle-main-content/u);
  journeys.push(pass("protected-route-rendered"));
  const apiResponse = await fetch(`${web}/api/oracle/conversation`, { method:"POST",headers:{cookie:cookieHeader,"content-type":"application/json"},body:JSON.stringify({requestId:`stage4-${nonce}`,text:"qualification probe"}),redirect:"manual" });
  assert.equal(apiResponse.status, 503, "Authenticated API did not reach its governed inactive-runtime boundary.");
  journeys.push(pass("protected-api-authorised"));
  const bindings = [];
  for (const session of sessions) {
    const user = await session.client.auth.getUser(); assert.ifError(user.error); assert.equal(user.data.user?.id, session.userId);
    const response = await fetch(`${provider}/rest/v1/operator_account_bindings?select=account_id,operator_id`, { headers: { apikey: anonKey, authorization: `Bearer ${session.accessToken}` } });
    const responseText=await response.text();assert.equal(response.status,200,responseText);const rows=JSON.parse(responseText);
    assert.equal(rows.length, 1, "RLS did not return exactly one own Account binding."); assert.equal(rows[0].account_id, session.userId); bindings.push(rows[0]);
  }
  assert.notEqual(bindings[0].operator_id, bindings[1].operator_id);
  journeys.push(pass("cross-account-isolation-passed"));
  await sessions[0].client.auth.signOut({ scope:"global" });
  assert.equal(sessions[0].cookies.size,0,"Sign-out did not clear the governed cookie store.");
  const signedOut = await fetch(`${web}/companion`, { headers:{cookie:[...sessions[0].cookies].map(([name,value])=>`${name}=${value}`).join("; ")},redirect:"manual" }); assert.equal(signedOut.status,307);
  journeys.push(pass("sign-out-invalidates-session"));
  const rendering = { mainLandmarks:(html.match(/<main/gu)??[]).length,levelOneHeadings:(html.match(/<h1/gu)??[]).length,protectedStatus:protectedResponse.status,method:"authenticated-production-server-render" };
  assert.ok(rendering.mainLandmarks >= 1);
  const record = { contract:developmentRehearsal?"oracle.sprint-30-5.stage-4-r1-development-rehearsal":"oracle.sprint-30-5.stage-4-r1-journey",result:"passed",classification:developmentRehearsal?["NON-QUALIFICATION","NON-AUTHORITY","NON-EVIDENCE","DEVELOPMENT REHEARSAL"]:"GOVERNED-STAGE-4-R1-QUALIFICATION",collectedAtUtc:new Date().toISOString(),provider:{classification:"disposable-local-non-production",productionEndpoint:false,externalEmail:false},journeys,rendering,isolation:{accountCount:2,crossAccountLeaks:0,distinctAuthenticatedPrincipals:true,distinctOperators:true,rlsBindingsPerPrincipal:[1,1]},secretsRetained:false };
  const serialized = redactEvidence(record,[anonKey,serviceKey,password,...accounts,...sessions.map(item=>item.accessToken)]);
  writeJsonAtomicCreateOnly(output,JSON.parse(serialized));
} finally {
  process.env.ORACLE_STAGE4_ANON_KEY=""; process.env.SUPABASE_SECRET_KEY=""; process.env.ORACLE_WEB_SESSION_SECRET="";
}
function pass(id){return {id,result:"passed"};}
async function provisionOperator(accountId,callsign){const response=await fetch(`${provider}/rest/v1/rpc/provision_operator_for_account`,{method:"POST",headers:{apikey:serviceKey,authorization:`Bearer ${serviceKey}`,"content-type":"application/json"},body:JSON.stringify({p_account_id:accountId,p_command:{contract:{name:"oracle.operator-provisioning-command",version:1},commandId:randomUUID(),callsign,policyId:"stage4-r1-fixture",policyVersion:"1"}})});const text=await response.text();assert.equal(response.status,200,text);}

async function waitForConfirmation(email){
  const deadline=Date.now()+30_000;
  while(Date.now()<deadline){
    const search=await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`);
    if(search.ok){const payload=await search.json();const messages=payload.messages??payload.Messages??[];for(const summary of messages){const id=summary.ID??summary.Id??summary.id;if(!id)continue;const response=await fetch(`${mailpit}/api/v1/message/${encodeURIComponent(id)}`);if(!response.ok)continue;const text=JSON.stringify(await response.json()).replaceAll("\\/","/");const match=text.match(/https?:\/\/[^"'<>\s]+\/auth\/v1\/verify[^"'<>\s]+/u);if(match)return match[0];}}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  throw new Error(`Local confirmation message was not captured for ${email}.`);
}
