import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const harnessRoot = import.meta.dirname;
const repositoryRoot = path.resolve(harnessRoot, "../../..");
const contract = JSON.parse(fs.readFileSync(path.join(harnessRoot, "Oracle.Stage2RequalificationR8Contract.json"), "utf8"));
if (contract.status !== "founder-authorised-execution-enabled" || contract.futureTransfer.creationPermitted !== true || contract.authority.qualificationExecutionPermitted !== true) {
  throw new Error("R8 transfer creation is not authorised by this preparation baseline.");
}
const args = new Map();
for (let index=2; index<process.argv.length; index+=2) args.set(process.argv[index].replace(/^--/u,""),process.argv[index+1]);
const transferId=required("transfer-id");
const timestampUtc=required("timestamp-utc");
const executionCommit=required("execution-commit");
const executionTree=required("execution-tree");
assert.match(transferId,/^transfer-stage2-r8-\d{8}T\d{9}Z-[0-9a-f]{8}$/u);
assert.equal(git(["rev-parse","HEAD"]),executionCommit);
assert.equal(git(["rev-parse","HEAD^{tree}"]),executionTree);
assert.equal(git(["status","--porcelain=v1"]),"");
assert.equal(git(["branch","--show-current"]),contract.requiredBranch);
assert.equal(contract.engineeringFreeze.accepted,true);
const freezeRoot=path.resolve(repositoryRoot,contract.engineeringFreeze.root);
const freezePath=path.join(freezeRoot,"Oracle.Stage2R8EngineeringCandidateFreeze.json");
assert.equal(sha256(freezePath),contract.engineeringFreeze.freezeSha256);
const transferBase=path.resolve(repositoryRoot,contract.futureTransfer.artifactBase);
const transferRoot=path.join(transferBase,transferId);
assertWithin(transferRoot,transferBase);
if(fs.existsSync(transferRoot))throw new Error("Create-only R8 transfer already exists.");
fs.mkdirSync(transferBase,{recursive:true});
fs.mkdirSync(transferRoot,{recursive:false});
const payloadRoot=path.join(transferRoot,"payload");
fs.mkdirSync(payloadRoot,{recursive:false});
const harnessTarget=path.join(payloadRoot,"harness");
fs.mkdirSync(harnessTarget,{recursive:false});
for(const name of ["Oracle.Stage2RequalificationR8Contract.json","Oracle.Stage2R8CleanHostCore.ps1","Invoke-OracleStage2R8Qualification.ps1"]){
  copyCreateOnly(path.join(harnessRoot,name),path.join(harnessTarget,name));
}
copyDirectoryCreateOnly(path.join(freezeRoot,"release"),path.join(payloadRoot,"release"));
copyCreateOnly(freezePath,path.join(payloadRoot,path.basename(freezePath)));
const files=inventory(payloadRoot);
const manifest={schemaVersion:"1.0.0",contract:"oracle.sprint-30-5.stage-2-r8-transfer-manifest",transferId,createdAtUtc:timestampUtc,executionCommit,executionTree,founderAuthorisedQualificationExecution:true,singleAttemptOnly:true,engineeringFreezeSha256:contract.engineeringFreeze.freezeSha256,packageSha256:contract.engineeringFreeze.packageSha256,publicCertificateSha256:contract.engineeringFreeze.publicCertificateSha256,files};
const manifestPath=path.join(transferRoot,"Oracle.Stage2R8TransferManifest.json");
writeCreateOnly(manifestPath,manifest);
const manifestSha256=sha256(manifestPath);
const custody={schemaVersion:"1.0.0",contract:"oracle.sprint-30-5.stage-2-r8-transfer-custody",transferId,createdAtUtc:timestampUtc,manifestSha256,createOnly:true,independentVerificationRequired:true,source:"accepted-r8-engineering-freeze",destination:"Founder-QA-01 local create-only copy",files:files.length,bytes:files.reduce((sum,item)=>sum+item.bytes,0)};
const custodyPath=path.join(transferRoot,"Oracle.Stage2R8TransferCustody.json");
writeCreateOnly(custodyPath,custody);
console.log(JSON.stringify({transferId,transferRoot,manifestSha256,custodySha256:sha256(custodyPath),files:files.length,bytes:custody.bytes},null,2));

function required(name){const value=args.get(name);if(!value)throw new Error("Required argument is absent: --"+name);return value;}
function git(arguments_){const result=spawnSync(contract.toolchainExecutables.git,arguments_,{cwd:repositoryRoot,encoding:"utf8",shell:false,windowsHide:true});if(result.status!==0)throw new Error(result.stderr);return result.stdout.trim();}
function sha256(file){return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");}
function assertWithin(candidate,root){const resolved=path.resolve(candidate),prefix=path.resolve(root)+path.sep;if(!resolved.toLowerCase().startsWith(prefix.toLowerCase()))throw new Error("Path escapes governed transfer root.");}
function copyCreateOnly(source,target){fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target,fs.constants.COPYFILE_EXCL);}
function copyDirectoryCreateOnly(source,target){fs.mkdirSync(target,{recursive:false});for(const entry of fs.readdirSync(source,{withFileTypes:true})){if(!entry.isFile()||entry.isSymbolicLink())throw new Error("Unexpected candidate-freeze release entry.");copyCreateOnly(path.join(source,entry.name),path.join(target,entry.name));}}
function walk(root){return fs.readdirSync(root,{withFileTypes:true}).flatMap(entry=>{const item=path.join(root,entry.name);if(entry.isSymbolicLink())throw new Error("Reparse transfer entry rejected.");return entry.isDirectory()?walk(item):entry.isFile()?[item]:[];});}
function inventory(root){return walk(root).map(file=>({path:path.relative(root,file).replaceAll("\\","/"),bytes:fs.statSync(file).size,sha256:sha256(file)})).sort((a,b)=>a.path.localeCompare(b.path,"en",{sensitivity:"variant"}));}
function writeCreateOnly(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+"\n",{encoding:"utf8",flag:"wx"});}