import assert from "node:assert/strict";
import { constants, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { contract, parseArguments, repositoryRoot, sha256, validateProcess, writeJsonCreateOnly } from "./stage4r5-core.mjs";

const args=parseArguments(process.argv.slice(2));
for(const name of ["mode","request","return-root","expected-authority-sha256"]) if(!args.has(name)) throw new Error(`Missing --${name}.`);
const mode=args.get("mode");if(!["start","stop"].includes(mode)) throw new Error("Provider mode must be start or stop.");
const requestPath=resolve(args.get("request"));const returnRoot=resolve(args.get("return-root"));
const request=JSON.parse(readFileSync(requestPath,"utf8"));
const isRehearsal=request.contract==="oracle.sprint-30-5.stage-4-r5-provider-rehearsal-request";
const isQualification=request.contract==="oracle.sprint-30-5.stage-4-r5-provider-start-request";
if(!isRehearsal&&!isQualification)throw new Error("Provider request contract differs.");
const runId=isRehearsal?request.rehearsalId:request.attemptId;
assert.match(runId,new RegExp(isRehearsal?contract.identity.rehearsalPattern:contract.identity.attemptPattern,"u"));
assert.match(request.providerIdentity,new RegExp(contract.identity.providerPattern,"u"));
let authorityId="NO-AUTHORITY-DEVELOPMENT-REHEARSAL";let authoritySha="NO-AUTHORITY-DEVELOPMENT-REHEARSAL";
if(isQualification){authoritySha=request.authoritySha256;assert.equal(authoritySha,args.get("expected-authority-sha256"));const authorityPath=join(returnRoot,"authority-record.json");assert.equal(sha256(authorityPath),authoritySha);const authority=JSON.parse(readFileSync(authorityPath,"utf8"));assert.equal(authority.consumed,true);assert.equal(authority.authorityId,request.authorityId);assert.equal(authority.attemptId,runId);assert.equal(authority.executionCommit,request.executionCommit);authorityId=authority.authorityId;}else{assert.equal(args.get("expected-authority-sha256"),"NO-AUTHORITY-DEVELOPMENT-REHEARSAL");assert.equal(request.authorityCreated,false);assert.equal(request.attemptCreated,false);}
const stateParent=resolve(repositoryRoot,contract.paths.providerStateRoot);mkdirSync(stateParent,{recursive:true});
const providerRoot=join(stateParent,request.providerIdentity);const statePath=join(stateParent,`${request.providerIdentity}.json`);
const tools=contract.toolchain;for(const [name,item] of Object.entries(tools)){if(!existsSync(item.path)||sha256(item.path)!==item.sha256) throw new Error(`Bound provider tool differs: ${name}`);}
const node=tools.node.path;const cli=tools.supabaseCli.path;const binary=tools.supabaseBinary.path;const docker=tools.docker.path;const netsh=tools.netsh.path;
const governedPath=[...new Set(Object.values(tools).map(item=>dirname(item.path)))].join(";");
const environment=Object.fromEntries(Object.entries(process.env).filter(([key])=>!["path","supabase_telemetry_disabled","supabase_cli_binary_override"].includes(key.toLowerCase())));
environment.Path=governedPath;environment.SUPABASE_TELEMETRY_DISABLED="1";environment.SUPABASE_CLI_BINARY_OVERRIDE=binary;
const records=[];const secrets=[];
const delay=milliseconds=>new Promise(resolveDelay=>setTimeout(resolveDelay,milliseconds));
const removeDirectoryBounded=async path=>{let last;for(let attempt=0;attempt<20;attempt++){try{rmSync(path,{recursive:true,force:false,maxRetries:0});return;}catch(error){last=error;if(!["EBUSY","EPERM","ENOTEMPTY"].includes(error.code))throw error;await delay(250);}}throw new AggregateError([last],`Provider work-root removal remained blocked: ${path}`);};
const run=(label,executable,argumentsList,sensitive=false)=>{const result=spawnSync(executable,argumentsList,{cwd:repositoryRoot,encoding:"utf8",shell:false,windowsHide:true,maxBuffer:64*1024*1024,env:environment});records.push({label,executable,arguments:sensitive?[]:argumentsList,exitCode:result.status,stdout:sensitive?{classification:"SENSITIVE-CONTENT-WITHHELD",bytes:Buffer.byteLength(result.stdout??"","utf8")}:result.stdout,stderr:sensitive?{classification:"SENSITIVE-CONTENT-WITHHELD",bytes:Buffer.byteLength(result.stderr??"","utf8")}:result.stderr});return validateProcess(result,label);};
const projectId=`${contract.provider.projectIdPrefix}-${runId.slice(-8)}`;
const firewallNames=contract.network.providerPublications.map(port=>`Oracle-Stage4-R5-${runId.slice(-8)}-${port}`);

if(mode==="start"){
  if(existsSync(providerRoot)||existsSync(statePath)) throw new Error("Create-only provider identity already exists.");
  mkdirSync(providerRoot);
  let started=false;const cleanup=[];
  try{
    run("provider-init",node,[cli,"init","--workdir",providerRoot]);
    const configPath=join(providerRoot,"supabase","config.toml");let config=readFileSync(configPath,"utf8");
    config=config.replace(/project_id = ".*"/u,`project_id = "${projectId}"`).replace('site_url = "http://127.0.0.1:3000"','site_url = "http://127.0.0.1:4314"').replace('additional_redirect_urls = ["https://127.0.0.1:3000"]','additional_redirect_urls = ["http://127.0.0.1:4314/auth/callback"]').replace("enable_confirmations = false","enable_confirmations = true").replace("minimum_password_length = 6","minimum_password_length = 8");
    for(const expected of [`project_id = "${projectId}"`,'site_url = "http://127.0.0.1:4314"',"enable_confirmations = true","minimum_password_length = 8"]) if(!config.includes(expected)) throw new Error(`Provider configuration binding is absent: ${expected}`);
    const fs=await import("node:fs");fs.writeFileSync(configPath,config);
    const migrations=join(providerRoot,"supabase","migrations");mkdirSync(migrations);
    const sourceMigrations=resolve(args.get("transfer-root"),"payload","migrations");const names=readdirSync(sourceMigrations).filter(name=>/^\d{3}_.+\.sql$/u.test(name)).sort();assert.deepEqual(names,contract.provider.requiredMigrations);
    names.forEach((name,index)=>copyFileSync(join(sourceMigrations,name),join(migrations,`20260806${String(index+1).padStart(6,"0")}_${name}`),constants.COPYFILE_EXCL));
    const start=run("provider-start",node,[cli,"start","--workdir",providerRoot,"--exclude","edge-runtime,imgproxy,logflare,postgres-meta,realtime,storage-api,studio,supavisor,vector","--output","json"],true);started=true;
    const bootstrap=JSON.parse(start.stdout.trim());secrets.push(...Object.values(bootstrap).filter(value=>typeof value==="string"&&value));
    const status=run("provider-status",node,[cli,"status","--workdir",providerRoot,"--output","json"],true);const provider=JSON.parse(status.stdout.trim());
    const anonymousKey=provider.ANON_KEY??provider.anonKey;const serviceKey=provider.SERVICE_ROLE_KEY??provider.serviceRoleKey;const api=provider.API_URL??provider.apiUrl;const mail=provider.INBUCKET_URL??provider.inbucketUrl;
    for(const [name,value] of Object.entries({anonymousKey,serviceKey,api,mail})) if(typeof value!=="string"||!value) throw new Error(`Provider status omitted ${name}.`);secrets.push(anonymousKey,serviceKey);
    for(const [port,rule] of contract.network.providerPublications.map((port,index)=>[port,firewallNames[index]])){
      run(`provider-portproxy-${port}`,netsh,["interface","portproxy","add","v4tov4",`listenaddress=${contract.hosts.provider.address}`,`listenport=${port}`,"connectaddress=127.0.0.1",`connectport=${port}`]);
      run(`provider-firewall-${port}`,netsh,["advfirewall","firewall","add","rule",`name=${rule}`,"dir=in","action=allow","protocol=TCP",`localip=${contract.hosts.provider.address}`,`localport=${port}`,`remoteip=${contract.hosts.qualification.address}`]);
    }
    for(const service of Object.values(contract.provider.services)){const inspected=run(`image-${service.image}`,docker,["image","inspect","--format","{{json .}}",service.image]);const image=JSON.parse(inspected.stdout);assert.equal(image.Id,service.digest);}
    const publicRecord={schemaVersion:"1.0.0",contract:"oracle.sprint-30-5.stage-4-r5-provider-admission",result:"passed",transferId:request.transferId,authorityId:authorityId,attemptId:runId,providerHost:contract.hosts.provider.computerName,providerIdentity:request.providerIdentity,network:{activeDefaultRoutes:0,privateOnLinkOnly:true,internetReachable:false,postgresPublished:false,publishedPorts:contract.network.providerPublications},provider:{classification:contract.provider.classification,implementation:contract.provider.implementation,productionEndpoint:false,externalEmail:false},images:Object.values(contract.provider.services).map(service=>({image:service.image,digest:service.digest})),migrations:contract.provider.requiredMigrations,secretValuesRecorded:false,admittedAtUtc:new Date().toISOString()};
    writeJsonCreateOnly(join(returnRoot,"provider-admission.json"),publicRecord);
    writeJsonCreateOnly(join(returnRoot,"provider-secret-handoff.json"),{schemaVersion:"1.0.0",contract:"oracle.sprint-30-5.stage-4-r5-secret-handoff",providerIdentity:request.providerIdentity,providerUrl:"http://127.0.0.1:54321",mailpitUrl:"http://127.0.0.1:54324",anonymousKey,serviceKey,webSessionSecret:randomBytes(48).toString("hex"),expiresAtUtc:new Date(Date.now()+30*60*1000).toISOString()});
    writeJsonCreateOnly(statePath,{schemaVersion:"1.0.0",contract:"oracle.sprint-30-5.stage-4-r5-provider-state",transferId:request.transferId,authorityId:authorityId,attemptId:runId,providerIdentity:request.providerIdentity,projectId,providerRoot,firewallNames,startedAtUtc:new Date().toISOString()});
    process.stdout.write(`${JSON.stringify({result:"provider-started-awaiting-qualification",providerIdentity:request.providerIdentity,attemptId:runId,admissionSha256:sha256(join(returnRoot,"provider-admission.json")),secretHandoffSha256:sha256(join(returnRoot,"provider-secret-handoff.json")),secretValuesRecorded:false},null,2)}\n`);
  }catch(error){
    if(started){try{run("provider-stop-after-failure",node,[cli,"stop","--workdir",providerRoot,"--no-backup"]);}catch(cleanupError){cleanup.push(cleanupError.message)}}
    for(const [port,rule] of contract.network.providerPublications.map((port,index)=>[port,firewallNames[index]])){try{run(`remove-portproxy-${port}`,netsh,["interface","portproxy","delete","v4tov4",`listenaddress=${contract.hosts.provider.address}`,`listenport=${port}`])}catch{};try{run(`remove-firewall-${port}`,netsh,["advfirewall","firewall","delete","rule",`name=${rule}`])}catch{}}
    if(existsSync(providerRoot))try{await removeDirectoryBounded(providerRoot)}catch(cleanupError){cleanup.push(cleanupError.message)}
    if(!existsSync(join(returnRoot,"provider-failure.json")))writeJsonCreateOnly(join(returnRoot,"provider-failure.json"),{result:"failed",attemptId:runId,primaryFailure:error.message,cleanupFailures:cleanup,retryAuthorised:false,recordedAtUtc:new Date().toISOString()});
    throw error;
  }
}else{
  if(!existsSync(statePath)) throw new Error("Governed provider state record is absent.");const state=JSON.parse(readFileSync(statePath,"utf8"));assert.equal(state.attemptId,runId);assert.equal(state.providerIdentity,request.providerIdentity);
  const cleanup=[];try{run("provider-stop",node,[cli,"stop","--workdir",state.providerRoot,"--no-backup"]);}catch(error){cleanup.push(error.message)}
  for(const [port,rule] of contract.network.providerPublications.map((port,index)=>[port,state.firewallNames[index]])){try{run(`remove-portproxy-${port}`,netsh,["interface","portproxy","delete","v4tov4",`listenaddress=${contract.hosts.provider.address}`,`listenport=${port}`])}catch(error){cleanup.push(error.message)};try{run(`remove-firewall-${port}`,netsh,["advfirewall","firewall","delete","rule",`name=${rule}`])}catch(error){cleanup.push(error.message)}}
  for(const [label,argumentsList] of [["containers",["ps","-a","--filter",`name=${state.projectId}`,"--format","{{.ID}}"]],["volumes",["volume","ls","--filter",`name=${state.projectId}`,"--format","{{.Name}}"]],["networks",["network","ls","--filter",`name=${state.projectId}`,"--format","{{.Name}}"]]]){try{const observed=run(`zero-${label}`,docker,argumentsList).stdout.trim();if(observed)cleanup.push(`${label} remain: ${observed}`)}catch(error){cleanup.push(error.message)}}
  if(existsSync(state.providerRoot))try{await removeDirectoryBounded(state.providerRoot)}catch(error){cleanup.push(error.message)}
  const result={schemaVersion:"1.0.0",contract:"oracle.sprint-30-5.stage-4-r5-provider-teardown",result:cleanup.length?"failed":"passed",transferId:state.transferId,authorityId:state.authorityId,attemptId:state.attemptId,providerIdentity:state.providerIdentity,providerContainers:0,providerVolumes:0,providerNetworks:0,providerRelays:0,firewallRules:0,providerWorkRootPresent:existsSync(state.providerRoot),cleanupFailures:cleanup,zeroResidue:cleanup.length===0&&!existsSync(state.providerRoot),recordedAtUtc:new Date().toISOString()};
  writeJsonCreateOnly(join(returnRoot,"provider-teardown.json"),result);if(cleanup.length)throw new Error(`Provider teardown failed: ${cleanup.join("; ")}`);rmSync(statePath,{force:false});process.stdout.write(`${JSON.stringify({result:"passed",providerIdentity:state.providerIdentity,zeroResidue:true,teardownSha256:sha256(join(returnRoot,"provider-teardown.json"))},null,2)}\n`);
}
