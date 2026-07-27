# Sprint 30.5 Stage 3 Reconciliation Evidence

This directory contains evidence imported from the governed Founder-QA-01 return package and the machine-readable records that reconcile that evidence with the immutable Revision 4–6 history.

## Imported evidence

Commit `a31acd42f19d71811ebb18d7dc7176debfc35a6d` imported 26 files totalling 55,820 bytes:

- 18 original phase-evidence JSON files and sidecars under `recovered-phase-evidence/`;
- eight chain-of-custody records and sidecars under `chain-of-custody/`.

The imported files preserve their original laptop-relative directory structure.

## Canonical recovered evidence

The recovered original Revision 4 NegativePathAndTrust evidence is:

`recovered-phase-evidence/revision-4-incoming/stage-3-evidence/02b-negative-path-and-trust-r4.json`

SHA-256:

`164a5df278aeca15d98b7c131e4c73cadea40f511d0831f12ed4d0d46e3215e2`

Its original sidecar is retained byte-for-byte.

This evidence proves that Revision 4 NegativePathAndTrust passed. It does not independently prove successful installation or Windows/AppX activation.

The immutable Revision 4 failure record retains its original installation and activation conclusions, while the reconciliation conservatively records the overall InstallAndStartup phase as failed.

## Reconciliation records

- `Oracle.Stage3ReconciliationInventory.json`
  - inventories every Commit 1 evidence-import file;
  - records file paths, sizes, and SHA-256 values;
  - records the external historical ZIP disposition.
- `Oracle.Stage3UnavailableEvidenceDisposition.json`
  - records artifacts that remain unavailable;
  - prohibits inference, recreation, or promotion.
- `Oracle.Stage3UsbIntegrityIncident.json`
  - records the removable-media read failure;
  - permanently prohibits reuse of the affected medium.
- `Oracle.Stage3ReconciliationRecord.json`
  - records the superseding reconciliation conclusions;
  - binds the recovered evidence, immutable failure records, status, authority, certificate timing, and harness state observed at reconciliation.

Every JSON reconciliation record has a SHA-256 sidecar.

## Historical preservation

The existing Revision 4, Revision 5, and Revision 6 evidence directories remain immutable and are not replaced by this directory.

Revision 6’s evidence-unavailable premise was accurate when recorded. It is superseded only as a statement of current availability because the original Revision 4 evidence was recovered later.

## Harness binding

The reconciliation records the harness path, SHA-256, and disposition observed at evidence-import commit `a31acd42f19d71811ebb18d7dc7176debfc35a6d`.

That SHA-256 is a historical-state binding. It does not permanently freeze the harness implementation or prevent a later separately governed replacement.

## External storage

The complete 91-file qualification history remains outside Git as governed external evidence:

- File: `Oracle.Stage3RevisionHistory.zip`
- Size: 1,501,901,728 bytes
- SHA-256: `6b188bf7993ef013ee53a95b225de203a296e03db023e7bacc0400d2d4bfe458`

The ZIP must remain preserved. Its absence from Git is intentional.

## Authority

These files do not grant qualification or execution authority.

Stage 3 is historically attempted, incomplete, and blocked. A separate Founder decision is required before any new harness, certificate, package, or qualification work.
