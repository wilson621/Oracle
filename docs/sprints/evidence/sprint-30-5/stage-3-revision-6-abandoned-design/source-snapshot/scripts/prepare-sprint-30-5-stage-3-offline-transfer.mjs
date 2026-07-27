import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cpSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourceArchive = join(
  root,
  ".artifacts",
  "sprint-30-5",
  "stage-2",
  "Oracle.Sprint30.5.Stage2QualificationEvidence.zip"
);
const kitSource = join(
  root,
  "scripts",
  "sprint-30-5",
  "stage-3-qualification"
);
const transferRoot = join(
  root,
  ".artifacts",
  "sprint-30-5",
  "stage-3",
  "offline-transfer"
);
const kitDestination = join(transferRoot, "stage-3-qualification-kit");
const archiveDestination = join(
  transferRoot,
  "Oracle.Sprint30.5.Stage2QualificationEvidence.zip"
);
const expectedArchiveSha256 =
  "8c20f6da7f0262ed4ef9a3a59c6a027ba3d64cb66c4e646b1f5d075da369f876";
const revision1 = Object.freeze({
  revision: 1,
  transferManifestSha256:
    "327083ed6418e064a7d737e3c5608ee526bc847050aa08fe6581627c8cd7d8b2",
  transferManifestSidecarSha256:
    "d414c932afcea8d7b0cbaed79caa88cb8320b0d6a51c81304f7911a38315f49d",
  kitManifestSha256:
    "6bc41d6f16826fe0c7b5015f74056d3c0c7383572cda8b36a4fc7f5db15dad23",
  qualificationScriptSha256:
    "ce1b4ab77b2082f4e7292e628fd2e7a6fce2667e69afcc512fe07e10dd8d7781",
  outcome: "pre-execution-failed-before-evidence",
  defect: "PowerShell 5.1 zero-output pipeline returned null under strict mode",
});
const revision2FailureRecordPath = join(
  kitSource,
  "Oracle.Stage3Revision2FailureRecord.json"
);
const revision2 = Object.freeze({
  revision: 2,
  transferManifestSha256:
    "cfe4828d9accff14cc6ddcf28934af6a3305c499a50254776ba3cfb1cede6733",
  transferManifestSidecarSha256:
    "87b23dafe6aa74ca91987686346cdd08ff88d0553bc50d5d2c07763494e3e8b1",
  kitManifestSha256:
    "46beb2742df4a06cbb3752f02fc2e4f8e4d80f36da0265359e402f4c41aa0e8f",
  qualificationScriptSha256:
    "26688814494fe3a1e67baf14ce056b6f667f55f51fd534f75bd6b24925b874ea",
  failureRecordSha256: sha256(revision2FailureRecordPath),
  outcome: "install-and-startup-blocked-before-package-registration",
  hresult: "0x800B0109",
  defect:
    "CurrentUser Root trust is not accepted by the Windows MSIX deployment provider",
});
const revision3FailureRecordPath = join(
  kitSource,
  "Oracle.Stage3Revision3FailureRecord.json"
);
const revision3 = Object.freeze({
  revision: 3,
  transferManifestSha256:
    "1f577548e9868174bb51e670998577e83b65e03c2c6e2efefb6c71a75b74d70d",
  transferManifestSidecarSha256:
    "f3edba0a51ddd3ab05abbc4aff53456074b4bf5c41937047497c7663f38fe529",
  kitManifestSha256:
    "d9317e8b01b56bb95e67e73c67466f90716f846aae7165a8c81f1391c0a3cc28",
  qualificationScriptSha256:
    "fbbe53d75bbf1f323aed389f42dd771223602f8aff7b6a46e060d718e9eb316f",
  failureRecordSha256: sha256(revision3FailureRecordPath),
  outcome: "negative-path-controls-passed-trust-scope-evaluator-failed",
  originalUntrustedHresult: "0x800B0109",
  tamperedHresult: "0x80096010",
  defect:
    "Inherited Current User logical projections were counted as additional physical trust entries",
});
const revision4FailureRecordPath = join(
  kitSource,
  "Oracle.Stage3Revision4FailureRecord.json"
);
const supersededRevision = Object.freeze({
  revision: 4,
  transferManifestSha256:
    "ee18fbd03cd44ac45bcc1bf2307ea680a083e301f7a5c6ebc74f5bb32848c971",
  transferManifestSidecarSha256:
    "e49e3c7d41ab17401042d179a75c88e74f665bbf99f2c6e75cf993b234efb6d7",
  kitManifestSha256:
    "875f795b89ed72af95b43ed2f6924939ef3480d65501aab5cf8eee9dd900d6b0",
  qualificationScriptSha256:
    "57bb72d21274e05d3ad91db84a4d4351db90af54663dffccc60a21723abb3789",
  negativePathEvidenceSha256:
    "164a5df278aeca15d98b7c131e4c73cadea40f511d0831f12ed4d0d46e3215e2",
  failureRecordSha256: sha256(revision4FailureRecordPath),
  outcome: "install-and-startup-timeout-after-successful-appx-activation",
  installedPackage:
    "Oracle.Platform.LocalCertification_0.1.1.0_x64__fw69ec0wxwzn4",
  installedExecutableSha256:
    "0cd98c06fae63d980fdd1c68446d576d4e3045d2ee293ebab21f94c5366abba6",
});
const approvedKitFiles = [
  "Invoke-OracleStage3Qualification.ps1",
  "Oracle.Stage3QualificationContract.json",
  "Oracle.Stage3Revision2FailureRecord.json",
  "Oracle.Stage3Revision3FailureRecord.json",
  "Oracle.Stage3Revision4FailureRecord.json",
  "README.txt",
];

