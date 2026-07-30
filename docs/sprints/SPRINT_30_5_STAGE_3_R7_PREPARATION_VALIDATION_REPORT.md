# Sprint 30.5 Stage 3 Qualification R7 Preparation Validation Report

**Status:** Passed development preparation validation; transfer and execution
remain unauthorised

**Classification:** Governed engineering record; not qualification evidence

**Programme:** Sprint 30.5 Stage 3 Qualification R7

## Accepted immutable input

- Stage 2 R2 attempt: `r2-20260728T203503018Z-ec577cf4`
- candidate commit: `11475fe01fff2ec69f0188547107f4e901c531d7`
- candidate tree: `1cec636603031aa8f63c8b331aea5bbcb916567d`
- accepted archive SHA-256:
  `6a3d2a6878b6e778214c550854a06e4a410fd5ec60b911b606aef844d4225f0f`
- accepted MSIX SHA-256:
  `6adb8d9b29585ff7de1b878ec2df2d76a82ce03661cf7269ced7eaff8aae50bc`
- accepted signer thumbprint:
  `119937D4B90068ACE8765695C5A94321A2C40BD8`

The preparation validator rehashed the accepted archive, MSIX, Release
Manifest and final Stage 2 evidence manifest. No accepted package or evidence
file was rewritten.

## R6 root cause and direct-activation correction

The shared R7 package-inventory policy retains the proven R4 canonical model:
`2,202` ZIP streams, `2,201` logical payload entries, `70` percent-decoded
names and one exact `[Content_Types].xml` container part. Path, size, SHA-256,
duplicate and traversal failure fixtures passed against the unchanged MSIX.

All R2-R5 corrections remain unchanged in semantics and pass their
deterministic fixtures.

The immutable R6 attempt proved machine trust, package installation, a
registered AppX launch request, Windows activation and Desktop AppX container
creation. It then failed because an Explorer shell-broker exit status was
treated as authoritative activation evidence.

R7 replaces that assertion with one shared
`IApplicationActivationManager.ActivateApplication` policy. The activation
contract requires `CLSCTX_LOCAL_SERVER`, `AO_NOERRORUI`, `S_OK` and a non-zero
process ID. The initial and repair launches publish create-only activation
records, and `Oracle.WindowDiscovery` plus `Oracle.WindowObserver` remain
mandatory runtime proof. Explorer is absent from both preflight and
qualification.

## Preserved R6 machine-trust correction

The accepted R5 attempt reached strict Authenticode `Status = Valid` after
placing the exact public signer certificate in `CurrentUser\Root`, then AppX
deployment failed with HRESULT `0x800B0109`, activity
`a549c0c7-1d3c-0004-cd5a-b7a63c1ddd01`. The immutable R5 attempt evidence and
preserved earlier Oracle failure evidence independently establish the same
user-store/deployment-provider mismatch.

R7 preserves the proven R6 shared certificate policy. It:

- requires an elevated 64-bit Windows PowerShell 5.1 process before authority
  or attempt creation;
- constructs only `certutil.exe -addstore TrustedPeople <exact-cer>` and
  `certutil.exe -delstore TrustedPeople <exact-thumbprint>`;
- never supplies `-user` or `-f`;
- verifies one physical `LocalMachine\TrustedPeople` entry through the machine
  certificate registry;
- separately classifies permitted inherited logical
  `TrustedPeople` projections;
- requires exact subject, uppercase 40-character thumbprint, raw certificate
  bytes and no private key;
- rejects unexpected stores, duplicate physical entries, duplicate logical
  views and identity mismatch;
- permits exact cleanup after a partial import even if logical projection has
  not appeared;
- retains strict Authenticode `Status = Valid`; and
- requires zero physical and logical residue after normal or failure teardown.

The process policy captures executable, arguments, timestamps, stdout, stderr,
exit code, signal and process error before classifying CertUtil success or
failure.

The machine-readable contract now binds the accepted failure activity,
HRESULT, rejected current-user scope and required machine scope. The shared
policy rejects any contract that changes the physical store, CertUtil argument
shape, elevation requirement, exact identity requirements or final zero
residue requirement.

## Optional-member and StrictMode audit

`Test-OracleStage3R7OptionalMemberAudit.ps1` parsed all reachable production
PowerShell, including the activation and trust policies. It classified `913` member
accesses and reported zero unclassified unsafe accesses under
`Set-StrictMode -Version Latest`.

