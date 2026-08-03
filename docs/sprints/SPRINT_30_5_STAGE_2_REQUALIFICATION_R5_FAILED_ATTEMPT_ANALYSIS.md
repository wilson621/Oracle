# Sprint 30.5 Stage 2 Requalification R5 Failed Attempt Analysis

Status: **IMMUTABLE FAILED ATTEMPT — ZERO RESIDUE; SUPERSEDED BY A NEW REVISION**

## Attempt identity

- attempt: `r5-20260803T170318060Z-658ee6f0`
- authority: `authority-r5-20260803T170318060Z-658ee6f0`
- candidate: `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`
- candidate tree: `8455a05780989a9d5f6c6d527f7d427d94526b04`
- harness: `0a20a0ab1191d5d9e119cca5e2a786e3deecf6c1`
- harness tree: `4f21b7b5735612a35f6ebde2ee69b4ddfd13d561`

## Terminal result

R5 stopped non-zero during `package-and-manifests-signed`. The constructed AppxManifest correctly contained package version `0.1.3.0`; an inherited verifier regex still required escaped literal `0.1.2.0`. The mismatch was mandatory and stopped forward execution.

The attempt is not retried, repaired, deleted, accepted or reinterpreted. Its authority is consumed and its namespace is immutable.

## Teardown and residue

The attempt created local-test certificate thumbprint `C4B179643A6F2776C719C2565F0A87A246786812`. Exact-thumbprint teardown passed. Reconciliation found zero installed Oracle packages, zero matching certificates and zero private signing material. The repository and index remained clean. No Founder action is required for residue.

## Immutable bindings

- authority record: `20b77307e2096a63aa9954810ede69812fcc9f1bbe3827db807d70dffdce4d1f`
- attempt record: `f095211252d61bf650059c2ef4bf101288ad52c7bb7f825d459a12f0eb1ec527`
- failure outcome: `1feda28b1796b91deca571afc0b71c8185a40083c1d86817d0fa4057c78fa356`
- lifecycle failure record: `37484f2f6c46385f48f05ebabbd3cef346bdf616fcccfb2a06e3218ef4ea35ab`
- exact teardown record: `5236d878ffe694fc24503ba747132e142defc4c21c1a0204f2f7fa2b80c80436`
- failed-attempt MSIX: `86d1619c176ae225196a995551927248812f21a82785cf5e8542cb3397ebd321`

## Corrective consequence

Correction requires a new harness revision, new package version, new authority and new attempt namespace. R6 must bind this failed R5 history, remove the stale version literal, add a regression that rejects its return, and pass all preparation gates before execution.
