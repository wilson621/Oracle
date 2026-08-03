# Sprint 30.5 Stage 3 Requalification R12 Replacement Transfer Completion

**Status:** Corrected preparation and replacement transfer complete
**Classification:** Non-qualification engineering evidence
**Programme:** `Sprint 30.5 Stage 3 Requalification R12`

## Corrected baseline

- branch: `sprint-9-overlay`
- harness commit: `68a304d6caad3caaf84d3a6b4f63802ab4b6fe83`
- harness tree: `5925665667932cb049789003512b1071a56de528`
- remote synchronization: `origin/sprint-9-overlay` matched the harness commit

The corrected baseline passed the R12 preparation validator, the adversarial
manifest-inventory fixture, the fourteen-phase non-qualification rehearsal,
repository lint, TypeScript no-emit checking and the architecture-boundary
audit.

## Replacement transfer

- transfer ID: `transfer-stage3-r12-20260803T201110346Z-3cf28c94`
- manifest SHA-256:
  `603b86c649463e4871a9a0ba2e43a9d231f1ec755c0c01fdf79428cafc55f66a`
- custody SHA-256:
  `681ea3eeb092d2be4ec66ab3603c499782d0757ed8c8c7094273e4829674904e`
- payload files: `57`
- payload bytes: `580675315`
- medium hardware serial: `5F10110403558`
- filesystem and label: `NTFS`, `ORACLE-S3R1`
- volume serial: `783A-2CD4`

Construction used a new create-only sibling on the exact governed USB medium.
The manifest binds the corrected commit and tree, the accepted Stage 2 R6
package, the immutable R11 failure and the immutable first-R12 pre-authority
failure.

## Independent verification

An independent read-only verifier checked the root shape, transfer and custody
identity, manifest and custody sidecars, manifest-to-custody binding, mandatory
contract subset, case-insensitive uniqueness, absence of directories and
reparse points, exact physical-directory equality, every payload size and every
payload SHA-256. The result was `passed`.

The same verifier rehashed the immutable first R12 package in full:

- transfer ID: `transfer-stage3-r12-20260803T190836740Z-2b8363bb`
- manifest SHA-256:
  `81e05a570cfffb886af7f65e60ab8658d1fdb92d6d9b1d21ae23981b36b830f0`
- custody SHA-256:
  `b31cde2f075b3b1ac34d168c6bbdd3a671bb9a447426388272a50a1de7b42115`
- payload files: `52`
- payload bytes: `580664254`
- failed continuity SHA-256:
  `a71d06ee38b2568384aa46c84bd23af5a7cfbfcb988fad9c676b127fec9622d8`

Those immutable records remained unchanged.

## Authority boundary

R12 authority files: `0`.
R12 attempt directories: `0`.

No grant, qualification authority, attempt, qualification execution or new
continuity record was created. The replacement transfer must not be executed
unless a later explicit Founder qualification mission authorises it.