## Historical operational retirement

Independent review confirmed that closed R1 through R6 repository transfer
builders remained package-exposed and that their copied qualification scripts
could still be invoked directly. The package transfer commands were removed
and both operational entry points for every closed revision now stop at an
unconditional retirement guard before mutation. R7 static validation verifies
all ten guards and the absence of every closed preparation, rehearsal and
transfer command. Only read-only historical return inspection remains
package-exposed. No immutable transfer, attempt or evidence file was changed.

The contract and plan also distinguish the current attempt-scoped R7 lineage
from the immutable historical `stage-3-revision-6-abandoned-design` record.

## Lifecycle and failure-path audit

`Oracle.Stage3R7PhaseAudit.json` retains all `14` ordered phases from
authority consumption through evidence freeze. The trust phases now explicitly
describe machine-scoped import, physical/logical verification, exact removal
and zero residue.

The lifecycle fixture rejected phase skips and repeats. Failure injection
before every phase preserved retry prohibition and selected teardown
obligations from completed state. The production catch path retains the
original failure while independently attempting process, package, exact
machine-trust and residue teardown.

## NON-QUALIFICATION development rehearsal

The development rehearsal remained explicitly:

- `NON-QUALIFICATION`;
- `NON-AUTHORITY`;
- `NON-EVIDENCE`; and
- `DEVELOPMENT REHEARSAL`.

It traversed all 14 simulated success phases, injected failure before every
phase, exercised the real lifecycle, identity, process, executable,
activation, installed-software and certificate-trust policies, verified create-only
archive publication and removed its isolated temporary output. It performed
no real package, certificate, trust, launch, repair or removal operation.

## Positive elevated development integration

One elevated development-only integration used the installed Windows Settings
package, not Oracle. The exact R7 COM implementation returned `S_OK` and
process ID `19936`; that PID was observed as `SystemSettings`, then the exact
PID was stopped. No Oracle package was installed. The record was classified
`NON-QUALIFICATION`, `NON-AUTHORITY`, `NON-EVIDENCE` and
`DEVELOPMENT INTEGRATION`, verified at SHA-256
`f484e02342696e09fd6d41b253b45f1a769c276328ce36670aba6bfa5d6b3ccb`,
then removed from the temporary development location.

## Pre-authority host probe

The transfer-bound read-only probe runs before authority and attempt creation.
It now rejects a non-elevated process before later machine trust could be
attempted. It continues to validate exact transfer bytes, R2 bindings, host
continuity, Windows PowerShell 5.1 x64, command surfaces, registry shapes,
package/certificate absence, path isolation, recovery, security state and
certificate time margin.

Elevation is observed read-only. The probe performs no certificate import,
package installation or other host mutation.

## Executed validation

The following completed successfully on the development machine:

- Node syntax checks for every R7 `.mjs` source;
- PowerShell parser checks for every R7 `.ps1` source;
- JSON parsing for the R7 contract and phase audit;
- `npm.cmd run sprint-30-5:stage-3:r7:validate`;
- the direct-activation fixture and live non-mutating COM availability probe;
- one positive elevated development integration using the built-in Settings
  AppUserModelId, with exact process-identity and cleanup checks;
- the exact machine-trust fixture, including partial-import cleanup;
- package inventory, script-path, host-shape, process-envelope, executable,
  lifecycle and installed-software regression fixtures;
- repository-wide `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run architecture:audit`;
- `git diff --check`.

PowerShell Script Analyzer was not installed and was not represented as run.
Parser, StrictMode AST audit, deterministic fixtures and the complete R7
validator provide the available compensating checks.

## Self-review correction

The first positive integration activated and identified the correct Settings
PID with `S_OK`, but the test sampled process teardown too early and reported
`processStopped = false`; the PID was absent on immediate independent
inspection. The development test was corrected to poll the exact PID for up
to 15 seconds. The corrected run passed. The review also added explicit COM
class/interface identity to activation evidence and rejects null or incomplete
native results.

## Validation boundary

No real certificate-store mutation or AppX deployment occurred during
preparation. Actual elevated machine-store import, AppX deployment and exact
machine-store removal can be proven only in a separately authorised
Founder-QA-01 qualification attempt after a transfer-bound pre-authority pass.

No R7 transfer, authority or attempt has been created. Stage 3 execution,
Stage 4 and release remain unauthorised.
