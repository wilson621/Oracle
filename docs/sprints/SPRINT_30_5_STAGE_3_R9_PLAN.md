# Sprint 30.5 Stage 3 Qualification R9 - Preparation and Execution Plan

**Status:** Preparation Founder-authorised; execution blocked and unauthorised
**Programme identity:** `Sprint 30.5 Stage 3 Qualification R9`
**Revision:** `R9`
**Prepared:** 30 July 2026
**Stage 2 input:** Founder-accepted and formally closed Requalification R2
**Stage 4:** Not authorised

## Purpose

This plan establishes a new versioned Stage 3 system without altering the
historical R1-R8 preparations, transfers, authorities, attempts, failure
evidence or reconciliation. It does not repair or reuse the accepted failed
R8 attempt. It qualifies the exact accepted Stage 2 R2 package on a separately
admitted clean Windows host. Preparation authority does not authorise transfer,
trust, installation or execution. R9 transfer construction requires a
separate Founder decision after preparation validation.

## Immutable input

- Stage 2 attempt: `r2-20260728T203503018Z-ec577cf4`
- Stage 2 authority: `authority-r2-20260728T203503018Z-ec577cf4`
- candidate and harness commit:
  `11475fe01fff2ec69f0188547107f4e901c531d7`
- candidate tree: `1cec636603031aa8f63c8b331aea5bbcb916567d`
- final evidence manifest SHA-256:
  `84660931dec8c2c4f4e409465e67e49d9606f8617824e7c1212bb2e8abf1d47d`
- qualification archive SHA-256:
  `6a3d2a6878b6e778214c550854a06e4a410fd5ec60b911b606aef844d4225f0f`
- MSIX SHA-256:
  `6adb8d9b29585ff7de1b878ec2df2d76a82ce03661cf7269ced7eaff8aae50bc`
- Release Manifest SHA-256:
  `22d11f7273c2721efe032f5fedd956fdd4a2bfb587c55e7f84fde73dad8726ad`
- signer thumbprint: `119937D4B90068ACE8765695C5A94321A2C40BD8`
- signer expiry: `2026-08-27T20:35:39Z`
- latest permitted execution start:
  `2026-08-26T20:35:39Z`.

Any mismatch, missing input or obsolete candidate fails closed.

## R8 failure and R9 correction

The immutable R8 attempt
`stage3-r8-20260730T210845862Z-ac6b9c67`, under authority
`authority-stage3-r8-20260730T210845862Z-ac6b9c67`, proved direct activation,
AppModel ownership, strict runtime identity and 47 consecutive valid native
window observations. Its captured observation span was 59.929 seconds against
the mandatory 60-second minimum. R8 started a nominal deadline before the
first observer completed, admitted samples only before that deadline and then
used sample count as the completion proxy. That construction could not prove
60 complete seconds between captured valid observations.

R9 retains the 60-second requirement exactly. A shared observation policy uses
a monotonic stopwatch, starts the evidence interval at the first valid
captured sample and continues until a final valid captured sample proves at
least 60,000 elapsed milliseconds. It applies no rounding, tolerance or sample
count substitution.

R8 teardown also exposed a process-exit race: an Oracle process could exit
after enumeration but before the AppModel `OpenProcess` ownership query. R9
uses a typed OpenProcess failure and an immediate PID-existence recheck. Only
an already absent PID is classified as a safe exit race. An unverifiable live
process, access denial, ownership mismatch or any non-OpenProcess failure
remains fatal, and final zero-residue verification remains mandatory.

## Prior corrective revisions

R3 preserved the R2 Windows computer-name correction and fixed the
deterministic harness self-path defect exposed by failed R2 identity
`stage3-r2-20260730T124016125Z-d0037861` under authority
`authority-stage3-r2-20260730T124016125Z-d0037861`. Those identities and the
R2 transfer are permanently retired and immutable. The failure occurred
before authority creation, attempt creation, trust mutation, package
installation or qualification evidence generation.

Under the exclusively governed `powershell.exe -File` invocation, R3 captured
the executing harness path once at script scope, derived `scriptRoot` from
that path and used the captured path inside `Assert-IdentityAndTransfer`.
Function-scoped `$MyInvocation.MyCommand` is never treated as an
`ExternalScriptInfo`. Strict mode and exact self-hash verification remain
mandatory. Dot-sourcing the qualification harness is unsupported and
unauthorised.

R3 later failed closed after authority creation during package-content
inventory reconciliation. The R3 transfer and the authority, attempt,
lifecycle and failure records generated on `Founder-QA-01` remain immutable
and retired. No R3 file is repaired or reused by R4 or R5.

