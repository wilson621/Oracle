import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const sourceRoot = "scripts/sprint-30-5/stage-1-kit";
const temporaryRoot = ".tmp-sprint-30-5-stage1-kit";
const kitRoot = path.join(temporaryRoot, "Oracle.Stage1EvidenceKit");
const artifactsRoot = ".artifacts/sprint-30-5/stage-1";
const archivePath = path.join(artifactsRoot, "Oracle.Stage1EvidenceKit.zip");
const transferRecordPath = path.join(
  artifactsRoot,
  "Oracle.Stage1EvidenceKit.transfer-source.json"
);
const electronVersion = "39.8.10";

removeExact(temporaryRoot);
removeExact(artifactsRoot);
fs.mkdirSync(kitRoot, { recursive: true });
fs.mkdirSync(artifactsRoot, { recursive: true });

for (const name of [
  "Collect-OracleStage1Baseline.ps1",
  "Test-OracleStage1LaptopRoute.ps1",
  "Run-OracleStage1EvidenceKit.ps1",
  "Start-OracleStage1EvidenceKit.cmd",
  "Confirm-OracleStage1Removal.ps1",
  "Confirm-OracleStage1Removal.cmd",
]) {
  fs.copyFileSync(path.join(sourceRoot, name), path.join(kitRoot, name));
}

const packageOutput = path.join(temporaryRoot, "packaged");
execFileSync(
  process.execPath,
  [
    "node_modules/@electron/packager/bin/electron-packager.mjs",
    path.join(sourceRoot, "gpu-probe"),
    "OracleStage1GpuProbe",
    "--platform=win32",
    "--arch=x64",
    `--electron-version=${electronVersion}`,
    `--out=${packageOutput}`,
    "--overwrite",
    "--asar",
    "--prune=true",
  ],
  { stdio: "inherit" }
);
fs.cpSync(
  path.join(packageOutput, "OracleStage1GpuProbe-win32-x64"),
  path.join(kitRoot, "gpu-probe"),
  { recursive: true }
);

const files = walk(kitRoot)
  .map((file) => ({
    path: path.relative(kitRoot, file).replaceAll("\\", "/"),
    sha256: fileHash(file),
    size: fs.statSync(file).size,
  }))
  .sort((left, right) => left.path.localeCompare(right.path));
const manifest = {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.evidence-kit",
  contractVersion: 1,
  createdAt: new Date().toISOString(),
  sourceBaselineCommit: git(["rev-parse", "HEAD"]),
  electronVersion,
  purpose: "environment-admission-only",
  productSourceIncluded: false,
  developmentToolsRequiredOnLaptop: false,
  files,
};
fs.writeFileSync(
  path.join(kitRoot, "kit-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);

execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-Command",
    `Compress-Archive -LiteralPath '${escapePowerShell(kitRoot)}' -DestinationPath '${escapePowerShell(archivePath)}' -CompressionLevel Optimal`,
  ],
  { stdio: "inherit" }
);
const archiveSha256 = fileHash(archivePath);
const transferRecord = {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.artifact-transfer-source",
  contractVersion: 1,
  createdAt: new Date().toISOString(),
  filename: path.basename(archivePath),
  sha256: archiveSha256,
  size: fs.statSync(archivePath).size,
  electronVersion,
  sourceBaselineCommit: manifest.sourceBaselineCommit,
  transferMethod: "to-be-recorded-on-qualification-machine",
};
fs.writeFileSync(
  transferRecordPath,
  `${JSON.stringify(transferRecord, null, 2)}\n`
);
fs.writeFileSync(
  `${archivePath}.sha256.txt`,
  `${archiveSha256}  ${path.basename(archivePath)}\n`
);

console.log(`Evidence kit: ${path.resolve(archivePath)}`);
console.log(`SHA-256: ${archiveSha256}`);

function walk(entry) {
  const stat = fs.statSync(entry);
  if (stat.isFile()) return [entry];
  return fs.readdirSync(entry).flatMap((child) => walk(path.join(entry, child)));
}

function fileHash(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function removeExact(entry) {
  const resolved = path.resolve(entry);
  const workspace = path.resolve(".");
  if (!resolved.startsWith(`${workspace}${path.sep}`)) {
    throw new Error(`Refusing to remove path outside workspace: ${resolved}`);
  }
  fs.rmSync(resolved, { recursive: true, force: true });
}

function escapePowerShell(value) {
  return path.resolve(value).replaceAll("'", "''");
}
