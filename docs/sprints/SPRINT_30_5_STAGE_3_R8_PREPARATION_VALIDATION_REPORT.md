# Sprint 30.5 Stage 3 Qualification R8 Preparation Validation Report

**Status:** Passed development preparation validation; transfer and execution
remain unauthorised

**Classification:** Governed engineering record; not qualification evidence

**Programme:** Sprint 30.5 Stage 3 Qualification R8

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

The shared R8 package-inventory policy retains the proven R4 canonical model:
`2,202` ZIP streams, `2,201` logical payload entries, `70` percent-decoded
names and one exact `[Content_Types].xml` container part. Path, size, SHA-256,
duplicate and traversal failure fixtures passed against the unchanged MSIX.

All R2-R5 corrections remain unchanged in semantics and pass their
deterministic fixtures.

The immutable R6 attempt proved machine trust, package installation, a
registered AppX launch request, Windows activation and Desktop AppX container
creation. It then failed because an Explorer shell-broker exit status was
treated as authoritative activation evidence.

R8 preserves R7's replacement of that assertion with one shared
`IApplicationActivationManager.ActivateApplication` policy. The activation
contract requires `CLSCTX_LOCAL_SERVER`, `AO_NOERRORUI`, `S_OK` and a non-zero
process ID. The initial and repair launches publish create-only activation
records, and `Oracle.WindowDiscovery` plus `Oracle.WindowObserver` remain
mandatory runtime proof. Explorer is absent from both preflight and
qualification.

## R7 discovery and teardown root cause

Windows PowerShell 5.1 reproduction with the exact top-level array shape
emitted by `Oracle.WindowDiscovery` confirmed that `@($json |
ConvertFrom-Json)` produces one nested `System.Object[]`. Two window records
therefore make `$_.handle` an array and reproduce the governed
`System.Object[]` to `System.Int64` conversion failure.

The R7 teardown used only `Get-Process.Path.StartsWith(InstallLocation)` to
classify package ownership. That heuristic contradicted the accepted AppModel
association for PID `9808`. R8 instead uses `GetPackageFamilyName` for exact
package-family ownership in both observation and teardown, while retaining
mandatory executable-path and Authenticode checks.

Focused Windows PowerShell 5.1 fixtures cover empty, single and multiple
discovery arrays; malformed, missing, nested and non-scalar members; exact
package-family matching; and rejection of missing or different package
identity. No package, certificate, authority, attempt or qualification state
is mutated.

## Preserved R6 machine-trust correction

The accepted R5 attempt reached strict Authenticode `Status = Valid` after
placing the exact public signer certificate in `CurrentUser\Root`, then AppX
deployment failed with HRESULT `0x800B0109`, activity
`a549c0c7-1d3c-0004-cd5a-b7a63c1ddd01`. The immutable R5 attempt evidence and
preserved earlier Oracle failure evidence independently establish the same
user-store/deployment-provider mismatch.

R8 preserves the proven R6 shared certificate policy. It:

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

`Test-OracleStage3R8OptionalMemberAudit.ps1` parsed all reachable production
PowerShell, including the activation and trust policies. It classified `913` member
accesses and reported zero unclassified unsafe accesses under
`Set-StrictMode -Version Latest`.

## Historical operational retirement

Independent review confirmed that closed R1 through R6 repository transfer
builders remained package-exposed and that their copied qualification scripts
could still be invoked directly. The package transfer commands were removed
and both operational entry points for every closed revision now stop at an
unconditional retirement guard before mutation. R8 static validation verifies
all ten guards and the absence of every closed preparation, rehearsal and
transfer command. Only read-only historical return inspection remains
package-exposed. No immutable transfer, attempt or evidence file was changed.

The contract and plan also distinguish the current attempt-scoped R8 lineage
from the immutable historical `stage-3-revision-6-abandoned-design` record.

## Lifecycle and failure-path audit

`Oracle.Stage3R8PhaseAudit.json` retains all `14` ordered phases from
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
package, not Oracle. The exact R8 COM implementation returned `S_OK` and
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

- Node syntax checks for every R8 `.mjs` source;
- PowerShell parser checks for every R8 `.ps1` source;
- JSON parsing for the R8 contract and phase audit;
- `npm.cmd run sprint-30-5:stage-3:r8:validate`;
- the Windows PowerShell 5.1 multi-window discovery-array reproduction and
  corrected-shape fixtures;
- one read-only invocation of the accepted `Oracle.WindowDiscovery` helper,
  which returned eight real desktop records; R8 normalized them to eight
  non-nested objects with a successful native diagnostic;
- the AppModel ownership fixtures for exact, missing and different package
  families;
- a read-only 64-bit Windows PowerShell 5.1 compatibility probe that loaded
  the `GetPackageFamilyName` wrapper and confirmed an unpackaged process fails
  closed;
- the inherited direct-activation fixture and non-mutating COM availability
  probe;
- the exact machine-trust fixture, including partial-import cleanup;
- package inventory, script-path, host-shape, process-envelope, executable,
  lifecycle and installed-software regression fixtures;
- `npm.cmd run sprint-30-5:stage-3:r8:rehearse`, including all fourteen
  simulated phases and failure injection before every phase;
- focused ESLint for every R8 `.mjs` source;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run architecture:audit`;
- `git diff --check`.

PowerShell Script Analyzer was not installed and was not represented as run.
Parser, StrictMode AST audit, deterministic fixtures and the complete R8
validator provide the available compensating checks.

## Self-review correction

Adversarial review found that merely adding a focused fixture would leave the
new window policy outside the development rehearsal. The rehearsal now sources
and exercises the real discovery normalization and AppModel ownership policy,
and the validator requires that policy in the reported exercised-policy set.
The optional-member audit was also extended to classify the newly bound window
policy and fails if its reachable member access becomes unclassified.

## Validation boundary

No real certificate-store mutation or AppX deployment occurred during
preparation. Actual elevated machine-store import, AppX deployment and exact
machine-store removal can be proven only in a separately authorised
Founder-QA-01 qualification attempt after a transfer-bound pre-authority pass.

No R8 transfer, authority or attempt has been created. Stage 3 execution,
Stage 4 and release remain unauthorised.
