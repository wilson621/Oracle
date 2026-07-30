# Sprint 30.5 Stage 3 Qualification R4 - Preparation and Execution Plan

**Status:** Preparation Founder-authorised; execution blocked and unauthorised
**Programme identity:** `Sprint 30.5 Stage 3 Qualification R4`
**Revision:** `R4`
**Prepared:** 30 July 2026
**Stage 2 input:** Founder-accepted and formally closed Requalification R2
**Stage 4:** Not authorised

## Purpose

This plan establishes a new versioned Stage 3 system without altering the
historical Stage 3 plans, R1 preparation, failed R2 and failed R3 preparation,
transfers, attempt identities, evidence or reconciliation. It qualifies
the exact accepted Stage 2 R2 package on a separately admitted clean Windows
host. Preparation authority does not authorise transfer, trust, installation
or execution. The R4 corrective-preparation authority separately authorises
construction of one create-only R4 transfer on the already approved USB; it
does not authorise transfer admission or execution.

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
and retired. No R3 file is repaired or reused by R4.

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

## Authority and identities

Transfer construction and Stage 3 execution require separate Founder
authority. Each uses a unique, immutable identity. Execution uses:

- authority `authority-stage3-r4-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx`;
- attempt `stage3-r4-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx`;
- the same canonical UTC timestamp and suffix in both identities;
- one authority for one attempt; and
- create-only authority, work and evidence roots.

No historical attempt can be resumed or retried.

## Host admission and continuity

The proposed host remains `Founder-QA-01`, MEDION ERAZER P6605 MD61596, under
the historical host-specific admission and provenance exception. Historical
admission is not current continuity proof.

Immediately after verified transfer arrival and before execution, the governed
lifecycle must verify the host identity, admitted Windows-installation continuity,
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
and Stage 3 R4 kit. It creates a unique destination, copies bytes without replacement,
verifies every hash and publishes deterministic manifests and sidecars
atomically.

The Founder-approved `Sony Storage Media` USB (`NTFS`, label `ORACLE-S3R1`,
hardware serial `5F10110403558`, volume serial `783A-2CD4`) may host R4 in a
new create-only sibling directory. The R1, failed R2 and failed R3 transfers remain
immutable. Admission must bind the exact R4 transfer root, identity, manifest
and custody hashes; the presence of R1, R2 or R3 does not authorise their use. Any
different physical or
logical method requires explicit Founder approval. The method, source,
destination, custody checkpoints and return hashes form part of the attempt
evidence.

## Ordered execution lifecycle

1. Validate Founder authority, transfer manifest and all R2 bindings.
2. Revalidate the certificate deadline with an unambiguous UTC source.
3. Admit host identity and continuity; freeze the clean baseline.
4. Create the authority and attempt namespaces atomically.
5. Verify transfer bytes, signatures, Release Manifest, SBOM and provenance.
6. Derive the public certificate from the signed MSIX; prove no private key.
7. Prove the untrusted package and a tampered copy are rejected.
8. Trust only the exact certificate using shell-free `certutil.exe` into
   `CurrentUser\Root`; verify subject, thumbprint and raw bytes.
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
- the exact R4 transfer on the approved medium or another separately approved
  isolated method;
- temporary exact-certificate Root trust;
- installation, repair/reset and removal of the exact R2 MSIX; and
- starting before the mandatory certificate deadline.

This plan grants no Stage 3 execution, Stage 4, production signing,
publication, distribution, deployment or release authority.
