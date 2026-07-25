# SPRINT 29 PLAN — SECURE DESKTOP OPERATIONS AND DISTRIBUTION

**Status:** Complete, locally certified, Founder-accepted and closed;
clean-machine certification deferred
**Approved option:** Option A — Windows-native governed MSIX distribution
**ADR:** ADR-046
**Migration:** None
**Deployment:** Not authorised
**External distribution:** Not authorised

---

# Objective

Prove locally that Oracle can be packaged, signed with an isolated test
identity, installed, updated, repaired, rolled back and uninstalled safely on
Windows without claiming production publisher trust or public release
readiness.

# Permanent Distinctions

- Packaged does not mean published.
- Locally signed does not mean production trusted.
- Locally certified does not mean externally distributed.
- Release mechanics proven does not mean production release authorised.

Local test signing proves packaging and distribution mechanics only. It never
grants production trust, operational certification, deployment or external
distribution authority.

# Governing Boundaries

- ADR-040 through ADR-046 remain mandatory.
- The signed immutable Release Manifest is the canonical distribution
  contract.
- The runtime composition manifest remains the canonical runtime contract.
- Windows package deployment owns installation, replacement, repair and
  removal.
- The Electron main process owns only transient update coordination.
- Renderers remain presentation-only and receive no installer, process,
  filesystem, URL or signing authority.
- Release builds execute only packaged renderer/server code and communicate
  only with allowlisted HTTPS Service endpoints.
- Runtime persistence and persisted producers and consumers remain disabled.
- No production signing, hosting, publication, distribution, deployment,
  migration, Gate C or remote push is authorised.

# Delivery Phases

## Phase 1 — Release contract and threat model

1. Record the Founder decision and accept ADR-046.
2. Inventory every packaged executable, helper, renderer/server asset and
   local state location.
3. Define the immutable Release Manifest schema and canonical serialization.
4. Define `beta` and `stable` channel isolation and rollback rules.
5. Define disposable test identity generation and destruction.
6. Record the signing, update, downgrade, helper-substitution, secret,
   uninstall and false-claim threat model.

Exit: accepted ADR, plan, release schema and threat-model tests.

## Phase 2 — Least-privilege packaged runtime

1. Build Next.js standalone output for the packaged Desktop.
2. Bundle immutable standalone, static and public assets with Electron.
3. Start the packaged server only on loopback using an ephemeral port.
4. Load only the exact instance-owned loopback origin.
5. Enable renderer sandboxing, context isolation and disabled Node
   integration.
6. Enforce navigation, window creation, permission and IPC sender policies.
7. Package native helpers without projecting paths or handles.
8. Verify no `.env` file or trusted credential enters an artifact.

Exit: a reproducible unsigned application payload that starts locally and
retains Desktop Platform API v1 and Guidance v1.

## Phase 3 — Release construction and integrity

1. Create the Windows x64 MSIX manifest and required assets.
2. Construct the payload reproducibly from approved build outputs.
3. Generate a CycloneDX SBOM and SLSA-shaped local provenance statement.
4. Generate native-helper and payload hashes.
5. Produce and sign the canonical Release Manifest.
6. Generate an isolated self-signed test certificate in a disposable
   directory.
7. Sign executable artifacts and the MSIX with the test identity.
8. Mechanically verify package contents, signatures, hashes, identity,
   channel, version, provenance, SBOM and runtime manifest against the Release
   Manifest.
9. Destroy exported test-key material after certification.

Exit: a locally test-signed MSIX whose artifacts exactly equal the declared
Release Manifest.

## Phase 4 — Update, repair, rollback and uninstall

1. Implement the instance-owned Desktop Update Coordinator.
2. Add immutable renderer-safe update state and bounded controls without
   changing Desktop Platform API v1.
3. Coordinate observation invalidation, Companion detach, shutdown and fresh
   runtime construction.
4. Verify successful same-channel update.
5. Reject invalid signatures, hashes, identities, channels and arbitrary
   downgrades.
6. Verify failed-update recovery and package repair.
7. Verify only an explicitly authorised signed rollback target.
8. Verify uninstall removes binaries, caches, transient diagnostics and the
   local encrypted credential vault without deleting Operator identity.

Exit: deterministic local lifecycle evidence for every authorised and
prohibited path.

## Phase 5 — Disposable clean-machine certification

1. Create a disposable Windows certification environment or record the exact
   unavailable prerequisite without weakening evidence.
2. Trust only the Sprint-local test root inside that environment.
3. Install and verify the visible test publisher identity.
4. Start Oracle, exercise the bounded Desktop journey and inspect sandbox,
   process, network and secret boundaries.
5. Update, induce failure, repair, roll back and uninstall.
6. Prove no artifact remains installed and no production identity was used.
7. Record any environment limitation honestly.

Exit: clean-machine local evidence or an explicit operational-certification
deferral with affected claims disabled.

## Phase 6 — Full certification and Founder review

1. Run TypeScript, lint, production Web build, Electron compile and native
   helper builds.
2. Run architectural, runtime-manifest, release-manifest, security, secret,
   SBOM, provenance and lifecycle verification.
3. Confirm Migrations 009–014 are unchanged and no Migration 015 exists.
4. Confirm production, persistence, Gate C and Minecraft status are unchanged.
5. Reconcile living programme and implementation documentation.
6. Prepare the Sprint 29 Founder Acceptance Package.
7. Stop without production signing, hosting, publication, distribution,
   deployment or push.

# Definition of Done

- ADR-046 is implemented without weakening ADR-040 through ADR-045.
- One reproducible Windows x64 MSIX is generated from declared inputs.
- The test identity is explicit, isolated, disposable and unmistakably
  non-production.
- Package contents mechanically equal the signed Release Manifest.
- SBOM and provenance are generated and verified.
- Renderer sandboxing and IPC/navigation/permission boundaries pass.
- Install, update, failed update, repair, authorised rollback, downgrade
  rejection and uninstall pass locally.
- Clean-machine evidence and limitations are truthful.
- No production secret or signing credential enters source or artifacts.
- No production publication, distribution, deployment or push occurs.

# Stop Conditions

Stop and return for Founder review if implementation requires:

- a production publisher identity or signing credential;
- managed signing, hosting, Store or external distribution;
- a change to the External Companion trust boundary;
- Guidance v2 or Desktop Platform API v2;
- a migration, persistence or retention;
- a weakening of manifest verification or renderer isolation; or
- any product or security behaviour not resolved by ADR-046.
