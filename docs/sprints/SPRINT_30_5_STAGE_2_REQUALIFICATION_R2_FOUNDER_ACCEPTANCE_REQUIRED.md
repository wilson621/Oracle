# Sprint 30.5 Stage 2 Requalification R2 — Founder Acceptance Required

**Decision:** Required
**Status:** Passing evidence independently reconciled; not accepted or closed
**Date:** 28 July 2026
**Stage 3:** Blocked and unauthorised

## Decision requested

The Founder is asked to accept or reject the immutable passing evidence for:

- attempt `r2-20260728T203503018Z-ec577cf4`;
- authority `authority-r2-20260728T203503018Z-ec577cf4`;
- candidate and harness commit
  `11475fe01fff2ec69f0188547107f4e901c531d7`; and
- candidate and harness tree
  `1cec636603031aa8f63c8b331aea5bbcb916567d`.

Engineering recommends acceptance for Stage 2 R2 Candidate Freeze and
Package Reconciliation only.

## Reconciled evidence

| Item | Reconciled value |
| --- | --- |
| Runtime Manifest | `1.7.0`; Web/Electron equality passed |
| Package | `Oracle_0.1.1.0_x64_STAGE2_REQUALIFICATION_R2_LOCAL_TEST_ONLY.msix` |
| Package identity/version/architecture | `Oracle.Platform.LocalCertification` / `0.1.1.0` / `x64` |
| Package-content entries | `2201` |
| MSIX SHA-256 | `6adb8d9b29585ff7de1b878ec2df2d76a82ce03661cf7269ced7eaff8aae50bc` |
| Release Manifest SHA-256 | `22d11f7273c2721efe032f5fedd956fdd4a2bfb587c55e7f84fde73dad8726ad` |
| Release Manifest signature | Valid detached CMS |
| Executable and package Authenticode | Four governed artifacts exactly `Valid` |
| Exact signer thumbprint | `119937D4B90068ACE8765695C5A94321A2C40BD8` |
| Signer expiry | `2026-08-27T20:35:39Z` |
| Mandatory Stage 3 execution-start deadline | `2026-08-26T20:35:39Z` |
| SBOM SHA-256 | `f1e77af72f999a432bbfe38e3aa7b7c3d2b453bb7e8a5b3f3486e06650ecd5f1` |
| Provenance SHA-256 | `c7a1c42c0366245d53c09647b80aa5dd573170ecd5629507b34cedfff21b63a2` |
| Certificate-store residue | Zero |
| Private signing material | Destroyed |
| Governed package installed | No |
| Final evidence manifest SHA-256 | `84660931dec8c2c4f4e409465e67e49d9606f8617824e7c1212bb2e8abf1d47d` |
| Qualification archive SHA-256 | `6a3d2a6878b6e778214c550854a06e4a410fd5ec60b911b606aef844d4225f0f` |

The canonical bounded evidence is indexed by
[Sprint 30.5 Stage 2 Requalification R2 Evidence](evidence/sprint-30-5/stage-2-requalification-r2/README.md).
The full `217000960`-byte archive remains in governed Git-ignored local
storage and is bound by its committed sidecar and final manifest.

The execution-completion snapshot records repository evidence publication as
pending because it was created before the bounded repository copy. The later
final repository checkpoint records
`repositoryEvidencePublicationPending: false`,
`repositoryVisibleEvidenceOnly: true` and an eight-file pre-manifest
publication inventory. The final manifest and its sidecar were then published
as terminal bindings. This is the governed create-only sequence.

## Independent reconciliation

Engineering independently recalculated the archive, final manifest, MSIX,
Release Manifest, SBOM and provenance hashes; verified every indexed
evidence, release and lifecycle file; verified all repository evidence copies
against their immutable artifact sources; and confirmed all 20 command
records exited with code zero and no signal or spawn error.

Live final checks found zero matching R2 certificates, zero installed
`Oracle.Platform.LocalCertification` packages, no private signing material,
a clean index and no tracked source modification.

The 24-hour execution-start margin closes at
`2026-08-26T20:35:39Z`. Any later Stage 3 preparation and execution must
retain this gate and fail closed if the remaining validity becomes
insufficient.

## Decision boundary

Acceptance would authorise formal R2 evidence/governance closure only if the
Founder separately directs that closure. It would not itself authorise Stage
3 preparation or execution, package transfer, production signing,
publication, distribution, deployment or release.
