# SPRINT 29 FOUNDER ACCEPTANCE PACKAGE

**Status:** Founder-accepted on 25 July 2026; Sprint closed
**Recommendation:** Accept and close Sprint 29 as an engineering and
current-host distribution-mechanics Sprint; retain clean-machine certification
as explicitly deferred
**Prepared:** 25 July 2026
**Deployment:** Not authorised

**Decision:** Recommendation approved. Clean-Machine Certification Deferred
remains the accepted independent programme status. See
`SPRINT_29_CLOSURE.md`.

---

# Recommendation

Accept and close Sprint 29 because ADR-046, the canonical signed Release
Manifest, the secure packaged runtime, artifact integrity and the entire
Windows host lifecycle are implemented and locally certified.

Record the independent clean-machine milestone as:

**Clean-Machine Certification Deferred — Required Disposable Windows
Environment Unavailable**

This recommendation preserves the same governance distinction Oracle already
uses elsewhere: completed engineering evidence is not converted into evidence
for an unavailable operational environment. Sprint 30 may not rely on or
represent the deferred clean-machine claim as passed.

# What Sprint 29 Conclusively Proved

- Oracle can be built as a Windows x64 MSIX from approved immutable source
  outputs without a development server.
- The package, Oracle executable and both native helpers can be signed with an
  isolated, unmistakably non-production test identity.
- The signed immutable Release Manifest mechanically equals package identity,
  package content, hashes, SBOM, provenance and runtime manifest `1.6.0`.
- A modified candidate fails Windows signature validation while the installed
  baseline remains intact.
- Windows locally performs install, transactional update, packaged startup,
  repair/reset, declared rollback and uninstall.
- Temporary machine test trust and package registration are removed after the
  test.
- Renderer, IPC, navigation, permission, observation, Companion and runtime
  shutdown boundaries remain fail-closed.
- The test key is short-lived, exported only in a disposable local directory
  and destroyed before verification.
- No production signing, hosting, publication, distribution, deployment,
  persistence, migration or Gate C action occurred.

# What Sprint 29 Did Not Prove

- installation or lifecycle behavior on a separate disposable clean Windows
  machine;
- production publisher identity or trust;
- public release readiness or operational certification;
- external release delivery or update hosting;
- Microsoft Store readiness;
- production installation, deployment or operation; or
- Sprint 30 product qualification.

# Why Clean-Machine Certification Is Deferred

The workstation runs Windows Home. Windows Sandbox is unavailable and no
separate disposable Windows VM is configured. Docker and WSL provide Linux
containers and cannot truthfully substitute for a Windows MSIX clean-machine
test.

The missing environment does not affect the completed cryptographic,
artifact-integrity or current-host Windows lifecycle evidence. It does prevent
the narrower assertion that no pre-existing machine state influenced
installation.

# Governance and Commercial Clarity

Closing the engineering Sprint with this explicit deferral creates no
architectural, commercial, safety or governance ambiguity:

- ADR-046 permanently forbids interpreting local signing as production trust
  or external-release authority.
- The package identity and publisher both say `LocalCertification` and
  `NOT PRODUCTION`.
- Release Manifest flags mechanically state that production trust, public
  release, external distribution and deployment are false.
- The generated package remains in an ignored local build directory.
- No release host, updater feed, Store identity, production credential or
  distribution path exists.
- The production dependency audit is zero. Nine high advisories remain
  confined to the latest stable Next ESLint development-plugin graph; the
  affected tooling is excluded from the packaged runtime, and the audit's
  incompatible forced downgrade was rejected and documented.
- Sprint 30 remains unable to claim complete production qualification until
  its own environment gates, including any required clean-machine exercise,
  pass.

# How Deferred Certification Can Be Completed

An authorised engineer can later create a disposable supported Windows VM,
trust only a newly generated local-test certificate inside it, run the
committed Sprint 29 builder and lifecycle harness, capture machine-provenance
evidence, and destroy the VM.

That evidence can append the outstanding clean-machine certification record
without rewriting Sprint 29 implementation history or changing ADR-046. It
grants no production signing, publication, distribution or deployment
authority.

# Architecture

- ADR-046 is accepted and implemented.
- The signed Release Manifest is the canonical distribution contract.
- ADR-040 runtime manifest `1.6.0` remains independently canonical and exact
  across Web and Electron.
- Desktop Platform API v1 and Guidance v1 remain unchanged.
- No runtime component was added or removed, so no manifest increment was
  required.
- ADR-040 through ADR-045, the External Companion trust boundary and all
  authoritative Service ownership remain unchanged.

# Repository and Programme State

- Production remains unchanged.
- Migration 009 remains the only deployed migration.
- Migrations 010–014 remain certified, undeployed and inactive.
- No Migration 015 exists.
- Runtime persistence remains disabled.
- Persisted producers and consumers remain disabled.
- Gate C remains deferred.
- Minecraft remains `provisionally-certified`; observation remains disabled.
- No production signing, hosting, publication, external distribution,
  deployment or push occurred.

# Founder Decision Requested

Approve or reject:

1. the Sprint 29 implementation and local certification evidence;
2. Sprint 29 closure as an engineering and current-host
   distribution-mechanics Sprint;
3. the explicit clean-machine certification deferral; and
4. progression to preparation of the Sprint 30 Founder Decision Package only.

No Sprint 30 implementation, production signing, hosting, distribution,
deployment or push is requested.