assert.equal(sha256(sourceArchive), expectedArchiveSha256);
assertWorkspacePath(transferRoot);
preserveRevision2Transfer();
preserveRevision3Transfer();
preserveRevision4Transfer();
rmSync(transferRoot, { recursive: true, force: true });
mkdirSync(kitDestination, { recursive: true });
copyFileSync(sourceArchive, archiveDestination);

for (const filename of approvedKitFiles) {
  copyFileSync(join(kitSource, filename), join(kitDestination, filename));
}

const kitEntries = approvedKitFiles.map((filename) => {
  const path = join(kitDestination, filename);
  return {
    relativePath: filename,
    sha256: sha256(path),
    size: statSync(path).size,
  };
});
const kitManifestPath = join(
  kitDestination,
  "Oracle.Stage3QualificationKit.manifest.json"
);
writeJson(kitManifestPath, {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-3-qualification-kit-manifest",
  contractVersion: 1,
  revision: 5,
  supersedes: supersededRevision,
  revisionHistory: [revision1, revision2, revision3],
  host: "Founder-QA-01",
  runtimeRequirements: ["Windows PowerShell 5.1", "Windows 11 x64"],
  forbiddenDependencies: [
    "Node.js",
    "Git",
    "compiler",
    "SDK",
    "development server",
    "Oracle source",
  ],
  files: kitEntries,
  authority: {
    stage3Only: true,
    stage4: false,
    production: false,
    deployment: false,
    privateKeyTransfer: false,
  },
});

