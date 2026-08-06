import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root=import.meta.dirname;
const repository=path.resolve(root,"../../..");
const contractPath=path.join(root,"Oracle.Stage2RequalificationR8Contract.json");
const contract=JSON.parse(fs.readFileSync(contractPath,"utf8"));
assert.equal(contract.contract,"oracle.sprint-30-5.stage-2-requalification-r8");
assert.equal(contract.status,"replacement-pre-authority-host-identity-failed-further-transfer-not-authorised");
assert.equal(contract.candidate.commit,"4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d");
assert.equal(contract.candidate.tree,"1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a");
assert.equal(contract.package.version,"0.1.6.0");
assert.equal(contract.qualificationHost.identity,"Founder-QA-01");
assert.equal(contract.qualificationHost.repositoryPermitted,false);
assert.equal(contract.qualificationHost.developmentToolInstallationPermitted,false);
assert.deepEqual(contract.qualificationHost.prohibitedDependencies,["git","node","npm","supabase","docker"]);
assert.equal(contract.futureTransfer.creationPermitted,false);
assert.equal(contract.authority.transferCreationPermitted,false);
assert.equal(contract.authority.authorityCreationPermitted,false);
assert.equal(contract.authority.attemptCreationPermitted,false);
assert.equal(contract.authority.qualificationExecutionPermitted,false);
assert.match(contract.executionMission.founderGrantId,/^founder-stage2-r8-grant-\d{8}T\d{9}Z-[0-9a-f]{8}$/u);
assert.match(contract.executionMission.transferId,/^transfer-stage2-r8-\d{8}T\d{9}Z-[0-9a-f]{8}$/u);
assert.equal(contract.executionMission.maximumTransfers,1);
assert.equal(contract.executionMission.maximumAuthorities,1);
assert.equal(contract.executionMission.maximumAttempts,1);
assert.equal(contract.executionMission.createAuthorityOnlyAfterAllPreAuthorityGates,true);
assert.equal(contract.executionMission.retryAfterConsumedAuthority,false);
assert.equal(contract.executionMission.stage3Authorised,false);
assert.equal(contract.executionMission.state,"pre-authority-transfer-failed");
assert.equal(contract.executionMission.transferCreationConsumed,true);
assert.equal(contract.executionMission.replacementTransferAuthorised,false);
assert.match(contract.replacementMission.founderGrantId,/^founder-stage2-r8-replacement-grant-\d{8}T\d{9}Z-[0-9a-f]{8}$/u);
assert.match(contract.replacementMission.transferId,/^transfer-stage2-r8-replacement-\d{8}T\d{9}Z-[0-9a-f]{8}$/u);
assert.equal(contract.replacementMission.replacesTransferId,contract.executionMission.transferId);
assert.equal(contract.replacementMission.acceptedCorrectionBaseline,"e449803796256b54323c2a11c7bda90c3ef6ca08");
assert.equal(contract.replacementMission.maximumTransfers,1);
assert.equal(contract.replacementMission.maximumAuthorities,1);
assert.equal(contract.replacementMission.maximumAttempts,1);
assert.equal(contract.replacementMission.createAuthorityOnlyAfterAllPreAuthorityGates,true);
assert.equal(contract.replacementMission.retryAfterConsumedAuthority,false);
assert.equal(contract.replacementMission.stage3Authorised,false);
assert.equal(contract.replacementMission.state,"pre-authority-host-identity-failed");
assert.equal(sha256(path.resolve(repository,contract.replacementMission.failureRecord.path)),contract.replacementMission.failureRecord.sha256);
assert.equal(contract.replacementMission.failureRecord.hostContinuityCreated,false);
assert.equal(contract.replacementMission.failureRecord.authorityCreated,false);
assert.equal(contract.replacementMission.failureRecord.attemptCreated,false);
assert.equal(contract.replacementMission.transferCreationConsumed,true);
const failedTransferRoot=path.resolve(repository,contract.futureTransfer.artifactBase,contract.executionMission.transferId);
assert.equal(fs.existsSync(failedTransferRoot),true);
assert.equal(sha256(path.join(failedTransferRoot,"Oracle.Stage2R8TransferManifest.json")),contract.executionMission.failureRecord.manifestSha256);
assert.equal(sha256(path.join(failedTransferRoot,"Oracle.Stage2R8TransferCustody.json")),contract.executionMission.failureRecord.custodySha256);
assert.equal(sha256(path.join(failedTransferRoot,"Oracle.Stage2R8TransferVerification.json")),contract.executionMission.failureRecord.verificationSha256);
assert.equal(sha256(path.resolve(repository,contract.executionMission.failureRecord.path)),contract.executionMission.failureRecord.sha256);
const replacementTransferRoot=path.resolve(repository,contract.futureTransfer.artifactBase,contract.replacementMission.transferId);
assert.equal(fs.existsSync(replacementTransferRoot),true);
assert.equal(sha256(path.join(replacementTransferRoot,"Oracle.Stage2R8TransferManifest.json")),contract.replacementMission.sealedTransfer.manifestSha256);
assert.equal(sha256(path.join(replacementTransferRoot,"Oracle.Stage2R8TransferCustody.json")),contract.replacementMission.sealedTransfer.custodySha256);
assert.equal(sha256(path.join(replacementTransferRoot,"Oracle.Stage2R8TransferVerification.json")),contract.replacementMission.sealedTransfer.verificationSha256);
assert.equal(fs.existsSync(path.resolve(repository,contract.output.artifactBase)),false);
assert.equal(fs.existsSync(path.resolve(repository,contract.output.repositoryEvidenceBase)),false);

