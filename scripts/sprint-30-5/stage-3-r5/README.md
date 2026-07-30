# Sprint 30.5 Stage 3 Qualification R5 Harness

This directory contains the prepared, R2-bound Stage 3 R5 transfer and clean
Windows qualification system.

Preparation and construction of one create-only R5 transfer on the already
approved USB are authorised by the R5 final-preparation mission. Transfer
admission and Stage 3 execution remain unauthorised until separate Founder
decisions bind the exact transfer, one authority and one attempt.

The Node transfer builder runs only on the development machine. It consumes
the accepted Stage 2 R2 attempt, creates a unique transfer directory and
verifies copied bytes. It binds the Founder-approved USB identity and emits
create-only transfer-manifest and custody records with SHA-256 sidecars. It
never deletes or replaces an output.

On `Founder-QA-01`, copy the approved transfer create-only to a new isolated
local staging root and verify it before execution, then remove the USB. Pass
only that local copy as `TransferRoot`; qualification teardown deletes the
local copy and must never target the immutable USB transfer.

The shared `Oracle.Stage3R5IdentityPolicy.ps1` implements ordinal
case-insensitive Windows computer-name equality for both host continuity and
qualification admission. Both records preserve the raw observed
`COMPUTERNAME` value unchanged.

The shared `Oracle.Stage3R5PackageInventoryPolicy.ps1` defines the canonical
package inventory as single percent-decoded, forward-slash logical package
paths. The OPC root part `[Content_Types].xml` is validated by exact path, size
and SHA-256, then excluded from the logical payload count because the accepted
Stage 2 inventory was generated from the MakeAppx unpacked payload. Every
other ZIP stream must match the governed inventory by path, size and SHA-256.

The shared `Oracle.Stage3R5InstalledSoftwarePolicy.ps1` enumerates native
machine, WOW6432 machine and current-user uninstall views under StrictMode.
It existence-checks optional registry values, skips unusable names, preserves
valid records and duplicates, fails closed on inaccessible views and applies
ordinal deterministic ordering.

`Invoke-OracleStage3R5PreAuthorityPreflight.ps1` is the only target-host
pre-authority probe. It is read-only and explicitly classified as
non-qualification, non-authority and non-evidence. It validates Windows
PowerShell 5.1 x64, command parameters, registry shapes, transfer bytes,
continuity, package/certificate absence, paths and time margin before an
authority or attempt identity may be created.

`Oracle.Stage3R5ProcessPolicy.ps1` is the single external-process envelope
used by qualification. It records executable, arguments, UTC timestamps,
stdout, stderr, exit code, signal and process error before failing closed on
startup errors, signals, null status or non-zero status.

`Oracle.Stage3R5LifecyclePolicy.ps1` is shared by production lifecycle
publication and the development rehearsal. The rehearsal exercises every
ordered phase and injected failure before every phase without executing
package, trust, launch, repair or removal operations. Its temporary output is
unmistakably development-only and is deleted after validation.

The qualification harness captures its exact executing path once at script
scope under the governed `powershell.exe -File` invocation. Function-scoped
code uses that immutable captured path for harness self-hash validation.
Dot-sourcing the qualification harness is unsupported and unauthorised.

`Get-OracleStage3R5HostContinuity.ps1` creates the fresh, create-only,
read-only host-continuity record required immediately before a separately
authorised execution. The Founder binds its SHA-256 to that execution.

The PowerShell harness runs as one ordered lifecycle on the admitted Windows
host. It has no independently runnable phases. It requires a unique matching
authority/attempt identity, a verified transfer manifest, a Founder-approved
fresh host-continuity record and a unique evidence return root.

Returned archives are checked on the development machine with:

```powershell
npm.cmd run sprint-30-5:stage-3:r5:verify-return -- `
  --archive <archive> --sidecar <sidecar> --manifest <manifest>
```

Historical tooling under `scripts/sprint-30-5/stage-3-qualification/` and
`scripts/prepare-sprint-30-5-stage-3-offline-transfer.mjs` is retired and must
not be used.

Current preparation validation:

```powershell
npm.cmd run sprint-30-5:stage-3:r5:validate
```

The complete operator sequence, parameter bindings, stop conditions and
Founder gates are recorded in
`docs/sprints/SPRINT_30_5_STAGE_3_R4_PRE_EXECUTION_GATE.md`.

No command in this README grants transfer, trust, installation, qualification,
Stage 4, production signing, publication, distribution, deployment or release
authority.
