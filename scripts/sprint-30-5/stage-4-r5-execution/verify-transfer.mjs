import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { assertContract, contract, inventory, parseArguments, sha256, writeJsonCreateOnly } from "./stage4r5-core.mjs";

const args = parseArguments(process.argv.slice(2));
for (const name of ["transfer-root","expected-manifest-sha256","expected-custody-sha256","expected-commit"]) if(!args.has(name)) throw new Error(`Missing --${name}.`);
assertContract();
const root=resolve(args.get("transfer-root"));
const manifestPath=join(root,"Oracle.Stage4R5TransferManifest.json");
const custodyPath=join(root,"Oracle.Stage4R5TransferCustody.json");
const verificationPath=join(root,"Oracle.Stage4R5TransferVerification.json");
if(existsSync(verificationPath)) throw new Error("Independent verification record already exists.");
assert.equal(sha256(manifestPath),args.get("expected-manifest-sha256"));
assert.equal(sha256(custodyPath),args.get("expected-custody-sha256"));
assert.equal(readFileSync(`${manifestPath}.sha256.txt`,"ascii"),`${args.get("expected-manifest-sha256")}  ${basename(manifestPath)}\n`);
assert.equal(readFileSync(`${custodyPath}.sha256.txt`,"ascii"),`${args.get("expected-custody-sha256")}  ${basename(custodyPath)}\n`);
const manifest=JSON.parse(readFileSync(manifestPath,"utf8"));
const custody=JSON.parse(readFileSync(custodyPath,"utf8"));
assert.equal(manifest.contract,"oracle.sprint-30-5.stage-4-r5-transfer-manifest");
assert.equal(manifest.replacesTransferId,contract.replacesTransferId);
assert.match(manifest.transferId,new RegExp(contract.identity.transferPattern,"u"));
assert.match(manifest.founderGrantId,new RegExp(contract.identity.founderGrantPattern,"u"));
assert.equal(manifest.preparation.executionCommit,args.get("expected-commit"));
assert.equal(manifest.founderAuthorisedQualificationExecution,true);
assert.equal(manifest.singleAttemptOnly,true);
assert.equal(manifest.maximumAuthorities,1);
assert.equal(manifest.maximumAttempts,1);
assert.equal(manifest.retryAuthorised,false);
assert.deepEqual(manifest.acceptedChain,contract.acceptedChain);
assert.deepEqual(manifest.transferMedium,contract.transferMedium);
assert.equal(manifest.privateKeysIncluded,false);
assert.equal(manifest.productionCredentialsIncluded,false);
assert.equal(manifest.productSourceIncluded,false);
assert.equal(custody.transferId,manifest.transferId);
assert.equal(custody.replacesTransferId,manifest.replacesTransferId);
assert.equal(custody.founderGrantId,manifest.founderGrantId);
assert.equal(custody.createOnly,true);
assert.equal(custody.independentVerificationRequired,true);
assert.equal(custody.manifest.sha256,sha256(manifestPath));
assert.equal(custody.manifest.bytes,statSync(manifestPath).size);
const actual=inventory(join(root,"payload"),root);
assert.deepEqual(actual,manifest.payload);
const names=readdirSync(root).sort();
assert.deepEqual(names,["Oracle.Stage4R5TransferCustody.json","Oracle.Stage4R5TransferCustody.json.sha256.txt","Oracle.Stage4R5TransferManifest.json","Oracle.Stage4R5TransferManifest.json.sha256.txt","payload"].sort());
const required=[
  `payload/release/${contract.package.fileName}`,
  `payload/release/${contract.package.publicCertificateFileName}`,
  "payload/harness/Invoke-OracleStage4R5FounderHandoff.ps1",
  "payload/harness/Invoke-OracleStage4R5Qualification.ps1",
  "payload/harness/Invoke-OracleStage4R5InstalledPackageJourney.ps1",
  "payload/harness/Oracle.Stage4R5ExecutionContract.json"
];
for(const path of required) assert.ok(manifest.payload.some(entry=>entry.path===path),`Required payload absent: ${path}`);
assert.equal(sha256(join(root,`payload/release/${contract.package.fileName}`)),contract.package.sha256);
assert.equal(sha256(join(root,`payload/release/${contract.package.publicCertificateFileName}`)),contract.package.publicCertificateSha256);
writeJsonCreateOnly(verificationPath,{
  schemaVersion:"1.0.0",contract:"oracle.sprint-30-5.stage-4-r5-transfer-verification",result:"passed",transferId:manifest.transferId,founderGrantId:manifest.founderGrantId,verifiedAtUtc:new Date().toISOString(),manifestSha256:sha256(manifestPath),custodySha256:sha256(custodyPath),executionCommit:manifest.preparation.executionCommit,payloadFiles:actual.length,payloadBytes:actual.reduce((sum,item)=>sum+item.bytes,0),authorityCreated:false,attemptCreated:false,qualificationEvidence:false
});
process.stdout.write(`${JSON.stringify({result:"passed",transferId:manifest.transferId,manifestSha256:sha256(manifestPath),custodySha256:sha256(custodyPath),verificationSha256:sha256(verificationPath),payloadFiles:actual.length,payloadBytes:actual.reduce((sum,item)=>sum+item.bytes,0),authorityCreated:false,attemptCreated:false},null,2)}\n`);