## R4 package-inventory correction

The accepted Stage 2 inventory contains `2,201` logical payload files generated
from the MakeAppx-unpacked package. Direct read-only reconciliation against the
unchanged MSIX finds `2,202` ZIP file entries: all `2,201` governed entries
match after one URI percent-decoding pass, while the sole additional entry is
the root OPC container part `[Content_Types].xml`.

R4 defines one canonical representation:

- raw ZIP entry names are decoded exactly once with URI percent-decoding;
- canonical paths use forward slashes and reject absolute, empty, dot,
  dot-dot, control-character, backslash and duplicate paths;
- every decoded logical payload path must match the existing governed
  inventory by exact ordinal path, byte size and SHA-256;
- exactly `70` ZIP names must require percent-decoding for this immutable
  package;
- exactly one `[Content_Types].xml` must exist at the ZIP root with size
  `2374` and SHA-256
  `3261997987ea9adb75f9e3cee463f6582c6b83f5d462129a77eea21a9d938515`;
  it is verified but excluded from the logical payload count; and
- the exact MSIX SHA-256 remains mandatory, so no container byte is exempt
  from integrity protection.

Inventory generation and validation therefore use the same decoded logical
package-path semantics without modifying the accepted inventory or MSIX.

R4 proved that correction in governed execution: all `2,202` ZIP entries,
`2,201` logical entries and `70` percent-decoded entries reconciled with zero
mismatch. The create-only reconciliation record has SHA-256
`ffbc799a1ce3f0146ab88f03727aad14dc381159956f35a74c8cd74adda549ba`.
R4 then failed under authority
`authority-stage3-r4-20260730T142810425Z-34cd5760` and attempt
`stage3-r4-20260730T142810425Z-34cd5760` during installed-software inventory.
Those identities, the R4 transfer, continuity, lifecycle and failure evidence
are immutable. No package was installed, no trust was created, no archive was
published and no teardown failure occurred.

## R5 installed-software and final-readiness correction

R4 used direct `DisplayName` member access under StrictMode. Legitimate
uninstall entries without that optional value therefore raised
`PropertyNotFoundStrict`. R5 uses one shared installed-software policy:

- all three 64-bit-process registry paths are read independently: native
  machine, WOW6432 machine and current user;
- inaccessible existing views or values fail closed;
- a missing, null, empty or whitespace-only `DisplayName` is excluded exactly
  as the original inventory intended;
- usable non-string values are converted deterministically to strings;
- optional version and publisher values are existence-checked and preserved
  as strings or null;
- duplicates remain present; and
- records are ordered by exact ordinal name, version and publisher.

StrictMode remains `Latest`. A machine-readable AST audit classifies every
reachable non-static property access in the harness and sourced policies as a
validated mandatory member, an explicitly existence-checked optional member,
or a runtime-type guarantee. Any unclassified access fails preparation.

R5 additionally binds a read-only pre-authority probe, shared lifecycle policy,
complete phase audit, host-shape fixtures and a development rehearsal. The
rehearsal is explicitly `NON-QUALIFICATION`, `NON-AUTHORITY`, `NON-EVIDENCE`
and `DEVELOPMENT REHEARSAL`; it exercises the real shared policies, all phases,
and injected failure before every phase without trust, installation, launch,
authority consumption or qualification evidence.

## R5 pre-authority Explorer-path correction

The first immutable R5 transfer failed closed during pre-authority inspection
before any authority or attempt identity existed. The observed Founder-QA-01
shape was Windows directory `C:\Windows`, system directory
`C:\Windows\System32`, no `C:\Windows\System32\explorer.exe`, and valid
`C:\Windows\explorer.exe`. No qualification, installation, certificate trust
or qualification evidence occurred. That transfer remains immutable and is
retired from admission:

- transfer ID:
  `transfer-stage3-r5-20260730T160251612Z-1f0e4239`;
- transfer manifest SHA-256:
  `22efb0d9b983650b804037dae8e42b64d22989561cb552aa291620a104d3716e`.

The corrected preparation uses one manifest-bound shared Windows executable
policy across host continuity, pre-authority admission and qualification.
Explorer is resolved from
`Environment.GetFolderPath(Environment.SpecialFolder.Windows)`; CertUtil and
ReAgentC remain System32-bound. Every resolved path must be an absolute direct
child of its governed platform directory, exist as a file and not be a
reparse point. The correction changes no accepted Stage 2 input, package byte,
qualification phase, authority boundary or verification requirement. Only a
new create-only transfer bound to the corrected commit and tree may be
considered for admission.

## R6 root cause and direct-activation correction

