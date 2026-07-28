# Sprint 30.5 Stage 2 Requalification R2 — Implementation

**Status:** Complete, Founder-accepted and formally closed
**Date:** 28 July 2026
**Passing attempt:** `r2-20260728T203503018Z-ec577cf4`
**Candidate and harness commit:** `11475fe01fff2ec69f0188547107f4e901c531d7`
**Stage 3:** Blocked and unauthorised

## Outcome

The R2 harness froze and qualified the current approved Oracle source in one
governed attempt. It created an attempt-scoped local-test-only MSIX and
reconciled that package to Runtime Manifest `1.7.0`, the signed Release
Manifest, package inventory, SBOM, provenance, candidate identity and
repository state.

R2 remains separate from the accepted and closed R1 programme. R1 evidence
and historical Stage 2 and Stage 3 evidence were deny-listed and remained
unchanged.

Comparison with the accepted R1 candidate found no change under Oracle
product-source, desktop, native-helper, database, packaging-template or
runtime-manifest paths. Of the `485` frozen product-input records, only
`package.json` changed, solely to add the three R2 harness entry points.

## Implementation lineage

| Commit | Purpose |
| --- | --- |
| `b0aefe2423e89ac8882c36cc806f391d13e369be` | Activated the Founder-authorised R2 candidate refresh and its 30-day validity budget |
| `11475fe01fff2ec69f0188547107f4e901c531d7` | Added the isolated R2 contract, attempt-scoped harness, validation and package entry points |

The R2 executor reused the proven R1 lifecycle controls in a distinct
namespace. A critical pre-execution self-review found that the first R2 draft
still requested a two-day certificate despite declaring a 30-day contract.
That defect was corrected before commit and before any R2 authority or
attempt existed. Static validation now binds the requested 30-day lifetime
and requires between 29 and 30 days remaining at certificate creation.

## Passing mechanical result

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
- Evidence inventory, archive, sidecars and final manifest verification
  passed.

## Certificate validity

The isolated attempt signer:

- has thumbprint `119937D4B90068ACE8765695C5A94321A2C40BD8`;
- has subject
  `CN=Oracle Stage 2 Requalification R2 Local Test Signing - NOT PRODUCTION`;
- expires at `2026-08-27T20:35:39Z`; and
- was removed, with its trust copy and private signing material, after
  mechanical verification.

The public signer identity remains bound into the immutable signed artifacts
and verification evidence. R2 acceptance must later preserve the full
mandatory Stage 3 execution-start margin; this implementation does not
authorise Stage 3.

## Boundary

The Founder accepted the passing execution and R2 is formally closed. No
package installation, production certificate, production publisher trust,
publication, distribution, deployment, release or Stage 3 action occurred.
