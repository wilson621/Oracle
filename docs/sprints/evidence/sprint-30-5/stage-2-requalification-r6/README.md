# Sprint 30.5 Stage 2 Requalification R6 Evidence

**Status:** Founder-accepted, formally closed and frozen
**Passing attempt:** `r6-20260803T171057940Z-5e914d18`
**Authority:** `authority-r6-20260803T171057940Z-5e914d18`
**Candidate:** `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`
**Candidate tree:** `8455a05780989a9d5f6c6d527f7d427d94526b04`
**Harness:** `0b10f074d86ac9256462602c0e7bda528b8fba57`
**Harness tree:** `b32db4b2c7ebaf8ff6c1d2070e0056b6b7557f80`

The eleven immutable repository evidence files are preserved byte-for-byte in `r6-20260803T171057940Z-5e914d18/`. Their canonical machine-readable closure index is `Oracle.Stage2RequalificationR6AcceptedEvidenceIndex.json`.

- Final evidence manifest SHA-256: `a637a7fdf49f6b2a957738c89cb02015b6384d227c2c72f77a2aabdd721bf288`
- Qualification archive SHA-256: `7884c93b222cd5f16f51dd5ba1b56c51af5008e1f6c999dcff92a8c1a26ac690`
- Qualification archive size: `216700416` bytes
- MSIX SHA-256: `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`
- Signer thumbprint: `8C24858C147873EF46A9D61018FA2702B6222EA2`
- Signer expiry: `2026-09-02T17:11:50Z`

All eleven lifecycle phases passed. Independent reconciliation verified all 29 manifest-bound files and all 48 archive entries. Strict Authenticode and detached-manifest verification passed. Runtime-configuration canaries were absent from all 2,028 unpacked package files. Exact certificate trust/signing copies were removed, no package was installed, private signing material was destroyed, and final residue was zero.

R1-R4 and failed R5 remain immutable historical results. R10 remains R4-bound and barred. This closure grants no production-signing, publication, distribution, deployment or release authority.
