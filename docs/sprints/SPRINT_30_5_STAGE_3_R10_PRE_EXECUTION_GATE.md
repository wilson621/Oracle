# Sprint 30.5 Stage 3 Requalification R10 Pre-Execution Gate

**Status:** Governance-identity correction prepared; execution remains unauthorised
**Execution:** Blocked and unauthorised
**Required host:** `Founder-QA-01`, elevated 64-bit Windows PowerShell 5.1
**Candidate:** accepted Stage 2 R4 MSIX SHA-256 `8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5`

## Retired transfer prohibition

The canonical identity is exactly `Sprint 30.5 Stage 3 Requalification R10`. The following transfer IDs are immutable rejected history and are prohibited from admission, continuity reuse, authority creation and execution:

- `transfer-stage3-r10-20260803T130243096Z-7a48bde6`; and
- `transfer-stage3-r10-20260803T133216036Z-9dc6f3f1`.

The latter failed read-only admission because its manifest recorded the canonical Requalification identity while its transferred preflight required the noncanonical Qualification identity. No authority, attempt, trust, package installation or qualification occurred. A replacement must be generated create-only from the corrected published preparation with a new transfer ID.

## Gate sequence

1. Founder separately approves one transfer medium/method and one clean published R10 preparation commit/tree.
2. Construct exactly one transfer using `npm.cmd run sprint-30-5:stage-3:r10:prepare-transfer --` with the exact Founder transfer token, unique transfer identity, UTC timestamp, approved create-only root, medium identity, and expected harness commit. No execution entry point is exposed through `package.json`.
3. Independently verify every transfer file, size, SHA-256, manifest, sidecar, custody record, R4 closure binding, package inventory and certificate window.
4. Copy the approved transfer create-only to an isolated local host root; remove the physical medium before qualification.
5. Collect fresh continuity with the transferred `Get-OracleStage3R10HostContinuity.ps1`. Preserve raw computer-name casing and bind its SHA-256.
6. Run transferred `Invoke-OracleStage3R10PreAuthorityPreflight.ps1` elevated. It must pass exact transfer/custody/continuity checks, Windows PowerShell 5.1 x64, host identity/security/recovery, command and AppX surfaces, clean package/certificate/process state, installed-software inventory, untrusted signer state, certificate time margin, absent development tools, absent ambient provider/session variables, exact ADR-048 contract and writable isolated return roots. This probe is read-only, non-authority, non-attempt and non-evidence.
7. Stop if any gate fails. Do not create identities and do not mutate trust or package state.
8. Only after a separate Founder execution grant bind one fresh Founder grant, authority, attempt, transfer manifest/custody, preparation commit, continuity record and return root. Invoke the transferred qualification script once with those exact values.
9. Wait for the ordered lifecycle and bounded teardown to finish. Do not reconnect, retry, repair evidence or reuse any namespace.
10. Return the immutable archive, sidecar and archive manifest for independent verification and Founder acceptance.

## Mandatory stop conditions

Stop before authority for stale or mismatched continuity; certificate margin loss; any R4 or preparation binding mismatch; duplicate/pre-existing paths; reparse traversal; missing payload; host drift; package/certificate/process residue; ambient runtime credentials; missing elevation or command surface; or transfer/custody discrepancy. Stop after authority at the first lifecycle failure and perform only bounded exact teardown.

## Remaining Founder decisions

Preparation grants neither transfer nor execution authority. The next decision may authorise one create-only R10 transfer from the final published preparation commit/tree. After independent transfer review, a later decision may authorise fresh continuity, pre-authority admission, and one attempt.

## Exact governed bindings

Transfer construction requires `FOUNDER-AUTHORISED-STAGE3-R10-TRANSFER`, `ExpectedHarnessCommit`, and the separately approved medium identity. Execution requires `FOUNDER-AUTHORISED-STAGE3-R10-EXECUTION`, `ExpectedTransferManifestSha256`, `ExpectedTransferCustodySha256`, and `ExpectedHostContinuitySha256`.

The immutable candidate commit is `f7203f9b602b182a2bd006bc3cff3113b839be8e`; MSIX SHA-256 is `8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5`. The proposed medium has hardware serial `5F10110403558` and volume serial `783A-2CD4`, but its use requires a separate Founder decision. Qualification must start before `2026-09-01T11:50:55Z`.