const payloadPaths = [
  archiveDestination,
  ...approvedKitFiles.map((filename) => join(kitDestination, filename)),
  kitManifestPath,
];
const transferManifestPath = join(
  transferRoot,
  "Oracle.Stage3OfflineTransferManifest.json"
);
writeJson(transferManifestPath, {
  schemaVersion: 1,
  contract: "oracle.sprint-30-5.stage-3-offline-transfer-manifest",
  contractVersion: 1,
  revision: 5,
  supersedes: supersededRevision,
  revisionHistory: [revision1, revision2, revision3],
  transferMethod: "Founder-approved offline removable media",
  sourceCheckpoint: {
    branch: "sprint-9-overlay",
    baseCommit: "7e6cca76c250a806a61f59c12556e6121824a3f7",
    qualificationHarnessBoundByHash: true,
    productSourceChanged: false,
  },
  destinationHost: {
    deviceName: "Founder-QA-01",
    manufacturer: "MEDION",
    model: "ERAZER P6605 MD61596",
    admissionState: "admitted-with-founder-provenance-exception",
  },
  payloadFiles: payloadPaths.map((path) => ({
    relativePath: normalize(relative(transferRoot, path)),
    sha256: sha256(path),
    size: statSync(path).size,
  })),
  approvals: {
    exactFrozenStage2Archive: true,
    selfContainedPowerShellKit: true,
    publicCertificateDerivedLaterFromSignedEvidence: true,
    privateKeyIncluded: false,
    productionCredentialIncluded: false,
    productionDataIncluded: false,
    productSourceIncluded: false,
    revision2EvidencePreserved: true,
    revision3FailurePreserved: true,
    revision4FailurePreserved: true,
    revision4TransferPreservedByteForByte: true,
    physicalStoreTrustAuthority: true,
    logicalProjectionAuthority: false,
    continuationRequiresInstalledPackage: true,
    automaticReinstallPermitted: false,
    resumeFromInstallAndStartupContinuation: true,
  },
});
const manifestSha256 = sha256(transferManifestPath);
writeFileSync(
  `${transferManifestPath}.sha256.txt`,
  `${manifestSha256}  ${basename(transferManifestPath)}\n`,
  "ascii"
);

const declared = JSON.parse(readFileSync(transferManifestPath, "utf8"));
assert.equal(declared.payloadFiles.length, payloadPaths.length);
for (const entry of declared.payloadFiles) {
  const path = join(transferRoot, ...entry.relativePath.split("/"));
  assert.equal(sha256(path), entry.sha256);
  assert.equal(statSync(path).size, entry.size);
}
const kitManifest = JSON.parse(readFileSync(kitManifestPath, "utf8"));
assert.deepEqual(
  kitManifest.files.map((entry) => entry.relativePath).sort(),
  [...approvedKitFiles].sort()
);
for (const entry of kitManifest.files) {
  const path = join(kitDestination, entry.relativePath);
  assert.equal(sha256(path), entry.sha256);
  assert.equal(statSync(path).size, entry.size);
}
const failureRecord = JSON.parse(
  readFileSync(
    join(kitDestination, "Oracle.Stage3Revision2FailureRecord.json"),
    "utf8"
  )
);
assert.equal(failureRecord.deploymentFailure.hresult, "0x800B0109");
assert.equal(failureRecord.evidence.phase03CompletelyAbsent, true);
assert.equal(
  failureRecord.frozenCandidate.msixSha256,
  "00b045996e8a7e90400ce3208b2ab36bacccf48831a6ab770827f2ecd6e45276"
);
assert.equal(failureRecord.frozenCandidate.rebuilt, false);
assert.equal(failureRecord.frozenCandidate.resigned, false);
const revision3FailureRecord = JSON.parse(
  readFileSync(
    join(kitDestination, "Oracle.Stage3Revision3FailureRecord.json"),
    "utf8"
  )
);
assert.equal(
  revision3FailureRecord.deploymentFailure.originalUntrusted.hresult,
  "0x800B0109"
);
assert.equal(
  revision3FailureRecord.deploymentFailure.tamperedAfterTrust.hresult,
  "0x80096010"
);
assert.equal(
  revision3FailureRecord.returnedEvidence.physicalCertificateMatchCountAfterCleanup,
  0
);
assert.equal(
  revision3FailureRecord.returnedEvidence.revision3NegativeEvidenceCreated,
  false
);
assert.equal(revision3FailureRecord.frozenCandidate.rebuilt, false);
assert.equal(revision3FailureRecord.frozenCandidate.resigned, false);
const revision4FailureRecord = JSON.parse(
  readFileSync(
    join(kitDestination, "Oracle.Stage3Revision4FailureRecord.json"),
    "utf8"
  )
);
assert.equal(
  revision4FailureRecord.outcome,
  "install-and-startup-timeout-after-successful-appx-activation"
);
assert.equal(revision4FailureRecord.conclusions.installSucceeded, true);
assert.equal(revision4FailureRecord.conclusions.visibleReadinessProven, false);
assert.equal(
  revision4FailureRecord.conclusions.sustainedReadinessProven,
  false
);
assert.equal(
  revision4FailureRecord.conclusions.phase03SuccessEvidenceCreated,
  false
);
assert.equal(
  revision4FailureRecord.bindings.frozenMsixSha256,
  "00b045996e8a7e90400ce3208b2ab36bacccf48831a6ab770827f2ecd6e45276"
);
assert.equal(revision4FailureRecord.governance.msixRebuilt, false);
assert.equal(revision4FailureRecord.governance.msixResigned, false);
const qualificationContract = JSON.parse(
  readFileSync(
    join(kitDestination, "Oracle.Stage3QualificationContract.json"),
    "utf8"
  )
);
assert.equal(qualificationContract.qualificationKitRevision, 5);
assert.equal(
  qualificationContract.requalification.revision5RestartFrom,
  "InstallAndStartupContinuation"
);
assert.equal(
  qualificationContract.requalification.automaticReinstallPermitted,
  false
);
assert.deepEqual(qualificationContract.startupObservation, {
  processCreationDeadlineSeconds: 90,
  windowReadinessDeadlineSeconds: 60,
  samplingIntervalSeconds: 1,
  consecutiveResponsiveSamples: 5,
  sustainedRuntimeSeconds: 120,
  gracefulCloseDeadlineSeconds: 30,
  minimumCertificateMinutesRemaining: 30,
  nonLoopbackConnectionsPermitted: false,
});

