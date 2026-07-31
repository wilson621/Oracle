# Sprint 30.5 Stage 2 Requalification R3 — Preparation Plan

**Status:** Historical plan; qualification passed, Founder-accepted and formally closed
**Identity:** `Sprint 30.5 Stage 2 Requalification R3`
**Scope:** Corrected current-source candidate freeze and package reconciliation
**Candidate:** `a7fc67f207d9c95407c70812828fa66bd487285d`
**Candidate tree:** `356f6d52f1bf70065692e892af8bf916acc8727a`
**Stage 4:** Execution not authorised

## Objective

Prepare one governed R3 lifecycle capable of qualifying the exact corrected
product baseline after the Migration 011 and Migration 012 pgcrypto schema
corrections. R2 remains accepted, closed and immutable, and Stage 3 R9 remains
accepted, closed and immutable. R3 is a new qualification revision; it does not
rewrite either historical outcome.

## Candidate and harness model

The qualified candidate is fixed by the contract to the commit and tree above.
The future R3 harness commit is separately bound at execution to repository
HEAD. The candidate must be an ancestor of the harness, and Git must prove no
change between candidate and harness commits under any governed product or
packaging path. The R3 preparation therefore does not modify `package.json` or
any product input.

The corrected migrations are additionally bound as:

- `database/011_operator_account_provisioning.sql` SHA-256
  `dff827ce532a062fdc3aa93df08eba4628e004b46e9233005325f443e8429928`;
- `database/012_operator_identity_lifecycle.sql` SHA-256
  `e64213123ff2b75b12c293d79380cc43dc9028dd56f503330aac9f5d97442c73`.

## Authority and immutable identity

Preparation authority cannot create an R3 authority or attempt. A later
Founder decision must grant exactly one execution using the token
`FOUNDER-AUTHORISED-STAGE-2-R3-SINGLE-ATTEMPT` and one matching pair:

- authority: `authority-r3-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx`;
- attempt: `r3-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx`.

The timestamp is canonical UTC with millisecond precision. Existing authority,
attempt, artifact or evidence identities are rejected. The single executor
contains the ordered lifecycle; no execution phase is independently exposed.

## Package and certificate contract

- identity: `Oracle.Platform.LocalCertification`;
- version: `0.1.1.0`;
- semantic version: `0.1.1`;
- architecture: `x64`;
- Runtime Manifest: `1.7.0`;
- publisher:
  `CN=Oracle Stage 2 Requalification R3 Local Test Signing - NOT PRODUCTION`;
- package:
  `Oracle_0.1.1.0_x64_STAGE2_REQUALIFICATION_R3_LOCAL_TEST_ONLY.msix`;
- signing classification: isolated local-test-only;
- production trust: false;
- certificate lifetime: at most 30 calendar days, with at least 29 days
  remaining immediately after creation;
- cleanup selection: exact thumbprint only.

The 30-day budget is the proven bounded R2 model and is sufficient for Stage 2
execution, independent reconciliation, Founder acceptance and closure. Stage 4
qualifies the frozen Web source against a disposable provider and does not use
this signer or MSIX as its runtime input; R3 certificate validity must not be
misrepresented as Stage 4 authority or admission.

## Namespaces

- artifacts:
  `.artifacts/sprint-30-5/stage-2-requalification-r3/<attempt-id>/`;
- repository evidence:
  `docs/sprints/evidence/sprint-30-5/stage-2-requalification-r3/<attempt-id>/`.

Every destination is create-only, attempt-scoped, non-reusable and protected
against traversal, symlinks, junctions and reparse points. Historical Stage 2,
R1, R2 and Stage 3 roots are deny-listed. Accepted R2 and Stage 3 archives,
final manifests and closure records are rehashed before authority consumption.

## Governed lifecycle

1. Validate the exact Founder token and all supplied identities.
2. Validate branch, harness HEAD, exact candidate commit/tree, ancestry,
   candidate-to-harness product equality, clean repository and index.
3. Validate machine, locked toolchain, package identity, certificate/package
   absence and immutable historical bindings.
4. Atomically claim one unique authority and create one unique attempt root.
5. Freeze exact candidate, harness and governed product inventories.
6. Run TypeScript, lint, architecture and dependency validation.
7. Build production Web, Electron, bundled preload and native helpers.
8. Verify Runtime Manifest equality and source/input non-drift.
9. Construct and fully inventory the local-test MSIX.
10. Create one R3 certificate and bind its exact subject, thumbprint, validity,
    private-key state and raw bytes.
11. Sign the package, executables and Release Manifest; generate SBOM and
    provenance.
12. Require strict Authenticode `Valid`, exact signer identity, detached CMS,
    package inventory and artifact reconciliation.
13. Remove temporary Root trust and signing certificate by exact thumbprint,
    destroy PFX/CER/password/private material and require zero residue.
14. Inventory expected evidence and reject missing or unexpected files.
15. Freeze evidence create-only, create and verify archive plus sidecar, publish
    the final evidence manifest and record final repository/machine checkpoints.
16. Stop at `complete-awaiting-founder-review`.

## Failure model

The first failure stops forward execution. There is no automatic retry,
resumption or second attempt. After certificate mutation, only the governed
exact-thumbprint safety teardown may continue. The original failure, command
stdout/stderr/status/signal/process error, teardown result and residue remain
visible. A failed attempt is immutable and cannot be promoted or reused.

## Success and governance boundary

R3 passes only when every source, build, package, manifest, signature, SBOM,
provenance, teardown, evidence, archive and final checkpoint assertion passes
affirmatively with zero residue. A pass remains subject to independent evidence
review, Founder acceptance and a separate closure operation.

R3 grants no Stage 4 execution, production signing, publication, distribution,
deployment or release authority.
