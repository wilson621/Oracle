# Sprint 30.5 Stage 3 Qualification R4 Pre-Execution Gate

**Status:** R4 corrective preparation authorised; execution blocked
**Programme identity:** `Sprint 30.5 Stage 3 Qualification R4`
**Authority:** Founder-authorised preparation only
**Prepared:** 30 July 2026
**Execution:** Blocked and unauthorised

## Operating authority

This gate applies [OEOM v1.0](../ORACLE_ENGINEERING_OPERATING_MODEL.md).
OEOM owns authority separation, immutable attempts, evidence integrity,
fail-closed execution, review and closure. This record does not restate or
replace those controls.

The gate proves that the R4 preparation system, still bound exclusively to
the accepted Stage 2 R2 candidate, is ready to receive a separate Founder
execution decision. Founder authority in the R4 corrective preparation
mission permits one create-only R4 transfer on the already
approved USB. It does not authorise certificate trust, package installation,
Stage 3 execution or qualification evidence.

R3 preserved the R2 Windows computer-name correction and fixed only the
confirmed function-scoped `FunctionInfo.Path` defect. Failed R2 identity
`stage3-r2-20260730T124016125Z-d0037861`, authority
`authority-stage3-r2-20260730T124016125Z-d0037861` and the R2 transfer remain
immutable and retired. R3 then failed closed during package-content inventory
reconciliation after authority creation; its transfer and generated host
records remain immutable and retired. R4 retains the exact executing harness path at script
scope under `powershell.exe -File` and uses it for strict self-hash validation.
Dot-sourced invocation is unsupported and unauthorised.

R4 reconciles the immutable MSIX directly as ZIP streams. It decodes entry
names once to the same forward-slash logical paths used by the accepted Stage
2 inventory. Every governed path, size and SHA-256 remains mandatory. The sole
container-only entry `[Content_Types].xml` is required at the root and checked
against exact size `2374` and SHA-256
`3261997987ea9adb75f9e3cee463f6582c6b83f5d462129a77eea21a9d938515`,
then excluded from the `2,201`-entry logical payload count. The total ZIP file
count remains exactly `2,202`.

## Authoritative input

- accepted Stage 2 attempt: `r2-20260728T203503018Z-ec577cf4`
- accepted Stage 2 authority:
  `authority-r2-20260728T203503018Z-ec577cf4`
- candidate and harness commit:
  `11475fe01fff2ec69f0188547107f4e901c531d7`
- candidate tree: `1cec636603031aa8f63c8b331aea5bbcb916567d`
- final evidence manifest SHA-256:
  `84660931dec8c2c4f4e409465e67e49d9606f8617824e7c1212bb2e8abf1d47d`
- archive SHA-256:
  `6a3d2a6878b6e778214c550854a06e4a410fd5ec60b911b606aef844d4225f0f`
- MSIX SHA-256:
  `6adb8d9b29585ff7de1b878ec2df2d76a82ce03661cf7269ced7eaff8aae50bc`
- Release Manifest SHA-256:
  `22d11f7273c2721efe032f5fedd956fdd4a2bfb587c55e7f84fde73dad8726ad`
- signer thumbprint: `119937D4B90068ACE8765695C5A94321A2C40BD8`
- signer expiry: `2026-08-27T20:35:39Z`
- latest permitted execution start: `2026-08-26T20:35:39Z`

The transfer builder additionally binds the exact clean preparation branch,
harness commit, harness tree and OEOM version. The execution harness requires
the Founder-approved preparation commit and verifies its own copied bytes and
contract bytes against the transfer inventory.

## Readiness result

| Area | Result | Remaining execution-time condition |
| --- | --- | --- |
| Governance | Ready | One R4 transfer is authorised; Founder must separately authorise execution |
| Candidate | Ready | Exact R2 hashes must revalidate |
| Harness | Ready | Founder must approve the committed preparation revision |
| Historical protection | Ready | Historical guards and deny-lists must continue to pass |
| Host admission | Conditional ready | Fresh continuity record must pass on `Founder-QA-01` |
| Certificate validity | Ready at gate review | Execution must begin before the mandatory deadline |
| Transfer | Authorised for construction | Create one R4 sibling on the approved USB and bind its exact manifest and custody record |
| Evidence return | Ready | Founder must approve isolated create-only return locations |
| Stage 4 and release | Not authorised | No later-stage authority exists |

## Operator sequence after separate Founder authority

