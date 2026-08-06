import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import {
  assertContract, assertCreateOnly, contract, copyFileCreateOnly, harnessRoot,
  inventory, parseArguments, repositoryRoot, sha256, validateRepository,
  writeFileCreateOnly, writeJsonCreateOnly,
} from "./stage4r5-core.mjs";

const args = parseArguments(process.argv.slice(2));
for (const name of ["founder-token", "founder-grant-id", "transfer-id", "timestamp-utc", "destination-root", "expected-commit"]) if (!args.has(name)) throw new Error(`Missing --${name}.`);
assertContract();
if (args.get("founder-token") !== contract.executionAuthority.requiredFounderToken) throw new Error("Exact Founder execution token is absent.");
if (!new RegExp(contract.identity.transferPattern, "u").test(args.get("transfer-id"))) throw new Error("Transfer identity is malformed.");
if (!new RegExp(contract.identity.founderGrantPattern, "u").test(args.get("founder-grant-id"))) throw new Error("Founder grant identity is malformed.");
const timestamp = new Date(args.get("timestamp-utc"));
if (!Number.isFinite(timestamp.valueOf()) || timestamp.toISOString() !== args.get("timestamp-utc")) throw new Error("Transfer timestamp is not canonical UTC.");
const repository = validateRepository(args.get("expected-commit"), true);

const destinationParent = resolve(args.get("destination-root"));
if (!existsSync(destinationParent)) throw new Error("Approved transfer destination root is absent.");
const transferRoot = assertCreateOnly(join(destinationParent, args.get("transfer-id")), destinationParent);
mkdirSync(transferRoot);
const payloadRoot = join(transferRoot, "payload");
mkdirSync(payloadRoot);

const freezeRoot = resolve(repositoryRoot, contract.paths.engineeringFreezeRoot);
const releaseRoot = join(freezeRoot, "release");
const releaseFiles = [
  contract.package.fileName,
  contract.package.publicCertificateFileName,
  "oracle-release-manifest.json",
  "oracle-release-manifest.json.p7s",
  "oracle-0.1.6.cdx.json",
  "oracle-0.1.6.provenance.json",
  "package-content-inventory.json",
  "signature-and-trust-verification.json",
];
for (const name of releaseFiles) copyFileCreateOnly(join(releaseRoot, name), join(payloadRoot, "release", name), transferRoot);
if (sha256(join(payloadRoot, "release", contract.package.fileName)) !== contract.package.sha256) throw new Error("Accepted R8 MSIX differs.");
if (sha256(join(payloadRoot, "release", contract.package.publicCertificateFileName)) !== contract.package.publicCertificateSha256) throw new Error("Accepted R8 public certificate differs.");

for (const name of contract.provider.requiredMigrations) copyFileCreateOnly(join(repositoryRoot, "database", name), join(payloadRoot, "migrations", name), transferRoot);

const runtimeHarness = [
  "Invoke-OracleStage4R5FounderHandoff.ps1",
  "Initialize-OracleStage4R5PrivateLink.ps1",
  "Restore-OracleStage4R5PrivateLink.ps1",
  "Invoke-OracleStage4R5TwoHostRehearsal.ps1",
  "Invoke-OracleStage4R5Qualification.ps1",
  "Invoke-OracleStage4R5InstalledPackageJourney.ps1",
  "Invoke-OracleStage4R5CleanHostJourney.ps1",
  "Oracle.Stage4R5CleanHostCore.ps1",
  "Oracle.Stage4R5ExecutionContract.json",
  "Oracle.Stage4R5LifecyclePolicy.ps1",
  "Oracle.Stage4R5NetworkPolicy.ps1",
  "Oracle.Stage4R5JourneyPolicy.ps1",
  "Oracle.Stage4R5ProviderHostPolicy.ps1",
  "Oracle.Stage3R13ActivationPolicy.ps1",
  "Oracle.Stage3R13InstalledRuntimeConfigurationPolicy.ps1",
  "Oracle.Stage4R4ProcessTeardownPolicy.ps1"
];
for (const name of runtimeHarness) copyFileCreateOnly(join(harnessRoot, name), join(payloadRoot, "harness", name), transferRoot);

