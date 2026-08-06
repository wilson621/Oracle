import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root=import.meta.dirname;
const repository=path.resolve(root,"../../..");
const contract=JSON.parse(fs.readFileSync(path.join(root,"Oracle.Stage2RequalificationR8Contract.json"),"utf8"));
assert.equal(contract.contract,"oracle.sprint-30-5.stage-2-requalification-r8");
assert.equal(contract.status==="engineering-preparation-transfer-barred"||contract.status==="engineering-freeze-accepted-transfer-barred",true);
assert.equal(contract.candidate.commit,"4d22b3b0e09817bcc4d0eeb50a2f123be6626f5d");
assert.equal(contract.candidate.tree,"1bdc84bae6c4c7ebf9d0e50396ff2439d425e70a");
assert.equal(contract.package.version,"0.1.6.0");
assert.equal(contract.qualificationHost.identity,"Founder-QA-01");
assert.equal(contract.qualificationHost.repositoryPermitted,false);
assert.equal(contract.qualificationHost.developmentToolInstallationPermitted,false);
assert.deepEqual(contract.qualificationHost.prohibitedDependencies,["git","node","npm","supabase","docker"]);
assert.equal(contract.futureTransfer.creationPermitted,false);
assert.equal(contract.authority.authorityCreationPermitted,false);
assert.equal(contract.authority.attemptCreationPermitted,false);
assert.equal(contract.authority.qualificationExecutionPermitted,false);
assert.equal(fs.existsSync(path.resolve(repository,contract.futureTransfer.artifactBase)),false);
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
const prepare=source("prepare-candidate.mjs");
assert.match(prepare,/NO-AUTHORITY-ENGINEERING-PREPARATION/u);
assert.match(prepare,/transferCreated:\s*false/u);
assert.match(prepare,/authorityCreated:\s*false/u);
assert.match(prepare,/attemptCreated:\s*false/u);
assert.match(prepare,/performSafetyTeardown\(\)/u);
assert.match(prepare,/Oracle\.Stage2R8PublicCertificate\.cer/u);
assert.match(prepare,/"-PackageFileName",\s*PACKAGE_FILE,\s*"-ExpectedThumbprint"/u);
assert.match(prepare,/admittedPublicCertificate/u);
assert.match(prepare,/contract\.package\.version/u);
assert.equal(prepare.includes('Version="0\\.1\\.4\\.0"'),false);
assert.doesNotMatch(prepare,/claimSingleAttemptAuthority\(/u);
assert.doesNotMatch(prepare,/createAttemptRecord\(/u);
assert.doesNotMatch(prepare,/createAttemptDirectory\(/u);

const qualification=source("Invoke-OracleStage2R8Qualification.ps1");
const authorityGate=qualification.indexOf("R8 qualification execution is not authorised");
const transferGate=qualification.indexOf("Assert-OracleStage2R8Transfer");
const hostGate=qualification.indexOf("Get-OracleStage2R8HostAdmission");
const authorityCreation=qualification.indexOf("New-OracleStage2R8AuthorityIdentity");
const candidateVerification=qualification.indexOf("Invoke-OracleStage2R8CandidateVerification");
assert.ok(authorityGate>=0&&authorityGate<transferGate&&transferGate<hostGate&&hostGate<authorityCreation&&authorityCreation<candidateVerification);
assert.doesNotMatch(qualification,/\bgit(?:\.exe)?\b|\bnode(?:\.exe)?\b|\bnpm(?:\.cmd)?\b|\bsupabase\b|\bdocker\b/iu);
assert.match(qualification,/createdAfterTransferContinuityHostAndPreAuthorityAdmission=\$true/u);
assert.match(qualification,/retryAuthorised=\$false/u);

const cleanup=source("remove-exact-certificate.ps1");
assert.match(cleanup,/stage-2-r8-engineering-freeze/u);
assert.match(cleanup,/stage-2-requalification-r8/u);
assert.match(cleanup,/candidate-r8-/u);
assert.match(cleanup,/stage2-r8-/u);

const core=source("Oracle.Stage2R8CleanHostCore.ps1");
assert.match(core,/Development repository is prohibited on the qualification host/u);
assert.match(core,/Development tooling is prohibited on the qualification host/u);
assert.match(core,/Pre-authority package or certificate state is not zero/u);
assert.match(core,/Transferred package was unexpectedly trusted before the attempt/u);
assert.match(core,/MSIX Authenticode verification failed/u);
assert.match(core,/Detached release-manifest signer differs/u);
assert.match(core,/Runtime-configuration canary leaked into the package/u);
assert.match(core,/Exact temporary trust remains after verification/u);

const transferBuilder=source("prepare-transfer.mjs");
assert.match(transferBuilder,/R8 transfer creation is not authorised by this preparation baseline/u);
assert.match(transferBuilder,/founderAuthorisedQualificationExecution:true/u);
assert.match(transferBuilder,/singleAttemptOnly:true/u);
const blockedTransfer=spawnSync(process.execPath,[path.join(root,"prepare-transfer.mjs")],{cwd:repository,encoding:"utf8",shell:false,windowsHide:true});
assert.notEqual(blockedTransfer.status,0);
assert.match(blockedTransfer.stderr,/transfer creation is not authorised/u);

const powershell=contract.toolchainExecutables.powershell;
const blockedQualification=spawnSync(powershell,["-NoLogo","-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"Invoke-OracleStage2R8Qualification.ps1"),"-TransferRoot","C:\\absent","-ExpectedManifestSha256","0".repeat(64),"-ExpectedCustodySha256","0".repeat(64),"-ExpectedVerificationSha256","0".repeat(64),"-FounderGrantId","blocked-fixture","-LocalExecutionParent","C:\\absent","-ReturnRoot","C:\\absent"],{cwd:repository,encoding:"utf8",shell:false,windowsHide:true});
assert.notEqual(blockedQualification.status,0);
assert.match(blockedQualification.stderr,/qualification execution is not authorised/u);

console.log(JSON.stringify({result:"passed",contract:contract.contract,status:contract.status,historicalBindings:contract.historicalEvidenceBindings.length,cleanHostRuntime:"powershell-only",transferCreated:false,authorityCreated:false,attemptCreated:false,fixtures:{syntax:"passed",historicalIntegrity:"passed",candidateFreezeBoundary:"passed",transferGate:"passed",qualificationGate:"passed",gateOrdering:"passed",cleanHostTooling:"passed",signatureVerification:"passed",canaryRejection:"passed",teardown:"passed"}},null,2));

function source(name){return fs.readFileSync(path.join(root,name),"utf8");}
function sha256(file){return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");}
