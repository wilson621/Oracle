# Sprint 30.5 Stage 3 Qualification R1 - Preparation and Execution Plan

**Status:** Preparation Founder-authorised; execution blocked and unauthorised
**Programme identity:** `Sprint 30.5 Stage 3 Qualification R1`
**Revision:** `R1`
**Prepared:** 28 July 2026
**Stage 2 input:** Founder-accepted and formally closed Requalification R2
**Stage 4:** Not authorised

## Purpose

This plan establishes a new versioned Stage 3 system without altering the
historical Stage 3 plans, attempts, evidence or reconciliation. It qualifies
the exact accepted Stage 2 R2 package on a separately admitted clean Windows
host. Preparation authority does not authorise transfer, trust, installation
or execution.

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

## Authority and identities

Transfer construction and Stage 3 execution require separate Founder
authority. Each uses a unique, immutable identity. Execution uses:

- authority `authority-stage3-r1-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx`;
- attempt `stage3-r1-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx`;
- the same canonical UTC timestamp and suffix in both identities;
- one authority for one attempt; and
- create-only authority, work and evidence roots.

No historical attempt can be resumed or retried.

## Host admission and continuity

The proposed host remains `Founder-QA-01`, MEDION ERAZER P6605 MD61596, under
the historical host-specific admission and provenance exception. Historical
admission is not current continuity proof.

Immediately before transfer and again before execution the governed lifecycle
must verify the host identity, admitted Windows-installation continuity,
activation, recovery readiness, Secure Boot, TPM, Defender, development-tool
absence, Oracle absence, package absence, certificate absence and absence of
production resources. Reinstall, reset, restoration or material identity drift
returns the host to admission review.

The fresh continuity record is create-only, has a maximum age of 60 minutes
at execution admission and is bound by an exact Founder-approved SHA-256.

## Transfer

The transfer builder consumes only the accepted R2 archive, package, Release
Manifest, detached signature, SBOM, provenance, verification records and
R1 kit. It creates a unique destination, copies bytes without replacement,
verifies every hash and publishes deterministic manifests and sidecars
atomically.

The retired USB is prohibited. A replacement physical medium or isolated
logical transfer method requires explicit Founder approval. The method,
source, destination, custody checkpoints and return hashes form part of the
attempt evidence.

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
- the replacement transfer medium or isolated method;
- temporary exact-certificate Root trust;
- installation, repair/reset and removal of the exact R2 MSIX; and
- starting before the mandatory certificate deadline.

This plan grants no Stage 3 execution, Stage 4, production signing,
publication, distribution, deployment or release authority.
