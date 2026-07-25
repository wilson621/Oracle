# SPRINT 29 CERTIFICATION — SECURE DESKTOP OPERATIONS AND DISTRIBUTION

**Status:** Local source, artifact and current-host lifecycle certification
passed; clean-machine certification deferred
**Date:** 25 July 2026
**Deployment:** Not authorised
**Publication and distribution:** Not authorised

---

# Result

Sprint 29 passes the implementation, production build, release-contract,
artifact-integrity, local-signing and current-Windows-host lifecycle gates.

The separate disposable clean-machine gate remains untested because no
disposable Windows Sandbox or VM is available on the current Windows Home
workstation. No clean-machine or production-readiness claim is made.

# Release Evidence

- Candidate: `Oracle_0.1.0.0_x64_LOCAL_TEST_ONLY.msix`
- Candidate SHA-256:
  `cf8b71dc83d5b51410a385b8be92bf9e1368d02d1170ef1694308a68157313a3`
- Package identity: `Oracle.Platform.LocalCertification`
- Test publisher: `CN=Oracle Local Test Signing - NOT PRODUCTION`
- Certificate thumbprint:
  `6850342CDD851B97F35FD90F93E4B7AEF51DB1D2`
- Certificate lifetime: 25–27 July 2026 only
- Runtime composition manifest: `1.6.0`
- Release Manifest detached CMS signature: cryptographically valid
- CycloneDX SBOM: version 1.6, generated and hash-verified
- SLSA-shaped local provenance: generated and hash-verified
- Exported private test key: destroyed before verification and lifecycle tests

# Mechanical Verification Passed

- canonical Release Manifest contract and local-only trust flags;
- exact package identity, publisher, version, architecture and executable;
- unpacked MSIX contents against every declared artifact size and SHA-256;
- exactly one candidate MSIX and two declared native helpers;
- Oracle executable, both native helpers and MSIX signed by the explicit local
  test subject;
- detached Release Manifest signature;
- candidate MSIX digest in provenance;
- CycloneDX metadata and dependency inventory;
- absence of `.env`, PFX, PEM and private-key files from package contents;
- renderer sandbox, context isolation, disabled Node integration, permission
  denial, navigation denial and IPC sender-origin checks;
- fail-closed release-hosting-unavailable state;
- invalid channel and production-trust declarations rejected;
- observation invalidation, detach and runtime-stop ordering; and
- arbitrary downgrade disabled with only `0.0.9.0` declared as rollback.

# Current-Host Lifecycle Verification Passed

1. Trust the two-day test public certificate temporarily in
   `LocalMachine\Root`.
2. Install signed baseline `0.0.9.0`.
3. Reject a tampered candidate and preserve the baseline.
4. Update transactionally to signed candidate `0.1.0.0`.
5. Launch the packaged sandboxed local-certification shell.
6. Reset and repair through re-registration of the same signed candidate.
7. Roll back only to declared signed target `0.0.9.0`.
8. Uninstall the package.
9. Remove the temporary machine test root.
10. Verify no Oracle test package or test certificate remains.

# Complete Verification Status

The final repository suite also confirms:

- TypeScript: passed;
- ESLint: passed with zero warnings;
- optimized Next.js 16.2.11 production build: passed;
- Electron compile: passed;
- both self-contained Windows native helper builds: passed;
- architectural dependency audit: passed;
- Web/Electron runtime manifest equality `1.6.0`: passed;
- Sprint 19 and Sprint 27–29 focused verification: passed;
- Session, Understanding, Intelligence, development, Conversation, Guidance,
  Companion and Trust & Control suites: passed; and
- Migration 009–014 source integrity remains unchanged with no Migration 015.
- production dependency audit (`--omit=dev`): zero vulnerabilities.

The complete dependency audit reports nine high-severity
`brace-expansion` advisories only through the development ESLint plugin graph
bundled by the latest stable `eslint-config-next`. Those packages are excluded
from the packaged runtime and SBOM-required scope. The audit's forced
resolution would replace the current Next configuration with an incompatible
historical package; it was rejected. This upstream development-tooling
limitation remains visible and must be reassessed when a compatible stable
Next lint stack is released.

# Explicitly Not Proven

- a disposable clean-machine Windows install;
- production publisher trust;
- public or private external distribution;
- release hosting or Store submission;
- production deployment or operation;
- production signing or managed signing;
- an operational update feed;
- production qualification, which remains Sprint 30 scope.

# Permanent Interpretation

Local test signing proves packaging and distribution mechanics only. It must
never be interpreted as production publisher trust, public release readiness,
operational certification, deployment authority or permission to distribute
Oracle externally.
