# Sprint 30.5 Stage 3 Requalification R11 Pre-Execution Gate

**Status:** R6-bound preparation complete; execution authorised only after transfer and pre-authority gates pass
**Execution:** Authorised only after transfer and pre-authority admission pass
**Required host:** `Founder-QA-01`, elevated 64-bit Windows PowerShell 5.1
**Candidate:** accepted Stage 2 R6 MSIX SHA-256 `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`

## Retired transfer prohibition

The canonical identity is exactly `Sprint 30.5 Stage 3 Requalification R11`. The following transfer IDs are immutable rejected history and are prohibited from admission, continuity reuse, authority creation and execution:

- `transfer-stage3-r10-20260803T130243096Z-7a48bde6`; and
- `transfer-stage3-r10-20260803T133216036Z-9dc6f3f1`.

The latter failed read-only admission because its manifest recorded the canonical Requalification identity while its transferred preflight required the noncanonical Qualification identity. No authority, attempt, trust, package installation or qualification occurred. A replacement must be generated create-only from the corrected published preparation with a new transfer ID.

## Gate sequence

1. Founder separately approves one transfer medium/method and one clean published R11 preparation commit/tree.
2. Construct exactly one transfer using `npm.cmd run sprint-30-5:stage-3:r11:prepare-transfer --` with the exact Founder transfer token, unique transfer identity, UTC timestamp, approved create-only root, medium identity, and expected harness commit. No execution entry point is exposed through `package.json`.
3. Independently verify every transfer file, size, SHA-256, manifest, sidecar, custody record, R6 closure binding, package inventory and certificate window.
4. Copy the approved transfer create-only to an isolated local host root; remove the physical medium before qualification.
5. Collect fresh continuity with the transferred `Get-OracleStage3R11HostContinuity.ps1`. Preserve raw computer-name casing and bind its SHA-256.
6. Run transferred `Invoke-OracleStage3R11PreAuthorityPreflight.ps1` elevated. It must pass exact transfer/custody/continuity checks, Windows PowerShell 5.1 x64, host identity/security/recovery, command and AppX surfaces, clean package/certificate/process state, installed-software inventory, untrusted signer state, certificate time margin, absent development tools, absent ambient provider/session variables, exact ADR-048 contract and writable isolated return roots. This probe is read-only, non-authority, non-attempt and non-evidence.
7. Stop if any gate fails. Do not create identities and do not mutate trust or package state.
8. Only after the continuing mission's execution condition is satisfied by passing all preceding gates, bind one fresh Founder grant, authority, attempt, transfer manifest/custody, preparation commit, continuity record and return root. Invoke the transferred qualification script once with those exact values.
9. Wait for the ordered lifecycle and bounded teardown to finish. Do not reconnect, retry, repair evidence or reuse any namespace.
10. Return the immutable archive, sidecar and archive manifest for independent verification and Founder acceptance.

## Mandatory stop conditions

Stop before authority for stale or mismatched continuity; certificate margin loss; any R4 or preparation binding mismatch; duplicate/pre-existing paths; reparse traversal; missing payload; host drift; package/certificate/process residue; ambient runtime credentials; missing elevation or command surface; or transfer/custody discrepancy. Stop after authority at the first lifecycle failure and perform only bounded exact teardown.

## Sequential authority boundaries

Preparation grants neither transfer nor execution authority. The next decision may authorise one create-only R11 transfer from the final published preparation commit/tree. After independent transfer review, a later decision may authorise fresh continuity, pre-authority admission, and one attempt.

## Exact governed bindings

Transfer construction requires `FOUNDER-AUTHORISED-STAGE3-R11-TRANSFER`, `ExpectedHarnessCommit`, and the separately approved medium identity. Execution requires `FOUNDER-AUTHORISED-STAGE3-R11-EXECUTION`, `ExpectedTransferManifestSha256`, `ExpectedTransferCustodySha256`, and `ExpectedHostContinuitySha256`.

The immutable candidate commit is `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`; MSIX SHA-256 is `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`. The proposed medium has hardware serial `5F10110403558` and volume serial `783A-2CD4`, but its use is authorised only after the preceding governed gate passes. Qualification must start before `2026-09-01T17:11:50Z`.