console.log(`Stage 3 offline transfer prepared: ${transferRoot}`);
console.log(`Payload files: ${payloadPaths.length}`);
console.log(`Transfer files including manifest and sidecar: ${payloadPaths.length + 2}`);
console.log(`Transfer manifest SHA-256: ${manifestSha256}`);

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalize(path) {
  return path.replaceAll("\\", "/");
}

function assertWorkspacePath(path) {
  const relativePath = relative(root, path);
  assert.ok(relativePath && !relativePath.startsWith(".."));
}

function preserveRevision2Transfer() {
  const revision2Root = join(
    root,
    ".artifacts",
    "sprint-30-5",
    "stage-3",
    "superseded",
    "offline-transfer-r2"
  );
  const currentManifest = join(
    transferRoot,
    "Oracle.Stage3OfflineTransferManifest.json"
  );
  const currentSidecar = `${currentManifest}.sha256.txt`;
  const currentKitManifest = join(
    transferRoot,
    "stage-3-qualification-kit",
    "Oracle.Stage3QualificationKit.manifest.json"
  );
  const currentScript = join(
    transferRoot,
    "stage-3-qualification-kit",
    "Invoke-OracleStage3Qualification.ps1"
  );

  const currentManifestSha256 = sha256(currentManifest);
  if (
    currentManifestSha256 === revision2.transferManifestSha256 &&
    !existsSync(revision2Root)
  ) {
    assert.equal(
      sha256(currentSidecar),
      revision2.transferManifestSidecarSha256
    );
    assert.equal(
      sha256(currentKitManifest),
      revision2.kitManifestSha256
    );
    assert.equal(
      sha256(currentScript),
      revision2.qualificationScriptSha256
    );
    assert.equal(
      sha256(join(transferRoot, basename(sourceArchive))),
      expectedArchiveSha256
    );
    mkdirSync(dirname(revision2Root), { recursive: true });
    cpSync(transferRoot, revision2Root, {
      recursive: true,
      errorOnExist: true,
    });
  } else if (currentManifestSha256 !== revision2.transferManifestSha256) {
    const current = JSON.parse(readFileSync(currentManifest, "utf8"));
    assert.ok([3, 4, 5].includes(current.revision));
  }

  assert.equal(
    sha256(join(revision2Root, basename(currentManifest))),
    revision2.transferManifestSha256
  );
  assert.equal(
    sha256(
      join(
        revision2Root,
        "Oracle.Stage3OfflineTransferManifest.json.sha256.txt"
      )
    ),
    revision2.transferManifestSidecarSha256
  );
  assert.equal(
    sha256(
      join(
        revision2Root,
        "stage-3-qualification-kit",
        basename(currentKitManifest)
      )
    ),
    revision2.kitManifestSha256
  );
  assert.equal(
    sha256(
      join(
        revision2Root,
        "stage-3-qualification-kit",
        "Invoke-OracleStage3Qualification.ps1"
      )
    ),
    revision2.qualificationScriptSha256
  );
  assert.equal(
    sha256(join(revision2Root, basename(sourceArchive))),
    expectedArchiveSha256
  );
}