for(const binding of contract.historicalEvidenceBindings){
  const file=path.resolve(repository,...binding.path.split("/"));
  assert.equal(sha256(file),binding.sha256,"Historical evidence binding failed: "+binding.path);
}
for(const name of fs.readdirSync(root)){
  const file=path.join(root,name);
  if(name.endsWith(".mjs")){
    const check=spawnSync(process.execPath,["--check",file],{cwd:repository,encoding:"utf8",shell:false,windowsHide:true});
    assert.equal(check.status,0,check.stderr);
  }
}
const powershell=contract.toolchainExecutables.powershell;
const parseScript=`$errors=$null; Get-ChildItem -LiteralPath '${root.replaceAll("'","''")}' -Filter '*.ps1' | ForEach-Object { [void][Management.Automation.Language.Parser]::ParseFile($_.FullName,[ref]$null,[ref]$errors); if($errors.Count){$errors|Out-String|Write-Error; exit 1} }`;
const parse=spawnSync(powershell,["-NoLogo","-NoProfile","-ExecutionPolicy","Bypass","-Command",parseScript],{cwd:repository,encoding:"utf8",shell:false,windowsHide:true});
assert.equal(parse.status,0,parse.stderr);

const qualification=source("Invoke-OracleStage2R8Qualification.ps1");
const authorityGate=qualification.indexOf("R8 qualification execution is not authorised");
const transferGate=qualification.indexOf("Assert-OracleStage2R8Transfer");
const missionBinding=qualification.indexOf("R8 admitted transfer mission binding differs");
const hostGate=qualification.indexOf("Get-OracleStage2R8HostAdmission");
const continuityWrite=qualification.indexOf("Write-OracleStage2R8CreateOnlyJson -Path $continuityPath");
const authorityCreation=qualification.indexOf("New-OracleStage2R8AuthorityIdentity");
const candidateVerification=qualification.indexOf("Invoke-OracleStage2R8CandidateVerification");
assert.ok(authorityGate>=0&&authorityGate<transferGate&&transferGate<missionBinding&&missionBinding<hostGate&&hostGate<continuityWrite&&continuityWrite<authorityCreation&&authorityCreation<candidateVerification);
assert.doesNotMatch(qualification,/\bgit(?:\.exe)?\b|\bnode(?:\.exe)?\b|\bnpm(?:\.cmd)?\b|\bsupabase\b|\bdocker\b/iu);
assert.match(qualification,/createdAfterTransferContinuityHostAndPreAuthorityAdmission=\$true/u);
assert.match(qualification,/retryAuthorised=\$false/u);
assert.match(qualification,/attempt-completion\.json/u);
assert.match(qualification,/failed-permanently/u);

