# Sprint 30.5 Stage 2 Requalification R1 Plan

**Status:** Founder-authorised — execution not begun
**Parent milestone:** Sprint 30.5 Production Qualification Completion
**Sequence:** Return to the beginning of Stage 2
**Historical Stage 2:** Accepted, closed and immutable
**Stage 3:** Historically attempted, incomplete, blocked and unauthorised
**Product changes:** None permitted during requalification

## Objective

Freeze one exact current-source Runtime Manifest `1.7.0` Oracle qualification
candidate and produce a mechanically reconciled local Windows MSIX without
changing product behaviour, altering the immutable Sprint 29 package or
rewriting the historical Stage 2 qualification.

The permanent identity of this cycle is:

`Sprint 30.5 Stage 2 Requalification R1`

Requalification R1 proves candidate identity and package reconciliation only.
It does not perform clean Windows, live Auth, protected rendering,
installed-package GPU, performance, accessibility, reproducibility or final
integrated qualification.

## Prerequisites

1. The repository is on `sprint-9-overlay` with a clean working tree.
2. Governance closure commit
   `eac4f5180c7daca42355f4d2688e6c093b220345` is present.
3. Current implementation commit
   `6113565765a95b990415b6cdf2f2f1d7ff3e83c8` is present.
4. Stage 1 remains Founder-accepted and closed.
5. Historical Stage 2 documentation, evidence and frozen hashes verify
   unchanged.
6. The immutable Sprint 29 package and certification verify unchanged.
7. The Founder has authorised governance activation of Requalification R1.
8. The Founder separately confirms the exact package identity and version,
   local package construction and isolated temporary test signing before those
   actions occur.
9. No matching temporary signing certificate or trust exists before execution.
10. Production signing, publisher registration, publication, distribution,
    deployment, remote push and every later qualification stage remain
    unauthorised.

## Preservation boundary

The following historical roots are immutable and must never be overwritten,
removed, regenerated or reused as output:

- `docs/sprints/evidence/sprint-30-5/stage-2/`;
- `.artifacts/sprint-30-5/stage-2/`;
- every original Stage 2 plan, implementation, qualification and closure
  record; and
- every Stage 3 historical, recovered-evidence and reconciliation record.

Requalification R1 must use fresh create-only roots:

- `.artifacts/sprint-30-5/stage-2-requalification/<run-id>/`; and
- `docs/sprints/evidence/sprint-30-5/stage-2-requalification/`.

Every generated record must contain the permanent Requalification R1 identity
and its unique run identifier.

## Execution

### 1. Governance and historical preflight

- verify branch, HEAD and clean repository state;
- verify the Founder invalidation decision and this plan;
- verify Stage 1 closure;
- verify the historical Stage 2 archive, MSIX, Release Manifest and committed
  evidence hashes;
- verify the immutable Sprint 29 package;
- verify Stage 3 remains blocked and no Stage 3 action is included; and
- verify no existing Requalification R1 output would be overwritten.

### 2. Harness safety preparation

- inspect the Stage 2 builder, verifiers, certificate cleanup and evidence
  generators;
- replace historical output targets with the fresh Requalification R1 roots;
- enforce create-only evidence and fail on any existing destination;
- prevent deletion or replacement of historical Stage 2 artifacts;
- bind every output to Requalification R1 and the approved source revision;
- validate scripts and contracts without building, packaging or signing; and
- stop for review before execution.

Harness preparation must be committed from a clean repository before candidate
freeze. It may not change product behaviour or package content except where the
already-approved current source requires the corrected preload and native
helper outputs.

### 3. Founder pre-execution gate

Present for explicit confirmation:

- exact candidate source commit and tree;
- package identity, version and release identifier;
- Requalification R1 run identifier and output roots;
- packaging and verification tool hashes;
- proposed temporary signing subject and certificate lifetime;
- certificate-store and private-key cleanup procedure; and
- complete expected evidence set.

No package construction or certificate action may occur before confirmation.

### 4. Source baseline

Run the complete baseline:

- TypeScript semantic validation;
- lint;
- production Web build;
- Electron compilation with the sandbox-compatible bundled preload;
- native WindowDiscovery and WindowObserver builds;
- architecture and dependency-cycle audits; and
- Runtime Manifest `1.7.0` Web/Electron equality.

Any failure stops Requalification R1 before candidate freeze.

### 5. Candidate freeze

