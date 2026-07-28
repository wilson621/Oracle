# Sprint 30.5 Stage 2 Requalification R1 — Implementation

**Status:** Complete, Founder-accepted and closed
**Date:** 28 July 2026
**Accepted attempt:** `r1-20260728T190335052Z-d2ffe76a`
**Candidate and harness commit:** `cd3b7ca1a49d53d85a718a24d594267c93531994`
**Stage 3:** Unauthorised

## Outcome

The R1 harness froze and qualified the current source revision without
modifying Oracle product behaviour. It created one attempt-scoped, local-only
MSIX and reconciled that package to Runtime Manifest `1.7.0`, the signed
Release Manifest, package inventory, SBOM, provenance, candidate identity and
repository state.

The implementation remained bounded to qualification tooling. Historical
Stage 2 and Stage 3 evidence paths were deny-listed, existing attempt
destinations were create-only and every authority and attempt identity was
immutable.

## Harness implementation lineage

| Commit | Purpose |
| --- | --- |
| `5b68e7aaa170aab8440211d9dee7ee7cffb1a760` | Prepared the attempt-scoped R1 harness and retired unsafe historical entry points |
| `a1d533a2747275bc19a9dafd2a8cd3f73ddd5f6d` | Implemented the single ordered execution lifecycle |
| `ef3d34a2956b5b1c80783d6362de9ab2aa6beb1d` | Corrected PowerShell confirmation binding and temporary trust-store handling |
| `9383c3c0f5d15683b2f8a241e53a87e93c12f09e` | Made Founder authority attempt-scoped and append-only |
| `23c6358de6cb3390c520e8b9f2dd731dc37e916f` | Excluded governed artifacts from lint and made command-buffer failures deterministic |
| `5e9585974f4b17b384847c1d02aa6aeffcacc60f` | Established noninteractive temporary CurrentUser Root trust for strict Authenticode verification |
| `cd3b7ca1a49d53d85a718a24d594267c93531994` | Completed noninteractive exact-certificate teardown |

## Fail-closed attempt history

The following attempts remain immutable local engineering history:

| Attempt | Last reached state | Disposition |
| --- | --- | --- |
| `r1-20260728T163434928Z-4e4fa165` | Package and manifests signed | Failed closed during signature verification/teardown invocation; harness defect corrected |
| `r1-20260728T171701597Z-a1848647` | Candidate frozen | Failed closed during lint because generated artifacts entered lint scope and command output exceeded the default buffer; harness/configuration defect corrected |
| `r1-20260728T173416290Z-ff150ace` | Package and manifests signed | Failed closed because strict Authenticode trust was not established; harness trust defect corrected |
| `r1-20260728T183341390Z-103bc227` | Mechanical verification passed | Failed closed during PowerShell Root-store teardown; exact residual trust was removed and the harness defect corrected |
| `r1-20260728T190335052Z-d2ffe76a` | Complete awaiting Founder review | Passed and accepted as the canonical R1 attempt |

No failed attempt was retried, overwritten, deleted or promoted. Each
correction was committed before a later, separately authorised attempt.

## Accepted mechanical result

- TypeScript, lint, architecture and dependency validation passed.
- Production Web, Electron, bundled preload and native-helper builds passed.
- Runtime Manifest `1.7.0` Web/Electron equality passed.
- Package identity `Oracle.Platform.LocalCertification`, version `0.1.1.0`
  and architecture `x64` passed.
- All `2201` package entries were inventoried and reconciled.
- MSIX, Oracle executable, WindowDiscovery and WindowObserver Authenticode
  status was exactly `Valid`.
- The detached Release Manifest signature passed with the exact attempt
  signer.
- CycloneDX `1.6` SBOM and SLSA-shaped provenance bindings passed.
- Exact CurrentUser Root and My certificate teardown passed.
- Zero governed certificate matches, installed governed packages and private
  signing-material files remained.
- Evidence inventory, archive, sidecars and final manifest verification passed.

## Boundary

The implementation and accepted result are local qualification mechanics
only. No production certificate, publisher trust, package installation,
publication, distribution, deployment, release or Stage 3 action occurred.
