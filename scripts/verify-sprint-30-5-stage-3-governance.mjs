import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const evidenceRoot =
  "docs/sprints/evidence/sprint-30-5/stage-3-host-admission";
const returnedEvidence = join(evidenceRoot, "returned-evidence-r2");
const admissionPath = join(
  returnedEvidence,
  "Oracle.Stage3HostAdmission.json"
);
const controlsPath = join(
  returnedEvidence,
  "Oracle.Stage3CompensatingControls.json"
);
const baselinePath = join(
  evidenceRoot,
  "FOUNDER_QA_01_BASELINE_AND_RECOVERY.md"
);
const candidatePath = join(
  evidenceRoot,
  "Oracle.Stage3ProvenanceExceptionCandidate.json"
);
const approvalPath = join(
  evidenceRoot,
  "Oracle.Stage3HostAdmissionApproval.json"
);
const approvalPackagePath =
  "docs/sprints/SPRINT_30_5_STAGE_3_PROVENANCE_EXCEPTION_FOUNDER_APPROVAL_PACKAGE.md";

const expected = Object.freeze({
  admission:
    "6dfaa176ed2d43595511d44401612536c6c0f1955f94527469d0f22af09c3b0e",
  baseline:
    "6674b900fccadcc8f6d476dda6a787f859aad948dc78033dbfb7793ac90e8d44",
  controls:
    "9455f45f61b96eaabb33f009b9c8fb1aca2d8f99d1744bb9857453db24855eda",
  candidate:
    "651ea63adeff8c677e26fcc4b72e013e7047a35e3421ae705b0de7eb5a5bf2df",
  approvalPackage:
    "ec20282f48d047cce2ab6c89ba5658b7d44f12674c2fb3302ac03fa89bb6f5b7",
  approval:
    "0d9a9668dbbf11c91f08d58bd84261f48baa2d3d3fd13184434965b66ffe2282",
  collector:
    "d071a9c86a77c41b50315fadb3d6f24297d0e7dcad0bb8933ab2adc56b7f79ac",
  evaluator:
    "2383e27293212a10b05adcaf4f8ee40bd0b7f49c73d1989fce015288dab6f1bb",
});

assert.equal(fileHash(admissionPath), expected.admission);
assert.equal(fileHash(baselinePath), expected.baseline);
assert.equal(fileHash(controlsPath), expected.controls);
assert.equal(fileHash(candidatePath), expected.candidate);
assert.equal(fileHash(approvalPackagePath), expected.approvalPackage);
assert.equal(fileHash(approvalPath), expected.approval);
assert.equal(
  fileHash(
    "scripts/sprint-30-5/stage-3-host-admission/Collect-OracleStage3CompensatingControls.ps1"
  ),
  expected.collector
);
assert.equal(
  fileHash(
    "scripts/sprint-30-5/stage-3-host-admission/Test-OracleStage3ProvenanceException.ps1"
  ),
  expected.evaluator
);

verifySidecars(returnedEvidence);
verifySidecar(`${candidatePath}.sha256.txt`);
verifySidecar(`${approvalPath}.sha256.txt`);

const admission = readJson(admissionPath);
const controls = readJson(controlsPath);
const candidate = readJson(candidatePath);
const approval = readJson(approvalPath);

assert.equal(
  admission.mandatoryChecks.installationMediaEvidencePresent,
  false
);
assert.deepEqual(admission.failedChecks, [
  "installationMediaEvidencePresent",
]);
for (const [name, result] of Object.entries(admission.mandatoryChecks)) {
  if (name !== "installationMediaEvidencePresent") {
    assert.equal(result, true, `Admission control failed: ${name}`);
  }
}
assert.deepEqual(
  Object.values(admission.founderConfirmations),
  Object.values(admission.founderConfirmations).map(() => true)
);

assert.equal(controls.result, "passed");
assert.deepEqual(controls.failedChecks, []);
assert.equal(controls.binding.hostAdmissionSha256, expected.admission);
assert.equal(
  controls.binding.baselineRecoveryDocumentSha256,
  expected.baseline
);
assert.equal(controls.binding.installationMediaEvidencePresent, false);
assert.equal(controls.authority.grantsHostAdmission, false);
assert.equal(controls.authority.grantsStage3Authority, false);
assert.equal(
  controls.authority.maximumDownstreamState,
  "eligible-for-founder-approval"
);
assert.equal(controls.collector.sha256, expected.collector);
assert.equal(controls.controls.dism.noCorruptionDetected, true);
assert.equal(controls.controls.sfc.noIntegrityViolations, true);
assert.equal(controls.controls.defender.passed, true);

