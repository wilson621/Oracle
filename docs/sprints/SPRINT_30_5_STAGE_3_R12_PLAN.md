# Sprint 30.5 Stage 3 Requalification R12 Plan

**Status:** Replacement-transfer engineering correction authorised; execution barred
**Operating model:** OEOM v1.0
**Programme:** `Sprint 30.5 Stage 3 Requalification R12`

## Purpose

R12 is the create-only successor engineering revision to immutable failed R11.
It corrects the post-reset package-data lifecycle assumption while continuing to
bind only the accepted Stage 2 R6 product package. R9 remains accepted passing
Stage 3 history. R11 remains immutable failed qualification evidence.

## Evidence-led root cause

R11 proved the signed installed runtime, direct activation and native window for
60.448 seconds, then `Reset-AppxPackage` removed the Windows-managed package-data
root. The harness attempted to write its second ADR-048 configuration before
reinitialising that store and failed closed as designed.

R12 snapshots the exact AppX identities before reset, then waits for one exact
package registration using a bounded 120-poll, 250-millisecond stabilization
policy. Windows may recreate the package root during that interval. R12 records
the observed pre-API state, invokes
`Windows.Management.Core.ApplicationDataManager.CreateForPackageFamily`,
requires its `LocalFolder` to equal the exact expected `LocalState`, rejects
reparse traversal, and only then creates the second configuration.

Manual package-root creation and an unconfigured bootstrap activation are both
forbidden. The product fail-closed runtime remains unchanged.

## Immutable inputs

- accepted Stage 2 R6 candidate: `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`
- accepted MSIX: `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`
- R11 attempt: `stage3-r11-20260803T175715661Z-84bf486c`
- R11 failed-evidence index: `2e43a590d1dab0bdfb8707dfaa1de625008766c3a8590c91c201640cca43168f`
- R11 failure: `2e6cf6fb9d131c66376e247c94d5198db5e6ff4f8e740868b6f85194d004a489`

## Engineering gates

R12 must pass PowerShell 5.1 parsing, Node syntax, direct immutable-evidence
rehash, the ADR-048 installed runtime-configuration lifecycle fixture,
adversarial post-reset initialization tests, optional-member/StrictMode audit,
all-phase development rehearsal, lint, type checking and architecture audit.

The first R12 transfer is immutable pre-authority engineering failure
`transfer-stage3-r12-20260803T190836740Z-2b8363bb`. Its manifest, custody,
continuity and expired identities are preserved and barred from reuse.

The evidence-led inventory correction makes the exact Founder-bound manifest
authoritative for the complete payload while retaining a contract-defined
mandatory subset. The physical directory must equal the manifest exactly and
every manifested byte must pass size and SHA-256 verification. Adversarial
validation rejects unmanifested files, omissions, duplicates, case aliases,
reparse points and tampering.

Completion permits one new create-only, independently verified replacement
transfer with fresh transfer identity. It creates no qualification authority,
attempt or qualification evidence.