const bindings = [
  ["stage2-r8-accepted-evidence-index.json", join(repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5", "stage-2-requalification-r8", "Oracle.Stage2RequalificationR8AcceptedEvidenceIndex.json")],
  ["stage3-r13-accepted-evidence-index.json", join(repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5", "stage-3-r13", "Oracle.Stage3R13AcceptedEvidenceIndex.json")],
  ["stage4-r4-accepted-evidence-index.json", join(repositoryRoot, "docs", "sprints", "evidence", "sprint-30-5", "stage-4-r4", "Oracle.Stage4R4AcceptedEvidenceIndex.json")],
  ["stage4-r5-engineering-preparation-closure.md", join(repositoryRoot, "docs", "sprints", "SPRINT_30_5_STAGE_4_R5_ENGINEERING_PREPARATION_CLOSURE.md")]
];
for (const [name, source] of bindings) copyFileCreateOnly(source, join(payloadRoot, "bindings", name), transferRoot);

const payload = inventory(payloadRoot, transferRoot);
const manifestPath = join(transferRoot, "Oracle.Stage4R5TransferManifest.json");
writeJsonCreateOnly(manifestPath, {
  schemaVersion: "1.0.0",
  contract: "oracle.sprint-30-5.stage-4-r5-transfer-manifest",
  revision: "R5",
  transferId: args.get("transfer-id"),
  founderGrantId: args.get("founder-grant-id"),
  createdAtUtc: args.get("timestamp-utc"),
  founderAuthorisedQualificationExecution: true,
  singleAttemptOnly: true,
  maximumAuthorities: 1,
  maximumAttempts: 1,
  retryAuthorised: false,
  preparation: { acceptedCommit: contract.acceptedPreparation.commit, executionCommit: repository.head, executionTree: repository.tree },
  acceptedChain: contract.acceptedChain,
  destinationHost: contract.hosts.qualification,
  providerHost: contract.hosts.provider,
  privateLink: contract.network,
  transferMedium: contract.transferMedium,
  privateKeysIncluded: false,
  productionCredentialsIncluded: false,
  productSourceIncluded: false,
  payload
});
const manifestSha256 = sha256(manifestPath);
writeFileCreateOnly(`${manifestPath}.sha256.txt`, `${manifestSha256}  ${basename(manifestPath)}\n`, "ascii");
const custodyPath = join(transferRoot, "Oracle.Stage4R5TransferCustody.json");
writeJsonCreateOnly(custodyPath, {
  schemaVersion: "1.0.0",
  contract: "oracle.sprint-30-5.stage-4-r5-transfer-custody",
  transferId: args.get("transfer-id"),
  founderGrantId: args.get("founder-grant-id"),
  recordedAtUtc: args.get("timestamp-utc"),
  createOnly: true,
  independentVerificationRequired: true,
  sourceRepository: repository,
  destination: transferRoot,
  transferMedium: contract.transferMedium,
  manifest: { fileName: basename(manifestPath), bytes: statSync(manifestPath).size, sha256: manifestSha256 },
  preservedHistoricalEvidence: true,
  state: "prepared-create-only-awaiting-independent-verification"
});
const custodySha256 = sha256(custodyPath);
writeFileCreateOnly(`${custodyPath}.sha256.txt`, `${custodySha256}  ${basename(custodyPath)}\n`, "ascii");
process.stdout.write(`${JSON.stringify({result:"prepared-awaiting-independent-verification",transferId:args.get("transfer-id"),transferRoot,manifestSha256,custodySha256,payloadFiles:payload.length,payloadBytes:payload.reduce((sum,item)=>sum+item.bytes,0)},null,2)}\n`);
