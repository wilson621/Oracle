# Sprint 30.5 Stage 3 Qualification R3 Harness

This directory contains the prepared, R2-bound Stage 3 R3 transfer and clean
Windows qualification system.

Preparation and construction of one create-only R3 transfer on the already
approved USB are authorised by the R3 corrective-preparation mission. Transfer
admission and Stage 3 execution remain unauthorised until separate Founder
decisions bind the exact transfer, one authority and one attempt.

The Node transfer builder runs only on the development machine. It consumes
the accepted Stage 2 R2 attempt, creates a unique transfer directory and
verifies copied bytes. It binds the Founder-approved USB identity and emits
create-only transfer-manifest and custody records with SHA-256 sidecars. It
never deletes or replaces an output.

The shared `Oracle.Stage3R3IdentityPolicy.ps1` implements ordinal
case-insensitive Windows computer-name equality for both host continuity and
qualification admission. Both records preserve the raw observed
`COMPUTERNAME` value unchanged.

The qualification harness captures its exact executing path once at script
scope under the governed `powershell.exe -File` invocation. Function-scoped
code uses that immutable captured path for harness self-hash validation.
Dot-sourcing the qualification harness is unsupported and unauthorised.

`Get-OracleStage3R3HostContinuity.ps1` creates the fresh, create-only,
read-only host-continuity record required immediately before a separately
authorised execution. The Founder binds its SHA-256 to that execution.

The PowerShell harness runs as one ordered lifecycle on the admitted Windows
host. It has no independently runnable phases. It requires a unique matching
authority/attempt identity, a verified transfer manifest, a Founder-approved
fresh host-continuity record and a unique evidence return root.

Returned archives are checked on the development machine with:

```powershell
npm.cmd run sprint-30-5:stage-3:r3:verify-return -- `
  --archive <archive> --sidecar <sidecar> --manifest <manifest>
```

Historical tooling under `scripts/sprint-30-5/stage-3-qualification/` and
`scripts/prepare-sprint-30-5-stage-3-offline-transfer.mjs` is retired and must
not be used.

Current preparation validation:

```powershell
npm.cmd run sprint-30-5:stage-3:r3:validate
```

The complete operator sequence, parameter bindings, stop conditions and
Founder gates are recorded in
`docs/sprints/SPRINT_30_5_STAGE_3_R3_PRE_EXECUTION_GATE.md`.

No command in this README grants transfer, trust, installation, qualification,
Stage 4, production signing, publication, distribution, deployment or release
authority.
