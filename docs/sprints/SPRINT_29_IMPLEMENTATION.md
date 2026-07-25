# SPRINT 29 IMPLEMENTATION — SECURE DESKTOP OPERATIONS AND DISTRIBUTION

**Status:** Source implementation complete
**Date:** 25 July 2026
**ADR:** ADR-046
**Deployment:** Not authorised
**External distribution:** Not authorised

---

# Delivered

- Next.js standalone production output is bundled into the Electron payload
  with static and public assets; no separately started development server is
  required.
- The packaged renderer server binds only to an ephemeral loopback port. When
  the approved public Service configuration is absent, the package presents a
  static fail-closed local-certification notice instead of inventing an
  operational product state.
- Electron enables sandboxing before readiness. Renderer Node integration is
  disabled, context isolation is enabled, navigation and redirect origins are
  allowlisted, new windows and webviews are denied, permissions are denied and
  every IPC invocation validates both the owning WebContents and frame origin.
- Desktop release state is a separate renderer-safe additive contract. Desktop
  Platform API v1 and Guidance v1 remain unchanged.
- The instance-owned Desktop Update Coordinator validates local beta
  eligibility, exposes no installer path, URL, certificate, filesystem,
  process or arbitrary execution authority, and fails inactive while release
  hosting remains unauthorised.
- Governed replacement ordering invalidates observation, detaches the
  Companion and stops the runtime before package replacement. Recovery occurs
  through a fresh process and fresh runtime construction.
- The immutable signed Release Manifest declares package identity, publisher,
  semantic and package versions, channel, architecture, runtime composition
  manifest `1.6.0`, artifact hashes, explicit rollback targets, SBOM,
  provenance and non-production signing status.
- Windows x64 baseline `0.0.9.0` and candidate `0.1.0.0` MSIX packages are
  constructed from the same approved payload for lifecycle certification.
- Oracle.exe and both native helpers are Authenticode-signed with the explicit
  two-day `CN=Oracle Local Test Signing - NOT PRODUCTION` identity. The MSIX
  and detached Release Manifest are signed by the same isolated identity.
- A CycloneDX 1.6 SBOM and SLSA-shaped local provenance statement are
  generated. Mechanical verification unpacks the MSIX and compares all
  declared artifact sizes and SHA-256 hashes.
- Exported private test-signing material is deleted immediately after release
  construction. The committed source and retained local outputs contain no
  PFX, PEM, private key or environment file.
- The lifecycle harness temporarily trusts only the two-day public test
  certificate, then proves install, invalid-signature rejection, update,
  packaged startup, repair, authorised rollback, uninstall and complete trust
  cleanup.

# Permanent Local-Signing Distinction

> **Local test signing proves packaging and distribution mechanics only. It
> must never be interpreted as production publisher trust, public release
> readiness, operational certification, deployment authority or permission to
> distribute Oracle externally.**

Packaged does not mean published. Locally signed does not mean production
trusted. Locally certified does not mean externally distributed. Release
mechanics proven does not mean production release authorised.

# Architecture and Runtime State

- ADR-046 is accepted and implemented.
- ADR-040 through ADR-045 remain unchanged.
- Runtime composition did not change; Web and Electron remain exactly on
  manifest `1.6.0`.
- No Service, Application, Game Integration, Guidance provider or lifecycle
  classification changed.
- No migration was introduced.
- Runtime persistence and persisted producers and consumers remain disabled.
- Production, Gate C, Minecraft certification and the External Companion trust
  boundary remain unchanged.

# Operational Limitation

Current-host lifecycle mechanics passed. A disposable clean Windows machine
was not available because this Windows Home workstation has neither Windows
Sandbox nor another configured disposable Windows VM.

**Clean-Machine Certification Deferred — Required Disposable Windows
Environment Unavailable**

This is not a successful clean-machine test and is not production
qualification. It does not weaken the completed source, artifact-integrity or
current-host lifecycle evidence.