Freeze immutable bindings for:

- repository source commit and tree;
- product source;
- Runtime Manifest `1.7.0`;
- `package.json`, `package-lock.json` and dependency versions;
- Migrations 009–014;
- preload and native-helper sources and build tools;
- Stage 2 packaging and verification tools;
- SBOM inputs;
- package template; and
- release-environment configuration.

Any product-source correction after this point invalidates the candidate and
requires another return to the beginning of Stage 2.

### 6. Local package construction and test signing

- build the standalone Web runtime;
- build the Electron runtime and bundled preload;
- build the native helpers;
- construct the local-only Electron layout and MSIX;
- create a new isolated temporary local test-signing identity;
- sign only the governed local candidate artifacts; and
- keep all private signing material on the development PC.

The package must remain local, uninstalled, unpublished, undistributed and
undeployed.

### 7. Manifest, SBOM and provenance

Generate:

- qualification-candidate record;
- versioned Release Manifest;
- detached Release Manifest signature;
- CycloneDX `1.6` SBOM;
- SLSA-shaped provenance;
- package-content inventory; and
- release-build summary.

### 8. Mechanical verification

Verify:

- Runtime Manifest / Release Manifest reconciliation;
- MSIX identity, publisher, version, architecture and executable;
- every package-content path, size and SHA-256;
- absence of undeclared or forbidden content;
- every Release Manifest artifact size and SHA-256;
- native-helper and executable signatures;
- package signature;
- detached Release Manifest signature;
- SBOM contents and dependency binding;
- provenance source, dependency and MSIX bindings;
- immutable Sprint 29 package equality; and
- historical Stage 2 evidence preservation.

Any divergence fails closed.

### 9. Teardown

- remove temporary public-certificate trust;
- remove every exact matching certificate-store entry;
- destroy the temporary private key, PFX and exported certificate;
- verify zero matching entries across governed stores; and
- verify no key, PFX, CER or PEM remains in governed work or artifact roots.

Any residue fails Requalification R1 and blocks acceptance.

### 10. Evidence freeze

Create:

- Stage 2 Requalification R1 certification;
- evidence index;
- frozen-evidence record;
- immutable local evidence archive and SHA-256;
- sidecars and sidecar-verification result;
- final repository-state checkpoint; and
- final certificate-store checkpoint.

Large package and archive artifacts remain in governed Git-ignored local
storage. Only bounded evidence records approved for repository preservation may
enter Git.

### 11. Founder review and closure

Present the complete evidence without claiming Stage 2 acceptance.

Requalification R1 remains incomplete until the Founder:

1. independently reviews the evidence;
2. accepts or rejects the candidate;
3. authorises closure documentation; and
4. separately authorises a local closure commit.

Stage 3 remains blocked after Stage 2 acceptance unless separately and
explicitly authorised.

## Expected evidence

- candidate preflight;
- source-baseline result;
- qualification-candidate record;
- local MSIX and SHA-256;
- Release Manifest, detached signature and SHA-256;
- package-content inventory;
- signature and trust verification;
- native-helper hash and signature evidence;
- CycloneDX SBOM;
- SLSA-shaped provenance;
- signing-store cleanup;
- Sprint 29 immutability verification;
- historical Stage 2 preservation verification;
- Requalification R1 certification;
- evidence index;
- frozen-evidence record;
- immutable evidence archive and SHA-256;
- sidecar verification;
- final repository and certificate-store checkpoints;
- implementation report;
- Founder qualification package; and
- closure record only after Founder acceptance.

## Stop conditions

Stop immediately if:

- the repository is not clean or the approved commits are absent;
- historical evidence or artifacts differ;
- an output path already exists;
- Runtime Manifest equality fails;
- product source changes after freeze;
- package or Release Manifest content diverges;
- signing or trust escapes the declared boundary;
- certificate or private-key residue remains;
- an architectural, security, trust, migration or product decision is needed;
- Stage 3 or later-stage work would be required; or
- missing evidence would need to be inferred or represented as passed.

Failed artifacts remain local, untrusted, unpublished and undistributed.

## Authority boundary

Governance activation of Requalification R1 is Founder-authorised.

Package construction and isolated temporary test signing remain behind the
explicit pre-execution Founder gate. Production signing, publication,
distribution, deployment, release, Stage 3, Stage 4, Gate 7, Sprint 31 and
Beta are not authorised.