The accepted R6 attempt proved machine trust, package installation, a
registered AppX launch request, Windows activation and Desktop AppX container
creation. It then failed because the harness treated the exit status of
`explorer.exe shell:AppsFolder...` as authoritative launch evidence.
Shell-broker process lifetime is not packaged-application activation status.
The R6 authority, attempt and evidence are immutable.

R7 removed Explorer from the activation path. R9 preserves that shared policy,
which invokes
Windows `IApplicationActivationManager.ActivateApplication` with
`CLSCTX_LOCAL_SERVER` and `AO_NOERRORUI`. Activation succeeds only when the API
returns `S_OK` and a non-zero process ID. The pre-authority probe verifies that
the COM activation API can be created without launching an application.

Direct activation does not weaken runtime proof. `Oracle.WindowDiscovery` and
`Oracle.WindowObserver` remain mandatory after initial activation and after
repair/reset. Their exact window and manifest assertions still determine
whether Oracle reached the required installed runtime state.

This follows Microsoft's
[IApplicationActivationManager](https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/nn-shobjidl_core-iapplicationactivationmanager)
and
[ActivateApplication](https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/nf-shobjidl_core-iapplicationactivationmanager-activateapplication)
contracts: a short-lived launcher creates the out-of-process activation
manager, invokes the registered application by AppUserModelId, and checks the
returned HRESULT and process ID. No accepted package byte changes.

## Preserved R7 discovery and ownership correction

The immutable R7 attempt proved transfer verification, host admission,
machine trust, tampered-package rejection, package installation and direct
activation. `IApplicationActivationManager::ActivateApplication` returned
`S_OK`, Windows associated PID `9808` with the governed package and
`Oracle.WindowDiscovery` found the expected visible window.
The predecessor transfer is
`transfer-stage3-r7-20260730T195307524Z-1aaa6e8a`, with manifest SHA-256
`e204828cc6cc155acb6293def29eb714c1aa67f1ef06924a249e5362fda287e4`
and custody SHA-256
`228129291e5aa302e9a9784309776b113ee68b01ad37b9c3d07fbc0b66638b66`.

R7 then failed because Windows PowerShell 5.1 returned the discovery helper's
top-level JSON array as one `System.Object[]` pipeline value. With multiple
window records, member enumeration produced another array and the harness
attempted to cast it to `System.Int64`. R8 required an array root, explicitly
enumerates its entries, requires every window member to exist and be scalar,
uses invariant numeric parsing and rejects malformed shapes.

The ensuing teardown exposed an independent ownership-classification defect:
it treated an executable-path prefix as package ownership even though Windows
AppModel associated PID `9808` with the governed package. R8 introduced
`GetPackageFamilyName` with `PROCESS_QUERY_LIMITED_INFORMATION` and requires
ordinal case-insensitive equality with the installed package family in both
window validation and teardown. Installed executable path and exact
Authenticode signer checks remain mandatory. R7 direct activation is
unchanged.

## Revision lineage and historical retirement

`Sprint 30.5 Stage 3 Qualification R9` is the ninth revision in the current
attempt-scoped qualification lineage. It is distinct from the immutable
historical design record at
`docs/sprints/evidence/sprint-30-5/stage-3-revision-6-abandoned-design`.
That legacy design remains historical and non-operational; the R9 contract
records this distinction explicitly.

Repository operational entry points for R1 through R8 transfer construction
and qualification execution are permanently fail-closed. Their immutable
transfers, attempts and evidence remain unchanged. Only read-only historical
return inspection remains package-exposed; no closed revision can validate a
new preparation, rehearse, construct another transfer or execute
qualification from the repository.

## Authority and identities

Transfer construction and Stage 3 execution require separate Founder
authority. Each uses a unique, immutable identity. Execution uses:

- authority `authority-stage3-r9-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx`;
- attempt `stage3-r9-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx`;
- the same canonical UTC timestamp and suffix in both identities;
- one authority for one attempt; and
- create-only authority, work and evidence roots.

No historical attempt can be resumed or retried.

## Host admission and continuity

The proposed host remains `Founder-QA-01`, MEDION ERAZER P6605 MD61596, under
the historical host-specific admission and provenance exception. Historical
admission is not current continuity proof.

Immediately after verified transfer arrival and before execution authority or
attempt creation, the governed read-only preflight must verify elevated 64-bit
Windows PowerShell 5.1, required commands and parameters, registry shapes, installed
software inventory under StrictMode, transfer readability, isolated return
root eligibility, archive support, package and certificate absence, signer
time margin, host identity, admitted Windows-installation continuity,
activation, recovery readiness, Secure Boot, TPM, Defender, development-tool
absence, Oracle absence, package absence, certificate absence and absence of
production resources. Reinstall, reset, restoration or material identity drift
returns the host to admission review.

