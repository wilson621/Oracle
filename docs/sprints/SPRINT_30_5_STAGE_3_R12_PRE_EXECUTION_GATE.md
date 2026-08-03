# Sprint 30.5 Stage 3 Requalification R12 Pre-Execution Gate

**Status:** Founder-authorised mission active
**Transfer construction:** Founder-authorised
**Execution:** Founder-authorised after all pre-authority gates pass
**Qualification attempt:** One create-only attempt authorised

## Current boundary

The Founder accepted the completed R12 engineering baseline and authorised one
governed qualification mission. Transfer construction may proceed on the exact
approved medium. Execution may proceed only after independent transfer
verification, fresh `Founder-QA-01` continuity, elevated read-only pre-authority
admission and zero-state checks all pass.

The qualification harness creates and immediately consumes the one authority
record only after those gates pass. Any earlier non-zero result creates no
authority and no attempt. `package.json` continues to expose validation and
rehearsal only; governed transfer and execution use the token-gated scripts
directly from their approved source and verified transfer locations.

## Governed bindings

The mission must bind `ExpectedHarnessCommit`,
`ExpectedTransferManifestSha256`, `ExpectedTransferCustodySha256` and
`ExpectedHostContinuitySha256`, plus one new transfer, grant, authority and
attempt identity. No R10 or R11 identity may be reused.

The immutable product binding remains candidate
`ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff` and MSIX
`492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`.
The certificate margin closes at `2026-09-01T17:11:50Z`.

The approved physical medium is hardware serial `5F10110403558`, NTFS label
`ORACLE-S3R1`, and volume serial `783A-2CD4`. R12 output must be a new
create-only sibling and all historical transfers remain immutable.

Stage 4, production, publication and deployment remain not authorised.