function preserveRevision3Transfer() {
  const revision3Root = join(
    root,
    ".artifacts",
    "sprint-30-5",
    "stage-3",
    "superseded",
    "offline-transfer-r3"
  );
  const currentManifest = join(
    transferRoot,
    "Oracle.Stage3OfflineTransferManifest.json"
  );
  const currentSidecar = `${currentManifest}.sha256.txt`;
  const currentKitManifest = join(
    transferRoot,
    "stage-3-qualification-kit",
    "Oracle.Stage3QualificationKit.manifest.json"
  );
  const currentScript = join(
    transferRoot,
    "stage-3-qualification-kit",
    "Invoke-OracleStage3Qualification.ps1"
  );

  const currentManifestSha256 = sha256(currentManifest);
  if (
    currentManifestSha256 === revision3.transferManifestSha256 &&
    !existsSync(revision3Root)
  ) {
    assert.equal(
      sha256(currentSidecar),
      revision3.transferManifestSidecarSha256
    );
    assert.equal(
      sha256(currentKitManifest),
      revision3.kitManifestSha256
    );
    assert.equal(
      sha256(currentScript),
      revision3.qualificationScriptSha256
    );
    assert.equal(
      sha256(join(transferRoot, basename(sourceArchive))),
      expectedArchiveSha256
    );
    mkdirSync(dirname(revision3Root), { recursive: true });
    cpSync(transferRoot, revision3Root, {
      recursive: true,
      errorOnExist: true,
    });
  } else if (
    currentManifestSha256 !== revision3.transferManifestSha256
  ) {
    const current = JSON.parse(readFileSync(currentManifest, "utf8"));
    assert.ok([4, 5].includes(current.revision));
  }

  assert.equal(
    sha256(join(revision3Root, basename(currentManifest))),
    revision3.transferManifestSha256
  );
  assert.equal(
    sha256(
      join(
        revision3Root,
        "Oracle.Stage3OfflineTransferManifest.json.sha256.txt"
      )
    ),
    revision3.transferManifestSidecarSha256
  );
  assert.equal(
    sha256(
      join(
        revision3Root,
        "stage-3-qualification-kit",
        basename(currentKitManifest)
      )
    ),
    revision3.kitManifestSha256
  );
  assert.equal(
    sha256(
      join(
        revision3Root,
        "stage-3-qualification-kit",
        "Invoke-OracleStage3Qualification.ps1"
      )
    ),
    revision3.qualificationScriptSha256
  );
  assert.equal(
    sha256(join(revision3Root, basename(sourceArchive))),
    expectedArchiveSha256
  );
}

