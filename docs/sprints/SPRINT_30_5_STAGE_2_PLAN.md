# Sprint 30.5 Stage 2 — Candidate Freeze and Package Reconciliation Plan

**Status:** Founder-authorised — execution in progress
**Parent milestone:** Sprint 30.5 Production Qualification Completion
**Sequence:** Stage 2 of 7; Stage 1 is Founder-accepted and closed
**Estimated duration:** 1–2 engineering days

## Objective

Freeze one exact Runtime Manifest `1.7.0` Oracle qualification candidate and
produce a mechanically reconciled local Windows MSIX package without changing
product behaviour or modifying the immutable Sprint 29 package.

This stage proves candidate identity and package reconciliation. It does not
perform clean Windows, live Auth, protected rendering or installed-package GPU
qualification.

## Prerequisites

1. Stage 1 closure commit exists and the repository is clean.
2. The Founder explicitly authorised Stage 2.
3. The Founder separately authorised:
   - construction of a new local qualification package reconciled to Runtime
     Manifest `1.7.0`; and
   - isolated local test signing using a temporary test identity.
4. Production signing, publisher identity, publication, distribution,
   deployment and remote push remain unauthorised.

## Execution

1. Verify the active branch, clean worktree and accepted Stage 1 closure.
2. Run the complete source baseline required to freeze the candidate:
   TypeScript, lint, production Web build, Electron compilation, architecture,
   dependency cycles and Runtime Manifest equality.
3. Freeze immutable hashes for:
   - repository source commit;
   - product source;
   - Runtime Manifest `1.7.0`;
   - package lock and dependency versions;
   - Migrations 009–014;
   - packaging tools;
   - SBOM inputs; and
   - release-environment configuration.
4. Create a new versioned Release Manifest for the Stage 2 qualification
   candidate. Do not edit or rebuild the immutable Sprint 29 package.
5. Build the local Windows MSIX from the frozen candidate.
6. Create and use an isolated temporary local test-signing identity.
7. Mechanically verify:
   - Runtime Manifest / Release Manifest reconciliation;
   - constructed package contents against the Release Manifest;
   - package signature;
   - SBOM;
   - provenance;
   - hashes; and
   - absence of undeclared content.
8. Remove temporary certificate trust and destroy private signing material.
9. Freeze the Stage 2 artifacts and evidence.
10. Produce the Stage 2 evidence report and local completion commit, then stop.

## Deliverables

- Stage 2 qualification-candidate record
- reconciled Runtime Manifest `1.7.0` Release Manifest
- local MSIX and SHA-256
- package-content equality result
- local signature-verification evidence
- SBOM and provenance
- temporary test-signing creation, trust and destruction evidence
- Stage 2 evidence index
- Stage 2 progress report
- exact local Stage 2 completion commit

## Stop / go review

Stage 2 stops after verification and its local commit. Stage 3 may not begin
until the Founder independently reviews and accepts the Stage 2 evidence and
separately authorises Stage 3.

## Rollback and invalidation

- Any product-source correction after candidate freeze invalidates the
  candidate and requires a return to the beginning of Stage 2.
- Any Runtime Manifest, Release Manifest, constructed-runtime or package
  divergence fails Stage 2.
- Any signing-material or trust residue fails teardown and blocks acceptance.
- Any architecture, trust-boundary, security-policy, migration or product
  decision stops Stage 2 for separate Founder authority.
- Failed artifacts remain local, untrusted, unpublished and undistributed.

## Authority granted

The Founder explicitly authorised:

1. **Sprint 30.5 Stage 2 execution**; and
2. **Runtime Manifest `1.7.0` package reconciliation and isolated local
   test-signing**.

No new ADR is currently required. Discovery of an architectural or
trust-boundary change would stop the stage.

## Authority not requested

Stage 2 does not request production signing, publisher registration, managed
signing, publication, external distribution, deployment, production
persistence, migrations, Gate C, Gate 7, Sprint 31, Beta or release.
