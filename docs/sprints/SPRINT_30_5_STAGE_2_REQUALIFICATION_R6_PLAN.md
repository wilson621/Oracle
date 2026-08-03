# Sprint 30.5 Stage 2 Requalification R6 Plan

Status: **PREPARED — FOUNDER-AUTHORISED GOVERNED EXECUTION PENDING**

## Purpose

R6 requalifies corrected product commit `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`, tree `8455a05780989a9d5f6c6d527f7d427d94526b04`, after the immutable R5 attempt stopped on a stale harness-only manifest-version assertion. R4 remains accepted immutable history. R5 remains immutable failed history with zero residue.

## Exact bindings

- candidate: `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`
- candidate tree: `8455a05780989a9d5f6c6d527f7d427d94526b04`
- package identity/version: `Oracle.Platform.LocalCertification` / `0.1.4.0`
- package: `Oracle_0.1.4.0_x64_STAGE2_REQUALIFICATION_R6_LOCAL_TEST_ONLY.msix`
- signer subject: `CN=Oracle Stage 2 Requalification R6 Local Test Signing - NOT PRODUCTION`
- unique R6 authority, attempt, artifact and evidence namespaces

The contract hash-binds accepted R2-R4 and downstream historical evidence, plus the R5 authority, attempt, terminal failure, lifecycle failure, teardown, failed MSIX and analysis records.

## Correction

The AppxManifest verifier now requires escaped literal package version `0.1.4.0`. Static validation requires that assertion and prohibits return of the stale `0.1.2.0` assertion. Product source is unchanged from the corrected candidate.

## Governed lifecycle

Only `invoke-attempt.ps1` is Founder-facing. The continuing Founder mission authorises one new R6 authority/attempt pair. No R5 authority or namespace may be reused. Mandatory failure stops forward execution; exact certificate teardown and zero-residue proof remain required.

Passing execution does not itself accept or close R6. Stage 3 R10 remains R4-bound and barred. Any downstream revision must bind only accepted R6 evidence.