const core=source("Oracle.Stage2R8CleanHostCore.ps1");
for(const phrase of ["Development repository is prohibited on the qualification host","Development tooling is prohibited on the qualification host","Pre-authority package or certificate state is not zero","Transferred package was unexpectedly trusted before the attempt","MSIX Authenticode verification failed","Detached release-manifest signer differs","Runtime-configuration canary leaked into the package","Exact temporary trust remains after verification","Execution contract binding differs","Transfer single-use limits differ"]){assert.match(core,new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/gu,"\\$&"),"u"));}
assert.match(core,/Test-OracleStage2R8FileContainsCanary/u);
assert.match(core,/\$chunkBytes = 1MB/u);
assert.match(core,/\[Buffer\]::BlockCopy/u);
assert.match(core,/Dictionary\[string,object\].*StringComparer\]::Ordinal/u);
assert.match(core,/HashSet\[string\].*StringComparer\]::Ordinal/u);
assert.doesNotMatch(core,/\$actual\[\$index\].*\$expected\[\$index\]/u);
assert.match(core,/Transfer predecessor lineage shape differs/u);
assert.match(core,/Transfer predecessor lineage differs/u);
assert.match(core,/StringComparison\]::OrdinalIgnoreCase/u);
assert.doesNotMatch(core,/\$computer -cne/u);

const transferBuilder=source("prepare-transfer.mjs");
assert.match(transferBuilder,/Exactly four transfer arguments are required/u);
assert.match(transferBuilder,/Transfer identity differs from the single authorised identity/u);
assert.match(transferBuilder,/founderGrantId:contract\.replacementMission\.founderGrantId/u);
assert.match(transferBuilder,/maximumAuthorities:1/u);
assert.match(transferBuilder,/maximumAttempts:1/u);
assert.match(transferBuilder,/Invoke-OracleStage2R8FounderHandoff\.ps1/u);
const transferVerifier=source("verify-transfer.mjs");
assert.match(transferVerifier,/manifest\.transferId,contract\.replacementMission\.transferId/u);
assert.match(transferVerifier,/manifest\.founderGrantId,contract\.replacementMission\.founderGrantId/u);
assert.match(transferVerifier,/executionContractSha256/u);
assert.match(transferVerifier,/manifest\.replacesTransferId,contract\.replacementMission\.replacesTransferId/u);
const handoff=source("Invoke-OracleStage2R8FounderHandoff.ps1");
assert.doesNotMatch(handoff,/\bgit(?:\.exe)?\b|\bnode(?:\.exe)?\b|\bnpm(?:\.cmd)?\b|\bsupabase\b|\bdocker\b/iu);
assert.match(handoff,/Create-only local R8 transfer root already exists/u);
assert.match(handoff,/Assert-OracleStage2R8Transfer/u);
assert.match(handoff,/R8 source contract mission binding differs/u);

