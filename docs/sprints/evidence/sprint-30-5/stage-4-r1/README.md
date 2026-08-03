# Sprint 30.5 Stage 4 R1 Qualification Evidence

**Status:** Founder-accepted, formally closed and frozen
**Passing attempt:** `stage4-r1-20260803T093803115Z-7fc6b185`
**Authority:** `authority-stage4-r1-20260803T093803115Z-7fc6b185`
**Founder grant:** `founder-stage4-r1-grant-20260803T093803115Z-7fc6b185`
**Preparation commit:** `3994d483a4a7fc8dfe91a7d21c7c54d1d10a72c3`
**Preparation tree:** `6062c99988c4251b824b39f05d414b8155743506`
**Stage 5:** Not started and unauthorised

## Canonical accepted evidence

The canonical repository evidence namespace is
`stage4-r1-20260803T093803115Z-7fc6b185/`. It contains exactly `40` files
totalling `291328` bytes.

The final evidence manifest contains `39` entries and has SHA-256:

`1f516e1f7d1b30d88c8e9fbd22774068bd9c7071935cc415b1d1243b7b5d4c9d`

Every manifest entry was independently verified by relative path, byte size
and SHA-256.

The immutable qualification archive is
`stage4-r1-20260803T093803115Z-7fc6b185/Oracle.Sprint30.5.Stage4R1QualificationEvidence.zip`.
Its size is `30664` bytes, it contains exactly `18` files, and its SHA-256 is:

`91116098c123c960ba736114176c08876f7a4f66b0b777efbcb2bda1e53d2a15`

The archive sidecar matches this hash exactly.

## Qualification bindings

- accepted Stage 2 R3 candidate commit/tree:
  `a7fc67f207d9c95407c70812828fa66bd487285d` /
  `356f6d52f1bf70065692e892af8bf916acc8727a`;
- preflight SHA-256:
  `42ef3a9e3d7bbaea4c3cfb030188943db0cf822dae34ea3e5b1455fdbcb62142`;
- Stage 2 R3 manifest/archive/MSIX SHA-256:
  `79ae9b219f24c8f61c48b6e3a0094d1730f72fe29a932e02ff1e92f7b07c1229`,
  `82ad4a46721c2ab0e7103c57f192394887844fd4c311ec3fcea92d2ba05e0688`,
  `c2dc7c68bcc9b6dd8c3a8e39d6db5f1d5b8230b64906524e9a4c01cf25aa65d1`;
- Stage 3 R9 manifest/archive SHA-256:
  `19a8248a06b37d5fac73b42d35ac96049d3ede09249360b064d9dd692d07defe`,
  `5eadd80469edcafbe62cd461404c9a2bd782eb1393e542b78969784925e2f41e`.

## Reconciled conclusion

All thirteen lifecycle phases and all ten governed journeys passed. Protected
rendering and API authorisation passed, two-principal isolation recorded zero
cross-account leaks, session invalidation passed, and teardown proved zero
residue.

Every file beneath the passing-attempt namespace is immutable. Stage 2 R3,
Stage 3 R9 and all earlier Stage 4 records remain unchanged. This evidence
closes Stage 4 only and grants no later-stage or production authority.
