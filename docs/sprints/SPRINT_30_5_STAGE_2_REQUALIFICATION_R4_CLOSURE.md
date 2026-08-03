# Sprint 30.5 Stage 2 Requalification R4 Closure

**Status:** Founder-accepted and formally closed
**Closed:** 3 August 2026
**Scope:** Post-ADR-048 Candidate Freeze and Package Reconciliation
**Downstream execution:** Unauthorised
**Production:** Unchanged and unauthorised

## Founder acceptance

The Founder accepted passing attempt `r4-20260803T115002258Z-31ab0bf6` under consumed authority `authority-r4-20260803T115002258Z-31ab0bf6`.

The accepted product candidate is commit `f7203f9b602b182a2bd006bc3cff3113b839be8e`, tree `5d7eca4c012874df0b839533dfab283b54778661`. The governed harness is commit `a31c2897dd063e8e995e558cd83ecd188b8392ff`, tree `ec0dc354553b6be38daaee4cd2383e325bd94837`.

## Accepted evidence

- final evidence manifest SHA-256: `876be1c0342c7dc9f70965faa3daffe0c9c1d8d7a3e2c41b144155350557784d`;
- qualification archive SHA-256: `3f1f11dd04ddbc3b4eb51db344f71c12252cc7e41e8ae072950d3a74c1452495`;
- archive size: `216696320` bytes;
- MSIX SHA-256: `8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5`;
- Release Manifest SHA-256: `be26608410c26af2ef1d784949d2fa7c2af874de41ab1e13968da85c3372e7e7`;
- detached signature SHA-256: `3f4c1aab2eb0a5ab22e7455347ff9d59af523fd6424e59a638399383fdb19bf0`;
- SBOM SHA-256: `0b3627e41b252a3065a7199593fcc20a08f073bb9aa466b4feded16d3fc5a1b3`;
- provenance SHA-256: `3a29a893780b569b39fdaa0e355ebde2514e6465eb6f62b040e84ebb820e5392`; and
- exact signer thumbprint: `03BEFBF303751D3DC14DF3FA224EB6BC5A6E4222`.

All eleven admitted evidence files were independently byte-compared with their immutable originals. Both sidecars, the archive, final manifest, authority, attempt, candidate, harness and qualification result matched exactly.

## Qualification conclusion

All twelve governed phases passed. Source, build, package, signer, manifest, SBOM and provenance bindings passed. Runtime-configuration custody tests passed and deterministic build canaries were absent from generated outputs and all 2,026 unpacked package files. The MSIX, Oracle executable and both native helpers had Authenticode `Valid`; the detached Release Manifest signature passed. Exact CurrentUser Root/My teardown passed and final package, certificate, trust and private-material residue was zero.

## Historical and private-state integrity

Stage 2 R1-R3, Stage 3 R9, Stage 4 R1 and all failed historical attempts remain immutable. The accepted product candidate and historical evidence were not modified. The private `.env.local` remains unread and unmodified in its governed isolation location outside the repository; restoration requires separate authority.

## Formal closure

Stage 2 Requalification R4 is formally closed. R4 is now the accepted Stage 2 baseline for a separately authorised downstream requalification-planning decision. This closure does not begin or authorise Stage 3, Stage 4 or Stage 5 execution and grants no production authority.
