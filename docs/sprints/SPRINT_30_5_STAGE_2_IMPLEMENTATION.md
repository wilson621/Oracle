# Sprint 30.5 Stage 2 — Candidate Freeze and Package Reconciliation

**Status:** Founder-accepted and closed
**Date:** 26 July 2026
**Candidate source commit:** `d850743977735929f6873457fe122d2cf9697d9e`
**Runtime Manifest:** `1.7.0`
**Stage 3:** Not started and not authorised

## Outcome

Stage 2 froze one exact source candidate and constructed a new local-only
Windows MSIX whose signed Release Manifest declares Runtime Manifest `1.7.0`.
The immutable Sprint 29 package and its `1.6.0` contract were not edited,
rebuilt or resigned.

The Stage 2 candidate is:

- package `Oracle_0.1.1.0_x64_STAGE2_LOCAL_TEST_ONLY.msix`;
- package version `0.1.1.0`;
- SHA-256
  `00b045996e8a7e90400ce3208b2ab36bacccf48831a6ab770827f2ecd6e45276`;
- local-test signer
  `CN=Oracle Stage 2 Local Test Signing - NOT PRODUCTION`; and
- unpublished, undistributed, undeployed and not installed.

## Mechanical qualification

- Web and Electron Runtime Manifest `1.7.0` equality passed.
- Runtime Manifest / Release Manifest reconciliation passed.
- The Release Manifest detached CMS signature is cryptographically valid.
- Every Release Manifest artifact size and SHA-256 matches.
- The MSIX unpacked successfully and its package identity, publisher,
  architecture, executable and version match the declared contract.
- All 2,201 package-content entries were inventoried and hash-bound.
- No environment file, certificate, private key, PEM or PFX exists in the
  package.
- CycloneDX `1.6` SBOM and SLSA-shaped provenance passed.
- Migrations 009–014 remain unchanged and hash-bound to the candidate.

## Fail-closed teardown correction

The first final verification correctly stopped because the Windows packaging
tool had placed the temporary signer, including its private key, in the
elevated build context's `CurrentUser\My` certificate store. The PFX and
exported CER files had already been removed, but store residue is forbidden.

The exact Stage 2 identity was removed. The builder now performs explicit
exact-subject certificate-store teardown after every build, including failure
paths. Verification temporarily trusted only the public certificate derived
from the signed executable, verified the MSIX, then removed that trust and
every matching certificate-store entry.

The final elevated-context audit reports:

- private signing material retained: no;
- exported certificate retained: no;
- matching certificate-store entries: zero; and
- temporary verification trust retained: no.

The accepted Sprint 29 MSIX still has SHA-256
`cf8b71dc83d5b51410a385b8be92bf9e1368d02d1170ef1694308a68157313a3`,
exactly matching its committed certification record. Its historical generic
verifier cannot compare the old provenance package-lock hash to the evolved
current source lock; Stage 2 therefore verifies immutability directly against
the accepted package hash rather than rewriting Sprint 29 provenance.

No product source, runtime architecture, security boundary, trust boundary,
migration or production behaviour changed. The frozen product candidate
therefore remains the exact `d850743` source candidate; only qualification
teardown tooling was corrected.

## Boundaries preserved

Local test signing proves packaging and distribution mechanics only. It does
not establish production publisher trust, release readiness, operational
certification, deployment authority or external distribution permission.

No production signing, publisher registration, publication, distribution,
deployment, remote push, migration execution, runtime persistence, Gate C,
Gate 7, Sprint 31, Beta or Stage 3 activity occurred.