assert.equal(candidate.state, "eligible-for-founder-approval");
assert.equal(candidate.admissionGranted, false);
assert.equal(candidate.stage3AuthorityGranted, false);
assert.equal(
  candidate.exception.installationMediaEvidencePresent,
  false
);
assert.deepEqual(candidate.failedChecks, []);
assert.equal(candidate.evidence.hostAdmissionSha256, expected.admission);
assert.equal(
  candidate.evidence.baselineRecoverySha256,
  expected.baseline
);
assert.equal(
  candidate.evidence.compensatingControlsSha256,
  expected.controls
);
assert.equal(candidate.evaluator.sha256, expected.evaluator);
for (const [name, result] of Object.entries(candidate.checks)) {
  assert.equal(result, true, `Candidate evaluation failed: ${name}`);
}

assert.equal(
  approval.contract,
  "oracle.sprint-30-5.stage-3-host-admission-approval"
);
assert.equal(approval.decision, "approved");
assert.equal(
  approval.currentAdmission.state,
  "admitted-with-founder-provenance-exception"
);
assert.equal(
  approval.currentAdmission.classification,
  "founder-provenance-exception"
);
assert.equal(approval.currentAdmission.standardAdmission, false);
assert.equal(
  approval.currentAdmission.founderProvenanceExceptionAdmission,
  true
);
assert.equal(approval.currentAdmission.admissionGranted, true);
assert.equal(approval.currentAdmission.stage3AuthorityGranted, false);
assert.equal(
  approval.provenanceException.installationMediaEvidencePresent,
  false
);
assert.deepEqual(approval.bindings, {
  hostAdmissionSha256: expected.admission,
  baselineRecoveryDocumentSha256: expected.baseline,
  compensatingControlsSha256: expected.controls,
  provenanceExceptionCandidateSha256: expected.candidate,
  founderApprovalPackageSha256: expected.approvalPackage,
});
assert.deepEqual(approval.authority, {
  repositoryStateChangesOnly: true,
  stage3Execution: false,
  certificateTrust: false,
  artifactInstallation: false,
  stage3ArtifactAdmission: false,
  deployment: false,
  securityBoundaryChanges: false,
});

const documentation = [
  "docs/QUALIFICATION_REGISTER.md",
  "docs/sprints/SPRINT_30_5_STAGE_3_HOST_ADMISSION.md",
  "docs/sprints/SPRINT_30_5_STAGE_3_HOST_ADMISSION_DECISION.md",
  "docs/sprints/SPRINT_30_5_STAGE_3_PLAN.md",
  "docs/ENGINEERING_PROGRAMME.md",
  "docs/MASTER_BUILD_PLAN.md",
  "docs/Roadmap.md",
  "docs/PROJECT_BOARD.md",
  "docs/architecture/IMPLEMENTATION_STATUS.md",
  "docs/sprints/SPRINT_INDEX.md",
  "docs/sprints/SPRINT_30_PRODUCTION_QUALIFICATION_DOSSIER.md",
];
for (const document of documentation) {
  const content = readFileSync(document, "utf8");
  assert.match(
    content,
    /Founder provenance exception|Founder Provenance Exception|founder-provenance-exception/u,
    `Admission classification missing from ${document}.`
  );
  assert.match(
    content,
    /Stage 3.{0,80}(?:not authorised|unauthorised|requires a separate Founder decision)/isu,
    `Stage 3 authority exclusion missing from ${document}.`
  );
}

console.log(
  "Sprint 30.5 Stage 3 governance validation passed: host admitted with Founder provenance exception; Stage 3 remains unauthorised."
);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/u, ""));
}

function fileHash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function verifySidecars(directory) {
  for (const entry of readdirSync(directory)) {
    if (entry.endsWith(".sha256.txt")) {
      verifySidecar(join(directory, entry));
    }
  }
}

function verifySidecar(sidecarPath) {
  const sidecar = readFileSync(sidecarPath, "ascii").trim();
  const [declaredHash, filename] = sidecar.split(/\s+/u);
  const targetPath = join(
    sidecarPath.slice(0, sidecarPath.lastIndexOf("\\") + 1),
    filename
  );
  assert.equal(
    fileHash(targetPath),
    declaredHash.toLowerCase(),
    `Sidecar mismatch: ${sidecarPath}`
  );
}
