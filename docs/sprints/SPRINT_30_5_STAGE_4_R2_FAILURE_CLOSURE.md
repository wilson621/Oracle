# Sprint 30.5 Stage 4 Requalification R2 Failure Closure

**Status:** Accepted immutable failed qualification
**Attempt:** `stage4-r2-20260804T112122028Z-609ab6f0`
**Authority:** `authority-stage4-r2-20260804T112122028Z-609ab6f0` — consumed
**Retry:** Prohibited
**Last Reviewed:** 4 August 2026

The Founder accepted Stage 4 Requalification R2 as immutable failed qualification
evidence. The fresh transfer, independently verified preflight, consumed authority,
attempt namespace, controller result and teardown records are preserved unchanged.
No R2 retry is authorised.

The elevated pre-authority record passed against execution commit
`7a59616dab437829156638290c691f6a8d54771e`, tree
`983313f3e2563ecd9ef7e783542d2cca642ed36b`, and transfer
`transfer-stage4-r2-20260804T111859351Z-54dade09`. Authority was then created and
consumed. The attempt completed `authority-consumed` and `baseline-verified`, two
of twenty required lifecycle phases.

Execution failed before provider initialization because the qualification harness
had already created `logs/transfer-admission.json`, while the live-environment
controller attempted exclusive create-only creation of the existing `logs`
directory. Node returned `EEXIST` and exit code `1`. The qualification archive,
final evidence manifest and repository qualification-evidence namespace were not
produced.

Safety teardown passed with no cleanup failure. Independent post-attempt checks
proved zero Oracle packages, exact certificates, runtime-configuration or package
data, Oracle processes, disposable containers, volumes and networks. The immutable
attempt contains nine files and 10,770 bytes.

Cryptographic bindings:

- preflight: `728496a9a18be409c8d41aaea69e8ed57deacbb0e37e9c1c4b5d7c114037d3f4`;
- authority: `d7886066e4fc709e867fe5cb80c465be2fa1ce04adcda054ff004ae577cc2b06`;
- failure: `eff42158ed5fdf9a25c4bd4535762f09e624061939835789850bf69481298538`;
- controller result: `1d3b8f49c959a3954607c41c27e036a867d2cf311cb196e9c2ff7389964c2c4f`;
- accepted failed-evidence index: `1473cc282818567ea6f76ab240ea833a4689bf0f3ca6193843667247a0b75fde`.

Stage 4 remains incomplete for the accepted R6/R12 baseline. Stage 5 remains
blocked. A future qualification requires a separate Founder decision and a fresh
revision; the consumed R2 identity, authority, transfer and evidence namespaces
cannot be reused.