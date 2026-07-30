# Sprint 30.5 Stage 3 Qualification R8 Harness

This directory contains the prepared, R2-bound Stage 3 R8 transfer and clean
Windows qualification system.

Preparation and validation are authorised by the R8 launch-correction mission.
Transfer construction, transfer admission and Stage 3 execution remain
unauthorised until separate Founder decisions bind one exact transfer, one
authority and one attempt.

The Node transfer builder runs only on the development machine. It consumes
the accepted Stage 2 R2 attempt, creates a unique transfer directory and
verifies copied bytes. It binds the Founder-approved USB identity and emits
create-only transfer-manifest and custody records with SHA-256 sidecars. It
never deletes or replaces an output.

On `Founder-QA-01`, copy the approved transfer create-only to a new isolated
local staging root and verify it before execution, then remove the USB. Pass
only that local copy as `TransferRoot`; qualification teardown deletes the
local copy and must never target the immutable USB transfer.

The shared `Oracle.Stage3R8IdentityPolicy.ps1` implements ordinal
case-insensitive Windows computer-name equality for both host continuity and
qualification admission. Both records preserve the raw observed
`COMPUTERNAME` value unchanged.

The shared `Oracle.Stage3R8CertificateTrustPolicy.ps1` distinguishes physical
certificate-store entries from inherited logical provider projections. R8
requires an elevated process and exactly one physical public certificate in
`LocalMachine\TrustedPeople`, imported and removed through deterministic,
shell-free CertUtil arguments without `-user` or `-f`. Exact subject,
thumbprint, raw bytes, store and private-key state are mandatory before
deployment and before removal. Unexpected physical or logical views fail
closed, and final zero-residue verification remains mandatory.

R8 is the current attempt-scoped qualification revision, distinct from the
immutable historical `stage-3-revision-6-abandoned-design` record. Closed R1
through R6 repository transfer and qualification entry points are fail-closed;
their artifacts and evidence remain immutable.

The shared `Oracle.Stage3R8ActivationPolicy.ps1` uses the Windows
`IApplicationActivationManager.ActivateApplication` API through
`CLSCTX_LOCAL_SERVER`. A successful activation requires `S_OK` and a non-zero
process ID. That result is activation evidence, while
`Oracle.WindowDiscovery` and `Oracle.WindowObserver` remain the mandatory
runtime and window proof. `explorer.exe` and its process exit code are not
used as an activation or qualification assertion.

The shared `Oracle.Stage3R8PackageInventoryPolicy.ps1` defines the canonical
package inventory as single percent-decoded, forward-slash logical package
paths. The OPC root part `[Content_Types].xml` is validated by exact path, size
and SHA-256, then excluded from the logical payload count because the accepted
Stage 2 inventory was generated from the MakeAppx unpacked payload. Every
other ZIP stream must match the governed inventory by path, size and SHA-256.

The shared `Oracle.Stage3R8InstalledSoftwarePolicy.ps1` enumerates native
machine, WOW6432 machine and current-user uninstall views under StrictMode.
It existence-checks optional registry values, skips unusable names, preserves
valid records and duplicates, fails closed on inaccessible views and applies
ordinal deterministic ordering.

`Invoke-OracleStage3R8PreAuthorityPreflight.ps1` is the only target-host
pre-authority probe. It is read-only and explicitly classified as
non-qualification, non-authority and non-evidence. It validates Windows
PowerShell 5.1 x64, command parameters, registry shapes, transfer bytes,
continuity, package/certificate absence, paths and time margin before an
authority or attempt identity may be created.

`Oracle.Stage3R8ProcessPolicy.ps1` is the single external-process envelope
used by qualification. It records executable, arguments, UTC timestamps,
stdout, stderr, exit code, signal and process error before failing closed on
startup errors, signals, null status or non-zero status.

`Oracle.Stage3R8WindowsExecutablePolicy.ps1` maps only the System32-bound
`certutil.exe` and `reagentc.exe` utilities. Explorer is deliberately absent.
The pre-authority gate probes the direct activation API without launching an
application.

`Oracle.Stage3R8LifecyclePolicy.ps1` is shared by production lifecycle
publication and the development rehearsal. The rehearsal exercises every
ordered phase and injected failure before every phase without executing
package, trust, launch, repair or removal operations. Its temporary output is
unmistakably development-only and is deleted after validation.

The qualification harness captures its exact executing path once at script
scope under the governed `powershell.exe -File` invocation. Function-scoped
code uses that immutable captured path for harness self-hash validation.
Dot-sourcing the qualification harness is unsupported and unauthorised.

`Get-OracleStage3R8HostContinuity.ps1` creates the fresh, create-only,
read-only host-continuity record required immediately before a separately
authorised execution. The Founder binds its SHA-256 to that execution.

The PowerShell harness runs as one ordered lifecycle on the admitted Windows
host. It has no independently runnable phases. It requires a unique matching
authority/attempt identity, a verified transfer manifest, a Founder-approved
fresh host-continuity record and a unique evidence return root.

Returned archives are checked on the development machine with:

```powershell
npm.cmd run sprint-30-5:stage-3:r8:verify-return -- `
  --archive <archive> --sidecar <sidecar> --manifest <manifest>
```

Historical tooling under `scripts/sprint-30-5/stage-3-qualification/` and
`scripts/prepare-sprint-30-5-stage-3-offline-transfer.mjs` is retired and must
not be used.

Current preparation validation:

```powershell
npm.cmd run sprint-30-5:stage-3:r8:validate
```

The complete operator sequence, parameter bindings, stop conditions and
Founder gates are recorded in
`docs/sprints/SPRINT_30_5_STAGE_3_R8_PRE_EXECUTION_GATE.md`.

No command in this README grants transfer, trust, installation, qualification,
Stage 4, production signing, publication, distribution, deployment or release
authority.
