# Sprint 30.5 Stage 3 Requalification R12 Evidence

**Status:** Independently verified, formally closed and frozen
**Passing attempt:** `stage3-r12-20260803T204415402Z-b886be44`
**Consumed authority:** `authority-stage3-r12-20260803T204415402Z-b886be44`
**Qualification baseline:** `3aa68ac8f08fafaea2963517e7aa7ba3b011d931`
**Stage 4:** Not started and not authorised

## Canonical evidence

`Oracle.Stage3R12Evidence/` is the byte-for-byte canonical copy of the returned
R12 evidence namespace. It contains `153` files totalling `358848` bytes. The
expanded frozen attempt contains `148` files totalling `253640` bytes.

The immutable qualification archive is
`Oracle.Stage3R12Evidence/stage3-r12-20260803T204415402Z-b886be44.zip`.
It is `100364` bytes, contains `148` files, and has SHA-256
`1e583ef3a67755a40ec2d4ec50e0535e38ee3e2eab9b65767d48a3a17f8f5055`.

The final evidence manifest has SHA-256
`d0238d0859a871d2589f66cbddc5f337b33638b32a02375b71f39fc2dac461d0`
and binds `144` pre-freeze evidence files. The accepted evidence index is
`Oracle.Stage3R12AcceptedEvidenceIndex.json`.

## Independent reconciliation

The repository return verifier passed the archive manifest, archive sidecar,
programme identity, authority/attempt identity, evidence manifest, all listed
file sizes and hashes, passing completion, final lifecycle record, and absence
of failure evidence. A separate byte comparison proved:

- `148/148` archive entries exactly match the expanded attempt;
- `153/153` returned files exactly match the canonical repository copy;
- the authority is consumed once and uses the same fresh identity as the
  attempt, completion and lifecycle;
- all fourteen lifecycle phases are present in order;
- the execution binds transfer
  `transfer-stage3-r12-20260803T203230543Z-6c8c1069` and manifest SHA-256
  `cf4a0dfadecd49cef3163f37dd33089ab91db9edb41892e3573da4c58c1309c8`;
- untrusted and tampered packages were rejected before the accepted package was
  installed;
- initial and repair direct activation returned `0x00000000` with non-zero
  process IDs;
- both native-window observations captured `55` valid samples and exceeded
  `60` measured seconds with exact package-family ownership, valid
  Authenticode and zero network connections;
- the post-reset package-data initializer resolved the registered package data
  root, matched `LocalState`, rejected reparse traversal and recorded no secret
  values; and
- final package, certificate, process, staged-transfer, work and package-data
  residue is zero, with installed software unchanged.

## Integrity boundary

R9 remains accepted immutable history. R11 remains immutable failed
qualification evidence. Both earlier R12 transfers and the first failed R12
continuity record remain immutable and are not part of the passing attempt.
The returned USB evidence was read and copied without modification.

This evidence closes Stage 3 R12 only. It does not begin or authorise Stage 4,
production signing, publication, distribution, deployment or release.