const correctedAdmission=spawnSync(powershell,["-NoLogo","-NoProfile","-ExecutionPolicy","Bypass","-Command",`. '${path.join(root,"Oracle.Stage2R8CleanHostCore.ps1").replaceAll("'","''")}'; Assert-OracleStage2R8Transfer -TransferRoot '${failedTransferRoot.replaceAll("'","''")}' -ExpectedManifestSha256 '${contract.executionMission.failureRecord.manifestSha256}' -ExpectedCustodySha256 '${contract.executionMission.failureRecord.custodySha256}' -ExpectedVerificationSha256 '${contract.executionMission.failureRecord.verificationSha256}' | Out-Null`],{cwd:repository,encoding:"utf8",shell:false,windowsHide:true});
assert.equal(correctedAdmission.status,0,correctedAdmission.stderr);
const replacementAdmission=spawnSync(powershell,["-NoLogo","-NoProfile","-ExecutionPolicy","Bypass","-Command",`. '${path.join(root,"Oracle.Stage2R8CleanHostCore.ps1").replaceAll("'","''")}'; Assert-OracleStage2R8Transfer -TransferRoot '${replacementTransferRoot.replaceAll("'","''")}' -ExpectedManifestSha256 '${contract.replacementMission.sealedTransfer.manifestSha256}' -ExpectedCustodySha256 '${contract.replacementMission.sealedTransfer.custodySha256}' -ExpectedVerificationSha256 '${contract.replacementMission.sealedTransfer.verificationSha256}' | Out-Null`],{cwd:repository,encoding:"utf8",shell:false,windowsHide:true});
assert.equal(replacementAdmission.status,0,replacementAdmission.stderr);
const blockedTransfer=spawnSync(process.execPath,[path.join(root,"prepare-transfer.mjs")],{cwd:repository,encoding:"utf8",shell:false,windowsHide:true});
assert.notEqual(blockedTransfer.status,0);
assert.match(blockedTransfer.stderr,/transfer creation is not authorised/iu);
assert.equal(fs.existsSync(replacementTransferRoot),true);
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),"oracle-stage2-r8-preauthority-"));
try{
  const local=path.join(temporary,"local"); const returned=path.join(temporary,"return"); fs.mkdirSync(local); fs.mkdirSync(returned);
  const blocked=spawnSync(powershell,["-NoLogo","-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"Invoke-OracleStage2R8Qualification.ps1"),"-TransferRoot",path.join(temporary,"absent-transfer"),"-ExpectedManifestSha256","0".repeat(64),"-ExpectedCustodySha256","0".repeat(64),"-ExpectedVerificationSha256","0".repeat(64),"-FounderGrantId",contract.replacementMission.founderGrantId,"-LocalExecutionParent",local,"-ReturnRoot",returned],{cwd:repository,encoding:"utf8",shell:false,windowsHide:true});
  assert.notEqual(blocked.status,0);
  assert.match(blocked.stderr,/not authorised/iu);
  assert.deepEqual(fs.readdirSync(local),[]);
  assert.deepEqual(fs.readdirSync(returned),[]);
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
const hostIdentityFixture=spawnSync(powershell,["-NoLogo","-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"Test-OracleStage2R8HostIdentity.ps1")],{cwd:repository,encoding:"utf8",shell:false,windowsHide:true});
assert.equal(hostIdentityFixture.status,0,hostIdentityFixture.stderr);
const hostIdentityResult=JSON.parse(hostIdentityFixture.stdout);
assert.deepEqual({result:hostIdentityResult.result,comparison:hostIdentityResult.comparison,uppercaseWindows:hostIdentityResult.accepted.uppercaseWindows,differentSuffix:hostIdentityResult.rejected.differentSuffix},{result:"passed",comparison:"OrdinalIgnoreCase",uppercaseWindows:true,differentSuffix:true});
const scannerFixture=spawnSync(powershell,["-NoLogo","-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"Test-OracleStage2R8CanaryScanner.ps1")],{cwd:repository,encoding:"utf8",shell:false,windowsHide:true});
assert.equal(scannerFixture.status,0,scannerFixture.stderr);
const scannerResult=JSON.parse(scannerFixture.stdout);
assert.deepEqual({result:scannerResult.result,absentRejected:scannerResult.absentRejected,utf8ChunkBoundaryDetected:scannerResult.utf8ChunkBoundaryDetected,utf16LeDetected:scannerResult.utf16LeDetected},{result:"passed",absentRejected:true,utf8ChunkBoundaryDetected:true,utf16LeDetected:true});
console.log(JSON.stringify({result:"passed",contract:contract.contract,status:contract.status,founderGrantId:contract.replacementMission.founderGrantId,transferId:contract.replacementMission.transferId,historicalBindings:contract.historicalEvidenceBindings.length,cleanHostRuntime:"powershell-only",historicalFailedTransferPreserved:true,replacementTransferState:"immutable-pre-authority-host-identity-failure",sourceTransferCreationClosed:true,hostnameCorrection:"OrdinalIgnoreCase",furtherTransferAuthorised:false,authorityCreated:false,attemptCreated:false,fixtures:{syntax:"passed",historicalIntegrity:"passed",freshReplacementIdentity:"passed",exactMissionBinding:"passed",ordinalInventoryCorrection:"passed",hostIdentityCorrection:"passed",preAuthorityOrdering:"passed",cleanHostTooling:"passed",transferAdmission:"passed",signatureVerification:"passed",canaryRejection:"passed",failClosedBeforeAuthority:"passed"}},null,2));
function source(name){return fs.readFileSync(path.join(root,name),"utf8");}
function sha256(file){return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");}
