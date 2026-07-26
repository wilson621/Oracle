# Sprint 30.5 Stage 3 — Replacement Host Admission Requirements

**Status:** Admitted with Founder Provenance Exception
**Designated role:** Clean Windows qualification host
**Current identity:** `Founder-QA-01`, `MEDION ERAZER P6605 MD61596`
**Admission classification:** `founder-provenance-exception`
**Previous Stage 3 proposal:** ASUS ROG Zephyrus G15 withdrawn from the Stage 3
role; its accepted Stage 1 evidence remains immutable history
**Stage 3:** Not started and not authorised

## Purpose

Admit only the minimum physical-host facts required before destructive clean
installation and Stage 3 execution. This is not a repeat of Stage 1 and does
not alter Stage 2.

## Pre-install admission evidence

Before any erase or installation, collect:

1. manufacturer and exact model;
2. serial number represented in committed evidence only by a salted SHA-256;
3. CPU model and architecture;
4. installed memory;
5. storage device identity, capacity, health and sufficient free capacity;
6. GPU identities;
7. display resolution and scaling capability;
8. firmware/BIOS version and date;
9. UEFI, Secure Boot and TPM 2.0 capability/state;
10. network-adapter identities, with MAC addresses redacted or hash-bound;
11. current Windows edition/build and the intended licensed Windows 11 x64
    edition after reinstall;
12. Windows activation/digital-licence readiness without retaining a product
    key or account identifier;
13. official recovery route and recovery-media availability;
14. Founder confirmation that required data is backed up and the device may be
    erased;
15. absence of production Oracle credentials and production data; and
16. confirmation that no purchase, paid provider, edition upgrade or new
    virtualisation provider is required.

The raw serial number, MAC address, licence key, recovery key, account identity
and other machine secrets must not be committed.

## Post-install clean-state admission evidence

After separately authorised clean installation and before package
qualification, collect:

1. official Windows installation-media identity and SHA-256;
2. installation timestamp, Windows edition, version, build, locale and
   architecture;
3. activation status with identifiers redacted;
4. stable Windows Update state;
5. installed official device-driver versions;
6. UEFI, Secure Boot, TPM and Defender state;
7. hardware identity continuity against the pre-install record;
8. complete installed-software inventory;
9. confirmation that Oracle is absent;
10. confirmation that Node.js, npm, Git, Python, Docker, Visual Studio, SDKs,
    compilers and development servers are absent;
11. confirmation that no Oracle package, process, service, task, file,
    application-data directory or certificate exists;
12. confirmation that no production endpoint, credential or data is present;
13. a documented clean baseline and recovery procedure; and
14. collector manifest, source/destination hash and removal evidence.

## Admission decision

A replacement host may become eligible for Stage 3 only when:

1. every mandatory technical and provenance control passes; or
2. every mandatory technical control passes and a narrowly defined,
   explicitly documented Founder-approved exception in this document governs
   the sole unavailable provenance item.

A failed or unavailable check remains failed or unavailable. It must never be
inferred, rewritten or represented as passed.

When a Founder-approved exception applies, the permitted admission state is:

`admitted-with-founder-provenance-exception`

This admission state does not authorise Stage 3. Stage 3 execution,
certificate trust, artifact transfer and package installation continue to
require separate Founder authority.

Admission fails closed if hardware identity cannot be pinned, any mandatory
technical control fails, freshness cannot be demonstrated, recovery cannot be
demonstrated, development tooling or Oracle residue exists, production
resources are required, evidence contains unredacted secrets, or the
exception's compensating controls or binding conditions are incomplete.

## Admission classifications

Oracle distinguishes two host-admission classifications:

1. `standard` — every mandatory technical and provenance control passes.
2. `founder-provenance-exception` — every mandatory technical control passes
   and a narrowly defined Founder-approved exception governs the sole
   unavailable provenance item.

The classifications are not interchangeable. Exception admission must remain
permanently visible and must never rewrite an unavailable provenance control
as passed.

## Founder-authorised retained-media provenance exception

This exception applies only to:

- device name `Founder-QA-01`;
- manufacturer/model `MEDION ERAZER P6605 MD61596`;
- the current Windows installation represented by host-admission evidence
  SHA-256
  `6dfaa176ed2d43595511d44401612536c6c0f1955f94527469d0f22af09c3b0e`;
  and
- baseline/recovery document SHA-256
  `6674b900fccadcc8f6d476dda6a787f859aad948dc78033dbfb7793ac90e8d44`.

The accepted assertion is that Windows was clean-installed using Microsoft's
official Media Creation Tool USB workflow, but the original USB or ISO hash
was not retained.

`installationMediaEvidencePresent` remains `false`.

The exception accepts this residual risk:

Oracle cannot cryptographically prove the identity of the original
installation media. It instead proves the observed freshness, integrity and
uncontaminated state of the resulting Windows installation.

The exception may become effective only after:

- every mandatory technical host-admission control passes;
- installation-media evidence is the sole failed host-admission check;
- `DISM.exe /Online /Cleanup-Image /CheckHealth` reports no component-store
  corruption;
- `sfc.exe /verifyonly` reports no integrity violation;
- a current Microsoft Defender scan completes with no active or newly
  detected threat;
- the compensating evidence is hash-bound;
- a host-specific exception record is prepared; and
- the Founder separately reviews and approves the complete exception
  evidence.

The exception is host-specific, installation-specific, non-transferable and
permanently visible in qualification evidence.

It is invalidated by Windows reinstall or reset, system-disk replacement,
system-image restoration, Secure Boot or TPM changes, contamination,
unexplained software, or failed integrity controls.

## Current admission decision

On 26 July 2026 the Founder approved the exception for the exact bound host and
Windows installation. `Founder-QA-01` is therefore:

`admitted-with-founder-provenance-exception`

The machine-readable approval record is
`evidence/sprint-30-5/stage-3-host-admission/Oracle.Stage3HostAdmissionApproval.json`
with SHA-256
`0d9a9668dbbf11c91f08d58bd84261f48baa2d3d3fd13184434965b66ffe2282`.

`installationMediaEvidencePresent` remains `false`. No collected evidence or
sidecar was modified. This admission grants no Stage 3 execution, certificate
trust, artifact transfer, package installation, deployment or security-boundary
authority.

## Evidence preserved from prior stages

Stage 1 remains accepted evidence for:

- the historical controlled non-pristine ASUS host;
- the standalone evidence-kit, transfer, isolation and cleanup method; and
- the distinction between environment admission and later operational
  qualification.

ASUS-specific hardware, GPU, driver, display, restore-point and local network
facts do not transfer to the replacement host.

Stage 2 remains accepted without qualification or repetition. The host change
does not alter:

- candidate source commit
  `d850743977735929f6873457fe122d2cf9697d9e`;
- Runtime Manifest `1.7.0`;
- the signed Release Manifest;
- MSIX
  `Oracle_0.1.1.0_x64_STAGE2_LOCAL_TEST_ONLY.msix`;
- MSIX SHA-256
  `00b045996e8a7e90400ce3208b2ab36bacccf48831a6ab770827f2ecd6e45276`;
- Release Manifest SHA-256
  `854b909a8d93a08ebd165d19a2f865ad6f3e84abe31f4bf1326e0647e761113d`;
- frozen Stage 2 archive SHA-256
  `8c20f6da7f0262ed4ef9a3a59c6a027ba3d64cb66c4e646b1f5d075da369f876`;
  or
- any accepted Stage 2 qualification evidence.

The replacement host's installed-package GPU evidence is a later Stage 5
requirement. It must not be inferred from the ASUS Stage 1 GPU admission.
