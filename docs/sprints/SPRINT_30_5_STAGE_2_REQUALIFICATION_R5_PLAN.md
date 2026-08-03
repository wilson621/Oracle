# Sprint 30.5 Stage 2 Requalification R5 Plan

Status: **PREPARED — FOUNDER-AUTHORISED GOVERNED EXECUTION PENDING**

## Purpose

R5 qualifies the packaged-server environment correction at product commit `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`, tree `8455a05780989a9d5f6c6d527f7d427d94526b04`. R4 remains Founder-accepted, formally closed and immutable for its exact historical package; R5 neither repairs nor reinterprets it.

## Exact bindings

- candidate: `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`
- candidate tree: `8455a05780989a9d5f6c6d527f7d427d94526b04`
- package identity/version: `Oracle.Platform.LocalCertification` / `0.1.3.0`
- package: `Oracle_0.1.3.0_x64_STAGE2_REQUALIFICATION_R5_LOCAL_TEST_ONLY.msix`
- signer subject: `CN=Oracle Stage 2 Requalification R5 Local Test Signing - NOT PRODUCTION`
- runtime configuration contract: `oracle.installed-runtime-configuration`, version 1, maximum age 900 seconds
- output roots: revision- and attempt-scoped R5 artifact and repository-evidence namespaces

The machine-readable contract binds the exact runtime consumer, strict packaged-server child-environment constructor, launcher integration, custody policy and regressions. It also hash-binds accepted R2, R3, R4, Stage 3 R9 and Stage 4 R1 evidence and closure records.

## Governed lifecycle

Only `invoke-attempt.ps1` is Founder-facing. The current Founder grant authorises one securely generated R5 authority/attempt pair. The wrapper consumes authority, freezes the candidate, validates source and runtime boundaries, builds under deterministic non-secret canaries, constructs and verifies the MSIX, creates one isolated local-test certificate, signs exact artifacts, requires strict Authenticode validity, tears down exact certificate material, proves zero residue, freezes evidence, creates the archive, and publishes create-only repository evidence.

Every mandatory failure stops the forward lifecycle. Bounded teardown still executes after partial certificate mutation. Existing authority, attempt, work, evidence, archive, certificate, package, or publication namespaces are never reused.

## Runtime configuration and secrecy

Before authority consumption the harness rejects `.env`, `.env.local`, `.env.production`, `.env.production.local`, and populated Oracle/Supabase runtime variables. The Web build receives deterministic non-secret canaries. Generated Next, Electron and native outputs, and the unpacked MSIX, must contain none of those canaries. The privileged utility child receives only the four admitted runtime keys plus fixed production/loopback values and a physically validated Windows SystemRoot.

## Terminal states

- `execution-passed-awaiting-founder-review`
- immutable failed attempt with bounded teardown and residue evidence
- pre-authority rejection with no authority or attempt identity

Passing execution does not itself accept or close R5. Stage 3 R10 remains R4-bound and must not be transferred or executed for R5. Any downstream revision must be created only after accepted R5 evidence is reconciled.
