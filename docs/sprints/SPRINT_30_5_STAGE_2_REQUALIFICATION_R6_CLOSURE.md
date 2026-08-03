# Sprint 30.5 Stage 2 Requalification R6 Closure

**Status:** Founder-accepted and formally closed
**Closed:** 3 August 2026
**Scope:** Corrected Candidate Freeze and Package Reconciliation
**Downstream:** Newly bound requalification permitted under the continuing Founder mission; R10 remains barred
**Production:** Unchanged and unauthorised

## Founder acceptance

The Founder accepted passing attempt `r6-20260803T171057940Z-5e914d18` under consumed authority `authority-r6-20260803T171057940Z-5e914d18` after independent evidence reconciliation.

The accepted product candidate is commit `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`, tree `8455a05780989a9d5f6c6d527f7d427d94526b04`. The governed harness is commit `0b10f074d86ac9256462602c0e7bda528b8fba57`, tree `b32db4b2c7ebaf8ff6c1d2070e0056b6b7557f80`.

## Accepted evidence

- final evidence manifest SHA-256: `a637a7fdf49f6b2a957738c89cb02015b6384d227c2c72f77a2aabdd721bf288`;
- qualification archive SHA-256: `7884c93b222cd5f16f51dd5ba1b56c51af5008e1f6c999dcff92a8c1a26ac690`;
- archive size: `216700416` bytes;
- MSIX SHA-256: `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`;
- Release Manifest SHA-256: `bd3dde2a3b37d75ccdcfecd8fa49bda2a493d340ead7283fddd2dd11a6e59bd3`;
- detached signature SHA-256: `4c8ec3b09f4bb03d5475398963e22a67657b9f4f4e5475fa03f512eae1cc97ac`;
- SBOM SHA-256: `ccefd235db62c007613d0280b6c35051999c3c757ce78a93581d9fcea626de22`;
- provenance SHA-256: `64c829eea43eed7b53af25712be38cda53f827b13844d544380f1776921e3920`; and
- exact signer thumbprint: `8C24858C147873EF46A9D61018FA2702B6222EA2`.

Independent reconciliation rehashed all 29 manifest-bound evidence, release and lifecycle files, verified 48 archive entries with zero unsafe paths, and matched the final hash sidecar.

## Qualification conclusion

All eleven governed lifecycle phases passed. Source, build, package, signer, manifest, SBOM, provenance and runtime-configuration secrecy bindings passed. The MSIX, Oracle executable and both native helpers had Authenticode `Valid`; the detached Release Manifest signature passed. Exact CurrentUser Root/My teardown passed and final package, certificate, trust and private-material residue was zero.

## Historical integrity

Accepted R1-R4 evidence and the immutable R5 failed attempt were not modified. R5's consumed authority cannot be reused. The corrected product candidate remains unchanged.

## Formal closure

Stage 2 Requalification R6 is formally closed and is the accepted Stage 2 baseline for newly bound downstream qualification. Stage 3 R10 remains exclusively R4-bound and must not be transferred or executed. A new clean-host revision may be prepared under the continuing Founder mission. No production authority is granted.
