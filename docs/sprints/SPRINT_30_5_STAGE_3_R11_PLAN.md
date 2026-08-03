# Sprint 30.5 Stage 3 Requalification R11 Plan

**Status:** Prepared and independently validated — execution contingent on transfer and pre-authority admission
**Operating model:** OEOM v1.0
**Purpose:** Clean Windows requalification of the Founder-accepted Stage 2 R6 ADR-048 package
**Historical position:** Stage 3 R9 remains Founder-accepted, formally closed, and immutable

## Canonical programme identity

The single exact R11 programme identity is `Sprint 30.5 Stage 3 Requalification R11`. This follows from R11's purpose: the already-qualified and closed Stage 3 lifecycle is being repeated against the accepted Stage 2 R6 product baseline. `Sprint 30.5 Stage 3 Qualification R11` is a rejected historical preparation identity and must never be accepted as an alias. Comparisons remain ordinal and exact.

Two constructed transfers are immutable and prohibited from admission, continuity reuse, authority creation or execution:

- `transfer-stage3-r10-20260803T130243096Z-7a48bde6`, rejected for inaccurate custody-authority recording; and
- `transfer-stage3-r10-20260803T133216036Z-9dc6f3f1`, rejected after pre-authority admission exposed the Qualification/Requalification programme-identity contradiction.

Their manifests, custody records, sidecars, continuity artefacts and admission findings remain historical records. Replacement construction must use a new transfer identity and the contract's rejected-transfer registry fails closed on either prior identity.

## Exact accepted input

R11 consumes only Stage 2 R6 attempt `r6-20260803T171057940Z-5e914d18` under authority `authority-r6-20260803T171057940Z-5e914d18`.

- product commit: `ee8fbeb7a8d18d393cc9a3e92d622250eb2165ff`;
- product tree: `8455a05780989a9d5f6c6d527f7d427d94526b04`;
- Stage 2 harness commit: `0b10f074d86ac9256462602c0e7bda528b8fba57`;
- Stage 2 harness tree: `b32db4b2c7ebaf8ff6c1d2070e0056b6b7557f80`;
- R6 closure commit: `190fb262fa8cd2ab24c2585e21b3bd7c8bd7e335`;
- R6 closure tree: `8268f8b09328ff06419b1cd9d4d9d45087da1d77`;
- final evidence manifest SHA-256: `a637a7fdf49f6b2a957738c89cb02015b6384d227c2c72f77a2aabdd721bf288`;
- qualification archive SHA-256: `7884c93b222cd5f16f51dd5ba1b56c51af5008e1f6c999dcff92a8c1a26ac690`;
- MSIX SHA-256: `492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430`;
- Release Manifest SHA-256: `bd3dde2a3b37d75ccdcfecd8fa49bda2a493d340ead7283fddd2dd11a6e59bd3`;
- detached signature SHA-256: `4c8ec3b09f4bb03d5475398963e22a67657b9f4f4e5475fa03f512eae1cc97ac`;
- SBOM SHA-256: `ccefd235db62c007613d0280b6c35051999c3c757ce78a93581d9fcea626de22`;
- provenance SHA-256: `64c829eea43eed7b53af25712be38cda53f827b13844d544380f1776921e3920`;
- signer thumbprint: `8C24858C147873EF46A9D61018FA2702B6222EA2`; and
- latest permitted execution start with the mandatory 24-hour margin: `2026-09-01T17:11:50.000Z`.

Any mismatch fails before authority creation or host mutation.

## Authority and identity model

Preparation authority does not authorise transfer construction or execution. A future transfer is authorised only after the preceding governed gate passes binding one clean preparation commit/tree, one create-only transfer ID, one manifest hash, one custody hash, and one approved medium. Execution requires another exact Founder grant plus fresh host continuity and a passing elevated pre-authority gate. Only then may one matching `authority-stage3-r11-<timestamp>-<suffix>` and `stage3-r11-<timestamp>-<suffix>` pair be created. Retry and namespace reuse are prohibited.

## Ordered lifecycle

The governed lifecycle is authority consumption; transfer verification and package reconciliation; host admission; untrusted-package rejection; exact LocalMachine TrustedPeople trust; tampered-package rejection; exact package installation; initial ADR-048 runtime-configuration admission, direct activation, runtime/window observation and configuration-consumption proof; exact process stop and package reset; fresh runtime-configuration admission, direct reactivation and repeated observation; exact package removal; exact trust removal; transfer removal; zero-residue verification; evidence freeze; archive and sidecar publication.

## Installed runtime configuration

Each activation epoch uses the ADR-048 LocalState boundary. The harness creates the file with `FileMode.CreateNew`, restrictive ACLs, the exact Founder grant/authority/attempt/candidate/package bindings, a 15-minute lifetime, and an exact loopback provider origin. Anonymous, service and session values are generated with Windows PowerShell 5.1-compatible cryptographic RNG. Only the path and SHA-256 enter activation arguments. Secret values never enter package bytes, command evidence, governance records, admission evidence, logs or archives. Atomic consumption, empty namespace removal, reset handling, failure cleanup and final package-data zero residue are mandatory. Stage 3 proves configuration admission, consumption and clean-host package operation; it does not claim provider connectivity or authenticated journeys. Those assertions remain mandatory in a separately authorised installed-authentication requalification before Stage 5.

## Qualification assertions

R11 preserves strict R9 controls: deterministic transfer inventory; canonical percent-decoded package inventory including exact `[Content_Types].xml`; strict signer subject/thumbprint/raw bytes and Authenticode `Valid`; direct `IApplicationActivationManager::ActivateApplication` S_OK and nonzero PID; exact AppModel ownership; signed installed executable; safe command line and loopback-only connection policy; one visible non-minimized Oracle window; at least 60,000 monotonic milliseconds of valid captured observations; repair/reset repeat; exact teardown; installed-software invariance; create-only evidence; and zero package, process, certificate, trust, package-data, runtime-configuration, transfer and work residue.

## Failure and immutability

The first mandatory failure stops forward execution. If authority was consumed, bounded teardown stops only exact package-owned processes, removes only the exact package, runtime namespace and signer thumbprint, proves residue, and writes immutable failure evidence. Partial archives are never published. Stage 2 R1-R6, Stage 3 R1-R9, Stage 4 R1 and all failed attempts remain unchanged.

## Terminal states

A governed attempt ends only as PASS awaiting Founder evidence acceptance, immutable FAIL awaiting evidence-led review, or external/governance blocker. No outcome grants Stage 4, Stage 5, production, publication, deployment or release authority.
