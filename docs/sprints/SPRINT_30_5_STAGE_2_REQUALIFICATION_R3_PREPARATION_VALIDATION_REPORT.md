# Sprint 30.5 Stage 2 Requalification R3 — Preparation Validation Report

**Result:** PASS
**Date:** 31 July 2026
**Classification:** Non-qualification engineering validation
**Qualification executed:** No
**Authority or attempt created:** No

## Baseline and isolation

- branch: `sprint-9-overlay`;
- candidate commit: `a7fc67f207d9c95407c70812828fa66bd487285d`;
- candidate tree: `356f6d52f1bf70065692e892af8bf916acc8727a`;
- remote branch: candidate commit confirmed after non-force push;
- Stage 4 R1 draft stash: `d554bf884b9d7657bc193b7b965cb251ab4337fd`;
- durable isolation reference:
  `refs/oracle/isolation/stage4-r1-draft-before-stage2-r3`;
- restore verification: PASS in disposable short-path worktree; tracked and
  untracked inventories and Git blob identities matched; disposable worktree
  removed;
- R3 governed product-path diff from candidate: zero.

## Executed validation

The following were actually run on the development machine:

- Node syntax checks for every R3 `.mjs`: PASS;
- Windows PowerShell 5.1 parser checks for every R3 `.ps1`: PASS;
- R3 contract JSON parse: PASS;
- R3 static and fixture validator: PASS;
- focused ESLint over R3 `.mjs`: PASS;
- repository-wide `npm.cmd run lint`: PASS;
- repository-locked TypeScript `--noEmit --incremental false`: PASS;
- `npm.cmd run architecture:audit`: PASS, 455 TypeScript files scanned, no
  new or unexpected boundary violation;
- `npm.cmd run migration-011:static:verify`: PASS, SHA-256
  `dff827ce532a062fdc3aa93df08eba4628e004b46e9233005325f443e8429928`;
- `npm.cmd run migration-012:static:verify`: PASS, SHA-256
  `e64213123ff2b75b12c293d79380cc43dc9028dd56f503330aac9f5d97442c73`;
- `git diff --check`: PASS;
- current-user Oracle package residue: zero;
- exact R3 certificate subject matches across governed CurrentUser and
  LocalMachine My/Root/TrustedPeople stores: zero;
- R3 artifact root: absent;
- R3 repository-evidence root: absent;
- staged paths: zero.

The R3 validator executed fixtures for exact candidate and tree binding,
corrected migration hashes, historical evidence hashes, complete harness
inventory, inherited R2 fixture parity, attempt identity, authority uniqueness,
retry rejection, lifecycle ordering, create-only writes/publication, traversal
and reparse rejection, exact certificate selection, certificate identity
recovery, trust import, strict signature verification, process startup/error/
signal/null/nonzero failures, partial-failure teardown, private-material
cleanup, evidence freeze and final checkpoints.

## Historical R2 validator disposition

The closed R2 validation command was run as a regression probe. It stops on its
historical dynamic deny-list completeness assertion because the later accepted
`docs/sprints/evidence/sprint-30-5/stage-3-r9` directory did not exist when the
R2 contract was frozen. The R2 harness and evidence were not modified.

This is not an R3 control failure: R3 carries the inherited R2 fixture set,
proves label parity mechanically, executes those fixtures in the R3 namespace,
and expands the deny-list to include R2 and Stage 3 R9. Altering the closed R2
contract merely to admit later history would violate historical immutability.

## Adversarial review

The complete affected lifecycle was reviewed against the R2 implementation.
After revision/namespace normalization, the exact-certificate removal,
Release Manifest signing and exact-signature verification scripts are
byte-equivalent to their proven R2 counterparts. R3 preserves strict
Authenticode `Valid`, exact subject/thumbprint/raw bytes, noninteractive
CertUtil Root trust, exact-thumbprint-only cleanup and final zero residue.

Review findings corrected before this report:

1. Candidate evidence initially inherited HEAD as its source identity. It now
   records the exact fixed candidate commit/tree, while harness HEAD remains a
   separate runtime binding.
2. The derived standalone `prepare-attempt.mjs` would have exposed attempt
   creation outside the single executor. It was omitted and the harness
   inventory/static tests require its absence.
3. Corrected migration hashes were initially preparation-only assertions.
   They are now checked by the executor before authority consumption.
4. Historical evidence hashing initially lacked an explicit traversal and
   reparse check. R3 now rejects traversal and reparse-backed binding paths.
5. The historical deny-list was expanded to include accepted R2 and Stage 3 R9
   roots and exact selected archive/manifest/closure hashes.

No unresolved deterministic harness defect was found. An all-users AppX
inventory query used only for this engineering review was denied by local
machine policy; the governed R3 preflight intentionally uses the current-user
package inventory, matching the actual installation scope, and that check
passed with zero packages.

## Boundary confirmation

No product build, MSIX construction, certificate creation/import/removal,
signing, authority creation, attempt creation, qualification evidence
publication or Stage 4 execution occurred. Accepted R2, Stage 3 R9 and all
historical evidence remain unchanged.
