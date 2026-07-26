# Sprint 30.5 Stage 3 — Replacement Host Admission Requirements

**Status:** Evidence required — no host action authorised
**Designated role:** Clean Windows qualification host
**Current identity:** Founder-designated replacement physical laptop; exact
hardware identity pending admission evidence
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

The replacement host may enter Stage 3 only if every mandatory item passes and
the Founder has then granted the separate destructive-action and Stage 3
authority.

Admission fails closed if hardware identity cannot be pinned, the licensed
Windows environment cannot be installed, recovery cannot be demonstrated,
development tooling or Oracle residue exists after reinstall, production
resources are required, or evidence contains unredacted secrets.

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