The values below are placeholders until the Founder approves one transfer and
one execution. They must be generated once, retained unchanged and never
reused.

### 1. Validate the preparation system

```powershell
npm.cmd run sprint-30-5:stage-3:r4:validate
git status --short --branch --untracked-files=all
git rev-parse HEAD
git rev-parse "HEAD^{tree}"
```

The repository must be clean on `sprint-9-overlay`. The reported HEAD and tree
become the proposed Stage 3 harness identity.

### 2. Construct one approved transfer

Under the Founder-approved R4 corrective-preparation authority:

```powershell
npm.cmd run sprint-30-5:stage-3:r4:prepare-transfer -- `
  --founder-authority FOUNDER-AUTHORISED-STAGE3-R4-TRANSFER `
  --transfer-id <transfer-stage3-r4-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx> `
  --timestamp-utc <YYYY-MM-DDTHH:mm:ss.mmmZ> `
  --approved-root <existing-approved-create-only-root> `
  --method founder-approved-existing-usb-create-only-sibling `
  --medium-device "Sony Storage Media" `
  --medium-hardware-serial 5F10110403558 `
  --medium-filesystem NTFS `
  --medium-label ORACLE-S3R1 `
  --medium-volume-serial 783A-2CD4 `
  --expected-harness-commit <approved-40-character-commit>
```

The transfer directory must not exist beforehand. Record the emitted transfer
root and manifest SHA-256. Verify the destination medium or isolated channel
bytes independently before custody changes.

### 3. Establish fresh host continuity

After verified transfer arrival on `Founder-QA-01`, run only the transferred
collector:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File <transfer>\payload\Get-OracleStage3R4HostContinuity.ps1 `
  -OutputPath <existing-isolated-root>\Oracle.Stage3R4HostContinuity.json
```

Hash the create-only result. It must report `passed`, have no issues, match the
admitted device/manufacturer/model and be no more than 60 minutes old when
execution admission begins.

### 4. Execute one ordered attempt

Only after a separate Founder execution decision binds the exact transfer,
continuity record, harness commit, authority, attempt and return root:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File <transfer>\payload\Invoke-OracleStage3R4Qualification.ps1 `
  -FounderAuthorityToken FOUNDER-AUTHORISED-STAGE3-R4-EXECUTION `
  -AuthorityId <authority-stage3-r4-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx> `
  -AttemptId <stage3-r4-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx> `
  -TimestampUtc <YYYY-MM-DDTHH:mm:ss.mmmZ> `
  -ExpectedTransferManifestSha256 <approved-transfer-manifest-sha256> `
  -ExpectedTransferCustodySha256 <approved-transfer-custody-sha256> `
  -ExpectedHarnessCommit <approved-40-character-commit> `
  -HostContinuityPath <approved-continuity-json> `
  -ExpectedHostContinuitySha256 <approved-continuity-sha256> `
  -TransferRoot <verified-transfer-root> `
  -EvidenceReturnRoot <existing-isolated-create-only-return-root>
```

Do not invoke phases separately, retry, reuse a destination or alter the host
outside the harness.

### 5. Verify returned evidence

On the development machine:

```powershell
npm.cmd run sprint-30-5:stage-3:r4:verify-return -- `
  --archive <returned-archive> `
  --sidecar <returned-archive-sidecar> `
  --manifest <returned-archive-manifest>
```

Execution success is not Founder acceptance or Stage 3 closure.

## Stop conditions

Stop before execution if any approved identity or hash differs; the repository
or host is dirty; the transfer or output already exists; continuity is stale
or failed; the certificate margin is unavailable; the package or certificate
is present; the transfer method or custody chain is unapproved; historical
evidence differs; or any required result is missing or ambiguous.

During execution, the ordered harness owns all detailed fail-closed,
teardown, residue and evidence rules. Manual repair, retry or broadened cleanup
is prohibited.

## Founder decisions still required

Before Stage 3 execution, the Founder must explicitly decide:

1. the exact committed Stage 3 R4 preparation revision;
2. the R4 transfer root, transfer identity, manifest hash and custody hash;
3. the fresh `Founder-QA-01` continuity record and hash;
4. the evidence-return root and custody path;
5. one authority and one attempt identity;
6. temporary exact-certificate Root trust;
7. exact R2 package installation, repair/reset and removal; and
8. one execution beginning before `2026-08-26T20:35:39Z`.

Until that decision, Stage 3 execution remains blocked and unauthorised.
