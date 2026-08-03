# Sprint 30.5 Stage 3 Requalification R10 Governance-Contradiction Recovery

**Status:** Corrected and validated as preparation; execution unauthorised
**Operating model:** OEOM v1.0
**Classification:** Engineering and governance preparation record, not qualification evidence

## Governing decision

The canonical programme identity is exactly `Sprint 30.5 Stage 3 Requalification R10`.

The governing basis is the accepted Stage 3 R9 closure plus the accepted Stage 2 R4 product-baseline change. R10 repeats the complete Stage 3 lifecycle against that new accepted candidate; it is therefore a requalification. The R10 plan, contract, revision lineage, phase audit, README and programme index all use that semantic identity. `Sprint 30.5 Stage 3 Qualification R10` is not an alias and remains invalid.

## Confirmed contradiction

The pre-authority admission of `transfer-stage3-r10-20260803T133216036Z-9dc6f3f1` stopped before authority creation because its manifest correctly recorded `Sprint 30.5 Stage 3 Requalification R10`, while the transferred preflight incorrectly required `Sprint 30.5 Stage 3 Qualification R10`. The mismatch was deterministic and fail-closed. No qualification, package installation, certificate trust or host mutation occurred.

## Immutable rejected history

The following transfers and every associated manifest, sidecar, custody, continuity and admission record are immutable and prohibited from reuse, repair, admission or execution:

| Transfer | Manifest SHA-256 | Custody SHA-256 | Disposition |
| --- | --- | --- | --- |
| `transfer-stage3-r10-20260803T130243096Z-7a48bde6` | `105d3004aa7c91f43eb440bced6d9806a963676ea0a9b2e661b8b32d7684aaed` | `fe57b149fda7192e473755149b2a202276b3abb6da826f542d5bf563b63ec5d2` | Rejected: custody authority was inaccurately recorded |
| `transfer-stage3-r10-20260803T133216036Z-9dc6f3f1` | `3caaeb29b432acca0aaccb43da45fc294f564e76d103cc274428ee83ad365e1e` | `7972737c6ec8b9884cf26816d316b809ffb6e01c22efb45ca88ef1b204e62317` | Rejected: preflight programme identity contradicted the canonical manifest identity |

## Corrected identity model

The contract is the authoritative source for the canonical programme identity and revision. Transfer manifests, custody, host continuity, preflight results, authority records, lifecycle records, completion/failure records, evidence manifests and archive manifests carry that identity. Transfer construction, pre-authority admission, qualification and returned-evidence verification reject any exact disagreement.

The contract also contains both rejected transfer identities. Transfer construction, preflight and qualification fail closed if either is presented. No compatibility alias, case folding, punctuation normalization or dual-name acceptance exists.

## Authority boundary

This correction and any replacement transfer remain preparation. They create no execution authority or attempt and do not authorise continuity collection, trust mutation, package installation or qualification. Fresh Founder-QA-01 admission requires a later exact Founder decision binding the corrected preparation commit/tree and a newly constructed transfer manifest/custody pair.