The fresh continuity record is create-only, has a maximum age of 60 minutes
at execution admission and is bound by an exact Founder-approved SHA-256.
Transfer approval relies on the immutable historical admission plus explicit
custody controls; it does not treat that admission as current continuity proof.

## Transfer

The transfer builder consumes only the accepted Stage 2 R2 archive, package,
Release Manifest, detached signature, SBOM, provenance, verification records
and Stage 3 R9 kit. It creates a unique destination, copies bytes without replacement,
verifies every hash and publishes deterministic manifests and sidecars
atomically.

The Founder-approved `Sony Storage Media` USB (`NTFS`, label `ORACLE-S3R1`,
hardware serial `5F10110403558`, volume serial `783A-2CD4`) may host R9 only
after separate Founder transfer authority, in a new create-only sibling
directory. The R1–R5 transfers remain immutable. Admission must bind the exact
R9 transfer root, identity, manifest and custody hashes; the presence of a
historical transfer does not authorise its use. Any different physical or
logical method requires explicit Founder approval. The method, source,
destination, custody checkpoints and return hashes form part of the attempt
evidence.

Admission copies the approved R9 directory create-only into a new isolated
local staging root on `Founder-QA-01`, verifies that local copy byte-for-byte,
and removes the USB before execution. The immutable USB directory is never an
execution `TransferRoot`. The governed `transfer-removed` phase removes only
the verified local staging copy.

## Ordered execution lifecycle

1. Validate transfer manifest, custody, all R2 bindings and proposed unique
   execution identities without creating them.
2. Run the complete read-only pre-authority probe and package reconciliation.
3. Revalidate the certificate deadline and fresh continuity with unambiguous UTC.
4. Only after every read-only check passes, atomically create and consume the
   authority and attempt namespaces.
5. Publish the already passed transfer/package reconciliation and clean-host
   admission records create-only.
6. Derive the public certificate from the signed MSIX; prove no private key.
7. Prove the untrusted package and a tampered copy are rejected.
8. Trust only the exact certificate using shell-free `certutil.exe` in the
   physical `LocalMachine\TrustedPeople` store; verify physical scope, allowed
   logical projections, subject, thumbprint, raw bytes and absence of a
   private key.
9. Install the exact MSIX and verify package identity.
10. Launch through the registered application identity.
11. Use `Oracle.WindowDiscovery` and `Oracle.WindowObserver` to prove one
    visible owned Oracle window, ready runtime state and at least 60 seconds of
    stable observation. Process-name polling is not startup proof.
12. Verify packaged local content, renderer sandboxing, context isolation,
    IPC authorisation, Runtime Manifest and Release Manifest separation, and
    prohibited-network/resource absence.
13. Exercise repair/reset, repeat native window/runtime observation, then
    uninstall.
14. Remove exact certificate trust noninteractively; verify package, process,
    certificate, private-key and file residue is zero.
15. Freeze the complete evidence inventory create-only, create the immutable
    archive and sidecar, verify return-transfer bytes and stop for Founder
    review.

Phases cannot be independently invoked or repeated.

## Evidence

The attempt records authority, identities, host continuity, tool versions,
transfer custody, source hashes, certificate validity, clean-state inventories,
all command envelopes, package/trust deltas, negative paths, native window and
observer samples, runtime and security checks, repair/removal, cleanup,
lifecycle transitions, evidence inventory, archive hash, return-transfer
reconciliation and final machine state.

Writes are create-only and atomic. Missing, duplicate, unexpected, malformed,
partial or conflicting evidence fails the attempt. A later failure preserves
all earlier evidence and the original failure.

## Terminal states and failure

An attempt ends `passed`, `failed`, `stopped` or `interrupted`. Only completion
of every mandatory transition may publish `passed`.

After mutation, failure stops forward work and invokes only bounded safety
teardown. Teardown never broadens certificate or package selection. Residue is
reported and requires Founder action.

## Founder execution gate

Before execution the Founder must explicitly approve:

- the exact harness commit and transfer manifest;
- one unique authority and attempt;
- the current `Founder-QA-01` continuity record;
- the exact R9 transfer on the approved medium or another separately approved
  isolated method;
- elevated temporary exact-certificate `LocalMachine\TrustedPeople` trust;
- installation, repair/reset and removal of the exact R2 MSIX; and
- starting before the mandatory certificate deadline.

This plan grants no Stage 3 execution, Stage 4, production signing,
publication, distribution, deployment or release authority.
