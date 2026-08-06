import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { contract, inventory, parseArguments, sha256 } from "./stage4r5-core.mjs";

const args=parseArguments(process.argv.slice(2));for(const name of ["attempt-root","repository-evidence-root"])if(!args.has(name))throw new Error(`Missing --${name}.`);
const attemptRoot=resolve(args.get("attempt-root"));const evidenceRoot=resolve(args.get("repository-evidence-root"));
const completionPath=join(attemptRoot,"completion.json");const finalPath=join(attemptRoot,"final-evidence-manifest.json");
for(const path of [completionPath,finalPath])assert.equal(existsSync(path),true,`Returned evidence record is absent: ${path}`);
const completion=JSON.parse(readFileSync(completionPath,"utf8"));const finalManifest=JSON.parse(readFileSync(finalPath,"utf8"));
assert.equal(completion.result,"passed-awaiting-founder-review");assert.equal(completion.zeroResidue,true);assert.equal(completion.retryAuthorised,false);assert.equal(completion.requiredJourneys,10);assert.equal(completion.requiredLifecyclePhases,20);
assert.equal(finalManifest.result,"passed-awaiting-founder-review");assert.equal(finalManifest.attemptId,completion.attemptId);assert.equal(finalManifest.authorityId,completion.authorityId);
const actual=inventory(attemptRoot,attemptRoot).filter(item=>item.path!=="final-evidence-manifest.json");assert.deepEqual(actual,finalManifest.files);
assert.deepEqual(inventory(attemptRoot,attemptRoot),inventory(evidenceRoot,evidenceRoot));
const archivePath=join(attemptRoot,"Oracle.Sprint30.5.Stage4R5QualificationEvidence.zip");assert.equal(sha256(archivePath),completion.archiveSha256);
assert.equal(readFileSync(`${archivePath}.sha256.txt`,"ascii"),`${completion.archiveSha256}  Oracle.Sprint30.5.Stage4R5QualificationEvidence.zip\n`);
const phases=contract.requiredLifecycle.map((phase,index)=>JSON.parse(readFileSync(join(attemptRoot,"lifecycle",`${String(index+1).padStart(3,"0")}-${phase}.json`),"utf8")));
assert.deepEqual(phases.map(item=>item.phase),contract.requiredLifecycle);for(const phase of phases){assert.equal(phase.attemptId,completion.attemptId);assert.equal(phase.authorityId,completion.authorityId);}
const journey=JSON.parse(readFileSync(join(attemptRoot,"evidence","live-journey.json"),"utf8"));assert.equal(journey.result,"passed");assert.equal(journey.classification,"GOVERNED-STAGE-4-R5-QUALIFICATION");assert.deepEqual(journey.journeys.map(item=>item.id),contract.requiredJourneys);assert.ok(journey.journeys.every(item=>item.result==="passed"));assert.equal(journey.secretsRetained,false);assert.equal(journey.isolation.accountCount,2);assert.equal(journey.isolation.crossAccountLeaks,0);
const installed=JSON.parse(readFileSync(join(attemptRoot,"logs","installed-package-result.json"),"utf8"));assert.equal(installed.result,"passed");assert.equal(installed.zeroResidue,true);assert.equal(installed.secretValuesRecorded,false);assert.equal(installed.packageSha256,contract.package.sha256);
const provider=JSON.parse(readFileSync(join(attemptRoot,"logs","provider-teardown.json"),"utf8"));assert.equal(provider.result,"passed");assert.equal(provider.zeroResidue,true);assert.deepEqual(provider.cleanupFailures,[]);
for(const item of actual.filter(entry=>/\.(json|md|txt)$/u.test(entry.path))){const text=readFileSync(join(attemptRoot,item.path),"utf8");assert.doesNotMatch(text,/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/u,`JWT-like value leaked: ${item.path}`);assert.doesNotMatch(text,/"(?:serviceKey|service_role|access_token|refresh_token|anonymousKey|webSessionSecret)"\s*:/iu,`Credential field leaked: ${item.path}`);}
process.stdout.write(`${JSON.stringify({result:"passed",attemptId:completion.attemptId,authorityId:completion.authorityId,archiveSha256:completion.archiveSha256,finalEvidenceManifestSha256:sha256(finalPath),attemptFiles:inventory(attemptRoot,attemptRoot).length,repositoryParity:true,requiredJourneys:10,requiredLifecyclePhases:20,zeroResidue:true},null,2)}\n`);
