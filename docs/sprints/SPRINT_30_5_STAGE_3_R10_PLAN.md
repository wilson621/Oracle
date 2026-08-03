# Sprint 30.5 Stage 3 Requalification R10 Plan

**Status:** Prepared and independently validated — execution unauthorised
**Operating model:** OEOM v1.0
**Purpose:** Clean Windows requalification of the Founder-accepted Stage 2 R4 ADR-048 package
**Historical position:** Stage 3 R9 remains Founder-accepted, formally closed, and immutable

## Canonical programme identity

The single exact R10 programme identity is `Sprint 30.5 Stage 3 Requalification R10`. This follows from R10's purpose: the already-qualified and closed Stage 3 lifecycle is being repeated against the accepted Stage 2 R4 product baseline. `Sprint 30.5 Stage 3 Qualification R10` is a rejected historical preparation identity and must never be accepted as an alias. Comparisons remain ordinal and exact.

Two constructed transfers are immutable and prohibited from admission, continuity reuse, authority creation or execution:

- `transfer-stage3-r10-20260803T130243096Z-7a48bde6`, rejected for inaccurate custody-authority recording; and
- `transfer-stage3-r10-20260803T133216036Z-9dc6f3f1`, rejected after pre-authority admission exposed the Qualification/Requalification programme-identity contradiction.

Their manifests, custody records, sidecars, continuity artefacts and admission findings remain historical records. Replacement construction must use a new transfer identity and the contract's rejected-transfer registry fails closed on either prior identity.

## Exact accepted input

R10 consumes only Stage 2 R4 attempt `r4-20260803T115002258Z-31ab0bf6` under authority `authority-r4-20260803T115002258Z-31ab0bf6`.

- product commit: `f7203f9b602b182a2bd006bc3cff3113b839be8e`;
- product tree: `5d7eca4c012874df0b839533dfab283b54778661`;
- Stage 2 harness commit: `a31c2897dd063e8e995e558cd83ecd188b8392ff`;
- Stage 2 harness tree: `ec0dc354553b6be38daaee4cd2383e325bd94837`;
- R4 closure commit: `9a180ad7452df3e800f09615283587e3679e83c0`;
- R4 closure tree: `00e38d83769a46571ce659e002a0f4b8a22da147`;
- final evidence manifest SHA-256: `876be1c0342c7dc9f70965faa3daffe0c9c1d8d7a3e2c41b144155350557784d`;
- qualification archive SHA-256: `3f1f11dd04ddbc3b4eb51db344f71c12252cc7e41e8ae072950d3a74c1452495`;
- MSIX SHA-256: `8679138e78827d41e20cf3f0c452e3c28120afad846ef4e20329eeff1f9aebd5`;
- Release Manifest SHA-256: `be26608410c26af2ef1d784949d2fa7c2af874de41ab1e13968da85c3372e7e7`;
- detached signature SHA-256: `3f4c1aab2eb0a5ab22e7455347ff9d59af523fd6424e59a638399383fdb19bf0`;
- SBOM SHA-256: `0b3627e41b252a3065a7199593fcc20a08f073bb9aa466b4feded16d3fc5a1b3`;
- provenance SHA-256: `3a29a893780b569b39fdaa0e355ebde2514e6465eb6f62b040e84ebb820e5392`;
- signer thumbprint: `03BEFBF303751D3DC14DF3FA224EB6BC5A6E4222`; and
- latest permitted execution start with the mandatory 24-hour margin: `2026-09-01T11:50:55.000Z`.

Any mismatch fails before authority creation or host mutation.

## Authority and identity model

Preparation authority does not authorise transfer construction or execution. A future transfer requires a separate Founder decision binding one clean preparation commit/tree, one create-only transfer ID, one manifest hash, one custody hash, and one approved medium. Execution requires another exact Founder grant plus fresh host continuity and a passing elevated pre-authority gate. Only then may one matching `authority-stage3-r10-<timestamp>-<suffix>` and `stage3-r10-<timestamp>-<suffix>` pair be created. Retry and namespace reuse are prohibited.

## Ordered lifecycle

The governed lifecycle is authority consumption; transfer verification and package reconciliation; host admission; untrusted-package rejection; exact LocalMachine TrustedPeople trust; tampered-package rejection; exact package installation; initial ADR-048 runtime-configuration admission, direct activation, runtime/window observation and configuration-consumption proof; exact process stop and package reset; fresh runtime-configuration admission, direct reactivation and repeated observation; exact package removal; exact trust removal; transfer removal; zero-residue verification; evidence freeze; archive and sidecar publication.

## Installed runtime configuration

Each activation epoch uses the ADR-048 LocalState boundary. The harness creates the file with `FileMode.CreateNew`, restrictive ACLs, the exact Founder grant/authority/attempt/candidate/package bindings, a 15-minute lifetime, and an exact loopback provider origin. Anonymous, service and session values are generated with Windows PowerShell 5.1-compatible cryptographic RNG. Only the path and SHA-256 enter activation arguments. Secret values never enter package bytes, command evidence, governance records, admission evidence, logs or archives. Atomic consumption, empty namespace removal, reset handling, failure cleanup and final package-data zero residue are mandatory. Stage 3 proves configuration admission, consumption and clean-host package operation; it does not claim provider connectivity or authenticated journeys. Those assertions remain mandatory in a separately authorised installed-authentication requalification before Stage 5.

## Qualification assertions

R10 preserves strict R9 controls: deterministic transfer inventory; canonical percent-decoded package inventory including exact `[Content_Types].xml`; strict signer subject/thumbprint/raw bytes and Authenticode `Valid`; direct `IApplicationActivationManager::ActivateApplication` S_OK and nonzero PID; exact AppModel ownership; signed installed executable; safe command line and loopback-only connection policy; one visible non-minimized Oracle window; at least 60,000 monotonic milliseconds of valid captured observations; repair/reset repeat; exact teardown; installed-software invariance; create-only evidence; and zero package, process, certificate, trust, package-data, runtime-configuration, transfer and work residue.

## Failure and immutability

The first mandatory failure stops forward execution. If authority was consumed, bounded teardown stops only exact package-owned processes, removes only the exact package, runtime namespace and signer thumbprint, proves residue, and writes immutable failure evidence. Partial archives are never published. Stage 2 R1-R4, Stage 3 R1-R9, Stage 4 R1 and all failed attempts remain unchanged.

## Terminal states

A governed attempt ends only as PASS awaiting Founder evidence acceptance, immutable FAIL awaiting evidence-led review, or external/governance blocker. No outcome grants Stage 4, Stage 5, production, publication, deployment or release authority.
