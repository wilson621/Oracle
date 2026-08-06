import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  assertCreateOnly, contract, copyFileCreateOnly, harnessRoot, inventory,
  parseArguments, repositoryRoot, sha256, validateRepository, writeJsonCreateOnly,
} from "./stage4r5-core.mjs";

const args=parseArguments(process.argv.slice(2));
for(const name of ["bundle-id","timestamp-utc","destination-root","expected-commit"])if(!args.has(name))throw new Error(`Missing --${name}.`);
if(!/^engineering-rehearsal-stage4-r5-[0-9]{8}T[0-9]{9}Z-[a-f0-9]{8}$/u.test(args.get("bundle-id")))throw new Error("Engineering rehearsal-bundle identity is malformed.");
const timestamp=new Date(args.get("timestamp-utc"));if(!Number.isFinite(timestamp.valueOf())||timestamp.toISOString()!==args.get("timestamp-utc"))throw new Error("Engineering rehearsal timestamp is not canonical UTC.");
const repository=validateRepository(args.get("expected-commit"),true);
const destinationParent=resolve(args.get("destination-root"));if(!existsSync(destinationParent))throw new Error("Engineering rehearsal destination is absent.");
const bundleRoot=assertCreateOnly(join(destinationParent,args.get("bundle-id")),destinationParent);mkdirSync(bundleRoot);const payloadRoot=join(bundleRoot,"payload");mkdirSync(payloadRoot);

const freezeRoot=resolve(repositoryRoot,contract.paths.engineeringFreezeRoot);const releaseRoot=join(freezeRoot,"release");
for(const name of [contract.package.fileName,contract.package.publicCertificateFileName,"oracle-release-manifest.json","oracle-release-manifest.json.p7s","oracle-0.1.6.cdx.json","oracle-0.1.6.provenance.json","package-content-inventory.json","signature-and-trust-verification.json"])copyFileCreateOnly(join(releaseRoot,name),join(payloadRoot,"release",name),bundleRoot);
if(sha256(join(payloadRoot,"release",contract.package.fileName))!==contract.package.sha256)throw new Error("Accepted R8 MSIX differs in the rehearsal bundle.");
if(sha256(join(payloadRoot,"release",contract.package.publicCertificateFileName))!==contract.package.publicCertificateSha256)throw new Error("Accepted R8 certificate differs in the rehearsal bundle.");
for(const name of contract.provider.requiredMigrations)copyFileCreateOnly(join(repositoryRoot,"database",name),join(payloadRoot,"migrations",name),bundleRoot);
for(const name of [
  "Initialize-OracleStage4R5PrivateLink.ps1","Restore-OracleStage4R5PrivateLink.ps1","Invoke-OracleStage4R5TwoHostRehearsal.ps1",
  "Invoke-OracleStage4R5InstalledPackageJourney.ps1","Invoke-OracleStage4R5CleanHostJourney.ps1","Oracle.Stage4R5CleanHostCore.ps1",
  "Oracle.Stage4R5ExecutionContract.json","Oracle.Stage4R5LifecyclePolicy.ps1","Oracle.Stage4R5NetworkPolicy.ps1","Oracle.Stage4R5JourneyPolicy.ps1",
  "Oracle.Stage4R5ProviderHostPolicy.ps1","Oracle.Stage3R13ActivationPolicy.ps1","Oracle.Stage3R13InstalledRuntimeConfigurationPolicy.ps1",
  "Oracle.Stage4R4ProcessTeardownPolicy.ps1",
])copyFileCreateOnly(join(harnessRoot,name),join(payloadRoot,"harness",name),bundleRoot);
const payload=inventory(payloadRoot,payloadRoot);
const manifestPath=join(bundleRoot,"Oracle.Stage4R5EngineeringRehearsalBundle.json");
writeJsonCreateOnly(manifestPath,{
  schemaVersion:"1.0.0",contract:"oracle.sprint-30-5.stage-4-r5-engineering-rehearsal-bundle",bundleId:args.get("bundle-id"),createdAtUtc:args.get("timestamp-utc"),
  classification:["NON-QUALIFICATION","NON-AUTHORITY","NON-EVIDENCE","NON-TRANSFER","TWO-HOST ENGINEERING REHEARSAL"],
  transferCreated:false,qualificationExecutionPermitted:false,authorityCreated:false,attemptCreated:false,qualificationEvidence:false,
  preparation:{executionCommit:repository.head,executionTree:repository.tree},acceptedPackageSha256:contract.package.sha256,
  destinationHost:contract.hosts.qualification,providerHost:contract.hosts.provider,privateLink:contract.network,
  privateKeysIncluded:false,productionCredentialsIncluded:false,productSourceIncluded:false,payload,
});
process.stdout.write(`${JSON.stringify({result:"prepared",classification:["NON-QUALIFICATION","NON-AUTHORITY","NON-EVIDENCE","NON-TRANSFER"],bundleId:args.get("bundle-id"),bundleRoot,manifestSha256:sha256(manifestPath),payloadFiles:payload.length,payloadBytes:payload.reduce((sum,item)=>sum+item.bytes,0),transferCreated:false,authorityCreated:false,attemptCreated:false},null,2)}\n`);
