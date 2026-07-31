import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { assertSafeCreateOnly, contract, redactEvidence, repositoryRoot, sha256, validateAcceptedBindings, validateExecutionIdentity, validateApprovedTool, validateProcessEnvelope, validateProviderEndpoint, writeJsonAtomicCreateOnly } from "./stage4-core.mjs";
validateAcceptedBindings();
const approvedTools=Object.fromEntries(["git","node","npmCli","supabaseCli","docker","powershell","taskkill"].map(name=>[name,validateApprovedTool(name)]));
assert.equal(process.execPath.toLowerCase(),approvedTools.node.path.toLowerCase(),"Preparation validator was not launched by the approved Node executable.");
assert.equal(contract.status,"ready-for-founder-execution-decision");
assert.equal(contract.repository.acceptedCandidateCommit,"a7fc67f207d9c95407c70812828fa66bd487285d");
assert.equal(contract.repository.acceptedCandidateTree,"356f6d52f1bf70065692e892af8bf916acc8727a");
assert.equal(contract.stage2.revision,"R3");assert.equal(contract.stage2.attemptId,"r3-20260731T171651908Z-9a8a2532");
assert.equal(contract.stage2.msixSha256,"c2dc7c68bcc9b6dd8c3a8e39d6db5f1d5b8230b64906524e9a4c01cf25aa65d1");
assert.equal(contract.stage2.certificateAdmission,"not-applicable-web-source-qualification-no-package-install-or-trust");
validateExecutionIdentity({authorityId:"authority-stage4-r1-20260731T120000123Z-a1b2c3d4",attemptId:"stage4-r1-20260731T120000123Z-a1b2c3d4",timestampUtc:"2026-07-31T12:00:00.123Z"});
assert.throws(()=>validateExecutionIdentity({authorityId:"authority-stage4-r1-20260731T120000123Z-a1b2c3d4",attemptId:"stage4-r1-20260731T120000123Z-ffffffff",timestampUtc:"2026-07-31T12:00:00.123Z"}));
for(const x of ["http://127.0.0.1:54321","http://localhost:4314"])assert.ok(validateProviderEndpoint(x));
for(const x of ["https://example.com","http://8.8.8.8","http://10.0.0.2:54321","http://user:pass@127.0.0.1"])assert.throws(()=>validateProviderEndpoint(x));
assert.equal(redactEvidence("secret value",["secret"]),"[REDACTED] value");assert.throws(()=>redactEvidence("eyJabc.def.ghi",[]));
for(const r of [null,{}, {status:null,signal:null,error:null},{status:1,signal:null,error:null},{status:0,signal:"SIGTERM",error:null},{status:null,signal:null,error:new Error("ENOBUFS")}])assert.throws(()=>validateProcessEnvelope(r));validateProcessEnvelope({status:0,signal:null,error:null});
const tmp=join(repositoryRoot,".tmp-stage4-r1-validation",`fixture-${randomBytes(8).toString("hex")}`);mkdirSync(tmp,{recursive:true});
try{const out=join(tmp,"evidence.json");assertSafeCreateOnly(out,tmp);writeJsonAtomicCreateOnly(out,{classification:["NON-QUALIFICATION","NON-AUTHORITY","NON-EVIDENCE"],result:"fixture"});assert.ok(existsSync(out));assert.throws(()=>writeJsonAtomicCreateOnly(out,{}));for(const root of contract.historicalProtectedRoots)assert.throws(()=>assertSafeCreateOnly(join(repositoryRoot,root,"forbidden.json"),repositoryRoot));}finally{rmSync(tmp,{recursive:true,force:true});}
for(const b of contract.historicalEvidenceBindings)assert.equal(sha256(join(repositoryRoot,b.path)),b.sha256,`Historical mismatch: ${b.path}`);
assert.equal(run(approvedTools.git.path,["diff","--name-only",contract.repository.acceptedCandidateCommit,"HEAD","--",...contract.repository.productPaths]).stdout.trim(),"","Accepted R3 product drifted.");
for(const f of ["stage4-core.mjs","run-live-journey.mjs","run-live-development-rehearsal.mjs","execute-live-environment.mjs","verify-preparation.mjs"])run(approvedTools.node.path,["--check",join(import.meta.dirname,f)]);
const ps=approvedTools.powershell.path;
for(const f of ["Oracle.Stage4R1LifecyclePolicy.ps1","Oracle.Stage4R1JourneyPolicy.ps1","Oracle.Stage4R1PreflightPolicy.ps1","Invoke-OracleStage4R1DevelopmentRehearsal.ps1","Invoke-OracleStage4R1PreAuthorityPreflight.ps1","Invoke-OracleStage4R1Qualification.ps1","Test-OracleStage4R1Policies.ps1"]){const p=join(import.meta.dirname,f);run(ps,["-NoLogo","-NoProfile","-NonInteractive","-Command",`$e=$null;$t=$null;[Management.Automation.Language.Parser]::ParseFile('${p.replaceAll("'","''")}',[ref]$t,[ref]$e)|Out-Null;if($e.Count){exit 1}`]);}
run(ps,["-NoLogo","-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-File",join(import.meta.dirname,"Test-OracleStage4R1Policies.ps1")]);
const rehearsal=JSON.parse(run(ps,["-NoLogo","-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-File",join(import.meta.dirname,"Invoke-OracleStage4R1DevelopmentRehearsal.ps1")]).stdout);assert.equal(rehearsal.authorityCreated,false);assert.equal(rehearsal.attemptCreated,false);assert.equal(rehearsal.hostMutation,false);assert.equal(rehearsal.qualificationEvidence,false);
const pkg=JSON.parse(readFileSync(join(repositoryRoot,"package.json"),"utf8"));for(const key of Object.keys(pkg.scripts))assert.ok(!key.startsWith("sprint-30-5:stage-4:r1:"));
const ex=readFileSync(join(import.meta.dirname,"Invoke-OracleStage4R1Qualification.ps1"),"utf8"),pre=readFileSync(join(import.meta.dirname,"Invoke-OracleStage4R1PreAuthorityPreflight.ps1"),"utf8"),shared=readFileSync(join(import.meta.dirname,"Oracle.Stage4R1PreflightPolicy.ps1"),"utf8"),ctl=readFileSync(join(import.meta.dirname,"execute-live-environment.mjs"),"utf8");
for(const pattern of [/FounderAuthorityToken -cne/u,/Invoke-OracleStage4R1PreAuthorityChecks/u,/maximumAgeMinutes/u,/--teardown-only/u,/CreateFromDirectory/u,/final-evidence-manifest\.json/u])assert.match(ex,pattern);
assert.doesNotMatch(ex,/Import-Certificate|Add-AppxPackage|certutil\.exe/u);assert.match(pre,/Invoke-OracleStage4R1PreAuthorityChecks/u);assert.match(shared,/historicalEvidenceBindings/u);assert.doesNotMatch(shared,/Get-Command/u);assert.match(shared,/Resolve-OracleStage4R1BoundTool/u);assert.match(shared,/ancestryReparseFree/u);assert.match(shared,/DestinationPrefix -in @\('0\.0\.0\.0\/0','::\/0'\)/u);assert.match(ctl,/ORACLE_STAGE4_EXECUTION_MODE/u);assert.match(ctl,/ORACLE_STAGE4_AUTHORITY_RECORD/u);assert.match(ctl,/ORACLE_STAGE4_POWERSHELL_PATH/u);assert.match(ctl,/ORACLE_STAGE4_TASKKILL_PATH/u);assert.match(ctl,/governedEnvironment/u);assert.match(ctl,/filter\(\(\[key\]\) => key\.toLowerCase\(\) !== "path"\)/u);assert.match(ctl,/teardown-only/u);assert.match(ctl,/environment-result\.json/u);
const topology=JSON.parse(readFileSync(join(import.meta.dirname,"Oracle.Stage4R1ProviderTopology.json"),"utf8"));assert.equal(topology.route.networkIsolationImplementationStatus,"pre-authority-no-default-route-required");
run(approvedTools.git.path,["diff","--check"]);
console.log(JSON.stringify({result:"passed",classification:"STAGE-4-R1-PREPARATION-VALIDATION",qualificationExecuted:false,authorityCreated:false,attemptCreated:false,acceptedR3ArtifactsRehashed:contract.historicalEvidenceBindings.length,historicalEvidenceMutated:false,fixtureFailurePhases:rehearsal.failureInjectionCount},null,2));
function run(executable,args){const r=spawnSync(executable,args,{cwd:repositoryRoot,encoding:"utf8",shell:false,maxBuffer:64*1024*1024});validateProcessEnvelope(r);return r;}
