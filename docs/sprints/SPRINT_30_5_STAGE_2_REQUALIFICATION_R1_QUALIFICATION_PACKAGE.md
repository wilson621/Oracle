# Sprint 30.5 Stage 2 Requalification R1 — Founder Qualification Package

**Decision:** Founder accepted Requalification R1 as complete
**Status:** Resolved and closed
**Accepted:** 28 July 2026
**Stage 3:** Unauthorised

## Founder decision

The Founder accepted the passing immutable evidence for:

- attempt `r1-20260728T190335052Z-d2ffe76a`;
- authority `authority-r1-20260728T190335052Z-d2ffe76a`;
- candidate and harness commit
  `cd3b7ca1a49d53d85a718a24d594267c93531994`; and
- candidate and harness tree
  `e7933a866fe656ae03689a62956c44641eb16a23`.

This is the authoritative passing Stage 2 Requalification R1 outcome.

## Accepted evidence

| Item | Accepted value |
| --- | --- |
| Runtime Manifest | `1.7.0`; Web/Electron equality passed |
| Package | `Oracle_0.1.1.0_x64_STAGE2_REQUALIFICATION_R1_LOCAL_TEST_ONLY.msix` |
| Package identity/version/architecture | `Oracle.Platform.LocalCertification` / `0.1.1.0` / `x64` |
| Package-content entries | `2201` |
| MSIX SHA-256 | `c9c3b4b624f1b7528123a4f0c86737fef6cab8832d6b6b042ea5b44bfcb9bdbb` |
| Release Manifest SHA-256 | `9355a230e0a3eeb3bcd2627e47ff500bfbdc4d5fd6353b91cefc2c463756bfbf` |
| Release Manifest signature | Valid detached CMS |
| Executable and package Authenticode | Four governed artifacts exactly `Valid` |
| Exact signer thumbprint | `EE8C6DE99CD4A925DFDF63E261A0796894BB75E0` |
| SBOM | CycloneDX `1.6`, verified |
| Provenance | SLSA-shaped, verified |
| Certificate-store residue | Zero |
| Private signing material | Destroyed |
| Governed package installed | No |
| Final evidence manifest SHA-256 | `0903762efa6605611b7a6213b3cec157d7618030945c6068aea8c28b1ab0b36d` |
| Qualification archive SHA-256 | `4d9d8af7a1ffaa4486c88a369c7f407b7cf7dbfd4a63f14baa07dc38b27567e6` |

The canonical bounded evidence is indexed by
[Sprint 30.5 Stage 2 Requalification R1 Evidence](evidence/sprint-30-5/stage-2-requalification/README.md).
The full `216994816`-byte archive remains in governed Git-ignored local
storage and is bound by its committed sidecar and final manifest.

The execution-completion snapshot records repository evidence publication as
pending because it was created before the bounded repository copy. The later
final repository checkpoint records
`repositoryEvidencePublicationPending: false`,
`repositoryVisibleEvidenceOnly: true` and an eight-file pre-manifest
publication inventory. The final manifest and its sidecar were then published
as terminal bindings. This is the governed create-only publication sequence,
not an unresolved evidence gap.

## Accepted conclusion

Requalification R1 proves one exact current-source candidate and its
local-test-only package are mechanically reconciled. It closes the
current-source Stage 2 candidate gap that invalidated continued use of the
historical candidate.

The historical Stage 2 candidate remains accepted, closed and immutable as
historical evidence. The failed R1 attempts remain immutable fail-closed
engineering history and are not accepted as passing evidence.

## Limits

This acceptance does not prove or authorise:

- clean Windows installation or package lifecycle;
- live authentication or protected rendering;
- installed-package GPU, performance or accessibility;
- reproducibility or final integrated qualification;
- production signing or publisher trust;
- publication, distribution, deployment or release; or
- Stage 3 or any later qualification stage.
