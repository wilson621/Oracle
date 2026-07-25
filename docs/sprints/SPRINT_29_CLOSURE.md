# SPRINT 29 CLOSURE — SECURE DESKTOP OPERATIONS AND DISTRIBUTION

**Status:** Founder-accepted and closed
**Closed:** 25 July 2026
**ADR:** ADR-046 — Windows Desktop Distribution, Release Integrity and Update Authority
**Deployment:** Not authorised
**External distribution:** Not authorised

---

# Founder Decision

The Founder accepted the Sprint 29 implementation, architecture, certification
evidence and recommended closure on 25 July 2026.

ADR-046 is permanent Oracle architecture. The Runtime Manifest and Release
Manifest remain separate canonical contracts. The immutable signed Release
Manifest is the canonical distribution contract.

# Accepted Outcomes

- Windows-native MSIX packaging is implemented.
- Package integrity, signature verification, SBOM, provenance and Release
  Manifest equality are certified.
- Current-host install, invalid-signature rejection, update, packaged startup,
  repair, declared rollback, uninstall and cleanup are certified.
- Temporary local certificate trust, package registration and signing material
  were removed after certification.
- Local test signing remains proof of packaging and distribution mechanics
  only. It is not production publisher trust, public release readiness,
  operational certification, deployment authority or permission to distribute
  Oracle externally.
- Runtime manifest `1.6.0` remains mechanically equal across Web and Electron.

# Independent Deferred Milestone

**Clean-Machine Certification Deferred — Required Disposable Windows
Environment Unavailable**

The current Windows Home workstation provides no Windows Sandbox and no
configured disposable Windows VM was available. This is an
operational-environment limitation, not an engineering failure.

The deferral does not claim or authorise clean-machine certification,
production readiness, production publisher trust, publication, distribution,
deployment or activation. Clean-machine evidence may be added later using the
committed Sprint 29 package and lifecycle harness in an authorised disposable
Windows environment without reopening or rewriting Sprint 29 history.

# Preserved Boundaries

- Production remains unchanged.
- Migration 009 remains the only deployed migration.
- Migrations 010–014 remain certified, undeployed and inactive.
- No Migration 015 exists.
- Runtime persistence remains disabled.
- Persisted producers and consumers remain disabled.
- Gate C remains deferred.
- Minecraft remains `provisionally-certified`, with observation disabled and
  operational certification deferred.
- No production signing, publisher identity, managed signing, Store
  submission, hosting, publication, external distribution, deployment or
  remote push is authorised.
- No captured-content retention, AI or renderer authority over Oracle truth,
  Guidance v2, Desktop Platform API v2, External Companion trust-boundary
  change or weakening of ADR-040 through ADR-046 is authorised.

# Closure Result

Sprint 29 is closed as the engineering and current-host
distribution-mechanics Sprint. Its accepted evidence remains bounded to what
was actually tested. The clean-machine limitation remains explicit and cannot
be converted into a passed qualification claim.

Sprint 30 is not activated by this closure. Only its Founder Decision Package
may now be reviewed.
