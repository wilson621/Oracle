import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args=new Map();
for(let index=2;index<process.argv.length;index+=2)args.set(process.argv[index].replace(/^--/u,""),process.argv[index+1]);
const transferRoot=path.resolve(required("transfer-root"));
const manifestPath=path.join(transferRoot,"Oracle.Stage2R8TransferManifest.json");
const custodyPath=path.join(transferRoot,"Oracle.Stage2R8TransferCustody.json");
const contractPath=path.join(transferRoot,"payload","harness","Oracle.Stage2RequalificationR8Contract.json");
const output=path.resolve(required("output"));
assert.equal(args.size,4,"Exactly four verification arguments are required.");
assert.equal(path.dirname(output).toLowerCase(),transferRoot.toLowerCase());
assert.equal(path.basename(output),"Oracle.Stage2R8TransferVerification.json");
assert.equal(fs.existsSync(output),false);
assert.equal(sha256(manifestPath),required("manifest-sha256").toLowerCase());
assert.equal(sha256(custodyPath),required("custody-sha256").toLowerCase());
const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const custody=JSON.parse(fs.readFileSync(custodyPath,"utf8"));
const contract=JSON.parse(fs.readFileSync(contractPath,"utf8"));
assert.equal(manifest.contract,"oracle.sprint-30-5.stage-2-r8-transfer-manifest");
assert.equal(contract.status,"founder-authorised-corrected-execution-enabled");
assert.equal(manifest.transferId,contract.correctedMission.transferId);
assert.equal(manifest.founderGrantId,contract.correctedMission.founderGrantId);
assert.equal(manifest.executionContractSha256,sha256(contractPath));
assert.equal(manifest.replacesTransferId,contract.correctedMission.replacesTransferId);
assert.equal(manifest.preservesOriginalTransferId,contract.correctedMission.preservesOriginalTransferId);
assert.equal(manifest.founderAuthorisedQualificationExecution,true);
assert.equal(manifest.singleAttemptOnly,true);
assert.equal(manifest.maximumAuthorities,1);
assert.equal(manifest.maximumAttempts,1);
assert.equal(custody.transferId,manifest.transferId);
assert.equal(custody.founderGrantId,manifest.founderGrantId);
assert.equal(custody.replacesTransferId,manifest.replacesTransferId);
assert.equal(custody.preservesOriginalTransferId,manifest.preservesOriginalTransferId);
assert.equal(custody.manifestSha256,sha256(manifestPath));
assert.equal(custody.createOnly,true);
assert.equal(custody.independentVerificationRequired,true);
const payloadRoot=path.join(transferRoot,"payload");
const actual=inventory(payloadRoot);
assert.deepEqual(actual,manifest.files);
assert.equal(custody.files,actual.length);
assert.equal(custody.bytes,actual.reduce((sum,item)=>sum+item.bytes,0));
const freezePath=path.join(payloadRoot,"Oracle.Stage2R8EngineeringCandidateFreeze.json");
const freeze=JSON.parse(fs.readFileSync(freezePath,"utf8"));
assert.equal(sha256(freezePath),manifest.engineeringFreezeSha256);
assert.equal(freeze.package.sha256,manifest.packageSha256);
assert.equal(freeze.publicCertificate.sha256,manifest.publicCertificateSha256);
assert.equal(sha256(path.join(payloadRoot,"release",freeze.package.fileName)),manifest.packageSha256);
assert.equal(sha256(path.join(payloadRoot,"release",freeze.publicCertificate.fileName)),manifest.publicCertificateSha256);
const verification={schemaVersion:"1.0.0",contract:"oracle.sprint-30-5.stage-2-r8-transfer-verification",result:"passed",classification:"INDEPENDENT TRANSFER VERIFICATION",verifiedAtUtc:new Date().toISOString(),transferId:manifest.transferId,founderGrantId:manifest.founderGrantId,replacesTransferId:manifest.replacesTransferId,preservesOriginalTransferId:manifest.preservesOriginalTransferId,manifestSha256:sha256(manifestPath),custodySha256:sha256(custodyPath),executionContractSha256:manifest.executionContractSha256,executionCommit:manifest.executionCommit,executionTree:manifest.executionTree,files:actual.length,bytes:custody.bytes,authorityCreated:false,attemptCreated:false};
fs.writeFileSync(output,JSON.stringify(verification,null,2)+"\n",{encoding:"utf8",flag:"wx"});
console.log(JSON.stringify({...verification,verificationSha256:sha256(output)},null,2));

function required(name){const value=args.get(name);if(!value)throw new Error("Required argument is absent: --"+name);return value;}
function sha256(file){return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");}
function walk(root){return fs.readdirSync(root,{withFileTypes:true}).flatMap(entry=>{const item=path.join(root,entry.name);if(entry.isSymbolicLink())throw new Error("Reparse transfer entry rejected.");return entry.isDirectory()?walk(item):entry.isFile()?[item]:[];});}
function inventory(root){return walk(root).map(file=>({path:path.relative(root,file).replaceAll("\\","/"),bytes:fs.statSync(file).size,sha256:sha256(file)})).sort((a,b)=>a.path.localeCompare(b.path,"en",{sensitivity:"variant"}));}