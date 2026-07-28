# Sprint 30.5 Stage 2 Requalification R2 — Candidate Refresh Plan

**Status:** Founder-authorised and active
**Identity:** `Sprint 30.5 Stage 2 Requalification R2`
**Scope:** Replacement current-source Candidate Freeze and Package
Reconciliation
**Stage 3:** Blocked and unauthorised

## Objective

Create and mechanically qualify one new current-source local-test-only MSIX
whose signing validity safely supports the remaining Stage 3 lifecycle.
Preserve R1 and every historical Stage 2 and Stage 3 record unchanged.

## Immutable identity model

Each execution requires:

- programme identity and revision `R2`;
- unique authority ID `authority-<attempt-id>`;
- unique attempt ID `r2-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx`;
- canonical UTC timestamp matching the attempt ID;
- candidate and harness commits and trees;
- machine identity and toolchain;
- product-source inventory and hash;
- package, Runtime Manifest and Release Manifest identities;
- exact signer subject, thumbprint and validity;
- output and repository-evidence namespaces;
- lifecycle state and stop reason;
- evidence manifest and final evidence hash.

Existing authority, attempt, artifact or evidence paths fail closed.

## Candidate contract

- Package identity: `Oracle.Platform.LocalCertification`
- Package version: `0.1.1.0`
- Semantic version: `0.1.1`
- Architecture: `x64`
- Runtime Manifest: `1.7.0`
- Publisher:
  `CN=Oracle Stage 2 Requalification R2 Local Test Signing - NOT PRODUCTION`
- Package:
  `Oracle_0.1.1.0_x64_STAGE2_REQUALIFICATION_R2_LOCAL_TEST_ONLY.msix`
- Signing classification: isolated local-test-only
- Production trust: false
- Certificate maximum lifetime: 30 calendar days
- Certificate cleanup: exact-thumbprint-only

## Attempt namespaces

- Artifacts:
  `.artifacts/sprint-30-5/stage-2-requalification-r2/<attempt-id>/`
- Repository evidence:
  `docs/sprints/evidence/sprint-30-5/stage-2-requalification-r2/<attempt-id>/`

Both namespaces are create-only, attempt-scoped, non-reusable and protected
from traversal, symlinks, junctions and reparse points. R1 and historical
Stage 2 and Stage 3 roots are immutable deny-listed inputs.

## Execution sequence

1. Validate Founder authority, branch, HEAD, tree, ancestry, clean repository,
   machine, toolchain, package identity, installed-package state, certificate
   stores and historical evidence.
2. Claim one immutable authority and attempt identity.
3. Freeze candidate, harness and product-source identities.
4. Run TypeScript, lint, architecture and dependency validation.
5. Build production Web, Electron, bundled preload and native helpers.
6. Verify Runtime Manifest `1.7.0` equality and source/input non-drift.
7. Construct the local-test-only MSIX and complete package inventory.
8. Create one bounded R2 local-test certificate.
9. Bind package, executable, native-helper and Release Manifest signatures to
   its exact thumbprint.
10. Generate and reconcile Release Manifest, SBOM and provenance.
11. Require strict Authenticode `Valid`, exact signer identity, detached CMS,
    package contents and artifact bindings.
12. Remove temporary Root trust and the signing certificate by exact
    thumbprint; destroy every private signing artifact.
13. Require zero certificate, trust, package and private-material residue.
14. Inventory expected evidence and reject missing or unexpected output.
15. Freeze evidence create-only, create and verify the archive and sidecar,
    publish the final evidence manifest and record terminal checkpoints.
16. Stop for independent review and Founder acceptance.

## Failure and interruption

No automatic retry or second attempt is permitted inside one execution.
Failure stops forward qualification. If certificate or trust state exists,
only the governed exact-thumbprint safety teardown may continue.

The original failure, command evidence, teardown result and residual state
must remain visible. A failed attempt is immutable and cannot be resumed,
promoted or overwritten.

## Acceptance criteria

R2 execution passes only when every source, build, package, manifest,
signature, SBOM, provenance, teardown, evidence, archive and repository
binding passes with no inferred result and no residue.

A passing execution remains `awaiting-founder-review`. Engineering cannot
accept or formally close R2.

## Authority boundary

R2 creates no Stage 3 authority. It does not approve a transfer medium,
transfer the package, install on the clean host, create production trust,
publish, distribute, deploy or release Oracle.
