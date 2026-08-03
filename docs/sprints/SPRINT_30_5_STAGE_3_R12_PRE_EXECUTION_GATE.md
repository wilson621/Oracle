# Sprint 30.5 Stage 3 Requalification R12 Pre-Execution Gate

**Status:** Execution-enabled mission authorised; fresh transfer pending
**Fresh transfer construction:** Founder-authorised
**Execution:** Founder-authorised after every pre-authority gate passes
**Qualification attempt:** One create-only attempt authorised

## Current boundary

The first R12 package and the independently verified replacement-only R12
transfer are immutable history. Their transfer, custody, continuity and expired
identity records must not be modified or reused.

The Founder authorised one fresh execution-enabled R12 baseline and create-only
transfer. Its manifest-bound contract must explicitly record
authority.execution as founder-authorised. Execution may proceed only after
independent full-transfer verification, fresh Founder-QA-01 continuity,
elevated read-only pre-authority admission, exact zero-state reconciliation,
security and trust admission, and create-only return-root checks all pass.

The qualification harness creates and immediately consumes one authority record
only after those gates pass. Any earlier non-zero result creates no authority and
no attempt. No retry is permitted after authority consumption or a permanent
failed attempt.

## Governed bindings

The fresh transfer must bind ExpectedHarnessCommit,
ExpectedTransferManifestSha256 and ExpectedTransferCustodySha256. The exact
Founder-bound manifest is the complete payload inventory authority; the
contract-defined mandatory subset must be present, every manifested byte must be
rehashed, and the physical payload directory must equal the manifest.

The immutable product binding remains candidate
ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff and MSIX
492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430.
The certificate margin closes at 2026-09-01T17:11:50Z.

The approved physical medium is hardware serial 5F10110403558, NTFS label
ORACLE-S3R1, and volume serial 783A-2CD4. Fresh output must be a new
create-only sibling and all historical transfers remain immutable.

Stage 4, production, publication and deployment remain not authorised.