function preserveRevision4Transfer() {
  const revision4Root = join(
    root,
    ".artifacts",
    "sprint-30-5",
    "stage-3",
    "superseded",
    "offline-transfer-r4"
  );
  const currentManifest = join(
    transferRoot,
    "Oracle.Stage3OfflineTransferManifest.json"
  );
  const currentSidecar = `${currentManifest}.sha256.txt`;
  const currentKitManifest = join(
    transferRoot,
    "stage-3-qualification-kit",
    "Oracle.Stage3QualificationKit.manifest.json"
  );
  const currentScript = join(
    transferRoot,
    "stage-3-qualification-kit",
    "Invoke-OracleStage3Qualification.ps1"
  );

  const currentManifestSha256 = sha256(currentManifest);
  if (
    currentManifestSha256 === supersededRevision.transferManifestSha256 &&
    !existsSync(revision4Root)
  ) {
    verifyTransferDirectory(
      transferRoot,
      4,
      supersededRevision.transferManifestSha256,
      supersededRevision.transferManifestSidecarSha256
    );
    assert.equal(
      sha256(currentSidecar),
      supersededRevision.transferManifestSidecarSha256
    );
    assert.equal(
      sha256(currentKitManifest),
      supersededRevision.kitManifestSha256
    );
    assert.equal(
      sha256(currentScript),
      supersededRevision.qualificationScriptSha256
    );
    assert.equal(
      sha256(join(transferRoot, basename(sourceArchive))),
      expectedArchiveSha256
    );
    const before = directorySnapshot(transferRoot);
    mkdirSync(dirname(revision4Root), { recursive: true });
    cpSync(transferRoot, revision4Root, {
      recursive: true,
      errorOnExist: true,
    });
    assert.deepEqual(directorySnapshot(revision4Root), before);
  } else if (
    currentManifestSha256 !== supersededRevision.transferManifestSha256
  ) {
    const current = JSON.parse(readFileSync(currentManifest, "utf8"));
    assert.equal(current.revision, 5);
  }

  verifyTransferDirectory(
    revision4Root,
    4,
    supersededRevision.transferManifestSha256,
    supersededRevision.transferManifestSidecarSha256
  );
  assert.equal(
    sha256(join(revision4Root, basename(currentManifest))),
    supersededRevision.transferManifestSha256
  );
  assert.equal(
    sha256(
      join(
        revision4Root,
        "Oracle.Stage3OfflineTransferManifest.json.sha256.txt"
      )
    ),
    supersededRevision.transferManifestSidecarSha256
  );
  assert.equal(
    sha256(
      join(
        revision4Root,
        "stage-3-qualification-kit",
        basename(currentKitManifest)
      )
    ),
    supersededRevision.kitManifestSha256
  );
  assert.equal(
    sha256(
      join(
        revision4Root,
        "stage-3-qualification-kit",
        "Invoke-OracleStage3Qualification.ps1"
      )
    ),
    supersededRevision.qualificationScriptSha256
  );
  assert.equal(
    sha256(join(revision4Root, basename(sourceArchive))),
    expectedArchiveSha256
  );
}

function directorySnapshot(path) {
  const snapshot = {};
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
      } else {
        const key = normalize(relative(path, entryPath));
        snapshot[key] = {
          sha256: sha256(entryPath),
          size: statSync(entryPath).size,
        };
      }
    }
  };
  visit(path);
  return snapshot;
}

function verifyTransferDirectory(
  directory,
  revision,
  expectedManifestSha256,
  expectedSidecarSha256
) {
  const manifestPath = join(
    directory,
    "Oracle.Stage3OfflineTransferManifest.json"
  );
  const sidecarPath = `${manifestPath}.sha256.txt`;
  assert.equal(sha256(manifestPath), expectedManifestSha256);
  assert.equal(sha256(sidecarPath), expectedSidecarSha256);
  const sidecarDeclaration = readFileSync(sidecarPath, "ascii")
    .trim()
    .split(/\s+/u)[0];
  assert.equal(sidecarDeclaration, expectedManifestSha256);

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.revision, revision);
  const expectedFiles = new Set([
    "Oracle.Stage3OfflineTransferManifest.json",
    "Oracle.Stage3OfflineTransferManifest.json.sha256.txt",
  ]);
  for (const entry of manifest.payloadFiles) {
    const path = join(directory, ...entry.relativePath.split("/"));
    assert.equal(sha256(path), entry.sha256);
    assert.equal(statSync(path).size, entry.size);
    expectedFiles.add(entry.relativePath);
  }
  const snapshot = directorySnapshot(directory);
  assert.deepEqual(
    Object.keys(snapshot).sort(),
    [...expectedFiles].sort()
  );

  const kitManifestPath = join(
    directory,
    "stage-3-qualification-kit",
    "Oracle.Stage3QualificationKit.manifest.json"
  );
  const kitManifest = JSON.parse(readFileSync(kitManifestPath, "utf8"));
  assert.equal(kitManifest.revision, revision);
  for (const entry of kitManifest.files) {
    const path = join(
      directory,
      "stage-3-qualification-kit",
      entry.relativePath
    );
    assert.equal(sha256(path), entry.sha256);
    assert.equal(statSync(path).size, entry.size);
  }
}
