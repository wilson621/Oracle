# Sprint 30.5 Stage 3 Requalification R12 Transfer Inventory Correction

**Status:** Engineering correction active — NON-QUALIFICATION
**Scope:** Replacement transfer preparation only

## Corrected authority model

The exact Founder-bound transfer manifest is the payload inventory authority.
The harness must require the physical payload directory to match that manifest
exactly, rehash every manifested file, reject duplicate or malformed paths, and
require a contract-defined operational subset.

This permits additional governance and failure records only when they are
explicitly present in the expected manifest whose SHA-256 is supplied to the
pre-authority and execution entry points. It does not permit an unmanifested
file, a missing required operational file, a case-alias duplicate, a nested
payload path, a reparse point, a size mismatch or a hash mismatch.

## Regression requirements

- the prior 52-entry governed manifest shape is accepted as internally exact;
- a manifested additional governance record is accepted;
- an unmanifested on-disk file is rejected;
- a missing required file is rejected;
- duplicate and case-alias manifest entries are rejected;
- tampered payload bytes are rejected;
- the replacement builder proves its planned inventory contains the mandatory
  subset before creating a transfer;
- execution remains not authorised during replacement preparation.

No current or historical transfer is modified by this correction.
