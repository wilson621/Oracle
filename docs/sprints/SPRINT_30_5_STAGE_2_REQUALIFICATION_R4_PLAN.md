# Sprint 30.5 Stage 2 Requalification R4 Plan

Status: **HISTORICAL PLAN — QUALIFICATION PASSED, FOUNDER-ACCEPTED AND FORMALLY CLOSED**

## Purpose

R4 qualifies the corrected installed-package runtime-configuration baseline at product commit `f7203f9b602b182a2bd006bc3cff3113b839be8e`, tree `5d7eca4c012874df0b839533dfab283b54778661`. R3 remains an accepted, closed historical result; R4 neither repairs nor reinterprets it.

## Exact bindings

- candidate: `f7203f9b602b182a2bd006bc3cff3113b839be8e`
- candidate tree: `5d7eca4c012874df0b839533dfab283b54778661`
- package identity/version: `Oracle.Platform.LocalCertification` / `0.1.2.0`
- package: `Oracle_0.1.2.0_x64_STAGE2_REQUALIFICATION_R4_LOCAL_TEST_ONLY.msix`
- signer subject: `CN=Oracle Stage 2 Requalification R4 Local Test Signing - NOT PRODUCTION`
- runtime configuration contract: `oracle.installed-runtime-configuration`, version 1, maximum age 900 seconds
- output roots: revision- and attempt-scoped R4 artifact and repository-evidence namespaces

The machine-readable contract binds the exact runtime consumer, launcher integration, custody policy, regression tests, R3 archive and manifest, Stage 3 R9 archive, Stage 4 R1 archive, and their closure records.

## Governed lifecycle

Only `invoke-attempt.ps1` is Founder-facing. A future Founder grant authorises exactly one securely generated authority/attempt pair. The wrapper consumes authority, freezes the candidate, validates source and the runtime boundary, builds under deterministic non-secret canaries, constructs and verifies the package, creates one isolated local-test certificate, signs exact artifacts, requires strict Authenticode validity, tears down exact certificate material, proves zero residue, freezes evidence, creates the archive, and publishes create-only repository evidence.

Every mandatory failure stops the forward lifecycle. Bounded teardown still executes after partial certificate mutation. Existing attempt, authority, work, evidence, archive, certificate, package, or publication namespaces are never reused.

## Runtime configuration and secrecy

Before authority consumption the harness rejects `.env`, `.env.local`, `.env.production`, `.env.production.local`, and populated Oracle/Supabase runtime variables. The Web build receives deterministic non-secret canaries. Generated Next, Electron and native outputs, and the unpacked MSIX, must contain none of those canaries. Exact product hashes and focused runtime-policy tests are mandatory. Credentials are therefore supplied only through the separate attempt-scoped installed-package custody boundary in later stages, never through Stage 2 package bytes.

## Terminal states

- `execution-passed-awaiting-founder-review`
- immutable failed attempt with bounded teardown and residue evidence
- pre-authority rejection with no authority or attempt identity

Passing execution does not accept or close R4 and does not authorise Stage 3, Stage 4, Stage 5, production signing, distribution, or release.
