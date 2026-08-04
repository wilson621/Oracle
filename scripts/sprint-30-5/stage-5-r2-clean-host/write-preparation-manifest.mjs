import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const root = import.meta.dirname;
const output = join(root, "Oracle.Stage5R2PreparationManifest.json");
const files = [
  "Oracle.Stage5R2CleanHostContract.json", "Oracle.Stage5R2CleanHostContinuityPolicy.ps1",
  "Oracle.Stage5CleanHostFixtureProvider.cs", "Oracle.Stage5CleanHostFixtureProvider.exe",
  "Invoke-OracleStage5R2EdgeSemanticProbe.ps1", "Measure-OracleStage5R2InstalledPackage.ps1",
  "Oracle.Stage5R2ObservationOwnershipPolicy.ps1", "Invoke-OracleStage5R2CompanionTransitions.ps1",
  "Oracle.Stage5GameWindowFixture.cs", "Oracle.Stage5GameWindowFixture.exe",
  "Oracle.Stage5R2ActivationPolicy.ps1", "Oracle.Stage5R2InstalledRuntimeConfigurationPolicy.ps1",
  "Oracle.Stage5R2ProcessTeardownPolicy.ps1", "Invoke-OracleStage5R2InstalledDevelopmentRehearsal.ps1",
  "stage5-r2-core.mjs",
];
const sha256 = path => createHash("sha256").update(readFileSync(path)).digest("hex");
const record = {
  schemaVersion: "1.0.0",
  contract: "oracle.sprint-30-5.stage-5-r2-clean-host-preparation-manifest",
  status: "engineering-preparation-qualification-barred",
  maximumTransfers: 0, maximumAuthorities: 0, maximumAttempts: 0,
  qualificationHostDeveloperToolCount: 0,
  fixtureEquivalenceClaimed: false,
  files: files.map(path => ({ path, sha256: sha256(join(root, path)) })),
};
writeFileSync(output, JSON.stringify(record, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ result: "passed", output: basename(output), files: record.files.length }));
